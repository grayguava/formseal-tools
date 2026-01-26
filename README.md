# FormSeal tools

FormSeal tools provides **operator-side utilities** for managing and inspecting FormSeal deployments.

These tools are designed to help operators:
- generate and validate cryptographic keys in the correct formats
- inspect and decrypt encrypted submissions offline
- export encrypted submissions from KV
- convert stored data into analysis-friendly formats

This repository complements the FormSeal pipeline but is **not part of the ingestion path**.

---

## What this repository is

This repository contains **utilities**, not services.

- No backend endpoints
- No ingestion logic
- No plaintext handling on the server
- No admin dashboard

All tooling is intended to be:
- explicit
- operator-controlled
- format-safe
- usable offline where possible

---

## Relationship to FormSeal

FormSeal tools is built to operate on data produced by the **FormSeal pipeline**.

- FormSeal handles secure ingestion and storage
- FormSeal Tools handle inspection and analysis after submission

For the ingestion pipeline, see:
[FormSeal  repository on GitHub](https://github.com/grayguava/formseal)


This separation is intentional to keep the pipeline small and auditable.

---

## Tool categories

### Key utilities
Helpers for generating and validating cryptographic keys used by FormSeal.

- X25519 keypair generation (for client-side encryption targets)
- Ed25519 keypair generation and validation (where applicable)
- Format enforcement (base64url, padding rules)

These tools exist to prevent common operator mistakes related to key formats.

---

### Submission inspection
Utilities for working with encrypted submissions.

- Offline decryption using operator-held private keys
- Payload decoding and validation
- JSONL inspection

All decryption happens **locally**.  
The backend never sees plaintext.

---

### KV interaction
Tools for interacting with stored submissions.

- Encrypted submission export from Cloudflare KV
- Read-only access patterns
- No mutation of stored data

Only export tools make network requests.  
All other tooling can be used fully offline.

---

### Data conversion
Helpers for transforming stored data into usable formats.

- JSONL → CSV conversion
- Field normalization for analysis
- Format-preserving transforms

These tools are intended for post-processing and review.

---

## Security model

- Operators are responsible for key custody
- Private keys never leave the operator environment
- No secrets are embedded in this repository
- No automatic key generation or storage is performed

These tools reduce **format and handling errors**, not operational responsibility.

---

## What this repository does NOT do

- No submission ingestion
- No authentication or login system
- No abuse mitigation
- No server-side crypto
- No hosted services

Those concerns are handled by FormSeal or by the operator.

---

## Usage expectations

This repository assumes:
- you already run or understand FormSeal
- you control the relevant private keys
- you understand the implications of decrypting stored data

These tools are helpers, not guardrails.

---

## License

MIT License.