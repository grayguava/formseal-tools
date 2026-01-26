import { signCanonical } from "/assets/js/crypto/ed25519-sign.js";
import { base64UrlToBytes } from "/assets/js/shared/encoding.js";
import { randomNonce } from "/assets/js/shared/nonce.js";
import { showStatus, clearStatus } from "/assets/js/shared/status.js";

/* =========================
   DOM REFERENCES
========================= */
const apiUrlEl   = document.getElementById("apiUrl");
const privKeyEl  = document.getElementById("privKey");
const pubKeyEl   = document.getElementById("pubKey");
const keysFileEl = document.getElementById("keysFile");
const limitEl    = document.getElementById("limit");
const fetchBtn   = document.getElementById("fetchBtn");
const statusEl   = document.getElementById("status");

/* =========================
   STATE
========================= */
let privateKeyBytes = null;
let publicKeyBytes  = null;

/* =========================
   KEY NORMALIZATION
========================= */
function parseKeysObject(obj) {
  let priv, pub;

  if (obj.ed25519_private) {
    priv = obj.ed25519_private;
    pub  = obj.ed25519_public;
  } else if (obj.privateKey) {
    priv = obj.privateKey;
    pub  = obj.publicKey;
  } else {
    throw new Error("Unrecognized key format");
  }

  if (!priv) throw new Error("Missing private key");

  const privBytes = base64UrlToBytes(priv);
  const pubBytes  = pub ? base64UrlToBytes(pub) : null;

  if (privBytes.length !== 64)
    throw new Error("Invalid Ed25519 private key length");

  if (pubBytes && pubBytes.length !== 32)
    throw new Error("Invalid Ed25519 public key length");

  return { privBytes, pubBytes };
}

/* =========================
   FILE INPUT (keys.json)
========================= */
const fileNameEl = document.getElementById("fileName");

keysFileEl.addEventListener("change", async () => {
  clearStatus(statusEl);

  const file = keysFileEl.files[0];
  fileNameEl.textContent = file ? file.name : "No file selected";
  if (!file) return;

  try {
    const json = JSON.parse(await file.text());
    const { privBytes, pubBytes } = parseKeysObject(json);

    privateKeyBytes = privBytes;
    publicKeyBytes  = pubBytes;



    showStatus(statusEl, "keys.json loaded");
  } catch {
    privateKeyBytes = null;
    publicKeyBytes  = null;
    privKeyEl.value = "";
    pubKeyEl.value  = "";
    showStatus(statusEl, "Invalid keys.json");
  }
});


/* =========================
   MANUAL KEY FALLBACK
========================= */
function loadManualKeys() {
  const privText = privKeyEl.value.trim();
  if (!privText) return false;

  try {
    const privBytes = base64UrlToBytes(privText);
    if (privBytes.length !== 64) return false;

    privateKeyBytes = privBytes;

    const pubText = pubKeyEl.value.trim();
    if (pubText) {
      const pubBytes = base64UrlToBytes(pubText);
      if (pubBytes.length !== 32) return false;
      publicKeyBytes = pubBytes;
    }

    return true;
  } catch {
    return false;
  }
}


/* =========================
   FETCH HANDLER
========================= */
fetchBtn.addEventListener("click", async () => {
  // prevent double-click / reentry
  if (fetchBtn.disabled) return;

  fetchBtn.disabled = true;
  const oldText = fetchBtn.textContent;
  fetchBtn.textContent = "Working…";

  try {
    clearStatus(statusEl);

  let apiUrl = apiUrlEl.value.trim();

// Auto-prefix https:// if missing
if (!/^https?:\/\//i.test(apiUrl)) {
  apiUrl = "https://" + apiUrl;
}

// Validate URL properly
let parsedUrl;
try {
  parsedUrl = new URL(apiUrl);
} catch {
  alert("Invalid API URL");
  return;
}

// Enforce HTTPS
if (parsedUrl.protocol !== "https:") {
  alert("API URL must use https");
  return;
}

// Use normalized URL from here on
apiUrl = parsedUrl.toString();

// Optional: reflect normalized URL back in the input
apiUrlEl.value = apiUrl;

    
    if (!privateKeyBytes && !loadManualKeys()) {
      alert("Invalid or missing private key");
      return;
    }

    const limit = Math.min(
      Math.max(1, Number(limitEl.value) || 1),
      500
    );

    const ts    = Math.floor(Date.now() / 1000);
    const nonce = randomNonce();

    // NOTE: path MUST match worker verification logic
    const canonical = [
      "POST",
      "/api/admin/export",
      ts,
      nonce,
      limit,
      ""
    ].join("\n");

    // DEBUG ONLY — canonical preview
    console.debug(
      "[KV EXPORT] Canonical string:\n" + canonical
    );

    let signature;
    try {
      signature = await signCanonical(canonical, privateKeyBytes);
    } catch {
      alert("Signing failed");
      return;
    }

    const payload = {
      ts,
      nonce,
      limit,
      signature
    };

    showStatus(statusEl, "Requesting export…");

    /* =========================
       FORM POST (DOWNLOAD)
    ========================= */
    const form = document.createElement("form");
    form.method = "POST";
    form.action = apiUrl;
    form.style.display = "none";

    const input = document.createElement("input");
    input.type  = "hidden";
    input.name  = "payload";
    input.value = JSON.stringify(payload);

    form.appendChild(input);
    document.body.appendChild(form);

    form.submit();
    form.remove();

    showStatus(statusEl, "Export requested");
  } finally {
    // always restore button state
    fetchBtn.disabled = false;
    fetchBtn.textContent = oldText;
  }
});

