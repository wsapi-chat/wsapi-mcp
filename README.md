# @wsapichat/mcp-server

[![npm version](https://badge.fury.io/js/@wsapichat%2Fmcp-server.svg)](https://badge.fury.io/js/@wsapichat%2Fmcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<a href="https://glama.ai/mcp/servers/@wsapi-chat/wsapi-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@wsapi-chat/wsapi-mcp/badge" alt="WSAPI WhatsApp Server MCP server" />
</a>

A Model Context Protocol (MCP) server for [WSAPI](https://wsapi.chat) - the WhatsApp API Gateway. Enables LLMs to send messages, manage contacts and groups, handle communities and newsletters, post status updates, and more through WhatsApp.

For comprehensive documentation, see the [WSAPI MCP Server guide](https://docs.wsapi.chat/integrations/mcp-server).

> **Note**: This project is not affiliated with, associated with, or endorsed by WhatsApp or Meta.

## Installation

### Prerequisites

- Node.js >= 20.19.0
- WSAPI account with API credentials ([wsapi.chat](https://wsapi.chat))

### Claude Desktop

Add to your Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "wsapi": {
      "command": "npx",
      "args": ["@wsapichat/mcp-server"],
      "env": {
        "WSAPI_API_KEY": "your_api_key_here",
        "WSAPI_INSTANCE_ID": "your_instance_id_here",
        "WSAPI_ENABLED_CATEGORIES": "messaging,contacts"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add wsapi -- npx @wsapichat/mcp-server \
  --env WSAPI_API_KEY=your_api_key_here \
  --env WSAPI_INSTANCE_ID=your_instance_id_here \
  --env WSAPI_ENABLED_CATEGORIES=messaging,contacts
```

## Tool Filtering

The server exposes 80+ tools across 12 categories. To reduce context window usage, you can filter which tools are loaded using environment variables.

### By category

Load only messaging and contact tools:

```
WSAPI_ENABLED_CATEGORIES=messaging,contacts
```

Available categories: `messaging`, `contacts`, `groups`, `chats`, `session`, `users`, `communities`, `newsletters`, `status`, `calls`, `media`

### By individual tool

Load only specific tools:

```
WSAPI_ENABLED_TOOLS=whatsapp_send_text,whatsapp_send_image,whatsapp_get_contacts
```

### Combined

Use categories as a base set and add individual tools from other categories:

```
WSAPI_ENABLED_CATEGORIES=messaging
WSAPI_ENABLED_TOOLS=whatsapp_get_contacts,whatsapp_get_chats
```

If neither variable is set, all tools are loaded.

## Passkey pairing

Some WhatsApp accounts make the owner verify with their passkey (WebAuthn) before a device links. While that step is pending, the QR and pair-code tools return 409 and `whatsapp_get_session_status` reports `passkeyStatus`. The `session` category covers the flow:

1. `whatsapp_get_passkey_state` returns the WebAuthn `challenge` (or `whatsapp_request_passkey_challenge` asks WhatsApp for one).
2. The account owner signs it with `navigator.credentials.get()` in a browser on `https://web.whatsapp.com`. The agent cannot do this itself, because WebAuthn binds the origin into the signature.
3. `whatsapp_submit_passkey` forwards the browser's `PublicKeyCredential.toJSON()` output.
4. If the state becomes `confirmation_required`, show `confirmationCode` to the owner, who approves on their phone. The server sends the confirmation automatically; `whatsapp_confirm_passkey` exists only for compatibility.

## Configuration

| Variable                   | Required | Default              | Description                              |
| -------------------------- | -------- | -------------------- | ---------------------------------------- |
| `WSAPI_API_KEY`            | Yes      | -                    | Your WSAPI API key                       |
| `WSAPI_INSTANCE_ID`        | Yes      | -                    | Your WSAPI instance ID                   |
| `WSAPI_BASE_URL`           | No       | `https://wsapi.chat` | WSAPI base URL                           |
| `WSAPI_ENABLED_CATEGORIES` | No       | _(all)_              | Comma-separated tool categories to load  |
| `WSAPI_ENABLED_TOOLS`      | No       | _(all)_              | Comma-separated tool names to load       |
| `LOG_LEVEL`                | No       | `info`               | Logging level (error, warn, info, debug) |

## Development

```bash
git clone https://github.com/wsapi-chat/wsapi-mcp
cd wsapi-mcp
npm install
cp .env.example .env  # Edit with your credentials
npm run build
npm start
```

## License

MIT - see [LICENSE](LICENSE) for details.

## Links

- [WSAPI MCP Server Documentation](https://docs.wsapi.chat/integrations/mcp-server)
- [WSAPI Documentation](https://docs.wsapi.chat)
- [Model Context Protocol](https://modelcontextprotocol.io)

## Scope

The server covers 105 WhatsApp operations; Cloud Account/subscription and OSS admin APIs are outside this integration's scope. See [CHANGELOG.md](CHANGELOG.md).
