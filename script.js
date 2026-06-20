const emailInput = document.getElementById("emailAddress");
const statusMessage = document.getElementById("statusMessage");
const inboxList = document.getElementById("inboxList");
const messageDetails = document.getElementById("messageDetails");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const refreshBtn = document.getElementById("refreshBtn");
const resetBtn = document.getElementById("resetBtn");
const year = document.getElementById("year");

if (year) {
  year.textContent = new Date().getFullYear();
}

const savedTheme = localStorage.getItem("quicktemp-theme");
if (savedTheme) {
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeButton(savedTheme);
}

function setLoading(button, isLoading, loadingText, defaultText) {
  if (!button) return;

  button.disabled = isLoading;
  button.classList.toggle("is-loading", isLoading);
  button.textContent = isLoading ? loadingText : defaultText;
}

function updateStatus(message) {
  if (statusMessage) {
    statusMessage.textContent = message;
  }
}

function enableMailboxButtons() {
  if (copyBtn) copyBtn.disabled = false;
  if (refreshBtn) refreshBtn.disabled = false;
  if (resetBtn) resetBtn.disabled = false;
}

function disableMailboxButtons() {
  if (copyBtn) copyBtn.disabled = true;
  if (refreshBtn) refreshBtn.disabled = true;
  if (resetBtn) resetBtn.disabled = true;
}

function generateEmail() {
  // Placeholder only.
  // Later, this function can call the public Mail.tm API to create an account and inbox.
  setLoading(generateBtn, true, "Generating...", "Generate Email");
  updateStatus("Generating a demo temporary email...");

  window.setTimeout(() => {
    const randomName = `user${Math.floor(Math.random() * 99999)}`;
    const demoEmail = `${randomName}@mail.tm`;

    if (emailInput) {
      emailInput.value = demoEmail;
    }

    enableMailboxButtons();
    updateStatus("Demo email generated. Real Mail.tm API connection can be added later.");
    setLoading(generateBtn, false, "Generating...", "Generate Email");
  }, 700);
}

function copyEmail() {
  // Placeholder only.
  const email = emailInput ? emailInput.value : "";

  if (!email || email === "Click Generate Email") {
    updateStatus("Generate an email first, then copy it.");
    return;
  }

  navigator.clipboard
    .writeText(email)
    .then(() => {
      updateStatus("Email copied to clipboard.");
    })
    .catch(() => {
      updateStatus("Copy failed. Please select and copy the email manually.");
    });
}

function refreshInbox() {
  // Placeholder only.
  // Later, this function can fetch inbox messages from Mail.tm.
  setLoading(refreshBtn, true, "Refreshing...", "Refresh Inbox");
  updateStatus("Checking demo inbox...");

  window.setTimeout(() => {
    if (inboxList) {
      inboxList.innerHTML = `
        <li class="empty-state">
          <strong>No demo messages</strong>
          <span>This is a placeholder inbox. Connect Mail.tm later to receive real messages.</span>
        </li>
      `;
    }

    if (messageDetails) {
      messageDetails.innerHTML = `<p class="muted-text">No message selected yet.</p>`;
    }

    updateStatus("Inbox refreshed. No messages found in placeholder mode.");
    setLoading(refreshBtn, false, "Refreshing...", "Refresh Inbox");
  }, 700);
}

function resetEmail() {
  // Placeholder only.
  if (emailInput) {
    emailInput.value = "Click Generate Email";
  }

  if (inboxList) {
    inboxList.innerHTML = `
      <li class="empty-state">
        <strong>No messages yet</strong>
        <span>Generate an email and refresh your inbox to check for messages.</span>
      </li>
    `;
  }

  if (messageDetails) {
    messageDetails.innerHTML = `<p class="muted-text">Select a message from the inbox to view details here.</p>`;
  }

  disableMailboxButtons();
  updateStatus("Temporary email reset.");
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", nextTheme);
  localStorage.setItem("quicktemp-theme", nextTheme);
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
