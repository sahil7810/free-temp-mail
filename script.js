// QuickTemp Mail
// Beginner-friendly frontend code for the Mail.tm API.
// This is a static website: no backend, no database, no npm, and no API key.

const API_BASE = "https://api.mail.tm";
const REFRESH_COOLDOWN_MS = 10000;
const AUTO_REFRESH_MS = 15000;
const TOAST_DURATION_MS = 3600;
const SAFE_URL_PATTERN = /(https?:\/\/[^\s<>"']+)/gi;

const STORAGE_KEYS = {
  email: "quicktemp_email",
  password: "quicktemp_password",
  token: "quicktemp_token",
  accountId: "quicktemp_account_id",
  lastRefresh: "quicktemp_last_refresh",
  knownMessageIds: "quicktemp_known_message_ids",
  readMessageIds: "quicktemp_read_message_ids",
  theme: "quicktemp-theme"
};

const emailInput = document.getElementById("emailAddress");
const statusMessage = document.getElementById("statusMessage");
const errorBanner = document.getElementById("errorBanner");
const inboxCount = document.getElementById("inboxCount");
const inboxList = document.getElementById("inboxList");
const messageDetails = document.getElementById("messageDetails");
const loadingSpinner = document.getElementById("loadingSpinner");
const toastContainer = document.getElementById("toastContainer");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const refreshBtn = document.getElementById("refreshBtn");
const resetBtn = document.getElementById("resetBtn");
const themeToggleBtn = document.querySelector(".theme-toggle");
const year = document.getElementById("year");

let isBusy = false;
let inboxRequestInFlight = false;
let activeLoadingButton = null;
let autoRefreshTimer = null;

initApp();

function initApp() {
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  if (emailInput) {
    emailInput.addEventListener("click", copyEmail);
  }

  if (generateBtn) {
    generateBtn.addEventListener("click", generateEmail);
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", copyEmail);
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => refreshInbox());
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetEmail);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
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
    updateInboxCount(0);
    renderEmptyInbox("No emails yet", "Generate a free temporary email and refresh your inbox to check for messages.");
    clearMessageDetails("Select a message from the inbox to view details here.");
    return;
  }

  showCurrentEmail(session.email);
  updateInboxCount(0);
  renderEmptyInbox("Saved inbox found", "Click Refresh Inbox or wait for auto-refresh to check your saved temporary email.");
  clearMessageDetails("Select a message from the inbox to view details here.");
  setStatus("Saved temporary email restored. Auto-refresh is now active.");
  startAutoRefresh();
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
  localStorage.removeItem(STORAGE_KEYS.knownMessageIds);
  localStorage.removeItem(STORAGE_KEYS.readMessageIds);
}

function hasMailboxSession() {
  const session = getSavedSession();
  return Boolean(session.email && session.token);
}

function updateControls() {
  const hasSession = hasMailboxSession();

  if (generateBtn) generateBtn.disabled = isBusy || inboxRequestInFlight;
  if (copyBtn) copyBtn.disabled = isBusy || !hasSession;
  if (refreshBtn) refreshBtn.disabled = isBusy || !hasSession || inboxRequestInFlight;
  if (resetBtn) resetBtn.disabled = isBusy || !hasSession || inboxRequestInFlight;
}

function startLoading(button, loadingText) {
  isBusy = true;
  activeLoadingButton = button || null;

  if (activeLoadingButton) {
    activeLoadingButton.dataset.defaultText = activeLoadingButton.textContent;
    activeLoadingButton.textContent = loadingText;
    activeLoadingButton.classList.add("is-loading");
  }

  showInlineSpinner(true);
  updateControls();
}

function stopLoading() {
  if (activeLoadingButton) {
    activeLoadingButton.textContent = activeLoadingButton.dataset.defaultText || activeLoadingButton.textContent;
    activeLoadingButton.classList.remove("is-loading");
  }

  activeLoadingButton = null;
  isBusy = false;
  showInlineSpinner(false);
  updateControls();
}

