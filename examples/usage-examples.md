# WSAPI MCP Server Usage Examples

This document provides practical examples of how to use the WSAPI MCP Server tools.

## Basic Messaging

### Send a Simple Text Message
```json
{
  "tool": "whatsapp_send_text",
  "arguments": {
    "to": "1234567890@s.whatsapp.net",
    "text": "Hello! How are you doing today?"
  }
}
```

### Send Text with Mentions
```json
{
  "tool": "whatsapp_send_text",
  "arguments": {
    "to": "1234567890@g.us",
    "text": "Hello @1234567890! Please check the latest updates.",
    "mentions": ["1234567890@s.whatsapp.net"]
  }
}
```

### Reply to a Message
```json
{
  "tool": "whatsapp_send_text",
  "arguments": {
    "to": "1234567890@s.whatsapp.net",
    "text": "Thanks for the information!",
    "replyTo": "message_id_here"
  }
}
```

## Media Messages

### Send Image from URL
```json
{
  "tool": "whatsapp_send_image",
  "arguments": {
    "to": "1234567890@s.whatsapp.net",
    "imageURL": "https://example.com/photo.jpg",
    "mimeType": "image/jpeg",
    "caption": "Check out this amazing sunset!"
  }
}
```

### Send Video with View Once
```json
{
  "tool": "whatsapp_send_video",
  "arguments": {
    "to": "1234567890@s.whatsapp.net",
    "videoURL": "https://example.com/video.mp4",
    "mimeType": "video/mp4",
    "viewOnce": true,
    "caption": "Secret video - view once only!"
  }
}
```

### Send Document
```json
{
  "tool": "whatsapp_send_document",
  "arguments": {
    "to": "1234567890@g.us",
    "documentURL": "https://example.com/report.pdf",
    "fileName": "monthly_report.pdf",
    "caption": "Here's the monthly report you requested"
  }
}
```

### Send Voice Message
```json
{
  "tool": "whatsapp_send_voice",
  "arguments": {
    "to": "1234567890@s.whatsapp.net",
    "voiceURL": "https://example.com/voice.ogg"
  }
}
```

## Location and Contact Sharing

### Send Location
```json
{
  "tool": "whatsapp_send_location",
  "arguments": {
    "to": "1234567890@s.whatsapp.net",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "name": "Golden Gate Bridge",
    "address": "San Francisco, CA 94129, USA",
    "url": "https://maps.google.com/?q=Golden+Gate+Bridge"
  }
}
```

### Send Contact vCard
```json
{
  "tool": "whatsapp_send_contact",
  "arguments": {
    "to": "1234567890@s.whatsapp.net",
    "vCard": "BEGIN:VCARD\nVERSION:3.0\nN:Doe;Jane;;;\nFN:Jane Doe\nTEL;TYPE=CELL:+1234567890\nEMAIL:jane@example.com\nEND:VCARD"
  }
}
```

### Send Contact by Display Name
```json
{
  "tool": "whatsapp_send_contact",
  "arguments": {
    "to": "1234567890@s.whatsapp.net",
    "displayName": "John Smith"
  }
}
```

## Message Management

### Edit a Message
```json
{
  "tool": "whatsapp_edit_message",
  "arguments": {
    "messageId": "message_id_here",
    "to": "1234567890@s.whatsapp.net",
    "text": "Corrected message text"
  }
}
```

### Delete a Message for Everyone
```json
{
  "tool": "whatsapp_delete_message",
  "arguments": {
    "messageId": "message_id_here",
    "chatId": "1234567890@s.whatsapp.net",
    "senderId": "your_number@s.whatsapp.net"
  }
}
```

### React to a Message
```json
{
  "tool": "whatsapp_send_reaction",
  "arguments": {
    "messageId": "message_id_here",
    "to": "1234567890@s.whatsapp.net",
    "senderId": "sender_number@s.whatsapp.net",
    "reaction": "👍"
  }
}
```

### Star a Message
```json
{
  "tool": "whatsapp_star_message",
  "arguments": {
    "messageId": "message_id_here",
    "chatId": "1234567890@s.whatsapp.net",
    "senderId": "sender_number@s.whatsapp.net"
  }
}
```

## Group Management

### Create a New Group
```json
{
  "tool": "whatsapp_create_group",
  "arguments": {
    "name": "Project Team",
    "participants": [
      "1234567890@s.whatsapp.net",
      "0987654321@s.whatsapp.net",
      "1122334455@s.whatsapp.net"
    ]
  }
}
```

### Get Group Information
```json
{
  "tool": "whatsapp_get_group",
  "arguments": {
    "groupId": "1234567890-1234567890@g.us"
  }
}
```

### Update Group Name
```json
{
  "tool": "whatsapp_update_group_name",
  "arguments": {
    "groupId": "1234567890-1234567890@g.us",
    "name": "Updated Project Team"
  }
}
```

## Chat Management

### Set Typing Indicator
```json
{
  "tool": "whatsapp_set_chat_presence",
  "arguments": {
    "chatId": "1234567890@s.whatsapp.net",
    "state": "typing"
  }
}
```

### Archive a Chat
```json
{
  "tool": "whatsapp_archive_chat",
  "arguments": {
    "chatId": "1234567890@s.whatsapp.net",
    "archived": true
  }
}
```

### Pin a Chat
```json
{
  "tool": "whatsapp_pin_chat",
  "arguments": {
    "chatId": "1234567890@s.whatsapp.net",
    "pinned": true
  }
}
```

## Contact Management

### Get All Contacts
```json
{
  "tool": "whatsapp_get_contacts",
  "arguments": {}
}
```

