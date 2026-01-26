/* ======================================================
   ED25519 — SIGNING / AUTHENTICATION
   Used by: KV exporter
====================================================== */

export async function signCanonical(canonical, privateKeyBytes) {
  if (!canonical || !privateKeyBytes) {
    throw new Error("Missing signing input");
  }

  await sodium.ready;

  const msg = new TextEncoder().encode(canonical);
  const sig = sodium.crypto_sign_detached(msg, privateKeyBytes);

  return sodium.to_base64(
    sig,
    sodium.base64_variants.URLSAFE_NO_PADDING
  );
}