function showInlineSpinner(shouldShow) {
  if (loadingSpinner) {
    loadingSpinner.hidden = !shouldShow;
  }
}

function setStatus(message, type = "") {
  if (!statusMessage) return;

  statusMessage.textContent = message;
  statusMessage.className = "status-message";

  if (type) {
    statusMessage.classList.add(type);
  }
}

function showToast(message, type = "") {
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = type ? `toast ${type}` : "toast";
  toast.textContent = message;

  toastContainer.append(toast);

  window.setTimeout(() => {
    toast.remove();
  }, TOAST_DURATION_MS);
}

function showError(message) {
  setStatus(message, "error");
  showToast(message, "error");

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

function updateInboxCount(count) {
  if (inboxCount) {
    inboxCount.textContent = String(count);
  }
}

function renderEmptyInbox(title, description) {
  if (!inboxList) return;

  updateInboxCount(0);

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
  stopAutoRefresh();
  startLoading(generateBtn, "Creating email...");
  setStatus("Creating email...");

  try {
    clearSession();
    showCurrentEmail("");
    updateInboxCount(0);
    renderEmptyInbox("Creating inbox", "Please wait while your temporary email is created.");
    clearMessageDetails("Select a message from the inbox to view details here.");

    const domain = await getFirstAvailableDomain();
    const accountData = await createRandomAccount(domain);
    const tokenData = await loginAccount(accountData.address, accountData.password);

    saveSession({
      email: accountData.address,
      password: accountData.password,
      token: tokenData.token,
      accountId: accountData.account?.id || ""
    });

    showCurrentEmail(accountData.address);
    renderEmptyInbox("No emails yet", "Use your temporary email, then refresh inbox after a few seconds.");
    setStatus("Email created successfully. You can copy it now.", "success");
    showToast("Email generated", "success");
    startAutoRefresh();
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
    showToast("Generate an email first", "warning");
    return;
  }

  try {
    await navigator.clipboard.writeText(session.email);
    setStatus("Email copied successfully.", "success");
    showToast("Email copied", "success");
  } catch (error) {
    console.error(error);
    setStatus("Copy failed. Please select and copy the email manually.", "warning");
    showToast("Copy failed", "warning");
  }
}

async function refreshInbox(options = {}) {
  const isAutomatic = Boolean(options.automatic);
  const isSilent = Boolean(options.silent);

  if (isBusy || inboxRequestInFlight) {
    if (!isSilent) {
      setStatus("Inbox is already refreshing. Please wait.", "warning");
    }
    return;
  }

  if (!isSilent) {
    clearError();
  }

  const session = getSavedSession();

  if (!session.token) {
    if (!isSilent) {
      setStatus("Generate an email first, then refresh the inbox.", "warning");
      showToast("Generate an email first", "warning");
    }
    return;
  }

  const now = Date.now();
  const lastRefresh = Number(localStorage.getItem(STORAGE_KEYS.lastRefresh) || 0);
  const timeSinceLastRefresh = now - lastRefresh;

  if (timeSinceLastRefresh < REFRESH_COOLDOWN_MS) {
    if (!isSilent) {
      const secondsLeft = Math.ceil((REFRESH_COOLDOWN_MS - timeSinceLastRefresh) / 1000);
      setStatus(`Please wait ${secondsLeft} second(s) before refreshing again.`, "warning");
      showToast(`Refresh available in ${secondsLeft}s`, "warning");
    }
    return;
  }

  inboxRequestInFlight = true;
  localStorage.setItem(STORAGE_KEYS.lastRefresh, String(now));
  updateControls();

  if (!isSilent) {
    startLoading(refreshBtn, "Refreshing...");
    setStatus("Refreshing inbox...");
  }

  try {
    const data = await apiRequest("/messages", {
      headers: getAuthHeaders(session.token)
    });

    const messages = data?.["hydra:member"] || [];
    const newCount = renderInboxMessages(messages);

    if (!isSilent) {
      setStatus(messages.length ? "Inbox refreshed." : "No emails yet.", messages.length ? "success" : "");
      showToast("Inbox refreshed", "success");
    } else if (isAutomatic && newCount > 0) {
      showToast(`${newCount} new email${newCount === 1 ? "" : "s"}`, "success");
    }
  } catch (error) {
    console.error(error);
    handleApiError(error, isSilent);
  } finally {
    inboxRequestInFlight = false;
    if (!isSilent) {
      stopLoading();
    } else {
      updateControls();
    }
  }
}

function getAuthHeaders(token) {
  return {
    Authorization: `Bearer ${token}`
  };
}

function renderInboxMessages(messages) {
  if (!inboxList) return 0;

  updateInboxCount(messages.length);

  if (!messages.length) {
    renderEmptyInbox("No emails yet", "Try again after a few seconds if you are waiting for a message.");
    clearMessageDetails("Select a message from the inbox to view details here.");
    return 0;
  }

  const knownIds = getStoredIdSet(STORAGE_KEYS.knownMessageIds);
  const readIds = getStoredIdSet(STORAGE_KEYS.readMessageIds);
  let newCount = 0;

  const items = messages.map((message) => {
    const messageId = message.id;
    const isNewMessage = messageId && !knownIds.has(messageId);
    const isUnread = messageId && !readIds.has(messageId);

    if (isNewMessage) {
      newCount += 1;
    }

    const item = document.createElement("li");
    item.className = "inbox-message";

    if (isNewMessage || isUnread) {
      item.classList.add("message-new");
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "message-button";

    const topLine = document.createElement("span");
    topLine.className = "message-topline";

    const subject = document.createElement("span");
    subject.className = "message-subject";
    subject.textContent = message.subject || "No subject";

    let badge = null;
    if (isNewMessage || isUnread) {
      badge = document.createElement("span");
      badge.className = "new-badge";
      badge.textContent = "New";
    }

    topLine.append(subject);
    if (badge) topLine.append(badge);

    const metaRow = document.createElement("span");
    metaRow.className = "message-meta-row";

    const from = document.createElement("span");
    from.className = "message-meta";
    from.textContent = `From: ${formatSender(message.from)}`;

    const date = document.createElement("span");
    date.className = "message-date";
    date.textContent = formatRelativeTime(message.createdAt);

    const intro = document.createElement("p");
    intro.className = "message-preview";
    intro.textContent = message.intro || "No preview available.";

    button.addEventListener("click", () => {
      if (messageId) {
        markMessageAsRead(messageId);
      }
      item.classList.remove("message-new");
      if (badge) badge.remove();
      loadMessageDetails(messageId);
    });

    metaRow.append(from, date);
    button.append(topLine, metaRow, intro);
    item.append(button);

    return item;
  });

  inboxList.replaceChildren(...items);
  saveKnownMessageIds(messages);
  return newCount;
}

async function loadMessageDetails(messageId) {
  clearError();
  const session = getSavedSession();

  if (!session.token || !messageId) {
    setStatus("Message cannot be loaded right now.", "warning");
    showToast("Message cannot be loaded", "warning");
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
    handleApiError(error, false);
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

  const from = createInfoLine("From", formatSender(message.from));
  const subject = createInfoLine("Subject", message.subject || "No subject");
  const date = createInfoLine("Date", formatFullDate(message.createdAt));

  const body = document.createElement("div");
  body.className = "message-body";
  renderSafeMessageBody(getSafePlainMessageBody(message), body);

  const note = document.createElement("p");
  note.className = "message-note";
  note.textContent = "Showing safe plain text only. Links are shown for convenience. Only open links you trust.";

  info.append(from, subject, date);
  messageDetails.replaceChildren(title, info, body, note);
}

function renderSafeMessageBody(text, container) {
  container.replaceChildren();

  if (!text) {
    container.textContent = "This message has no readable plain text content.";
    return;
  }

  SAFE_URL_PATTERN.lastIndex = 0;
  let lastIndex = 0;
  let match;

  while ((match = SAFE_URL_PATTERN.exec(text)) !== null) {
    const rawUrl = match[0];

    if (match.index > lastIndex) {
      container.append(document.createTextNode(text.slice(lastIndex, match.index)));
    }

    const { cleanUrl, trailingText } = cleanUrlText(rawUrl);

    if (cleanUrl) {
      container.append(createSafeLink(cleanUrl));
    }

    if (trailingText) {
      container.append(document.createTextNode(trailingText));
    }

    lastIndex = match.index + rawUrl.length;
  }

  if (lastIndex < text.length) {
    container.append(document.createTextNode(text.slice(lastIndex)));
  }
}

function cleanUrlText(rawUrl) {
  let cleanUrl = rawUrl;
  let trailingText = "";

  while (/[.,!?;:)\]]$/.test(cleanUrl)) {
    trailingText = cleanUrl.slice(-1) + trailingText;
    cleanUrl = cleanUrl.slice(0, -1);
  }

  return { cleanUrl, trailingText };
}

function createSafeLink(url) {
  const link = document.createElement("a");
  link.className = "message-link";
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer nofollow";
  link.title = url;
  link.textContent = url.startsWith("https://") ? "Open secure link" : "Open link";
  return link;
}

function createInfoLine(label, value) {
  const line = document.createElement("span");
  const strong = document.createElement("strong");
  strong.textContent = `${label}: `;
  const text = document.createTextNode(value || "Unknown");
  line.append(strong, text);
  return line;
}

function getSafePlainMessageBody(message) {
  if (typeof message.text === "string" && message.text.trim()) {
    return message.text.trim();
  }

  if (Array.isArray(message.text) && message.text.length > 0) {
    return message.text.join("\n").trim();
  }

  if (message.intro) {
    return message.intro;
  }

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

function formatRelativeTime(dateValue) {
  const date = new Date(dateValue);
  if (!dateValue || Number.isNaN(date.getTime())) return "Unknown time";

  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 60) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  return formatFullDate(dateValue);
}

function formatFullDate(dateValue) {
  const date = new Date(dateValue);

  if (!dateValue || Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function getStoredIdSet(key) {
  try {
    const ids = JSON.parse(localStorage.getItem(key) || "[]");
    return new Set(Array.isArray(ids) ? ids : []);
  } catch (error) {
    return new Set();
  }
}

function saveIdSet(key, idSet) {
  localStorage.setItem(key, JSON.stringify([...idSet]));
}

function saveKnownMessageIds(messages) {
  const knownIds = getStoredIdSet(STORAGE_KEYS.knownMessageIds);

  messages.forEach((message) => {
    if (message.id) {
      knownIds.add(message.id);
    }
  });

  saveIdSet(STORAGE_KEYS.knownMessageIds, knownIds);
}

function markMessageAsRead(messageId) {
  const readIds = getStoredIdSet(STORAGE_KEYS.readMessageIds);
  readIds.add(messageId);
  saveIdSet(STORAGE_KEYS.readMessageIds, readIds);
}

function handleApiError(error, isSilent = false) {
  if (error.status === 401) {
    stopAutoRefresh();
    if (!isSilent) showError("Your email session expired. Please reset and generate a new email.");
    return;
  }

  if (error.status === 429) {
    if (!isSilent) showError("Too many requests. Please wait a little and try again.");
    return;
  }

  if (!isSilent) {
    showError("Something went wrong, please try again.");
  }
}

function startAutoRefresh() {
  stopAutoRefresh();

  if (!hasMailboxSession()) return;

  autoRefreshTimer = window.setInterval(() => {
    refreshInbox({ automatic: true, silent: true });
  }, AUTO_REFRESH_MS);
}

function stopAutoRefresh() {
  if (autoRefreshTimer) {
    window.clearInterval(autoRefreshTimer);
    autoRefreshTimer = null;
  }
}

function resetEmail() {
  clearError();
  stopAutoRefresh();
  clearSession();
  showCurrentEmail("");
  updateInboxCount(0);
  renderEmptyInbox("No emails yet", "Generate a free temporary email and refresh your inbox to check for messages.");
  clearMessageDetails("Select a message from the inbox to view details here.");
  setStatus("Temporary email reset.");
  showToast("Email reset", "success");
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
