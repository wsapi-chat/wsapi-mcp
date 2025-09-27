import type { ToolHandler } from '../server.js';
import { wsapiClient } from '../client/index.js';
import { createLogger } from '../utils/logger.js';
import {
  validateInput,
  sendAudioMessageSchema,
  sendVoiceMessageSchema,
  sendDocumentMessageSchema,
  sendStickerMessageSchema,
  sendLocationMessageSchema,
  sendContactMessageSchema,
  type SendAudioMessageInput,
  type SendVoiceMessageInput,
  type SendDocumentMessageInput,
  type SendStickerMessageInput,
  type SendLocationMessageInput,
  type SendContactMessageInput,
} from '../validation/schemas.js';

const logger = createLogger('messaging-advanced-tools');

// Send audio message tool
export const sendAudioMessage: ToolHandler = {
  name: 'whatsapp_send_audio',
  description: 'Send an audio file message to a WhatsApp contact or group. Can send from URL or base64.',
  inputSchema: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Recipient phone number (with @s.whatsapp.net) or group ID (with @g.us)',
      },
      audioBase64: {
        type: 'string',
        description: 'Base64 encoded audio data (alternative to audioURL)',
        optional: true,
      },
      audioURL: {
        type: 'string',
        description: 'URL of the audio file to send (alternative to audioBase64)',
        optional: true,
      },
      mimeType: {
        type: 'string',
        enum: ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav'],
        description: 'MIME type of the audio file',
      },
      mentions: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of phone numbers to mention',
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
        description: 'Whether the audio should be sent as view-once',
        optional: true,
      },
    },
    required: ['to', 'mimeType'],
  },
  handler: async (args: any) => {
    const input = validateInput(sendAudioMessageSchema, args) as SendAudioMessageInput;

    logger.info('Sending audio message', {
      to: input.to,
      mimeType: input.mimeType,
      viewOnce: input.viewOnce,
    });

    const result = await wsapiClient.post('/messages/audio', input);

    logger.info('Audio message sent successfully', { messageId: result.id });

    return {
      success: true,
      messageId: result.id,
      message: 'Audio message sent successfully',
    };
  },
};

// Send voice message tool
export const sendVoiceMessage: ToolHandler = {
  name: 'whatsapp_send_voice',
  description: 'Send a voice message (PTT) to a WhatsApp contact or group. Can send from URL or base64.',
  inputSchema: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Recipient phone number (with @s.whatsapp.net) or group ID (with @g.us)',
      },
      voiceBase64: {
        type: 'string',
        description: 'Base64 encoded voice data (alternative to voiceURL)',
        optional: true,
      },
      voiceURL: {
        type: 'string',
        description: 'URL of the voice file to send (alternative to voiceBase64)',
        optional: true,
      },
      mentions: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of phone numbers to mention',
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
        description: 'Whether the voice message should be sent as view-once',
        optional: true,
      },
    },
    required: ['to'],
  },
  handler: async (args: any) => {
    const input = validateInput(sendVoiceMessageSchema, args) as SendVoiceMessageInput;

    logger.info('Sending voice message', {
      to: input.to,
      viewOnce: input.viewOnce,
    });

    const result = await wsapiClient.post('/messages/voice', input);

    logger.info('Voice message sent successfully', { messageId: result.id });

    return {
      success: true,
      messageId: result.id,
      message: 'Voice message sent successfully',
    };
  },
};

// Send document message tool
export const sendDocumentMessage: ToolHandler = {
  name: 'whatsapp_send_document',
  description: 'Send a document file to a WhatsApp contact or group. Can send from URL or base64.',
  inputSchema: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Recipient phone number (with @s.whatsapp.net) or group ID (with @g.us)',
      },
      documentBase64: {
        type: 'string',
        description: 'Base64 encoded document data (alternative to documentURL)',
        optional: true,
      },
      documentURL: {
        type: 'string',
        description: 'URL of the document to send (alternative to documentBase64)',
        optional: true,
      },
      fileName: {
        type: 'string',
        description: 'Name of the document file (max 255 characters)',
      },
      caption: {
        type: 'string',
        description: 'Caption for the document (max 1024 characters)',
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
    required: ['to', 'fileName'],
  },
  handler: async (args: any) => {
    const input = validateInput(sendDocumentMessageSchema, args) as SendDocumentMessageInput;

    logger.info('Sending document message', {
      to: input.to,
      fileName: input.fileName,
      hasCaption: !!input.caption,
    });

    const result = await wsapiClient.post('/messages/document', input);

    logger.info('Document message sent successfully', { messageId: result.id });

    return {
      success: true,
      messageId: result.id,
      message: 'Document message sent successfully',
    };
  },
};

