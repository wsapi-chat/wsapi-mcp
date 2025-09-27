import type { ToolHandler } from '../server.js';
import { wsapiClient } from '../client/index.js';
import { createLogger } from '../utils/logger.js';
import { validateInput, getChatSchema, setChatPresenceSchema, updateChatArchiveSchema, updateChatPinSchema } from '../validation/schemas.js';

const logger = createLogger('chat-tools');

export const getChats: ToolHandler = {
  name: 'whatsapp_get_chats',
  description: 'Get list of all WhatsApp chats.',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => {
    logger.info('Getting chats list');
    const result = await wsapiClient.get('/chats');
    return { success: true, chats: result, count: result.length };
  },
};

export const getChat: ToolHandler = {
  name: 'whatsapp_get_chat',
  description: 'Get information about a specific chat.',
  inputSchema: {
    type: 'object',
    properties: { chatId: { type: 'string', description: 'Chat ID' } },
    required: ['chatId'],
  },
  handler: async (args: any) => {
    const input = validateInput(getChatSchema, args);
    const result = await wsapiClient.get(`/chats/${input.chatId}`);
    return { success: true, chat: result };
  },
};

export const setChatPresence: ToolHandler = {
  name: 'whatsapp_set_chat_presence',
  description: 'Set presence status in a chat (typing, recording, paused).',
  inputSchema: {
    type: 'object',
    properties: {
      chatId: { type: 'string', description: 'Chat ID' },
      state: { type: 'string', enum: ['typing', 'recording', 'paused'], description: 'Presence state' },
    },
    required: ['chatId', 'state'],
  },
  handler: async (args: any) => {
    const input = validateInput(setChatPresenceSchema, args);
    await wsapiClient.put(`/chats/${input.chatId}/presence`, { state: input.state });
    return { success: true, message: 'Chat presence updated successfully' };
  },
};

export const archiveChat: ToolHandler = {
  name: 'whatsapp_archive_chat',
  description: 'Archive or unarchive a chat.',
  inputSchema: {
    type: 'object',
    properties: {
      chatId: { type: 'string', description: 'Chat ID' },
      archived: { type: 'boolean', description: 'Whether to archive or unarchive' },
    },
    required: ['chatId', 'archived'],
  },
  handler: async (args: any) => {
    const input = validateInput(updateChatArchiveSchema, args);
    await wsapiClient.put(`/chats/${input.chatId}/archive`, { archived: input.archived });
    return { success: true, message: `Chat ${input.archived ? 'archived' : 'unarchived'} successfully` };
  },
};

export const pinChat: ToolHandler = {
  name: 'whatsapp_pin_chat',
  description: 'Pin or unpin a chat.',
  inputSchema: {
    type: 'object',
    properties: {
      chatId: { type: 'string', description: 'Chat ID' },
      pinned: { type: 'boolean', description: 'Whether to pin or unpin' },
    },
    required: ['chatId', 'pinned'],
  },
  handler: async (args: any) => {
    const input = validateInput(updateChatPinSchema, args);
    await wsapiClient.put(`/chats/${input.chatId}/pin`, { pinned: input.pinned });
    return { success: true, message: `Chat ${input.pinned ? 'pinned' : 'unpinned'} successfully` };
  },
};

export const chatTools = { getChats, getChat, setChatPresence, archiveChat, pinChat };