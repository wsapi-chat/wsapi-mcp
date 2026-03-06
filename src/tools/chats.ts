import type { ToolHandler } from '../server.js';
import { wsapiClient } from '../client/index.js';
import { createLogger } from '../utils/logger.js';
import {
  validateInput,
  getChatSchema,
  setChatPresenceSchema,
  updateChatArchiveSchema,
  updateChatPinSchema,
  updateChatEphemeralSchema,
  updateChatMuteSchema,
  markChatAsReadSchema,
  requestChatMessagesSchema,
} from '../validation/schemas.js';

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
    properties: { chatId: { type: 'string', description: 'Chat JID' } },
    required: ['chatId'],
  },
  handler: async (args: any) => {
    const input = validateInput(getChatSchema, args);
    const result = await wsapiClient.get(`/chats/${input.chatId}`);
    return { success: true, chat: result };
  },
};

export const deleteChat: ToolHandler = {
  name: 'whatsapp_delete_chat',
  description: 'Delete a chat.',
  inputSchema: {
    type: 'object',
    properties: { chatId: { type: 'string', description: 'Chat JID' } },
    required: ['chatId'],
  },
  handler: async (args: any) => {
    const input = validateInput(getChatSchema, args);
    await wsapiClient.delete(`/chats/${input.chatId}`);
    return { success: true, message: 'Chat deleted successfully' };
  },
};

export const getChatPicture: ToolHandler = {
  name: 'whatsapp_get_chat_picture',
  description: 'Get chat profile picture.',
  inputSchema: {
    type: 'object',
    properties: { chatId: { type: 'string', description: 'Chat JID' } },
    required: ['chatId'],
  },
  handler: async (args: any) => {
    const input = validateInput(getChatSchema, args);
    const result = await wsapiClient.get(`/chats/${input.chatId}/picture`);
    return { success: true, picture: result };
  },
};

export const getChatBusinessProfile: ToolHandler = {
  name: 'whatsapp_get_chat_business_profile',
  description: 'Get business profile for a chat.',
  inputSchema: {
    type: 'object',
    properties: { chatId: { type: 'string', description: 'Chat JID' } },
    required: ['chatId'],
  },
  handler: async (args: any) => {
    const input = validateInput(getChatSchema, args);
    const result = await wsapiClient.get(`/chats/${input.chatId}/business`);
    return { success: true, businessProfile: result };
  },
};

