import type { ToolHandler } from '../server.js';
import { wsapiClient } from '../client/index.js';
import { createLogger } from '../utils/logger.js';
import { validateInput, getContactSchema, createContactSchema, blockContactSchema } from '../validation/schemas.js';

const logger = createLogger('contact-tools');

export const getContacts: ToolHandler = {
  name: 'whatsapp_get_contacts',
  description: 'Get list of all WhatsApp contacts.',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => {
    logger.info('Getting contacts list');
    const result = await wsapiClient.get('/contacts');
    return { success: true, contacts: result, count: result.length, message: `Retrieved ${result.length} contacts` };
  },
};

export const getContact: ToolHandler = {
  name: 'whatsapp_get_contact',
  description: 'Get information about a specific WhatsApp contact.',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'string', description: 'Contact JID' } },
    required: ['id'],
  },
  handler: async (args: any) => {
    const input = validateInput(getContactSchema, args);
    logger.info('Getting contact info', { id: input.id });
    const result = await wsapiClient.get(`/contacts/${input.id}`);
    return { success: true, contact: result, message: 'Contact information retrieved successfully' };
  },
};

export const createContact: ToolHandler = {
  name: 'whatsapp_create_contact',
  description: 'Create or update a WhatsApp contact.',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Phone number or JID of the contact' },
      fullName: { type: 'string', description: 'Full name of the contact' },
      firstName: { type: 'string', description: 'First name (optional)' },
    },
    required: ['id', 'fullName'],
  },
  handler: async (args: any) => {
    const input = validateInput(createContactSchema, args);
    logger.info('Creating contact', { id: input.id });
    await wsapiClient.post('/contacts', input);
    return { success: true, message: 'Contact created successfully' };
  },
};

export const syncContacts: ToolHandler = {
  name: 'whatsapp_sync_contacts',
  description: 'Trigger a full contact sync from the WhatsApp server.',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => {
    logger.info('Syncing contacts');
    await wsapiClient.post('/contacts/sync', {});
    return { success: true, message: 'Contact sync triggered' };
  },
};

export const getBlocklist: ToolHandler = {
  name: 'whatsapp_get_blocklist',
  description: 'Get the list of all blocked contacts.',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => {
    logger.info('Getting blocklist');
    const result = await wsapiClient.get('/contacts/blocklist');
    return { success: true, blocklist: result, message: 'Blocklist retrieved successfully' };
  },
};

export const blockContact: ToolHandler = {
  name: 'whatsapp_block_contact',
  description: 'Block a contact.',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'string', description: 'Contact JID to block' } },
    required: ['id'],
  },
  handler: async (args: any) => {
    const input = validateInput(blockContactSchema, args);
    logger.info('Blocking contact', { id: input.id });
    await wsapiClient.put(`/contacts/${input.id}/block`, {});
    return { success: true, message: 'Contact blocked successfully' };
  },
};

export const unblockContact: ToolHandler = {
  name: 'whatsapp_unblock_contact',
  description: 'Unblock a contact.',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'string', description: 'Contact JID to unblock' } },
    required: ['id'],
  },
  handler: async (args: any) => {
    const input = validateInput(blockContactSchema, args);
    logger.info('Unblocking contact', { id: input.id });
    await wsapiClient.put(`/contacts/${input.id}/unblock`, {});
    return { success: true, message: 'Contact unblocked successfully' };
  },
};

export const contactTools = {
  getContacts,
  getContact,
  createContact,
  syncContacts,
  getBlocklist,
  blockContact,
  unblockContact,
};
