/* ======================================================
   X25519 — GENERATION & KEY IMPORT
   Used by: X25519 KEYPAIR GENERATOR
====================================================== */


console.log("keys.js loaded", document.currentScript);


let currentPub = null;
let currentPriv = null;

async function generate() {
  console.log("generate() triggered");
  await sodium.ready;

  const kp = sodium.crypto_kx_keypair();

  if (currentPub) sodium.memzero(currentPub);
  if (currentPriv) sodium.memzero(currentPriv);

  currentPub = kp.publicKey;
  currentPriv = kp.privateKey;

  const pubB64 = sodium.to_base64(
    currentPub,
    sodium.base64_variants.URLSAFE_NO_PADDING
  );

  const privB64 = sodium.to_base64(
    currentPriv,
    sodium.base64_variants.URLSAFE_NO_PADDING
  );

  const decodedPub = sodium.from_base64(
    pubB64,
    sodium.base64_variants.URLSAFE_NO_PADDING
  );

  const decodedPriv = sodium.from_base64(
    privB64,
    sodium.base64_variants.URLSAFE_NO_PADDING
  );

  console.log("Pub bytes:", decodedPub.length);
  console.log("Priv bytes:", decodedPriv.length);

  const shared = sodium.crypto_scalarmult(decodedPriv, decodedPub);
  console.log("Shared secret length:", shared.length);

  document.getElementById("pub").value = pubB64;
  document.getElementById("priv").value = privB64;
}

function copyKey(id) {
  navigator.clipboard.writeText(
    document.getElementById(id).value
  );
}

function downloadJSON() {
  const pub = document.getElementById("pub").value;
  const priv = document.getElementById("priv").value;

  if (!pub || !priv) {
    alert("Generate a keypair first.");
    return;
  }

  const blob = new Blob(
    [JSON.stringify({ x25519_public: pub, x25519_private: priv }, null, 2)],
    { type: "application/json" }
  );

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "x25519.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importKey() {
  await sodium.ready;

  const input = document
    .getElementById("importPriv")
    .value
    .trim();

  const status = document.getElementById("importStatus");

  if (!input) {
    status.textContent = "Error: Key is empty.";
    status.style.color = "red";
    return;
  }

  if (input.includes("=")) {
    status.textContent = "Error: Key uses invalid padding (=).";
    status.style.color = "red";
    return;
  }

  if (!/^[A-Za-z0-9\-_]+$/.test(input)) {
    status.textContent =
      "Error: Invalid Base64 URL-safe characters.";
    status.style.color = "red";
    return;
  }

  let privBytes;
  try {
    privBytes = sodium.from_base64(
      input,
      sodium.base64_variants.URLSAFE_NO_PADDING
    );
  } catch {
    status.textContent = "Error: Base64 decode failed.";
    status.style.color = "red";
    return;
  }

  if (privBytes.length !== 32) {
    status.textContent =
      `Error: Decoded length ${privBytes.length}, expected 32.`;
    status.style.color = "red";
    return;
  }

  let derivedPub;
  try {
    derivedPub = sodium.crypto_scalarmult_base(privBytes);
  } catch {
    status.textContent = "Error: Invalid X25519 key.";
    status.style.color = "red";
    return;
  }

  status.textContent =
    "Success: Valid X25519 private key imported!";
  status.style.color = "green";

  window.importedPrivateKey = privBytes;
  window.importedPublicKey = derivedPub;

  const derivedPubB64 = sodium.to_base64(
    derivedPub,
    sodium.base64_variants.URLSAFE_NO_PADDING
  );

  document.getElementById("importPub").value = derivedPubB64;
}

// expose functions explicitly (optional but clean)
window.generate = generate;
window.copyKey = copyKey;
window.downloadJSON = downloadJSON;
window.importKey = importKey;
