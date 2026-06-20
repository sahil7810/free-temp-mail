// QuickTemp Mail
// Beginner-friendly frontend code for the Mail.tm API.
// This is a static website: no backend, no database, no npm, and no API key.

const API_BASE = "https://api.mail.tm";
const REFRESH_COOLDOWN_MS = 10000;

const STORAGE_KEYS = {
  email: "quicktemp_email",
  password: "quicktemp_password",
  token: "quicktemp_token",
  accountId: "quicktemp_account_id",
  lastRefresh: "quicktemp_last_refresh",
  theme: "quicktemp-theme"
};

const emailInput = document.getElementById("emailAddress");
const statusMessage = document.getElementById("statusMessage");
const errorBanner = document.getElementById("errorBanner");
const inboxList = document.getElementById("inboxList");
const messageDetails = document.getElementById("messageDetails");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const refreshBtn = document.getElementById("refreshBtn");
const resetBtn = document.getElementById("resetBtn");
const year = document.getElementById("year");

let isBusy = false;
let activeLoadingButton = null;

initApp();

function initApp() {
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  loadSavedTheme();
  loadSavedMailbox();
  setupFaqAccordion();
  updateControls();
}

function loadSavedTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);

  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeButton(savedTheme);
  }
}

function loadSavedMailbox() {
  const session = getSavedSession();

  if (!session.email || !session.token) {
    renderEmptyInbox("No emails yet", "Generate a free temporary email and refresh your inbox to check for messages.");
    clearMessageDetails("Select a message from the inbox to view details here.");
    return;
  }

  showCurrentEmail(session.email);
  renderEmptyInbox("Saved inbox found", "Click Refresh Inbox to check your saved temporary email.");
  clearMessageDetails("Select a message from the inbox to view details here.");
  setStatus("Saved temporary email restored. Click Refresh Inbox to check messages.");
}

function getSavedSession() {
  return {
    email: localStorage.getItem(STORAGE_KEYS.email) || "",
    password: localStorage.getItem(STORAGE_KEYS.password) || "",
    token: localStorage.getItem(STORAGE_KEYS.token) || "",
    accountId: localStorage.getItem(STORAGE_KEYS.accountId) || ""
  };
}

function saveSession({ email, password, token, accountId }) {
  localStorage.setItem(STORAGE_KEYS.email, email);
  localStorage.setItem(STORAGE_KEYS.password, password);
  localStorage.setItem(STORAGE_KEYS.token, token);
  localStorage.setItem(STORAGE_KEYS.accountId, accountId || "");
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.email);
  localStorage.removeItem(STORAGE_KEYS.password);
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.accountId);
  localStorage.removeItem(STORAGE_KEYS.lastRefresh);
}

function hasMailboxSession() {
  const session = getSavedSession();
  return Boolean(session.email && session.token);
}

function updateControls() {
  const hasSession = hasMailboxSession();

  if (generateBtn) generateBtn.disabled = isBusy;
  if (copyBtn) copyBtn.disabled = isBusy || !hasSession;
  if (refreshBtn) refreshBtn.disabled = isBusy || !hasSession;
  if (resetBtn) resetBtn.disabled = isBusy || !hasSession;
}

function startLoading(button, loadingText) {
  isBusy = true;
  activeLoadingButton = button || null;

  if (activeLoadingButton) {
    activeLoadingButton.dataset.defaultText = activeLoadingButton.textContent;
    activeLoadingButton.textContent = loadingText;
    activeLoadingButton.classList.add("is-loading");
  }

  updateControls();
}

function stopLoading() {
  if (activeLoadingButton) {
    activeLoadingButton.textContent = activeLoadingButton.dataset.defaultText || activeLoadingButton.textContent;
    activeLoadingButton.classList.remove("is-loading");
  }

  activeLoadingButton = null;
  isBusy = false;
  updateControls();
}

function setStatus(message, type = "") {
  if (!statusMessage) return;

  statusMessage.textContent = message;
  statusMessage.className = "status-message";

  if (type) {
    statusMessage.classList.add(type);
  }
}

function showError(message) {
  setStatus(message, "error");

  if (errorBanner) {
    errorBanner.textContent = message;
    errorBanner.hidden = false;
  }
}

function clearError() {
  if (errorBanner) {
    errorBanner.textContent = "";
    errorBanner.hidden = true;
  }
}

function showCurrentEmail(email) {
  if (emailInput) {
    emailInput.value = email || "Click Generate Email";
  }
}

function renderEmptyInbox(title, description) {
  if (!inboxList) return;

  const item = document.createElement("li");
  item.className = "empty-state";

  const icon = document.createElement("span");
  icon.className = "empty-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "📭";

  const strong = document.createElement("strong");
  strong.textContent = title;

  const span = document.createElement("span");
  span.textContent = description;

  item.append(icon, strong, span);
  inboxList.replaceChildren(item);
}

