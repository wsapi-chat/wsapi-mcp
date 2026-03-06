import type { ToolHandler } from '../server.js';
import { wsapiClient } from '../client/index.js';
import { createLogger } from '../utils/logger.js';
import { validateInput, getSessionLoginCodeSchema } from '../validation/schemas.js';

const logger = createLogger('session-tools');

export const getSessionStatus: ToolHandler = {
  name: 'whatsapp_get_session_status',
  description: 'Get current WhatsApp session status.',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => {
    logger.info('Getting session status');
    const result = await wsapiClient.get('/session/status');
    return { success: true, status: result, message: 'Session status retrieved successfully' };
  },
};

export const getQRCode: ToolHandler = {
  name: 'whatsapp_get_qr_code',
  description: 'Get QR code text string for WhatsApp login.',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => {
    logger.info('Getting QR code text');
    const result = await wsapiClient.get('/session/qr/text');
    return { success: true, qrCode: result, message: 'QR code retrieved successfully' };
  },
};

export const getQRCodeImage: ToolHandler = {
  name: 'whatsapp_get_qr_code_image',
  description: 'Get QR code PNG image for WhatsApp login.',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => {
    logger.info('Getting QR code image');
    const result = await wsapiClient.get('/session/qr');
    return { success: true, image: result, message: 'QR code image retrieved successfully' };
  },
};

export const getPairCode: ToolHandler = {
  name: 'whatsapp_get_pair_code',
  description: 'Get pairing code for WhatsApp login.',
  inputSchema: {
    type: 'object',
    properties: { phone: { type: 'string', description: 'Phone number (7-15 digits)' } },
    required: ['phone'],
  },
  handler: async (args: any) => {
    const input = validateInput(getSessionLoginCodeSchema, args);
    logger.info('Getting pair code', { phone: input.phone });
    const result = await wsapiClient.get(`/session/pair-code/${input.phone}`);
    return { success: true, pairCode: result, message: 'Pair code retrieved successfully' };
  },
};

export const logout: ToolHandler = {
  name: 'whatsapp_logout',
  description: 'Logout from WhatsApp.',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => {
    logger.info('Logging out');
    await wsapiClient.post('/session/logout', {});
    return { success: true, message: 'Logged out successfully' };
  },
};

export const flushHistory: ToolHandler = {
  name: 'whatsapp_flush_history',
  description: 'Flush cached history sync messages. Returns 202 Accepted, then asynchronously publishes cached history sync messages as events.',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => {
    logger.info('Flushing history');
    const result = await wsapiClient.post('/session/flush-history', {});
    return { success: true, result, message: 'History flush initiated' };
  },
};

export const sessionTools = { getSessionStatus, getQRCode, getQRCodeImage, getPairCode, logout, flushHistory };