### Get Specific Contact Info
```json
{
  "tool": "whatsapp_get_contact",
  "arguments": {
    "contactId": "1234567890@s.whatsapp.net"
  }
}
```

### Create a New Contact
```json
{
  "tool": "whatsapp_create_contact",
  "arguments": {
    "id": "1234567890@s.whatsapp.net",
    "fullName": "John Doe",
    "firstName": "John"
  }
}
```

### Subscribe to Contact Presence
```json
{
  "tool": "whatsapp_subscribe_contact_presence",
  "arguments": {
    "contactId": "1234567890@s.whatsapp.net"
  }
}
```

## Session Management

### Check Session Status
```json
{
  "tool": "whatsapp_get_session_status",
  "arguments": {}
}
```

### Get QR Code for Login
```json
{
  "tool": "whatsapp_get_qr_code",
  "arguments": {}
}
```

### Get Pairing Code
```json
{
  "tool": "whatsapp_get_pair_code",
  "arguments": {
    "phone": "1234567890"
  }
}
```

### Logout
```json
{
  "tool": "whatsapp_logout",
  "arguments": {}
}
```

## Account Management

### Get Account Information
```json
{
  "tool": "whatsapp_get_account_info",
  "arguments": {}
}
```

### Update Account Name
```json
{
  "tool": "whatsapp_set_account_name",
  "arguments": {
    "name": "My New Display Name"
  }
}
```

### Set Account Status
```json
{
  "tool": "whatsapp_set_account_status",
  "arguments": {
    "status": "Working from home today"
  }
}
```

### Set Account Presence
```json
{
  "tool": "whatsapp_set_account_presence",
  "arguments": {
    "status": "available"
  }
}
```

## Instance Management

### Get Instance Settings
```json
{
  "tool": "whatsapp_get_instance_settings",
  "arguments": {}
}
```

### Update Instance Settings
```json
{
  "tool": "whatsapp_update_instance_settings",
  "arguments": {
    "settings": {
      "alwaysOnline": true,
      "markOnlineOnConnect": true
    }
  }
}
```

### Restart Instance
```json
{
  "tool": "whatsapp_restart_instance",
  "arguments": {}
}
```

## Common Use Cases

### Customer Support Scenario
```json
// 1. Get customer contact info
{
  "tool": "whatsapp_get_contact",
  "arguments": {
    "contactId": "customer@s.whatsapp.net"
  }
}

// 2. Send support message
{
  "tool": "whatsapp_send_text",
  "arguments": {
    "to": "customer@s.whatsapp.net",
    "text": "Hello! I'm here to help you with your inquiry. How can I assist you today?"
  }
}

// 3. Set typing indicator while preparing response
{
  "tool": "whatsapp_set_chat_presence",
  "arguments": {
    "chatId": "customer@s.whatsapp.net",
    "state": "typing"
  }
}

// 4. Send document with solution
{
  "tool": "whatsapp_send_document",
  "arguments": {
    "to": "customer@s.whatsapp.net",
    "documentURL": "https://support.company.com/solution.pdf",
    "fileName": "solution_guide.pdf",
    "caption": "Here's the detailed solution for your issue."
  }
}
```

### Team Communication Scenario
```json
// 1. Create project group
{
  "tool": "whatsapp_create_group",
  "arguments": {
    "name": "Q4 Marketing Campaign",
    "participants": [
      "member1@s.whatsapp.net",
      "member2@s.whatsapp.net",
      "member3@s.whatsapp.net"
    ]
  }
}

// 2. Send project kickoff message
{
  "tool": "whatsapp_send_text",
  "arguments": {
    "to": "group_id@g.us",
    "text": "Welcome to the Q4 Marketing Campaign team! @member1 @member2 @member3 Let's make this campaign amazing!",
    "mentions": [
      "member1@s.whatsapp.net",
      "member2@s.whatsapp.net",
      "member3@s.whatsapp.net"
    ]
  }
}

// 3. Share project timeline
{
  "tool": "whatsapp_send_document",
  "arguments": {
    "to": "group_id@g.us",
    "documentURL": "https://company.com/timeline.pdf",
    "fileName": "Q4_Campaign_Timeline.pdf",
    "caption": "Here's our project timeline. Please review and let me know if you have any questions."
  }
}
```

## Error Handling Examples

Most tools will return success/error responses. Here are examples of handling common scenarios:

### Successful Response
```json
{
  "success": true,
  "messageId": "0123456789ABCDEF",
  "message": "Text message sent successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Invalid phone number format",
  "code": "VALIDATION_ERROR"
}
```

### Rate Limit Response
```json
{
  "success": false,
  "error": "Rate limit exceeded. Please wait before sending more messages.",
  "code": "RATE_LIMIT_ERROR"
}
```

## Tips for Better Usage

1. **Phone Number Format**: Always include the WhatsApp suffix:
   - Individual contacts: `1234567890@s.whatsapp.net`
   - Groups: `1234567890-1234567890@g.us`

2. **Media Files**: For better performance, use URLs instead of base64 when possible

3. **Message Length**: Keep text messages under 4096 characters

4. **File Sizes**: Respect WhatsApp's file size limits:
   - Images: 16MB max
   - Videos: 16MB max
   - Documents: 100MB max
   - Audio: 16MB max

5. **Rate Limiting**: Be mindful of sending frequency to avoid rate limits

6. **Error Handling**: Always check the response for success/error status

7. **Presence Updates**: Use presence indicators to improve user experience

8. **Session Management**: Regularly check session status for active connections