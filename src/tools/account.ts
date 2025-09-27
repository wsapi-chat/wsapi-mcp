import type { ToolHandler } from '../server.js';
import { wsapiClient } from '../client/index.js';
import { createLogger } from '../utils/logger.js';
import { validateInput, setAccountNameSchema, setAccountPictureSchema, setAccountPresenceSchema, setAccountStatusSchema } from '../validation/schemas.js';

const logger = createLogger('account-tools');

export const getAccountInfo: ToolHandler = {
  name: 'whatsapp_get_account_info',
  description: 'Get current account information.',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => {
    logger.info('Getting account info');
    const result = await wsapiClient.get('/account/info');
    return { success: true, account: result, message: 'Account information retrieved successfully' };
  },
};

export const setAccountName: ToolHandler = {
  name: 'whatsapp_set_account_name',
  description: 'Update account display name.',
  inputSchema: {
    type: 'object',
    properties: { name: { type: 'string', description: 'New account name (max 255 characters)' } },
    required: ['name'],
  },
  handler: async (args: any) => {
    const input = validateInput(setAccountNameSchema, args);
    logger.info('Setting account name');
    await wsapiClient.put('/account/name', input);
    return { success: true, message: 'Account name updated successfully' };
  },
};

export const setAccountPicture: ToolHandler = {
  name: 'whatsapp_set_account_picture',
  description: 'Update account profile picture.',
  inputSchema: {
    type: 'object',
    properties: { pictureBase64: { type: 'string', description: 'Base64 encoded image data' } },
    required: ['pictureBase64'],
  },
  handler: async (args: any) => {
    const input = validateInput(setAccountPictureSchema, args);
    logger.info('Setting account picture');
    const result = await wsapiClient.post('/account/picture', input);
    return { success: true, pictureId: result.id, message: 'Account picture updated successfully' };
  },
};

export const setAccountPresence: ToolHandler = {
  name: 'whatsapp_set_account_presence',
  description: 'Set account presence status.',
  inputSchema: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['available', 'unavailable'], description: 'Presence status' },
    },
    required: ['status'],
  },
  handler: async (args: any) => {
    const input = validateInput(setAccountPresenceSchema, args);
    logger.info('Setting account presence');
    await wsapiClient.put('/account/presence', input);
    return { success: true, message: 'Account presence updated successfully' };
  },
};

export const setAccountStatus: ToolHandler = {
  name: 'whatsapp_set_account_status',
  description: 'Update account status message.',
  inputSchema: {
    type: 'object',
    properties: { status: { type: 'string', description: 'Status message (max 139 characters)' } },
    required: ['status'],
  },
  handler: async (args: any) => {
    const input = validateInput(setAccountStatusSchema, args);
    logger.info('Setting account status');
    await wsapiClient.put('/account/status', input);
    return { success: true, message: 'Account status updated successfully' };
  },
};

export const accountTools = { getAccountInfo, setAccountName, setAccountPicture, setAccountPresence, setAccountStatus };