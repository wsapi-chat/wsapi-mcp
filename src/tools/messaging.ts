import type { ToolHandler } from "../server.js";
import { wsapiClient } from "../client/index.js";
import { createLogger } from "../utils/logger.js";
import {
  validateInput,
  sendTextMessageSchema,
  sendMediaMessageSchema,
  sendLinkMessageSchema,
  sendReactionMessageSchema,
  editMessageSchema,
  deleteMessageSchema,
  deleteMessageForMeSchema,
  markMessageAsReadSchema,
  starMessageSchema,
  pinMessageSchema,
  type SendTextMessageInput,
  type SendMediaMessageInput,
  type SendLinkMessageInput,
  type SendReactionMessageInput,
} from "../validation/schemas.js";

const logger = createLogger("messaging-tools");

export const sendTextMessage: ToolHandler = {
  name: "whatsapp_send_text",
  description:
    "Send a text message to a user JID or a group JID (<id>@g.us). The recipient receives it immediately and it cannot be unsent, only deleted with whatsapp_delete_message. Supports mentions, replies and a disappearing timer. Not idempotent: calling it twice sends two messages. Returns the message ID.",
  annotations: CREATE,
  inputSchema: {
    type: "object",
    properties: {
      to: { type: "string", description: "Recipient JID (user or group)" },
      text: {
        type: "string",
        description: "Message text content (max 4096 characters)",
      },
      mentions: {
        type: "array",
        items: { type: "string" },
        description: "JIDs of mentioned users",
      },
      replyTo: {
        type: "string",
        description: "ID of the message being replied to",
      },
      replyToSenderId: {
        type: "string",
        description: "Sender JID of the message being replied to",
      },
      isForwarded: { type: "boolean", description: "Mark as forwarded" },
      ephemeralExpiration: {
        type: "string",
        enum: ["off", "24h", "7d", "90d"],
        description: "Disappearing message timer",
      },
    },
    required: ["to", "text"],
  },
  handler: async (args: any) => {
    const input = validateInput(
      sendTextMessageSchema,
      args,
    ) as SendTextMessageInput;
    logger.info("Sending text message", {
      to: input.to,
      textLength: input.text.length,
    });
    const result = await wsapiClient.post("/messages/text", input);
    logger.info("Text message sent successfully", { messageId: result.id });
    return {
      success: true,
      messageId: result.id,
      message: "Text message sent successfully",
    };
  },
};

export const sendImageMessage: ToolHandler = {
  name: "whatsapp_send_image",
  description:
    "Send an image, from base64 data or a public URL, with an optional caption, to a user or group JID. The recipient receives it immediately; set viewOnce for a view-once image. Not idempotent. Returns the message ID.",
  annotations: CREATE,
  inputSchema: {
    type: "object",
    properties: {
      to: { type: "string", description: "Recipient JID" },
      data: { type: "string", description: "Base64 encoded image data" },
      url: { type: "string", description: "URL of the image" },
      mimeType: {
        type: "string",
        description: "MIME type (auto-detected if omitted)",
      },
      caption: { type: "string", description: "Caption for the image" },
      mentions: {
        type: "array",
        items: { type: "string" },
        description: "JIDs of mentioned users",
      },
      replyTo: { type: "string", description: "Message ID to reply to" },
      replyToSenderId: {
        type: "string",
        description: "Sender JID of the replied message",
      },
      isForwarded: { type: "boolean", description: "Mark as forwarded" },
      viewOnce: { type: "boolean", description: "Send as view-once" },
      ephemeralExpiration: {
        type: "string",
        enum: ["off", "24h", "7d", "90d"],
      },
    },
    required: ["to"],
  },
  handler: async (args: any) => {
    const input = validateInput(
      sendMediaMessageSchema,
      args,
    ) as SendMediaMessageInput;
    logger.info("Sending image message", {
      to: input.to,
      hasCaption: !!input.caption,
    });
    const result = await wsapiClient.post("/messages/image", input);
    logger.info("Image message sent successfully", { messageId: result.id });
    return {
      success: true,
      messageId: result.id,
      message: "Image message sent successfully",
    };
  },
};

