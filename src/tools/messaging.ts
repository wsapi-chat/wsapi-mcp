import type { ToolHandler } from '../server.js';
import { wsapiClient } from '../client/index.js';
import { createLogger } from '../utils/logger.js';
import {
  validateInput,
  sendTextMessageSchema,
  sendImageMessageSchema,
  sendVideoMessageSchema,
  sendLinkMessageSchema,
  sendReactionMessageSchema,
  editMessageSchema,
  deleteMessageSchema,
  markMessageAsReadSchema,
  starMessageSchema,
  type SendTextMessageInput,
  type SendImageMessageInput,
  type SendVideoMessageInput,
  type SendLinkMessageInput,
  type SendReactionMessageInput,
} from '../validation/schemas.js';

const logger = createLogger('messaging-tools');

// Send text message tool
export const sendTextMessage: ToolHandler = {
  name: 'whatsapp_send_text',
  description: 'Send a text message to a WhatsApp contact or group. Supports mentions and replies.',
  inputSchema: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Recipient phone number (with @s.whatsapp.net) or group ID (with @g.us)',
      },
      text: {
        type: 'string',
        description: 'Message text content (max 4096 characters)',
      },
      mentions: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of phone numbers to mention in the message',
        optional: true,
      },
      replyTo: {
        type: 'string',
        description: 'ID of the message being replied to',
        optional: true,
      },
      isForwarded: {
        type: 'boolean',
        description: 'Whether the message should be marked as forwarded',
        optional: true,
      },
    },
    required: ['to', 'text'],
  },
  handler: async (args: any) => {
    const input = validateInput(sendTextMessageSchema, args) as SendTextMessageInput;

    logger.info('Sending text message', { to: input.to, textLength: input.text.length });

    const result = await wsapiClient.post('/messages/text', input);

    logger.info('Text message sent successfully', { messageId: result.id });

    return {
      success: true,
      messageId: result.id,
      message: 'Text message sent successfully',
    };
  },
};

// Send image message tool
export const sendImageMessage: ToolHandler = {
  name: 'whatsapp_send_image',
  description: 'Send an image message to a WhatsApp contact or group. Can send from URL or base64.',
  inputSchema: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Recipient phone number (with @s.whatsapp.net) or group ID (with @g.us)',
      },
      imageBase64: {
        type: 'string',
        description: 'Base64 encoded image data (alternative to imageURL)',
        optional: true,
      },
      imageURL: {
        type: 'string',
        description: 'URL of the image to send (alternative to imageBase64)',
        optional: true,
      },
      mimeType: {
        type: 'string',
        enum: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        description: 'MIME type of the image',
      },
      caption: {
        type: 'string',
        description: 'Caption for the image (max 1024 characters)',
        optional: true,
      },
      mentions: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of phone numbers to mention in the caption',
        optional: true,
      },
      replyTo: {
        type: 'string',
        description: 'ID of the message being replied to',
        optional: true,
      },
      isForwarded: {
        type: 'boolean',
        description: 'Whether the message should be marked as forwarded',
        optional: true,
      },
      viewOnce: {
        type: 'boolean',
        description: 'Whether the image should be sent as view-once',
        optional: true,
      },
    },
    required: ['to', 'mimeType'],
  },
  handler: async (args: any) => {
    const input = validateInput(sendImageMessageSchema, args) as SendImageMessageInput;

    logger.info('Sending image message', {
      to: input.to,
      mimeType: input.mimeType,
      hasCaption: !!input.caption,
      viewOnce: input.viewOnce,
    });

    const result = await wsapiClient.post('/messages/image', input);

    logger.info('Image message sent successfully', { messageId: result.id });

    return {
      success: true,
      messageId: result.id,
      message: 'Image message sent successfully',
    };
  },
};

