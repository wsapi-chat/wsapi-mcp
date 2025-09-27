import type { ToolHandler } from '../server.js';
import { wsapiClient } from '../client/index.js';
import { createLogger } from '../utils/logger.js';
import { validateInput, createGroupSchema, getGroupSchema, updateGroupNameSchema, updateGroupDescriptionSchema } from '../validation/schemas.js';

const logger = createLogger('group-tools');

export const getGroups: ToolHandler = {
  name: 'whatsapp_get_groups',
  description: 'Get list of all WhatsApp groups.',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => {
    logger.info('Getting groups list');
    const result = await wsapiClient.get('/groups');
    return { success: true, groups: result, count: result.length };
  },
};

export const createGroup: ToolHandler = {
  name: 'whatsapp_create_group',
  description: 'Create a new WhatsApp group.',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Group name (max 255 characters)' },
      participants: { type: 'array', items: { type: 'string' }, description: 'List of participant phone numbers' },
    },
    required: ['name', 'participants'],
  },
  handler: async (args: any) => {
    const input = validateInput(createGroupSchema, args);
    logger.info('Creating group', { name: input.name, participantCount: input.participants.length });
    const result = await wsapiClient.post('/groups', input);
    return { success: true, groupId: result.id, message: 'Group created successfully' };
  },
};

export const getGroup: ToolHandler = {
  name: 'whatsapp_get_group',
  description: 'Get information about a specific group.',
  inputSchema: {
    type: 'object',
    properties: { groupId: { type: 'string', description: 'Group ID (with @g.us)' } },
    required: ['groupId'],
  },
  handler: async (args: any) => {
    const input = validateInput(getGroupSchema, args);
    const result = await wsapiClient.get(`/groups/${input.groupId}`);
    return { success: true, group: result };
  },
};

export const updateGroupName: ToolHandler = {
  name: 'whatsapp_update_group_name',
  description: 'Update group name.',
  inputSchema: {
    type: 'object',
    properties: {
      groupId: { type: 'string', description: 'Group ID (with @g.us)' },
      name: { type: 'string', description: 'New group name' },
    },
    required: ['groupId', 'name'],
  },
  handler: async (args: any) => {
    const input = validateInput(updateGroupNameSchema, args);
    await wsapiClient.put(`/groups/${input.groupId}/name`, { name: input.name });
    return { success: true, message: 'Group name updated successfully' };
  },
};

export const groupTools = { getGroups, createGroup, getGroup, updateGroupName };