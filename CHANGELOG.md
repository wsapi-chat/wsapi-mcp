# Changelog

## [3.2.0] - 2026-11-25

### Added

- Passkey pairing tools for accounts that make the owner verify with a passkey before a device links: `whatsapp_get_passkey_state` (read-only), `whatsapp_request_passkey_challenge`, `whatsapp_submit_passkey` (takes the browser's `PublicKeyCredential.toJSON()` object) and `whatsapp_confirm_passkey` (compatibility only; the server confirms automatically). The challenge must be signed in a browser on https://web.whatsapp.com.
- A 409 from the QR and pair-code tools while a passkey step is pending is reported as `PASSKEY_PENDING`, pointing to `whatsapp_get_passkey_state`.
- `PasskeyState`, `PasskeyAssertion`, `SessionStatus.passkeyStatus` and `UserInfo.verifiedName` in the OpenAPI spec and generated types.

### Changed

- `whatsapp_create_group`: `participants` is optional. Omit it or pass `[]` to create a group with only the paired account.

### Fixed

- The bundled OpenAPI spec documented the `DeviceNotPaired` response with status 403; the API returns 409
- The server reported version 2.0.0 to MCP clients regardless of the installed package; it now reports the package version

## [3.1.0]

Every tool now carries MCP annotations (read-only, destructive, idempotent, open-world) and a description that says what it changes, when to use it instead of a similar tool, and what it returns. Clients and agents can tell a harmless read from an irreversible delete before calling it. A test keeps new tools from shipping without both.

## [3.0.0]

QR images and media downloads now preserve binary bytes and return MCP image/embedded-resource content. Quiet dotenv startup avoids contaminating the stdio protocol. Added HTTP-backed binary tests and corrected catalog/runtime/scope documentation. Updated compatible dependency fixes.