// Send sticker message tool
export const sendStickerMessage: ToolHandler = {
  name: 'whatsapp_send_sticker',
  description: 'Send a sticker message to a WhatsApp contact or group. Can send from URL or base64.',
  inputSchema: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Recipient phone number (with @s.whatsapp.net) or group ID (with @g.us)',
      },
      stickerBase64: {
        type: 'string',
        description: 'Base64 encoded sticker data (alternative to stickerURL)',
        optional: true,
      },
      stickerURL: {
        type: 'string',
        description: 'URL of the sticker to send (alternative to stickerBase64)',
        optional: true,
      },
      mimeType: {
        type: 'string',
        enum: ['image/webp'],
        description: 'MIME type of the sticker (must be image/webp)',
      },
      isAnimated: {
        type: 'boolean',
        description: 'Whether the sticker is animated',
        optional: true,
      },
      mentions: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of phone numbers to mention',
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
    const input = validateInput(sendStickerMessageSchema, args) as SendStickerMessageInput;

    logger.info('Sending sticker message', {
      to: input.to,
      mimeType: input.mimeType,
      isAnimated: input.isAnimated,
    });

    const result = await wsapiClient.post('/messages/sticker', input);

    logger.info('Sticker message sent successfully', { messageId: result.id });

    return {
      success: true,
      messageId: result.id,
      message: 'Sticker message sent successfully',
    };
  },
};

// Send location message tool
export const sendLocationMessage: ToolHandler = {
  name: 'whatsapp_send_location',
  description: 'Send a location message to a WhatsApp contact or group.',
  inputSchema: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Recipient phone number (with @s.whatsapp.net) or group ID (with @g.us)',
      },
      latitude: {
        type: 'number',
        minimum: -90,
        maximum: 90,
        description: 'Latitude coordinate',
      },
      longitude: {
        type: 'number',
        minimum: -180,
        maximum: 180,
        description: 'Longitude coordinate',
      },
      name: {
        type: 'string',
        description: 'Name of the location (max 1000 characters)',
        optional: true,
      },
      address: {
        type: 'string',
        description: 'Address of the location (max 1000 characters)',
        optional: true,
      },
      url: {
        type: 'string',
        description: 'URL related to the location (e.g., Google Maps link)',
        optional: true,
      },
    },
    required: ['to', 'latitude', 'longitude'],
  },
  handler: async (args: any) => {
    const input = validateInput(sendLocationMessageSchema, args) as SendLocationMessageInput;

    logger.info('Sending location message', {
      to: input.to,
      latitude: input.latitude,
      longitude: input.longitude,
      hasName: !!input.name,
      hasAddress: !!input.address,
    });

    const result = await wsapiClient.post('/messages/location', input);

    logger.info('Location message sent successfully', { messageId: result.id });

    return {
      success: true,
      messageId: result.id,
      message: 'Location message sent successfully',
    };
  },
};

// Send contact message tool
export const sendContactMessage: ToolHandler = {
  name: 'whatsapp_send_contact',
  description: 'Send a contact (vCard) message to a WhatsApp contact or group.',
  inputSchema: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Recipient phone number (with @s.whatsapp.net) or group ID (with @g.us)',
      },
      displayName: {
        type: 'string',
        description: 'Display name for the contact (alternative to vCard)',
        optional: true,
      },
      vCard: {
        type: 'string',
        description: 'Raw vCard string (alternative to displayName)',
        optional: true,
      },
      mentions: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of phone numbers to mention',
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
    required: ['to'],
  },
  handler: async (args: any) => {
    const input = validateInput(sendContactMessageSchema, args) as SendContactMessageInput;

    logger.info('Sending contact message', {
      to: input.to,
      hasDisplayName: !!input.displayName,
      hasVCard: !!input.vCard,
    });

    const result = await wsapiClient.post('/messages/contact', input);

    logger.info('Contact message sent successfully', { messageId: result.id });

    return {
      success: true,
      messageId: result.id,
      message: 'Contact message sent successfully',
    };
  },
};

// Export all advanced messaging tools
export const advancedMessagingTools = {
  sendAudioMessage,
  sendVoiceMessage,
  sendDocumentMessage,
  sendStickerMessage,
  sendLocationMessage,
  sendContactMessage,
};