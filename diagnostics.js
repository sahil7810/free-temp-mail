// QuickTemp Mail diagnostics
// Helps show useful Mail.tm API errors instead of a generic failure message.

(function () {
  const originalFetch = window.fetch.bind(window);

  window.__quickTempLastApiError = null;

  function isMailTmUrl(value) {
    const url = typeof value === "string" ? value : value?.url || "";
    return url.includes("api.mail.tm") || url.includes("/api/mailtm");
  }

  function toShortUrl(value) {
    const url = typeof value === "string" ? value : value?.url || "";
    return url.replace(/^https?:\/\//, "").slice(0, 120);
  }

  window.fetch = async function quickTempFetch(input, init) {
    const apiRequest = isMailTmUrl(input);

    try {
      const response = await originalFetch(input, init);

      if (apiRequest && !response.ok) {
        let apiMessage = "";

        try {
          const data = await response.clone().json();
          apiMessage = data?.message || data?.["hydra:description"] || data?.detail || "";
        } catch (error) {
          apiMessage = "";
        }

        window.__quickTempLastApiError = {
          type: "http",
          status: response.status,
          url: toShortUrl(input),
          message: apiMessage
        };
      }

      return response;
    } catch (error) {
      if (apiRequest) {
        window.__quickTempLastApiError = {
          type: error?.name === "AbortError" ? "timeout" : "network",
          status: 0,
          url: toShortUrl(input),
          message: error?.message || "Network request failed"
        };
      }

      throw error;
    }
  };

  function explainMailTmError(fallbackMessage) {
    const info = window.__quickTempLastApiError;

    if (!info) {
      return fallbackMessage || "Temporary email service failed. Please try again.";
    }

    if (info.type === "timeout") {
      return "Mail.tm API timed out. Please try again in a minute.";
    }

    if (info.type === "network") {
      return "Mail.tm API is blocked or unreachable from this browser/network. Try another browser, turn off VPN/adblocker, or try again later.";
    }

    if (info.status === 429) {
      return "Mail.tm rate limit reached. Wait 1–2 minutes, then tap Generate again.";
    }

    if (info.status === 403) {
      return "Mail.tm blocked this request. Try another network/browser or try again later.";
    }

    if (info.status === 422) {
      return "Mail.tm rejected this generated address. Tap Generate again.";
    }

    if (info.status >= 500) {
      return "Mail.tm API is temporarily down. Try again later.";
    }

    if (info.status) {
      return `Mail.tm API error ${info.status}${info.message ? `: ${info.message}` : ""}`;
    }

    return fallbackMessage || "Temporary email service failed. Please try again.";
  }

  function clearToasts() {
    const toastContainer = document.getElementById("toastContainer");
    if (toastContainer) {
      toastContainer.replaceChildren();
    }
  }

  function installFriendlyErrors() {
    try {
      if (typeof showError !== "function") return;

      showError = function quickTempShowError(message) {
        const finalMessage = message === "Something went wrong, please try again."
          ? explainMailTmError(message)
          : message;

        const statusMessage = document.getElementById("statusMessage");
        const errorBanner = document.getElementById("errorBanner");

        if (statusMessage) {
          statusMessage.textContent = finalMessage;
          statusMessage.className = "status-message error";
        }

        if (errorBanner) {
          errorBanner.textContent = finalMessage;
          errorBanner.hidden = false;
        }

        clearToasts();
      };
    } catch (error) {
      // Keep diagnostics silent in production.
    }
  }

  window.__quickTempExplainMailTmError = explainMailTmError;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installFriendlyErrors);
  } else {
    installFriendlyErrors();
  }
})();
