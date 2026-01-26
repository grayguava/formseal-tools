/* ======================================================
   ED25519 — GENERATION
   Used by: Ed25519 keypair generator
====================================================== */

let currentPub = null;
let currentPriv = null;

function copyKey(id) {
  const el = document.getElementById(id);
  navigator.clipboard.writeText(el.value);
}

function downloadJSON() {
  if (!currentPub || !currentPriv) {
    alert("Generate a keypair first.");
    return;
  }

  const data = JSON.stringify({
    ed25519_public: currentPub,
    ed25519_private: currentPriv
  }, null, 2);

  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "ed25519.json";
  a.click();

  URL.revokeObjectURL(url);
}

async function generate() {
  await sodium.ready;
  const S = sodium;

  const kp = S.crypto_sign_keypair();

  currentPub  = S.to_base64(kp.publicKey,  S.base64_variants.URLSAFE_NO_PADDING);
  currentPriv = S.to_base64(kp.privateKey, S.base64_variants.URLSAFE_NO_PADDING);

  document.getElementById("pub").value  = currentPub;
  document.getElementById("priv").value = currentPriv;
}