# @wsapichat/mcp-server

[![npm version](https://badge.fury.io/js/@wsapichat%2Fmcp-server.svg)](https://badge.fury.io/js/@wsapichat%2Fmcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive Model Context Protocol (MCP) server that provides LLMs with seamless access to WhatsApp functionality through the WSAPI service. This server enables AI assistants to send messages, manage contacts and groups, handle chat operations, and much more functionallity.

## 🚀 Features

### 📱 Core Messaging
- **Text Messages**: Send rich text with mentions and replies
- **Media Messages**: Send images, videos, audio files, and voice messages
- **Documents**: Share files with captions
- **Stickers**: Send animated and static stickers
- **Location**: Share location data with coordinates and place information
- **Contacts**: Send vCard contacts
- **Links**: Send URLs with rich preview metadata
- **Reactions**: React to messages with emojis

### 📧 Message Management
- **Edit Messages**: Modify sent text messages
- **Delete Messages**: Remove messages for all participants or just yourself
- **Star Messages**: Mark important messages
- **Mark as Read**: Update message read status
- **Reply to Messages**: Create threaded conversations

### 👥 Contact Management
- **List Contacts**: Get all WhatsApp contacts
- **Contact Details**: Retrieve contact information and business profiles
- **Create/Update Contacts**: Manage your contact list
- **Profile Pictures**: Get contact profile images
- **Presence Subscription**: Monitor contact online status

### 🏢 Group Management
- **Create Groups**: Start new group chats with participants
- **Group Info**: Get group details and participant lists
- **Manage Participants**: Add/remove group members
- **Group Settings**: Update name, description, and picture
- **Invite Links**: Generate and manage group invite links

### 💬 Chat Management
- **List Chats**: Get all active conversations
- **Chat Presence**: Set typing/recording indicators
- **Archive/Unarchive**: Organize chat list
- **Pin/Unpin**: Prioritize important chats
- **Mute/Unmute**: Control notifications
- **Ephemeral Messages**: Configure disappearing messages

### 🔐 Session & Instance Management
- **Session Status**: Monitor connection state
- **QR Code Login**: Get QR codes for device pairing
- **Pair Code**: Generate pairing codes for phone linking
- **Logout**: Disconnect from WhatsApp
- **Instance Settings**: Configure instance preferences
- **API Key Management**: Generate new authentication keys

### 👤 Account Management
- **Profile Info**: Get account details
- **Display Name**: Update account name
- **Profile Picture**: Change profile image
- **Status Message**: Update account status
- **Presence Status**: Set availability (available/unavailable)

## 📦 Installation

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager
- WSAPI account with API credentials

### NPM Installation

```bash
npm install -g @wsapichat/mcp-server
```

### Usage with MCP Clients

#### Claude Desktop Configuration

Add the server to your Claude Desktop configuration file:

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
        "WSAPI_INSTANCE_ID": "your_instance_id_here"
      }
    }
  }
}
```

#### Alternative: Local Installation

1. **Install the package:**
```bash
npm install @wsapichat/mcp-server
```

2. **Configure environment variables:**
```env
WSAPI_API_KEY=your_api_key_here
WSAPI_INSTANCE_ID=your_instance_id_here
WSAPI_BASE_URL=https://api.wsapi.chat
```

3. **Add to MCP client configuration:**
```json
{
  "mcpServers": {
    "wsapi": {
      "command": "node",
      "args": ["./node_modules/@wsapichat/mcp-server/dist/index.js"],
      "env": {
        "WSAPI_API_KEY": "your_api_key_here",
        "WSAPI_INSTANCE_ID": "your_instance_id_here"
      }
    }
  }
}
```

### Development Setup

1. **Clone and install dependencies:**
```bash
git clone https://github.com/wsapi-chat/wsapi-mcp
cd wsapi-mcp
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
```

3. **Edit `.env` file with your WSAPI credentials:**
```env
WSAPI_API_KEY=your_api_key_here
WSAPI_INSTANCE_ID=your_instance_id_here
WSAPI_BASE_URL=https://api.wsapi.chat

# Server configuration
LOG_LEVEL=info
NODE_ENV=development
```

4. **Build and start:**
```bash
npm run build
npm start
```

## 🔧 Development

### Development Mode
```bash
npm run dev
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
npm run lint:fix
```

### Testing
```bash
npm test
npm run test:watch
```

### Generate Types from OpenAPI
```bash
npm run generate-types
```

## 🛠️ Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `WSAPI_API_KEY` | Yes | - | Your WSAPI API key |
| `WSAPI_INSTANCE_ID` | Yes | - | Your WSAPI instance ID |
| `WSAPI_BASE_URL` | No | `https://api.wsapi.chat` | WSAPI base URL |
| `WSAPI_TIMEOUT` | No | `30000` | Request timeout in milliseconds |
| `WSAPI_RETRY_ATTEMPTS` | No | `3` | Number of retry attempts |
| `WSAPI_RETRY_DELAY` | No | `1000` | Delay between retries in milliseconds |
| `PORT` | No | `3000` | Server port |
| `LOG_LEVEL` | No | `info` | Logging level (error, warn, info, debug) |
| `NODE_ENV` | No | `development` | Environment (development, production, test) |

### Getting WSAPI Credentials