function clearMessageDetails(message) {
  if (!messageDetails) return;

  const paragraph = document.createElement("p");
  paragraph.className = "muted-text";
  paragraph.textContent = message;

  messageDetails.replaceChildren(paragraph);
}

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, options);

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function generateEmail() {
  clearError();
  startLoading(generateBtn, "Creating email...");
  setStatus("Creating email...");

  try {
    clearSession();
    showCurrentEmail("");
    renderEmptyInbox("Creating inbox", "Please wait while your temporary email is created.");
    clearMessageDetails("Select a message from the inbox to view details here.");

    const domain = await getFirstAvailableDomain();
    const accountData = await createRandomAccount(domain);
    const tokenData = await loginAccount(accountData.address, accountData.password);

    saveSession({
      email: accountData.address,
      password: accountData.password,
      token: tokenData.token,
      accountId: accountData.account.id
    });

    showCurrentEmail(accountData.address);
    renderEmptyInbox("No emails yet", "Use your temporary email, then refresh inbox after a few seconds.");
    setStatus("Email created successfully. You can copy it now.", "success");
  } catch (error) {
    console.error(error);
    clearSession();
    showCurrentEmail("");
    renderEmptyInbox("No emails yet", "Something went wrong while creating your inbox. Please try again.");
    showError("Something went wrong, please try again.");
  } finally {
    stopLoading();
  }
}

async function getFirstAvailableDomain() {
  const data = await apiRequest("/domains");
  const domains = data?.["hydra:member"] || [];
  const firstDomain = domains.find((item) => item.domain && item.isActive !== false);

  if (!firstDomain) {
    throw new Error("No Mail.tm domains are available right now.");
  }

  return firstDomain.domain;
}