export const sendVideoMessage: ToolHandler = {
  name: "whatsapp_send_video",
  description:
    "Send a video, from base64 data or a public URL, with an optional caption, to a user or group JID. The recipient receives it immediately. Not idempotent. Returns the message ID.",
  annotations: CREATE,
  inputSchema: {
    type: "object",
    properties: {
      to: { type: "string", description: "Recipient JID" },
      data: { type: "string", description: "Base64 encoded video data" },
      url: { type: "string", description: "URL of the video" },
      mimeType: {
        type: "string",
        description: "MIME type (auto-detected if omitted)",
      },
      caption: { type: "string", description: "Caption for the video" },
      mentions: { type: "array", items: { type: "string" } },
      replyTo: { type: "string", description: "Message ID to reply to" },
      replyToSenderId: {
        type: "string",
        description: "Sender JID of the replied message",
      },
      isForwarded: { type: "boolean" },
      viewOnce: { type: "boolean", description: "Send as view-once" },
      ephemeralExpiration: {
        type: "string",
        enum: ["off", "24h", "7d", "90d"],
      },
    },
    required: ["to"],
  },
  handler: async (args: any) => {
    const input = validateInput(
      sendMediaMessageSchema,
      args,
    ) as SendMediaMessageInput;
    logger.info("Sending video message", { to: input.to });
    const result = await wsapiClient.post("/messages/video", input);
    logger.info("Video message sent successfully", { messageId: result.id });
    return {
      success: true,
      messageId: result.id,
      message: "Video message sent successfully",
    };
  },
};

export const sendLinkMessage: ToolHandler = {
  name: "whatsapp_send_link",
  description:
    "Send a text message with a link preview (title, description and thumbnail). Use it instead of whatsapp_send_text when you want to control how the preview looks. Not idempotent. Returns the message ID.",
  annotations: CREATE,
  inputSchema: {
    type: "object",
    properties: {
      to: { type: "string", description: "Recipient JID" },
      text: {
        type: "string",
        description: "Message text (max 4096 characters)",
      },
      url: { type: "string", description: "URL to include" },
      title: { type: "string", description: "Link preview title" },
      description: { type: "string", description: "Link preview description" },
      jpegThumbnail: { type: "string", description: "Base64 JPEG thumbnail" },
      mentions: { type: "array", items: { type: "string" } },
      replyTo: { type: "string" },
      replyToSenderId: { type: "string" },
      isForwarded: { type: "boolean" },
      ephemeralExpiration: {
        type: "string",
        enum: ["off", "24h", "7d", "90d"],
      },
    },
    required: ["to", "text", "url"],
  },
  handler: async (args: any) => {
    const input = validateInput(
      sendLinkMessageSchema,
      args,
    ) as SendLinkMessageInput;
    logger.info("Sending link message", { to: input.to, url: input.url });
    const result = await wsapiClient.post("/messages/link", input);
    logger.info("Link message sent successfully", { messageId: result.id });
    return {
      success: true,
      messageId: result.id,
      message: "Link message sent successfully",
    };
  },
};

export const sendReactionMessage: ToolHandler = {
  name: "whatsapp_send_reaction",
  description:
    "React to a message with an emoji, or remove this number's reaction by sending an empty string. Everyone in the chat sees it. Repeating it replaces the reaction. Returns a success confirmation.",
  annotations: SET,
  inputSchema: {
    type: "object",
    properties: {
      messageId: {
        type: "string",
        description: "ID of the message to react to",
      },
      to: { type: "string", description: "Chat JID" },
      senderId: {
        type: "string",
        description: "Sender of the original message (for groups)",
      },
      reaction: {
        type: "string",
        description: "Emoji reaction (empty string to remove)",
      },
    },
    required: ["messageId", "to", "reaction"],
  },
  handler: async (args: any) => {
    const input = validateInput(
      sendReactionMessageSchema,
      args,
    ) as SendReactionMessageInput;
    logger.info("Sending reaction", {
      messageId: input.messageId,
      to: input.to,
    });
    const result = await wsapiClient.post(
      `/messages/${input.messageId}/reaction`,
      {
        to: input.to,
        senderId: input.senderId,
        reaction: input.reaction,
      },
    );
    logger.info("Reaction sent successfully");
    return {
      success: true,
      messageId: result.id,
      message: "Reaction sent successfully",
    };
  },
};

