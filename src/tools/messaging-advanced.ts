import type { ToolHandler } from '../server.js';
import { wsapiClient } from '../client/index.js';
import { createLogger } from '../utils/logger.js';
import {
  validateInput,
  sendMediaMessageSchema,
  sendDocumentMessageSchema,
  sendStickerMessageSchema,
  sendLocationMessageSchema,
  sendContactMessageSchema,
  type SendMediaMessageInput,
  type SendDocumentMessageInput,
  type SendStickerMessageInput,
  type SendLocationMessageInput,
  type SendContactMessageInput,
} from '../validation/schemas.js';

const logger = createLogger('messaging-advanced-tools');

export const sendAudioMessage: ToolHandler = {
  name: 'whatsapp_send_audio',
  description: 'Send an audio file message. Provide either data (base64) or url.',
  inputSchema: {
    type: 'object',
    properties: {
      to: { type: 'string', description: 'Recipient JID' },
      data: { type: 'string', description: 'Base64 encoded audio data' },
      url: { type: 'string', description: 'URL of the audio file' },
      mimeType: { type: 'string', description: 'MIME type (auto-detected if omitted)' },
      mentions: { type: 'array', items: { type: 'string' } },
      replyTo: { type: 'string', description: 'Message ID to reply to' },
      replyToSenderId: { type: 'string' },
      isForwarded: { type: 'boolean' },
      viewOnce: { type: 'boolean' },
      ephemeralExpiration: { type: 'string', enum: ['off', '24h', '7d', '90d'] },
    },
    required: ['to'],
  },
  handler: async (args: any) => {
    const input = validateInput(sendMediaMessageSchema, args) as SendMediaMessageInput;
    logger.info('Sending audio message', { to: input.to });
    const result = await wsapiClient.post('/messages/audio', input);
    logger.info('Audio message sent successfully', { messageId: result.id });
    return { success: true, messageId: result.id, message: 'Audio message sent successfully' };
  },
};

export const sendVoiceMessage: ToolHandler = {
  name: 'whatsapp_send_voice',
  description: 'Send a voice message (PTT). Provide either data (base64) or url.',
  inputSchema: {
    type: 'object',
    properties: {
      to: { type: 'string', description: 'Recipient JID' },
      data: { type: 'string', description: 'Base64 encoded voice data' },
      url: { type: 'string', description: 'URL of the voice file' },
      mimeType: { type: 'string', description: 'MIME type (auto-detected if omitted)' },
      mentions: { type: 'array', items: { type: 'string' } },
      replyTo: { type: 'string' },
      replyToSenderId: { type: 'string' },
      isForwarded: { type: 'boolean' },
      viewOnce: { type: 'boolean' },
      ephemeralExpiration: { type: 'string', enum: ['off', '24h', '7d', '90d'] },
    },
    required: ['to'],
  },
  handler: async (args: any) => {
    const input = validateInput(sendMediaMessageSchema, args) as SendMediaMessageInput;
    logger.info('Sending voice message', { to: input.to });
    const result = await wsapiClient.post('/messages/voice', input);
    logger.info('Voice message sent successfully', { messageId: result.id });
    return { success: true, messageId: result.id, message: 'Voice message sent successfully' };
  },
};

export const sendDocumentMessage: ToolHandler = {
  name: 'whatsapp_send_document',
  description: 'Send a document file. Provide either data (base64) or url. Filename is required.',
  inputSchema: {
    type: 'object',
    properties: {
      to: { type: 'string', description: 'Recipient JID' },
      data: { type: 'string', description: 'Base64 encoded document data' },
      url: { type: 'string', description: 'URL of the document' },
      filename: { type: 'string', description: 'Filename shown to recipient' },
      mimeType: { type: 'string', description: 'MIME type (auto-detected if omitted)' },
      caption: { type: 'string', description: 'Caption for the document' },
      mentions: { type: 'array', items: { type: 'string' } },
      replyTo: { type: 'string' },
      replyToSenderId: { type: 'string' },
      isForwarded: { type: 'boolean' },
      ephemeralExpiration: { type: 'string', enum: ['off', '24h', '7d', '90d'] },
    },
    required: ['to', 'filename'],
  },
  handler: async (args: any) => {
    const input = validateInput(sendDocumentMessageSchema, args) as SendDocumentMessageInput;
    logger.info('Sending document message', { to: input.to, filename: input.filename });
    const result = await wsapiClient.post('/messages/document', input);
    logger.info('Document message sent successfully', { messageId: result.id });
    return { success: true, messageId: result.id, message: 'Document message sent successfully' };
  },
};

