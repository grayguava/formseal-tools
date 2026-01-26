export function base64UrlToBytes(b64url) {
  if (!b64url || typeof b64url !== "string") {
    throw new Error("Invalid base64url input");
  }

  return sodium.from_base64(
    b64url.trim(),
    sodium.base64_variants.URLSAFE_NO_PADDING
  );
}

export function bytesToBase64Url(bytes) {
  return sodium.to_base64(
    bytes,
    sodium.base64_variants.URLSAFE_NO_PADDING
  );
}
