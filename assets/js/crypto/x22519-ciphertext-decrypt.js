document.addEventListener("DOMContentLoaded", () => {

/* ======================================================
   SHARED OUTPUT
   ====================================================== */

function show(msg) {
  const out = document.getElementById("out");
  if (out) out.textContent = msg;
}

/* ======================================================
   PART 1 — X25519 KEY UPLOAD (RUNS ON LOAD)
   ====================================================== */

const fileInput = document.getElementById("keysFile");
const fileName  = document.getElementById("fileName");
const pubInput  = document.getElementById("pub");
const privInput = document.getElementById("priv");

if (fileInput && fileName && pubInput && privInput) {
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;

    fileName.textContent = file.name;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (
        typeof data.x25519_public !== "string" ||
        typeof data.x25519_private !== "string" ||
        !data.x25519_public.trim() ||
        !data.x25519_private.trim()
      ) {
        throw new Error("Invalid schema");
      }

      pubInput.value  = data.x25519_public.trim();
      privInput.value = data.x25519_private.trim();

      console.log("X25519 keys loaded");
    } catch {
      fileInput.value = "";
      fileName.textContent = "No file selected";
      pubInput.value = "";
      privInput.value = "";

      alert(
        "Invalid key file.\n\nExpected:\n" +
        "x25519_public\nx25519_private"
      );
    }
  });
}

/* ======================================================
   PART 2 — X25519 DECRYPT (RUNS ON CLICK)
   ====================================================== */

document.getElementById("decBtn").addEventListener("click", async () => {
  try {
    await sodium.ready;

    const cipherB64 = document.getElementById("cipher").value.trim();
    const pubB64    = pubInput.value.trim();
    const privB64   = privInput.value.trim();

    if (!cipherB64 || !pubB64 || !privB64) {
      show("❌ Missing ciphertext or keys.");
      return;
    }

    const cipher = sodium.from_base64(
      cipherB64,
      sodium.base64_variants.URLSAFE_NO_PADDING
    );
    const pubKey = sodium.from_base64(
      pubB64,
      sodium.base64_variants.URLSAFE_NO_PADDING
    );
    const privKey = sodium.from_base64(
      privB64,
      sodium.base64_variants.URLSAFE_NO_PADDING
    );

    const msgBytes = sodium.crypto_box_seal_open(cipher, pubKey, privKey);

    if (!msgBytes) {
      show(
        "❌ Decryption failed.\n\n" +
        "• Wrong keypair\n" +
        "• Wrong ciphertext\n" +
        "• Extra whitespace"
      );
      return;
    }

    const plaintext = new TextDecoder().decode(msgBytes);
    show(plaintext);

  } catch (err) {
    show("Error: " + err.message);
  }
});

  });