export const setChatPresence: ToolHandler = {
  name: 'whatsapp_set_chat_presence',
  description: 'Set presence status in a chat (typing, recording, paused).',
  inputSchema: {
    type: 'object',
    properties: {
      chatId: { type: 'string', description: 'Chat JID' },
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

export const subscribeChatPresence: ToolHandler = {
  name: 'whatsapp_subscribe_chat_presence',
  description: 'Subscribe to presence updates for a chat.',
  inputSchema: {
    type: 'object',
    properties: { chatId: { type: 'string', description: 'Chat JID' } },
    required: ['chatId'],
  },
  handler: async (args: any) => {
    const input = validateInput(getChatSchema, args);
    await wsapiClient.put(`/chats/${input.chatId}/presence/subscribe`, {});
    return { success: true, message: 'Subscribed to presence updates' };
  },
};

export const setChatEphemeral: ToolHandler = {
  name: 'whatsapp_set_chat_ephemeral',
  description: 'Set disappearing messages timer for a chat.',
  inputSchema: {
    type: 'object',
    properties: {
      chatId: { type: 'string', description: 'Chat JID' },
      expiration: { type: 'string', enum: ['off', '24h', '7d', '90d'], description: 'Timer duration' },
    },
    required: ['chatId', 'expiration'],
  },
  handler: async (args: any) => {
    const input = validateInput(updateChatEphemeralSchema, args);
    await wsapiClient.put(`/chats/${input.chatId}/ephemeral`, { expiration: input.expiration });
    return { success: true, message: 'Ephemeral timer set' };
  },
};

export const muteChat: ToolHandler = {
  name: 'whatsapp_mute_chat',
  description: 'Mute or unmute a chat.',
  inputSchema: {
    type: 'object',
    properties: {
      chatId: { type: 'string', description: 'Chat JID' },
      duration: { type: 'string', enum: ['8h', '1w', 'always', 'off'], description: 'Mute duration' },
    },
    required: ['chatId', 'duration'],
  },
  handler: async (args: any) => {
    const input = validateInput(updateChatMuteSchema, args);
    await wsapiClient.put(`/chats/${input.chatId}/mute`, { duration: input.duration });
    return { success: true, message: 'Chat mute setting updated' };
  },
};

export const archiveChat: ToolHandler = {
  name: 'whatsapp_archive_chat',
  description: 'Archive or unarchive a chat.',
  inputSchema: {
    type: 'object',
    properties: {
      chatId: { type: 'string', description: 'Chat JID' },
      archived: { type: 'boolean', description: 'Archive or unarchive' },
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
      chatId: { type: 'string', description: 'Chat JID' },
      pinned: { type: 'boolean', description: 'Pin or unpin' },
    },
    required: ['chatId', 'pinned'],
  },
  handler: async (args: any) => {
    const input = validateInput(updateChatPinSchema, args);
    await wsapiClient.put(`/chats/${input.chatId}/pin`, { pinned: input.pinned });
    return { success: true, message: `Chat ${input.pinned ? 'pinned' : 'unpinned'} successfully` };
  },
};

export const markChatAsRead: ToolHandler = {
  name: 'whatsapp_mark_chat_as_read',
  description: 'Mark a chat as read or unread.',
  inputSchema: {
    type: 'object',
    properties: {
      chatId: { type: 'string', description: 'Chat JID' },
      read: { type: 'boolean', description: 'Mark as read (true) or unread (false)' },
    },
    required: ['chatId', 'read'],
  },
  handler: async (args: any) => {
    const input = validateInput(markChatAsReadSchema, args);
    await wsapiClient.put(`/chats/${input.chatId}/read`, { read: input.read });
    return { success: true, message: 'Chat read state updated' };
  },
};

export const requestChatMessages: ToolHandler = {
  name: 'whatsapp_request_chat_messages',
  description: 'Request on-demand message history for a chat. Results arrive asynchronously.',
  inputSchema: {
    type: 'object',
    properties: {
      chatId: { type: 'string', description: 'Chat JID' },
      lastMessageId: { type: 'string', description: 'ID of the last known message' },
      lastMessageSenderId: { type: 'string', description: 'Sender of the last known message' },
      count: { type: 'number', description: 'Number of messages to request (default 50, max 500)' },
    },
    required: ['chatId', 'lastMessageId', 'lastMessageSenderId'],
  },
  handler: async (args: any) => {
    const input = validateInput(requestChatMessagesSchema, args);
    const result = await wsapiClient.post(`/chats/${input.chatId}/messages`, {
      lastMessageId: input.lastMessageId,
      lastMessageSenderId: input.lastMessageSenderId,
      count: input.count,
    });
    return { success: true, result, message: 'Message history request accepted' };
  },
};

export const clearChat: ToolHandler = {
  name: 'whatsapp_clear_chat',
  description: 'Clear all messages from a chat.',
  inputSchema: {
    type: 'object',
    properties: { chatId: { type: 'string', description: 'Chat JID' } },
    required: ['chatId'],
  },
  handler: async (args: any) => {
    const input = validateInput(getChatSchema, args);
    await wsapiClient.post(`/chats/${input.chatId}/clear`, {});
    return { success: true, message: 'Chat cleared successfully' };
  },
};

export const chatTools = {
  getChats, getChat, deleteChat, getChatPicture, getChatBusinessProfile,
  setChatPresence, subscribeChatPresence, setChatEphemeral, muteChat,
  archiveChat, pinChat, markChatAsRead, requestChatMessages, clearChat,
};
