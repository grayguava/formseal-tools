/* ======================================================
   X25519 — SEALED BOX (crypto_box_seal_open)
   Used by: KV to CSV converter
====================================================== */

/**
 * Open a sealed box encrypted for a specific recipient
 *
 * @param {Uint8Array} ciphertext
 * @param {Uint8Array} recipientPublicKey
 * @param {Uint8Array} recipientPrivateKey
 */

export async function decryptSealedBox(
  cipherBytes,
  recipientPublicKeyBytes,
  recipientPrivateKeyBytes
) {
  if (!cipherBytes || !recipientPublicKeyBytes || !recipientPrivateKeyBytes) {
    throw new Error("Missing sealed box inputs");
  }

  await sodium.ready;

  const plaintextBytes = sodium.crypto_box_seal_open(
    cipherBytes,
    recipientPublicKeyBytes,
    recipientPrivateKeyBytes
  );

  if (!plaintextBytes) {
    throw new Error("Sealed box decryption failed");
  }

  return plaintextBytes;
}
