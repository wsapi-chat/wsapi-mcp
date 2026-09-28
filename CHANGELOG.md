# Changelog

## [3.1.0]

Every tool now carries MCP annotations (read-only, destructive, idempotent, open-world) and a description that says what it changes, when to use it instead of a similar tool, and what it returns. Clients and agents can tell a harmless read from an irreversible delete before calling it. A test keeps new tools from shipping without both.

## [3.0.0]

QR images and media downloads now preserve binary bytes and return MCP image/embedded-resource content. Quiet dotenv startup avoids contaminating the stdio protocol. Added HTTP-backed binary tests and corrected catalog/runtime/scope documentation. Updated compatible dependency fixes.
