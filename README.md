# FormSeal tools (Archived)

⚠️ **This repository is archived and no longer in active use.**

This repository contains **historical tooling and experiments** related to early
operator-side workflows for FormSeal. It is preserved for reference only and is
not maintained, updated, or recommended for current deployments.

---

## Status

- ❌ Not actively developed
- ❌ Not used by current FormSeal deployments
- ❌ No guarantees of correctness or security
- ✅ Kept for historical and educational reference

If you are operating FormSeal today, **do not use this repository**.

---

## Why this repository was archived

This repository represents an **earlier phase** of FormSeal’s operator tooling,
including browser-based utilities and exploratory workflows.

Over time, the FormSeal architecture evolved toward:
- stricter trust boundaries
- local, offline-first administration
- simpler and more auditable operational models

As part of that evolution, the tooling in this repository was superseded by a
cleaner, purpose-built admin toolchain hosted separately.

Archiving this repository avoids:
- misleading operators
- accidental use of outdated workflows
- security assumptions that no longer hold

---

## Current admin tooling (use this instead)

The **active and supported** administrative tooling for FormSeal lives here:

👉 **FormSeal Sync**  
https://github.com/grayguava/formseal-sync

FormSeal Sync provides:
- controlled export of encrypted submissions via same-origin APIs
- local, offline decryption using operator-held private keys
- scriptable, operator-driven workflows
- no browser-based admin attack surface

That repository reflects the **current and intended** operational model.

---

## Relationship to FormSeal

- **FormSeal (core)** handles browser-side encryption, ingestion, and blind storage
- **FormSeal Sync** handles export, decryption, and administrative inspection
- **This repository** is legacy and no longer part of the system

For the active ingestion pipeline, see:
https://github.com/grayguava/formseal

---

## Contents of this repository

This repository may include:
- browser-based cryptographic helpers
- experimental export and conversion tools
- early inspection utilities
- deprecated workflows

These are retained **as historical artifacts only**.

---

## Security notice

Do not assume:
- correctness of cryptographic implementations
- alignment with current FormSeal threat models
- compatibility with modern FormSeal deployments

No security updates will be provided for this repository.

---

## License

MIT License.

Archival status does not change licensing terms.