export const sendStickerMessage: ToolHandler = {
  name: 'whatsapp_send_sticker',
  description: 'Send a sticker message (WebP format). Provide either data (base64) or url.',
  inputSchema: {
    type: 'object',
    properties: {
      to: { type: 'string', description: 'Recipient JID' },
      data: { type: 'string', description: 'Base64 encoded sticker data' },
      url: { type: 'string', description: 'URL of the sticker' },
      isAnimated: { type: 'boolean', description: 'Whether the sticker is animated' },
      mentions: { type: 'array', items: { type: 'string' } },
      replyTo: { type: 'string' },
      replyToSenderId: { type: 'string' },
      isForwarded: { type: 'boolean' },
      ephemeralExpiration: { type: 'string', enum: ['off', '24h', '7d', '90d'] },
    },
    required: ['to'],
  },
  handler: async (args: any) => {
    const input = validateInput(sendStickerMessageSchema, args) as SendStickerMessageInput;
    logger.info('Sending sticker message', { to: input.to });
    const result = await wsapiClient.post('/messages/sticker', input);
    logger.info('Sticker message sent successfully', { messageId: result.id });
    return { success: true, messageId: result.id, message: 'Sticker message sent successfully' };
  },
};

export const sendLocationMessage: ToolHandler = {
  name: 'whatsapp_send_location',
  description: 'Send a location message.',
  inputSchema: {
    type: 'object',
    properties: {
      to: { type: 'string', description: 'Recipient JID' },
      latitude: { type: 'number', minimum: -90, maximum: 90, description: 'Latitude' },
      longitude: { type: 'number', minimum: -180, maximum: 180, description: 'Longitude' },
      name: { type: 'string', description: 'Location name' },
      address: { type: 'string', description: 'Location address' },
      url: { type: 'string', description: 'Location URL' },
      ephemeralExpiration: { type: 'string', enum: ['off', '24h', '7d', '90d'] },
    },
    required: ['to', 'latitude', 'longitude'],
  },
  handler: async (args: any) => {
    const input = validateInput(sendLocationMessageSchema, args) as SendLocationMessageInput;
    logger.info('Sending location message', { to: input.to });
    const result = await wsapiClient.post('/messages/location', input);
    logger.info('Location message sent successfully', { messageId: result.id });
    return { success: true, messageId: result.id, message: 'Location message sent successfully' };
  },
};

export const sendContactMessage: ToolHandler = {
  name: 'whatsapp_send_contact',
  description: 'Send a contact (vCard) message. Provide either displayName or vcard.',
  inputSchema: {
    type: 'object',
    properties: {
      to: { type: 'string', description: 'Recipient JID' },
      displayName: { type: 'string', description: 'Display name (auto-generates vCard)' },
      vcard: { type: 'string', description: 'Raw vCard string' },
      mentions: { type: 'array', items: { type: 'string' } },
      replyTo: { type: 'string' },
      replyToSenderId: { type: 'string' },
      isForwarded: { type: 'boolean' },
      ephemeralExpiration: { type: 'string', enum: ['off', '24h', '7d', '90d'] },
    },
    required: ['to'],
  },
  handler: async (args: any) => {
    const input = validateInput(sendContactMessageSchema, args) as SendContactMessageInput;
    logger.info('Sending contact message', { to: input.to });
    const result = await wsapiClient.post('/messages/contact', input);
    logger.info('Contact message sent successfully', { messageId: result.id });
    return { success: true, messageId: result.id, message: 'Contact message sent successfully' };
  },
};

export const advancedMessagingTools = {
  sendAudioMessage,
  sendVoiceMessage,
  sendDocumentMessage,
  sendStickerMessage,
  sendLocationMessage,
  sendContactMessage,
};
