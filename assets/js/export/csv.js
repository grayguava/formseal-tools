// assets/js/export/csv.js

/**
 * Build a CSV string from normalized entries.
 * Assumes input is already normalized.
 */
export function buildCsv(entries) {
  const headers = [
    "key",
    "fullname",
    "email",
    "client_time",
    "client_tz",
    "message"
  ];

  return [
    headers.join(","),
    ...entries.map(e =>
      headers.map(h =>
        `"${String(e[h] ?? "").replace(/"/g, '""')}"`
      ).join(",")
    )
  ].join("\n");
}
