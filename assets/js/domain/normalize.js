// assets/js/domain/normalize.js

/**
 * Normalize decrypted payloads into a flat, version-agnostic shape.
 * This is the ONLY place that knows about schema versions.
 */
export function normalizePayload(obj) {
  if (!obj || typeof obj !== "object") {
    throw new Error("Invalid payload: not an object");
  }

  // v2+ schema (nested under `data`)
  if (obj.data && typeof obj.data === "object") {
    return {
      fullname: obj.data.fullname ?? "",
      email: obj.data.email ?? "",
      client_time: obj.data.client_time ?? "",
      client_tz: obj.data.client_tz ?? "",
      message: obj.data.message ?? ""
    };
  }

  // legacy v1 schema (flat)
  return {
    fullname: obj.fullname ?? "",
    email: obj.email ?? "",
    client_time: obj.client_time ?? "",
    client_tz: obj.client_tz ?? "",
    message: obj.message ?? ""
  };
}
