import type { ToolHandler } from '../server.js';
import { wsapiClient } from '../client/index.js';
import { createLogger } from '../utils/logger.js';
import {
  validateInput,
  getContactSchema,
  createContactSchema,
  updateContactSchema,
  updateContactFullNameSchema,
} from '../validation/schemas.js';

const logger = createLogger('contact-tools');

// Get contacts list tool
export const getContacts: ToolHandler = {
  name: 'whatsapp_get_contacts',
  description: 'Get list of all WhatsApp contacts.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  handler: async () => {
    logger.info('Getting contacts list');

    const result = await wsapiClient.get('/contacts');

    logger.info('Retrieved contacts successfully', { count: result.length });

    return {
      success: true,
      contacts: result,
      count: result.length,
      message: `Retrieved ${result.length} contacts`,
    };
  },
};

// Get specific contact tool
export const getContact: ToolHandler = {
  name: 'whatsapp_get_contact',
  description: 'Get information about a specific WhatsApp contact.',
  inputSchema: {
    type: 'object',
    properties: {
      contactId: {
        type: 'string',
        description: 'Contact ID (phone number with @s.whatsapp.net)',
      },
    },
    required: ['contactId'],
  },
  handler: async (args: any) => {
    const input = validateInput(getContactSchema, args);

    logger.info('Getting contact info', { contactId: input.contactId });

    const result = await wsapiClient.get(`/contacts/${input.contactId}`);

    logger.info('Retrieved contact successfully', { contactId: input.contactId });

    return {
      success: true,
      contact: result,
      message: 'Contact information retrieved successfully',
    };
  },
};

// Create contact tool
export const createContact: ToolHandler = {
  name: 'whatsapp_create_contact',
  description: 'Create a new WhatsApp contact.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Contact ID (phone number with @s.whatsapp.net)',
      },
      fullName: {
        type: 'string',
        description: 'Full name of the contact (max 255 characters)',
      },
      firstName: {
        type: 'string',
        description: 'First name of the contact (max 255 characters)',
      },
    },
    required: ['id', 'fullName', 'firstName'],
  },
  handler: async (args: any) => {
    const input = validateInput(createContactSchema, args);

    logger.info('Creating contact', {
      id: input.id,
      fullName: input.fullName,
    });

    await wsapiClient.post('/contacts', input);

    logger.info('Contact created successfully', { id: input.id });

    return {
      success: true,
      message: 'Contact created successfully',
    };
  },
};

// Update contact tool
export const updateContact: ToolHandler = {
  name: 'whatsapp_update_contact',
  description: 'Update an existing WhatsApp contact.',
  inputSchema: {
    type: 'object',
    properties: {
      contactId: {
        type: 'string',
        description: 'Contact ID (phone number with @s.whatsapp.net)',
      },
      fullName: {
        type: 'string',
        description: 'Full name of the contact (max 255 characters)',
      },
      firstName: {
        type: 'string',
        description: 'First name of the contact (max 255 characters)',
      },
    },
    required: ['contactId', 'fullName', 'firstName'],
  },
  handler: async (args: any) => {
    const input = validateInput(updateContactSchema, args);

    logger.info('Updating contact', {
      contactId: input.contactId,
      fullName: input.fullName,
    });

    await wsapiClient.put(`/contacts/${input.contactId}`, {
      fullName: input.fullName,
      firstName: input.firstName,
    });

    logger.info('Contact updated successfully', { contactId: input.contactId });

    return {
      success: true,
      message: 'Contact updated successfully',
    };
  },
};

// Get contact picture tool
export const getContactPicture: ToolHandler = {
  name: 'whatsapp_get_contact_picture',
  description: 'Get the profile picture of a WhatsApp contact.',
  inputSchema: {
    type: 'object',
    properties: {
      contactId: {
        type: 'string',
        description: 'Contact ID (phone number with @s.whatsapp.net)',
      },
    },
    required: ['contactId'],
  },
  handler: async (args: any) => {
    const input = validateInput(getContactSchema, args);

    logger.info('Getting contact picture', { contactId: input.contactId });

    const result = await wsapiClient.get(`/contacts/${input.contactId}/picture`);

    logger.info('Retrieved contact picture successfully', { contactId: input.contactId });

    return {
      success: true,
      picture: result,
      message: 'Contact picture retrieved successfully',
    };
  },
};

// Get contact business profile tool
export const getContactBusinessProfile: ToolHandler = {
  name: 'whatsapp_get_contact_business',
  description: 'Get the business profile information of a WhatsApp contact.',
  inputSchema: {
    type: 'object',
    properties: {
      contactId: {
        type: 'string',
        description: 'Contact ID (phone number with @s.whatsapp.net)',
      },
    },
    required: ['contactId'],
  },
  handler: async (args: any) => {
    const input = validateInput(getContactSchema, args);

    logger.info('Getting contact business profile', { contactId: input.contactId });

    const result = await wsapiClient.get(`/contacts/${input.contactId}/business`);

    logger.info('Retrieved contact business profile successfully', { contactId: input.contactId });

    return {
      success: true,
      businessProfile: result,
      message: 'Contact business profile retrieved successfully',
    };
  },
};

// Subscribe to contact presence updates
export const subscribeToContactPresence: ToolHandler = {
  name: 'whatsapp_subscribe_contact_presence',
  description: 'Subscribe to presence updates for a specific contact.',
  inputSchema: {
    type: 'object',
    properties: {
      contactId: {
        type: 'string',
        description: 'Contact ID (phone number with @s.whatsapp.net)',
      },
    },
    required: ['contactId'],
  },
  handler: async (args: any) => {
    const input = validateInput(getContactSchema, args);

    logger.info('Subscribing to contact presence', { contactId: input.contactId });

    await wsapiClient.post(`/contacts/${input.contactId}/presence`, {});

    logger.info('Subscribed to contact presence successfully', { contactId: input.contactId });

    return {
      success: true,
      message: 'Successfully subscribed to contact presence updates',
    };
  },
};

// Export all contact tools
export const contactTools = {
  getContacts,
  getContact,
  createContact,
  updateContact,
  getContactPicture,
  getContactBusinessProfile,
  subscribeToContactPresence,
};