async function createRandomAccount(domain) {
  // A random address may already exist, so we try a few times.
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const address = `${createRandomUsername()}@${domain}`;
    const password = createRandomPassword();

    const response = await fetch(`${API_BASE}/accounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ address, password })
    });

    let account = null;
    try {
      account = await response.json();
    } catch (error) {
      account = null;
    }

    if (response.ok) {
      return { address, password, account };
    }

    // Status 422 can happen when the random address already exists.
    if (response.status !== 422) {
      throw new Error(account?.message || "Could not create Mail.tm account.");
    }
  }

  throw new Error("Could not create a unique temporary email. Please try again.");
}

async function loginAccount(address, password) {
  return apiRequest("/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ address, password })
  });
}

function createRandomUsername() {
  const randomNumber = Math.floor(10000 + Math.random() * 90000);
  const randomLetters = Math.random().toString(36).replace(/[^a-z]/g, "").slice(0, 6);
  return `user${randomNumber}${randomLetters}`;
}

function createRandomPassword() {
  const randomPart = Math.random().toString(36).slice(2);
  return `QuickTemp-${Date.now()}-${randomPart}`;
}

async function copyEmail() {
  clearError();
  const session = getSavedSession();

  if (!session.email) {
    setStatus("Generate an email first, then copy it.", "warning");
    return;
  }

  try {
    await navigator.clipboard.writeText(session.email);
    setStatus("Email copied successfully.", "success");
  } catch (error) {
    console.error(error);
    setStatus("Copy failed. Please select and copy the email manually.", "warning");
  }
}

async function refreshInbox() {
  clearError();
  const session = getSavedSession();

  if (!session.token) {
    setStatus("Generate an email first, then refresh the inbox.", "warning");
    return;
  }

  const now = Date.now();
  const lastRefresh = Number(localStorage.getItem(STORAGE_KEYS.lastRefresh) || 0);
  const timeSinceLastRefresh = now - lastRefresh;

  if (timeSinceLastRefresh < REFRESH_COOLDOWN_MS) {
    const secondsLeft = Math.ceil((REFRESH_COOLDOWN_MS - timeSinceLastRefresh) / 1000);
    setStatus(`Please wait ${secondsLeft} second(s) before refreshing again.`, "warning");
    return;
  }

  localStorage.setItem(STORAGE_KEYS.lastRefresh, String(now));
  startLoading(refreshBtn, "Refreshing...");
  setStatus("Refreshing inbox...");

  try {
    const data = await apiRequest("/messages", {
      headers: getAuthHeaders(session.token)
    });

    const messages = data?.["hydra:member"] || [];
    renderInboxMessages(messages);
    setStatus(messages.length ? "Inbox refreshed." : "No emails yet.", messages.length ? "success" : "");
  } catch (error) {
    console.error(error);
    handleApiError(error);
  } finally {
    stopLoading();
  }
}

function getAuthHeaders(token) {
  return {
    Authorization: `Bearer ${token}`
  };
}

function renderInboxMessages(messages) {
  if (!inboxList) return;

  if (!messages.length) {
    renderEmptyInbox("No emails yet", "Try again after a few seconds if you are waiting for a message.");
    clearMessageDetails("Select a message from the inbox to view details here.");
    return;
  }

  const items = messages.map((message) => {
    const item = document.createElement("li");
    item.className = "inbox-message";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "message-button";
    button.addEventListener("click", () => loadMessageDetails(message.id));

    const subject = document.createElement("span");
    subject.className = "message-subject";
    subject.textContent = message.subject || "No subject";

    const metaRow = document.createElement("span");
    metaRow.className = "message-meta-row";

    const from = document.createElement("span");
    from.className = "message-meta";
    from.textContent = `From: ${formatSender(message.from)}`;

    const date = document.createElement("span");
    date.className = "message-date";
    date.textContent = formatDate(message.createdAt);

    const intro = document.createElement("p");
    intro.className = "message-preview";
    intro.textContent = message.intro || "No preview available.";

    metaRow.append(from, date);
    button.append(subject, metaRow, intro);
    item.append(button);

    return item;
  });

  inboxList.replaceChildren(...items);
}

async function loadMessageDetails(messageId) {
  clearError();
  const session = getSavedSession();

  if (!session.token || !messageId) {
    setStatus("Message cannot be loaded right now.", "warning");
    return;
  }

  startLoading(null, "Loading message...");
  setStatus("Loading message...");

  try {
    const message = await apiRequest(`/messages/${encodeURIComponent(messageId)}`, {
      headers: getAuthHeaders(session.token)
    });

    renderMessageDetails(message);
    setStatus("Message loaded.", "success");
  } catch (error) {
    console.error(error);
    handleApiError(error);
  } finally {
    stopLoading();
  }
}

function renderMessageDetails(message) {
  if (!messageDetails) return;

  const title = document.createElement("h3");
  title.textContent = message.subject || "No subject";

  const info = document.createElement("div");
  info.className = "message-info";

  const from = document.createElement("span");
  from.textContent = `From: ${formatSender(message.from)}`;

  const to = document.createElement("span");
  to.textContent = `To: ${formatRecipients(message.to)}`;

  const date = document.createElement("span");
  date.textContent = `Date: ${formatDate(message.createdAt)}`;

  const body = document.createElement("div");
  body.className = "message-body";
  body.textContent = getSafePlainMessageBody(message);

  const note = document.createElement("p");
  note.className = "message-note";
  note.textContent = "Showing safe plain text only. HTML email content is not inserted into the page.";

  info.append(from, to, date);
  messageDetails.replaceChildren(title, info, body, note);
}

function getSafePlainMessageBody(message) {
  // Prefer the plain text version of the message.
  if (typeof message.text === "string" && message.text.trim()) {
    return message.text.trim();
  }

  if (Array.isArray(message.text) && message.text.length > 0) {
    return message.text.join("\n").trim();
  }

  if (message.intro) {
    return message.intro;
  }

  // If only HTML exists, convert it to text. Do not insert untrusted HTML into the page.
  if (message.html) {
    const htmlString = Array.isArray(message.html) ? message.html.join("\n") : String(message.html);
    const parsedHtml = new DOMParser().parseFromString(htmlString, "text/html");
    const plainText = parsedHtml.body.textContent || "";
    return plainText.trim() || "This HTML email has no readable plain text content.";
  }

  return "This message has no readable plain text content.";
}

function formatSender(sender) {
  if (!sender) return "Unknown sender";
  return sender.name ? `${sender.name} <${sender.address}>` : sender.address || "Unknown sender";
}

function formatRecipients(recipients) {
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return "Unknown recipient";
  }

  return recipients
    .map((recipient) => recipient.name ? `${recipient.name} <${recipient.address}>` : recipient.address)
    .join(", ");
}

function formatDate(dateValue) {
  if (!dateValue) return "Unknown date";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function handleApiError(error) {
  if (error.status === 401) {
    showError("Your email session expired. Please reset and generate a new email.");
    return;
  }

  if (error.status === 429) {
    showError("Too many requests. Please wait a little and try again.");
    return;
  }

  showError("Something went wrong, please try again.");
}

function resetEmail() {
  clearError();
  clearSession();
  showCurrentEmail("");
  renderEmptyInbox("No emails yet", "Generate a free temporary email and refresh your inbox to check for messages.");
  clearMessageDetails("Select a message from the inbox to view details here.");
  setStatus("Temporary email reset.");
  updateControls();
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", nextTheme);
  localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
  updateThemeButton(nextTheme);
}

function updateThemeButton(theme) {
  const themeButtonText = document.querySelector(".theme-toggle-text");
  const themeButtonIcon = document.querySelector(".theme-toggle span[aria-hidden='true']");

  if (themeButtonText) {
    themeButtonText.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
  }

  if (themeButtonIcon) {
    themeButtonIcon.textContent = theme === "dark" ? "☀️" : "🌙";
  }
}

function setupFaqAccordion() {
  const faqItems = document.querySelectorAll("[data-faq-list] details");

  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;

      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.open = false;
        }
      });
    });
  });
}
