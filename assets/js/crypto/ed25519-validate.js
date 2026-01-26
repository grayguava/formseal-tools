(async () => {
  await sodium.ready;
  const S = sodium;

  /* ======================================================
     STATUS / RESULT HANDLING
     ====================================================== */

  function setResult(msg, ok) {
    const el = document.getElementById("result");
    if (!el) return;

    el.textContent = msg;

    if (ok === true) el.style.color = "green";
    else if (ok === false) el.style.color = "red";
    else el.style.color = "inherit";
  }

  /* ======================================================
     PART 1 — KEY UPLOAD (JSON → INPUT FIELDS)
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
  typeof data.ed25519_public !== "string" ||
  typeof data.ed25519_private !== "string" ||
  !data.ed25519_public.trim() ||
  !data.ed25519_private.trim()
) {
  throw new Error("Invalid key values");
}

pubInput.value  = data.ed25519_public.trim();
privInput.value = data.ed25519_private.trim();


        setResult("Key file loaded. Ready to verify.", null);
      } catch {
        setResult(
          "Invalid key file. Expected JSON with ed25519_public and ed25519_private.",
          false
        );

        fileInput.value = "";
        fileName.textContent = "No file selected";
        pubInput.value = "";
        privInput.value = "";
      }
    });
  }

  /* ======================================================
     PART 2 — KEYPAIR VERIFICATION (CRYPTO)
     ====================================================== */

  const verifyBtn = document.getElementById("verifyBtn");

  if (verifyBtn && pubInput && privInput) {
    verifyBtn.onclick = () => {
      const pubB64  = pubInput.value.trim();
      const privB64 = privInput.value.trim();

      if (!pubB64 || !privB64) {
        setResult("Both keys are required.", false);
        return;
      }

      try {
        const pub  = S.from_base64(
          pubB64,
          S.base64_variants.URLSAFE_NO_PADDING
        );

        const priv = S.from_base64(
          privB64,
          S.base64_variants.URLSAFE_NO_PADDING
        );

        if (pub.length !== 32) {
          setResult(
            "Invalid public key length (must be 32 bytes).",
            false
          );
          return;
        }

        if (priv.length !== 64) {
          setResult(
            "Invalid private key length (must be 64 bytes).",
            false
          );
          return;
        }

        const msg = S.from_string("verification-test");
        const sig = S.crypto_sign_detached(msg, priv);

        const ok = S.crypto_sign_verify_detached(sig, msg, pub);

        setResult(
          ok
            ? "✔ VALID KEYPAIR — signing & verification successful"
            : "❌ INVALID KEYPAIR — verification failed",
          ok
        );
      } catch {
        setResult("❌ Malformed Base64 or invalid key format.", false);
      }
    };
  }
})();