1. Visit [WSAPI.chat](https://wsapi.chat) and create an account
2. Create a new WhatsApp instance
3. Get your API key and Instance ID from the dashboard
4. Configure your instance settings as needed

## 📚 Usage Examples

### Send a Text Message
```typescript
// Tool: whatsapp_send_text
{
  "to": "1234567890@s.whatsapp.net",
  "text": "Hello! How are you today?",
  "mentions": ["1234567890@s.whatsapp.net"]
}
```

### Send an Image with Caption
```typescript
// Tool: whatsapp_send_image
{
  "to": "1234567890@s.whatsapp.net",
  "imageURL": "https://example.com/image.jpg",
  "mimeType": "image/jpeg",
  "caption": "Check out this amazing photo!"
}
```

### Create a Group
```typescript
// Tool: whatsapp_create_group
{
  "name": "Project Team",
  "participants": [
    "1234567890@s.whatsapp.net",
    "0987654321@s.whatsapp.net"
  ]
}
```

### Send Location
```typescript
// Tool: whatsapp_send_location
{
  "to": "1234567890@s.whatsapp.net",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "name": "San Francisco",
  "address": "San Francisco, CA, USA"
}
```

### Set Chat Presence
```typescript
// Tool: whatsapp_set_chat_presence
{
  "chatId": "1234567890@s.whatsapp.net",
  "state": "typing"
}
```

## 🔗 Available Tools

### Messaging Tools
- `whatsapp_send_text` - Send text messages
- `whatsapp_send_image` - Send image messages
- `whatsapp_send_video` - Send video messages
- `whatsapp_send_audio` - Send audio files
- `whatsapp_send_voice` - Send voice messages
- `whatsapp_send_document` - Send document files
- `whatsapp_send_sticker` - Send stickers
- `whatsapp_send_location` - Send location data
- `whatsapp_send_contact` - Send contact vCards
- `whatsapp_send_link` - Send links with preview
- `whatsapp_send_reaction` - React to messages
- `whatsapp_edit_message` - Edit sent messages
- `whatsapp_delete_message` - Delete messages
- `whatsapp_mark_message_read` - Mark messages as read
- `whatsapp_star_message` - Star messages

### Contact Tools
- `whatsapp_get_contacts` - List all contacts
- `whatsapp_get_contact` - Get contact details
- `whatsapp_create_contact` - Create new contact
- `whatsapp_update_contact` - Update contact info
- `whatsapp_get_contact_picture` - Get contact profile picture
- `whatsapp_get_contact_business` - Get business profile
- `whatsapp_subscribe_contact_presence` - Monitor contact status

### Group Tools
- `whatsapp_get_groups` - List all groups
- `whatsapp_create_group` - Create new group
- `whatsapp_get_group` - Get group details
- `whatsapp_update_group_name` - Change group name

### Chat Tools
- `whatsapp_get_chats` - List all chats
- `whatsapp_get_chat` - Get chat details
- `whatsapp_set_chat_presence` - Set typing/recording status
- `whatsapp_archive_chat` - Archive/unarchive chats
- `whatsapp_pin_chat` - Pin/unpin chats

### Session Tools
- `whatsapp_get_session_status` - Check connection status
- `whatsapp_get_qr_code` - Get QR code for login
- `whatsapp_get_qr_code_image` - Get QR code image
- `whatsapp_get_pair_code` - Get pairing code
- `whatsapp_logout` - Logout from WhatsApp

### Instance Tools
- `whatsapp_get_instance_settings` - Get instance configuration
- `whatsapp_update_instance_settings` - Update instance settings
- `whatsapp_restart_instance` - Restart instance
- `whatsapp_update_api_key` - Generate new API key

### Account Tools
- `whatsapp_get_account_info` - Get account information
- `whatsapp_set_account_name` - Update display name
- `whatsapp_set_account_picture` - Update profile picture
- `whatsapp_set_account_presence` - Set availability status
- `whatsapp_set_account_status` - Update status message

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify your API key and instance ID are correct
   - Check that your WSAPI subscription is active
   - Ensure the instance is properly configured

2. **Connection Issues**
   - Check your internet connection
   - Verify the WSAPI service status
   - Review firewall settings

3. **Message Sending Failures**
   - Ensure the recipient number format is correct (include @s.whatsapp.net)
   - Check that the WhatsApp session is active
   - Verify media file formats and sizes

4. **Validation Errors**
   - Review input parameters against the tool schemas
   - Check data types and required fields
   - Ensure string lengths don't exceed limits

### Debug Mode

Enable debug logging for detailed troubleshooting:

```bash
LOG_LEVEL=debug npm start
```

### Health Check

The server includes a built-in health check that verifies API connectivity on startup.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Add tests for new functionality
- Update documentation for new features
- Run linting and type checking before committing
- Follow the existing code style and conventions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [WSAPI Documentation](https://wsapi.gitbook.io/wsapi-docs)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [OpenAPI Specification](https://openapi.gitbook.com/o/VqjwkXj2jsuSdFqwsNwR/spec/wsapi-api.yaml)

## 📞 Support

For support and questions:

- Create an issue in this repository
- Check the [WSAPI documentation](https://wsapi.gitbook.io/wsapi-docs)
- Contact WSAPI support for API-related issues

---

Built with ❤️ using TypeScript, and the Model Context Protocol SDK.