// Send video message tool
export const sendVideoMessage: ToolHandler = {
  name: 'whatsapp_send_video',
  description: 'Send a video message to a WhatsApp contact or group. Can send from URL or base64.',
  inputSchema: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Recipient phone number (with @s.whatsapp.net) or group ID (with @g.us)',
      },
      videoBase64: {
        type: 'string',
        description: 'Base64 encoded video data (alternative to videoURL)',
        optional: true,
      },
      videoURL: {
        type: 'string',
        description: 'URL of the video to send (alternative to videoBase64)',
        optional: true,
      },
      mimeType: {
        type: 'string',
        enum: ['video/mp4', 'video/3gp', 'video/mov', 'video/avi'],
        description: 'MIME type of the video',
      },
      caption: {
        type: 'string',
        description: 'Caption for the video (max 1024 characters)',
        optional: true,
      },
      viewOnce: {
        type: 'boolean',
        description: 'Whether the video should be sent as view-once',
        optional: true,
      },
      mentions: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of phone numbers to mention in the caption',
        optional: true,
      },
      replyTo: {
        type: 'string',
        description: 'ID of the message being replied to',
        optional: true,
      },
      isForwarded: {
        type: 'boolean',
        description: 'Whether the message should be marked as forwarded',
        optional: true,
      },
    },
    required: ['to', 'mimeType'],
  },
  handler: async (args: any) => {
    const input = validateInput(sendVideoMessageSchema, args) as SendVideoMessageInput;

    logger.info('Sending video message', {
      to: input.to,
      mimeType: input.mimeType,
      hasCaption: !!input.caption,
      viewOnce: input.viewOnce,
    });

    const result = await wsapiClient.post('/messages/video', input);

    logger.info('Video message sent successfully', { messageId: result.id });

    return {
      success: true,
      messageId: result.id,
      message: 'Video message sent successfully',
    };
  },
};

// Send link message tool
export const sendLinkMessage: ToolHandler = {
  name: 'whatsapp_send_link',
  description: 'Send a link message with optional preview to a WhatsApp contact or group.',
  inputSchema: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Recipient phone number (with @s.whatsapp.net) or group ID (with @g.us)',
      },
      text: {
        type: 'string',
        description: 'Message text content (max 4096 characters)',
      },
      url: {
        type: 'string',
        description: 'URL to include in the message',
      },
      title: {
        type: 'string',
        description: 'Title for the link preview (max 500 characters)',
        optional: true,
      },
      description: {
        type: 'string',
        description: 'Description for the link preview (max 1000 characters)',
        optional: true,
      },
      jpegThumbnail: {
        type: 'string',
        description: 'Base64 encoded JPEG thumbnail for the link preview',
        optional: true,
      },
      mentions: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of phone numbers to mention in the message',
        optional: true,
      },
      replyTo: {
        type: 'string',
        description: 'ID of the message being replied to',
        optional: true,
      },
      isForwarded: {
        type: 'boolean',
        description: 'Whether the message should be marked as forwarded',
        optional: true,
      },
    },
    required: ['to', 'text', 'url'],
  },
  handler: async (args: any) => {
    const input = validateInput(sendLinkMessageSchema, args) as SendLinkMessageInput;

    logger.info('Sending link message', {
      to: input.to,
      url: input.url,
      hasTitle: !!input.title,
      hasDescription: !!input.description,
    });

    const result = await wsapiClient.post('/messages/link', input);

    logger.info('Link message sent successfully', { messageId: result.id });

    return {
      success: true,
      messageId: result.id,
      message: 'Link message sent successfully',
    };
  },
};

// Send reaction message tool
export const sendReactionMessage: ToolHandler = {
  name: 'whatsapp_send_reaction',
  description: 'Send a reaction (emoji) to a specific message.',
  inputSchema: {
    type: 'object',
    properties: {
      messageId: {
        type: 'string',
        description: 'ID of the message to react to',
      },
      to: {
        type: 'string',
        description: 'Chat ID where the message is located',
      },
      senderId: {
        type: 'string',
        description: 'ID of the original message sender',
      },
      reaction: {
        type: 'string',
        description: 'Emoji reaction to send (max 10 characters)',
      },
    },
    required: ['messageId', 'to', 'senderId', 'reaction'],
  },
  handler: async (args: any) => {
    const input = validateInput(sendReactionMessageSchema, args) as SendReactionMessageInput;

    logger.info('Sending reaction', {
      messageId: input.messageId,
      to: input.to,
      reaction: input.reaction,
    });

    const result = await wsapiClient.post(`/messages/${input.messageId}/reaction`, {
      to: input.to,
      senderId: input.senderId,
      reaction: input.reaction,
    });

    logger.info('Reaction sent successfully', { messageId: result.id });

    return {
      success: true,
      messageId: result.id,
      message: 'Reaction sent successfully',
    };
  },
};