export const editMessage: ToolHandler = {
  name: "whatsapp_edit_message",
  description:
    "Edit the text of a message this number sent. Everyone in the chat sees it marked as edited. WhatsApp only allows it for about 15 minutes after sending. Returns a success confirmation.",
  annotations: SET,
  inputSchema: {
    type: "object",
    properties: {
      messageId: { type: "string", description: "ID of the message to edit" },
      to: { type: "string", description: "Chat JID" },
      text: {
        type: "string",
        description: "New text content (max 4096 characters)",
      },
      mentions: { type: "array", items: { type: "string" } },
      ephemeralExpiration: {
        type: "string",
        enum: ["off", "24h", "7d", "90d"],
      },
    },
    required: ["messageId", "to", "text"],
  },
  handler: async (args: any) => {
    const input = validateInput(editMessageSchema, args);
    logger.info("Editing message", { messageId: input.messageId });
    const result = await wsapiClient.post(`/messages/${input.messageId}/edit`, {
      to: input.to,
      text: input.text,
      mentions: input.mentions,
      ephemeralExpiration: input.ephemeralExpiration,
    });
    logger.info("Message edited successfully");
    return {
      success: true,
      messageId: result.id,
      message: "Message edited successfully",
    };
  },
};

export const deleteMessage: ToolHandler = {
  name: "whatsapp_delete_message",
  description:
    "Delete a message for everyone in the chat. It cannot be undone; participants see that a message was deleted. Only works on messages this number sent (or, as group admin, on others' messages in the group). To hide a message only on this account, use whatsapp_delete_message_for_me. Returns a success confirmation.",
  annotations: DESTRUCTIVE,
  inputSchema: {
    type: "object",
    properties: {
      messageId: { type: "string", description: "ID of the message to delete" },
      chatId: { type: "string", description: "Chat JID" },
      senderId: { type: "string", description: "Message sender JID" },
    },
    required: ["messageId", "chatId", "senderId"],
  },
  handler: async (args: any) => {
    const input = validateInput(deleteMessageSchema, args);
    logger.info("Deleting message", { messageId: input.messageId });
    await wsapiClient.post(`/messages/${input.messageId}/delete`, {
      chatId: input.chatId,
      senderId: input.senderId,
    });
    logger.info("Message deleted successfully");
    return { success: true, message: "Message deleted successfully" };
  },
};

export const deleteMessageForMe: ToolHandler = {
  name: "whatsapp_delete_message_for_me",
  description:
    "Delete a message only on this account. Other participants still see it. It cannot be undone. To remove it for everyone, use whatsapp_delete_message. Returns a success confirmation.",
  annotations: DESTRUCTIVE,
  inputSchema: {
    type: "object",
    properties: {
      messageId: { type: "string", description: "ID of the message to delete" },
      chatId: { type: "string", description: "Chat JID" },
      senderId: { type: "string", description: "Message sender JID" },
      isFromMe: {
        type: "boolean",
        description: "Whether the message was sent by you",
      },
      timestamp: {
        type: "string",
        description: "Message timestamp (ISO 8601)",
      },
    },
    required: ["messageId", "chatId"],
  },
  handler: async (args: any) => {
    const input = validateInput(deleteMessageForMeSchema, args);
    logger.info("Deleting message for me", { messageId: input.messageId });
    await wsapiClient.post(`/messages/${input.messageId}/delete-for-me`, {
      chatId: input.chatId,
      senderId: input.senderId,
      isFromMe: input.isFromMe,
      timestamp: input.timestamp,
    });
    logger.info("Message deleted for me successfully");
    return { success: true, message: "Message deleted for me successfully" };
  },
};

