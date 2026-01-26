import { decryptSealedBox } from "/assets/js/crypto/x25519-jsonl-decrypt.js";
import { base64UrlToBytes } from "/assets/js/shared/encoding.js";
import { normalizePayload } from "/assets/js/domain/normalize.js";
import { buildCsv } from "/assets/js/export/csv.js";

/* =========================
   DOM
========================= */
const privKeyEl   = document.getElementById("privKey");
const pubKeyEl    = document.getElementById("pubKey");
const keysFileEl  = document.getElementById("keysFile");
const jsonlFileEl = document.getElementById("jsonlFile");
const decryptBtn  = document.getElementById("decryptBtn");
const statusEl    = document.getElementById("status");
const fileNameEl       = document.getElementById("fileName");
const exportFileNameEl = document.getElementById("exportFileName");

/* =========================
   UI helpers
========================= */
keysFileEl.addEventListener("change", () => {
  fileNameEl.textContent =
    keysFileEl.files[0]?.name || "No file selected";
});

jsonlFileEl.addEventListener("change", () => {
  exportFileNameEl.textContent =
    jsonlFileEl.files[0]?.name || "No file selected";
});

/* =========================
   STATE
========================= */
let privateKeyBytes = null;
let publicKeyBytes  = null;

/* =========================
   LOAD keys.json (X25519 ONLY)
========================= */
keysFileEl.addEventListener("change", async () => {
  statusEl.textContent = "";

  try {
    const json = JSON.parse(await keysFileEl.files[0].text());

    if (!json.x25519_private || !json.x25519_public) {
      throw new Error("keys.json must contain x25519_private and x25519_public");
    }

    privateKeyBytes = base64UrlToBytes(json.x25519_private);
    publicKeyBytes  = base64UrlToBytes(json.x25519_public);

    statusEl.textContent = "X25519 keys loaded";
  } catch {
    privateKeyBytes = null;
    publicKeyBytes  = null;
    statusEl.textContent = "Invalid keys.json";
  }
});

/* =========================
   MANUAL KEY FALLBACK
========================= */
privKeyEl.addEventListener("input", async () => {
  try {
    await sodium.ready;

    const text = privKeyEl.value.trim();
    if (!text) {
      privateKeyBytes = null;
      return;
    }

    const bytes = base64UrlToBytes(text);
    if (bytes.length !== 32) {
      privateKeyBytes = null;
      return;
    }

    privateKeyBytes = bytes;
    publicKeyBytes  = sodium.crypto_scalarmult_base(bytes);
  } catch {
    privateKeyBytes = null;
  }
});

/* =========================
   MAIN ACTION
========================= */
decryptBtn.addEventListener("click", async () => {
  statusEl.textContent = "";

  if (!privateKeyBytes) {
    alert("X25519 private key required");
    return;
  }

  const file = jsonlFileEl.files[0];
  if (!file) {
    alert("No .jsonl file selected");
    return;
  }

  await sodium.ready;

  if (!publicKeyBytes) {
    publicKeyBytes = sodium.crypto_scalarmult_base(privateKeyBytes);
  }

  const text = await file.text();
  const entries = [];
  let failed = 0;

  for (const line of text.split("\n")) {
    if (!line.trim()) continue;

    try {
      const row = JSON.parse(line);

      if (!row.key || !row.blob) {
        failed++;
        continue;
      }

      const plaintext = await decryptSealedBox(
        base64UrlToBytes(row.blob),
        publicKeyBytes,
        privateKeyBytes
      );

      const decoded = new TextDecoder().decode(plaintext);
      const data = JSON.parse(decoded);

      const normalized = normalizePayload(data);

      // HARD GUARD — prevents silent schema corruption
      if (
        !normalized.fullname &&
        !normalized.email &&
        !normalized.message
      ) {
        throw new Error("Empty normalized payload (schema mismatch)");
      }

      entries.push({
        key: row.key,
        ...normalized
      });

    } catch {
      failed++;
    }
  }

  if (!entries.length) {
    alert("No entries decrypted");
    return;
  }

  /* =========================
     SORT BY LATEST TIME
  ========================= */
  entries.sort((a, b) =>
    Date.parse(b.client_time || 0) -
    Date.parse(a.client_time || 0)
  );

  /* =========================
     BUILD CSV (delegated)
  ========================= */
  const csv = buildCsv(entries);

  /* =========================
     DOWNLOAD
  ========================= */
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
 
    const originalName = file.name || "kv-export";
const baseName = originalName.replace(/\.[^.]+$/, "");
a.download = `${baseName}.csv`;

    
  a.click();

  statusEl.textContent =
    `Decrypted ${entries.length} entries` +
    (failed ? ` (${failed} failed)` : "");
});
