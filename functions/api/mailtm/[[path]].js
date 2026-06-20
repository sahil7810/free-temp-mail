const MAILTM_ORIGIN = "https://api.mail.tm";

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cache-Control": "no-store"
};

const ALLOWED_ROUTES = [
  { method: "GET", pattern: /^\/domains$/ },
  { method: "POST", pattern: /^\/accounts$/ },
  { method: "POST", pattern: /^\/token$/ },
  { method: "GET", pattern: /^\/messages$/ },
  { method: "GET", pattern: /^\/messages\/[A-Za-z0-9_-]+$/ }
];

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...SECURITY_HEADERS,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function getPath(context) {
  const rawPath = context.params?.path;

  if (Array.isArray(rawPath)) {
    return `/${rawPath.join("/")}`;
  }

  if (typeof rawPath === "string" && rawPath) {
    return `/${rawPath}`;
  }

  return "/";
}

function isAllowed(method, path) {
  return ALLOWED_ROUTES.some((route) => route.method === method && route.pattern.test(path));
}

function pickHeaders(request) {
  const headers = new Headers();
  headers.set("Accept", "application/json");

  const contentType = request.headers.get("Content-Type");
  if (contentType && contentType.includes("application/json")) {
    headers.set("Content-Type", "application/json");
  }

  const authorization = request.headers.get("Authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    headers.set("Authorization", authorization);
  }

  return headers;
}

export async function onRequest(context) {
  const { request } = context;
  const method = request.method.toUpperCase();

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: SECURITY_HEADERS });
  }

  const path = getPath(context);

  if (!isAllowed(method, path)) {
    return jsonResponse({ message: "Route not allowed." }, 403);
  }

  let body;
  if (method !== "GET" && method !== "HEAD") {
    body = await request.text();

    if (body.length > 4096) {
      return jsonResponse({ message: "Request body too large." }, 413);
    }
  }

  const upstreamUrl = `${MAILTM_ORIGIN}${path}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      method,
      headers: pickHeaders(request),
      body,
      redirect: "follow"
    });

    const responseText = await upstream.text();
    const contentType = upstream.headers.get("Content-Type") || "application/json; charset=utf-8";

    return new Response(responseText, {
      status: upstream.status,
      headers: {
        ...SECURITY_HEADERS,
        "Content-Type": contentType.includes("json") ? "application/json; charset=utf-8" : "text/plain; charset=utf-8"
      }
    });
  } catch (error) {
    return jsonResponse({ message: "Temporary email provider is unreachable." }, 502);
  }
}