export const markMessageAsRead: ToolHandler = {
  name: "whatsapp_mark_message_read",
  description:
    "Send a read receipt for a message, so the sender sees it as read (blue ticks, if their privacy settings allow). To mark a whole chat, use whatsapp_mark_chat_as_read. Returns a success confirmation.",
  annotations: SET,
  inputSchema: {
    type: "object",
    properties: {
      messageId: { type: "string", description: "Message ID" },
      chatId: { type: "string", description: "Chat JID" },
      senderId: { type: "string", description: "Message sender JID" },
      receiptType: {
        type: "string",
        enum: ["delivered", "sender", "read", "played"],
        description: "Receipt type",
      },
    },
    required: ["messageId", "chatId", "senderId", "receiptType"],
  },
  handler: async (args: any) => {
    const input = validateInput(markMessageAsReadSchema, args);
    logger.info("Marking message as read", { messageId: input.messageId });
    await wsapiClient.post(`/messages/${input.messageId}/read`, {
      chatId: input.chatId,
      senderId: input.senderId,
      receiptType: input.receiptType,
    });
    return { success: true, message: "Message marked as read successfully" };
  },
};

export const starMessage: ToolHandler = {
  name: "whatsapp_star_message",
  description:
    "Star or unstar a message on this account. Only this account sees it. Returns a success confirmation.",
  annotations: SET,
  inputSchema: {
    type: "object",
    properties: {
      messageId: { type: "string", description: "Message ID" },
      chatId: { type: "string", description: "Chat JID" },
      senderId: { type: "string", description: "Message sender JID" },
      starred: {
        type: "boolean",
        description: "True to star, false to unstar",
      },
    },
    required: ["messageId", "chatId", "senderId"],
  },
  handler: async (args: any) => {
    const input = validateInput(starMessageSchema, args);
    logger.info("Starring message", { messageId: input.messageId });
    await wsapiClient.post(`/messages/${input.messageId}/star`, {
      chatId: input.chatId,
      senderId: input.senderId,
      starred: input.starred,
    });
    return { success: true, message: "Message starred successfully" };
  },
};

export const pinMessage: ToolHandler = {
  name: "whatsapp_pin_message",
  description:
    "Pin or unpin a message in a chat, optionally for a limited time. Everyone in the chat sees the pin. To pin a whole chat in the list, use whatsapp_pin_chat. Returns a success confirmation.",
  annotations: SET,
  inputSchema: {
    type: "object",
    properties: {
      messageId: { type: "string", description: "Message ID" },
      chatId: { type: "string", description: "Chat JID" },
      senderId: { type: "string", description: "Message sender JID" },
      pinned: { type: "boolean", description: "True to pin, false to unpin" },
      pinExpiration: {
        type: "string",
        description: "Pin expiration (e.g. 24h, 7d, 30d)",
      },
    },
    required: ["messageId", "chatId", "senderId"],
  },
  handler: async (args: any) => {
    const input = validateInput(pinMessageSchema, args);
    logger.info("Pinning message", { messageId: input.messageId });
    await wsapiClient.post(`/messages/${input.messageId}/pin`, {
      chatId: input.chatId,
      senderId: input.senderId,
      pinned: input.pinned,
      pinExpiration: input.pinExpiration,
    });
    return { success: true, message: "Message pin updated successfully" };
  },
};

import { advancedMessagingTools } from "./messaging-advanced.js";
import { CREATE, DESTRUCTIVE, SET } from "./annotations.js";

export const messagingTools = {
  sendTextMessage,
  sendImageMessage,
  sendVideoMessage,
  sendLinkMessage,
  sendReactionMessage,
  editMessage,
  deleteMessage,
  deleteMessageForMe,
  markMessageAsRead,
  starMessage,
  pinMessage,
  ...advancedMessagingTools,
};
