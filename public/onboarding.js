const params = new URLSearchParams(window.location.search);
const telegramUserId = params.get("telegramUserId");
const telegramUsername = params.get("telegramUsername");
const platform = params.get("platform") || "telegram";

const telegramIdentityEl = document.getElementById("telegramIdentity");
const statusEl = document.getElementById("status");
const signupBtn = document.getElementById("signupBtn");
const signinBtn = document.getElementById("signinBtn");
const connectDriveBtn = document.getElementById("connectDriveBtn");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

let authToken = null;
let linkedUser = null;

function setStatus(message, type = "") {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

function getApiBaseUrl() {
  return window.location.origin;
}

function renderTelegramIdentity() {
  if (!telegramIdentityEl) return;

  if (!telegramUserId) {
    telegramIdentityEl.textContent = "Missing telegram identity in URL";
    setStatus("Invalid onboarding link. Telegram user id is missing.", "error");

    if (signupBtn) signupBtn.disabled = true;
    if (signinBtn) signinBtn.disabled = true;

    return;
  }

  telegramIdentityEl.textContent = telegramUsername
    ? `@${telegramUsername} (id: ${telegramUserId})`
    : `Telegram user id: ${telegramUserId}`;
}

async function signup() {
  const name = nameInput?.value.trim();
  const email = emailInput?.value.trim();
  const password = passwordInput?.value.trim();

  if (!name || !email || !password) {
    setStatus("Name, email, and password are required for signup.", "error");
    return null;
  }

  const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Signup failed");
  }

  return data;
}

async function signin() {
  const email = emailInput?.value.trim();
  const password = passwordInput?.value.trim();

  if (!email || !password) {
    setStatus("Email and password are required for signin.", "error");
    return null;
  }

  const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Signin failed");
  }

  return data;
}

async function linkTelegramIdentity(token) {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/link-channel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      platform,
      externalId: telegramUserId,
      username: telegramUsername,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to link Telegram account");
  }

  return data;
}

async function handleAuth(mode) {
  try {
    if (signupBtn) signupBtn.disabled = true;
    if (signinBtn) signinBtn.disabled = true;
    if (connectDriveBtn) connectDriveBtn.style.display = "none";

    setStatus(mode === "signup" ? "Creating account..." : "Signing in...");

    const authData = mode === "signup" ? await signup() : await signin();

    if (!authData) {
      return;
    }

    const payload = authData.data || authData;

    authToken = payload.token || payload.accessToken || null;
    linkedUser = payload.user || null;

    if (!authToken || !linkedUser?.id) {
      throw new Error("Auth API must return user.id and token/accessToken");
    }

    setStatus("Linking Telegram identity...");
    await linkTelegramIdentity(authToken);

    setStatus("Telegram account linked successfully.", "success");

    if (connectDriveBtn) {
      connectDriveBtn.style.display = "block";
    }
  } catch (error) {
    setStatus(error.message || "Something went wrong", "error");
  } finally {
    if (signupBtn) signupBtn.disabled = false;
    if (signinBtn) signinBtn.disabled = false;
  }
}

if (signupBtn) {
  signupBtn.addEventListener("click", () => handleAuth("signup"));
}

if (signinBtn) {
  signinBtn.addEventListener("click", () => handleAuth("signin"));
}

if (connectDriveBtn) {
  connectDriveBtn.addEventListener("click", () => {
    if (!authToken) {
      setStatus("Missing auth token. Please sign in again.", "error");
      return;
    }

    window.location.href =
      `${getApiBaseUrl()}/api/v1/drive/google/connect?token=` +
      encodeURIComponent(authToken);
  });
}

renderTelegramIdentity();