// Edit message tool
export const editMessage: ToolHandler = {
  name: 'whatsapp_edit_message',
  description: 'Edit a previously sent text message.',
  inputSchema: {
    type: 'object',
    properties: {
      messageId: {
        type: 'string',
        description: 'ID of the message to edit',
      },
      to: {
        type: 'string',
        description: 'Chat ID where the message is located',
      },
      text: {
        type: 'string',
        description: 'New text content for the message (max 4096 characters)',
      },
    },
    required: ['messageId', 'to', 'text'],
  },
  handler: async (args: any) => {
    const input = validateInput(editMessageSchema, args);

    logger.info('Editing message', {
      messageId: input.messageId,
      to: input.to,
      textLength: input.text.length,
    });

    const result = await wsapiClient.put(`/messages/${input.messageId}/text`, {
      to: input.to,
      text: input.text,
    });

    logger.info('Message edited successfully', { messageId: result.id });

    return {
      success: true,
      messageId: result.id,
      message: 'Message edited successfully',
    };
  },
};

// Delete message tool
export const deleteMessage: ToolHandler = {
  name: 'whatsapp_delete_message',
  description: 'Delete a message for all participants in the chat.',
  inputSchema: {
    type: 'object',
    properties: {
      messageId: {
        type: 'string',
        description: 'ID of the message to delete',
      },
      chatId: {
        type: 'string',
        description: 'Chat ID where the message is located',
      },
      senderId: {
        type: 'string',
        description: 'ID of the message sender',
      },
    },
    required: ['messageId', 'chatId', 'senderId'],
  },
  handler: async (args: any) => {
    const input = validateInput(deleteMessageSchema, args);

    logger.info('Deleting message', {
      messageId: input.messageId,
      chatId: input.chatId,
    });

    await wsapiClient.put(`/messages/${input.messageId}/delete`, {
      chatId: input.chatId,
      senderId: input.senderId,
    });

    logger.info('Message deleted successfully', { messageId: input.messageId });

    return {
      success: true,
      message: 'Message deleted successfully',
    };
  },
};

// Mark message as read tool
export const markMessageAsRead: ToolHandler = {
  name: 'whatsapp_mark_message_read',
  description: 'Mark a message as read.',
  inputSchema: {
    type: 'object',
    properties: {
      messageId: {
        type: 'string',
        description: 'ID of the message to mark as read',
      },
      chatId: {
        type: 'string',
        description: 'Chat ID where the message is located',
      },
      senderId: {
        type: 'string',
        description: 'ID of the message sender',
      },
      receiptType: {
        type: 'string',
        enum: ['delivered', 'sender', 'read', 'played'],
        description: 'Type of receipt to send',
      },
    },
    required: ['messageId', 'chatId', 'senderId', 'receiptType'],
  },
  handler: async (args: any) => {
    const input = validateInput(markMessageAsReadSchema, args);

    logger.info('Marking message as read', {
      messageId: input.messageId,
      chatId: input.chatId,
      receiptType: input.receiptType,
    });

    await wsapiClient.put(`/messages/${input.messageId}/read`, {
      chatId: input.chatId,
      senderId: input.senderId,
      receiptType: input.receiptType,
    });

    logger.info('Message marked as read successfully', { messageId: input.messageId });

    return {
      success: true,
      message: 'Message marked as read successfully',
    };
  },
};

// Star message tool
export const starMessage: ToolHandler = {
  name: 'whatsapp_star_message',
  description: 'Star or unstar a message.',
  inputSchema: {
    type: 'object',
    properties: {
      messageId: {
        type: 'string',
        description: 'ID of the message to star',
      },
      chatId: {
        type: 'string',
        description: 'Chat ID where the message is located',
      },
      senderId: {
        type: 'string',
        description: 'ID of the message sender',
      },
    },
    required: ['messageId', 'chatId', 'senderId'],
  },
  handler: async (args: any) => {
    const input = validateInput(starMessageSchema, args);

    logger.info('Starring message', {
      messageId: input.messageId,
      chatId: input.chatId,
    });

    await wsapiClient.put(`/messages/${input.messageId}/star`, {
      chatId: input.chatId,
      senderId: input.senderId,
    });

    logger.info('Message starred successfully', { messageId: input.messageId });

    return {
      success: true,
      message: 'Message starred successfully',
    };
  },
};

// Import advanced messaging tools
import { advancedMessagingTools } from './messaging-advanced.js';

// Export all messaging tools
export const messagingTools = {
  sendTextMessage,
  sendImageMessage,
  sendVideoMessage,
  sendLinkMessage,
  sendReactionMessage,
  editMessage,
  deleteMessage,
  markMessageAsRead,
  starMessage,
  ...advancedMessagingTools,
};