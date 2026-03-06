import type { ToolHandler } from '../server.js';
import { wsapiClient } from '../client/index.js';
import { createLogger } from '../utils/logger.js';
import {
  validateInput,
  createNewsletterSchema,
  getNewsletterSchema,
  getNewsletterByInviteSchema,
  setNewsletterSubscriptionSchema,
  muteNewsletterSchema,
} from '../validation/schemas.js';

const logger = createLogger('newsletter-tools');

export const listNewsletters: ToolHandler = {
  name: 'whatsapp_list_newsletters',
  description: 'List all subscribed newsletters.',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => {
    logger.info('Listing newsletters');
    const result = await wsapiClient.get('/newsletters');
    return { success: true, newsletters: result, count: result.length };
  },
};

export const createNewsletter: ToolHandler = {
  name: 'whatsapp_create_newsletter',
  description: 'Create a new newsletter/channel.',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Newsletter name' },
      description: { type: 'string', description: 'Newsletter description' },
      picture: { type: 'string', description: 'Base64-encoded profile picture' },
    },
    required: ['name'],
  },
  handler: async (args: any) => {
    const input = validateInput(createNewsletterSchema, args);
    logger.info('Creating newsletter', { name: input.name });
    const result = await wsapiClient.post('/newsletters', input);
    return { success: true, newsletterId: result.id, message: 'Newsletter created' };
  },
};

export const getNewsletterByInvite: ToolHandler = {
  name: 'whatsapp_get_newsletter_by_invite',
  description: 'Get newsletter info by invite code.',
  inputSchema: {
    type: 'object',
    properties: { code: { type: 'string', description: 'Newsletter invite code' } },
    required: ['code'],
  },
  handler: async (args: any) => {
    const input = validateInput(getNewsletterByInviteSchema, args);
    const result = await wsapiClient.get(`/newsletters/invite/${input.code}`);
    return { success: true, newsletter: result };
  },
};

export const getNewsletter: ToolHandler = {
  name: 'whatsapp_get_newsletter',
  description: 'Get newsletter info by JID.',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'string', description: 'Newsletter JID' } },
    required: ['id'],
  },
  handler: async (args: any) => {
    const input = validateInput(getNewsletterSchema, args);
    const result = await wsapiClient.get(`/newsletters/${input.id}`);
    return { success: true, newsletter: result };
  },
};

export const setNewsletterSubscription: ToolHandler = {
  name: 'whatsapp_set_newsletter_subscription',
  description: 'Subscribe or unsubscribe from a newsletter.',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Newsletter JID' },
      subscribed: { type: 'boolean', description: 'True to subscribe, false to unsubscribe' },
    },
    required: ['id', 'subscribed'],
  },
  handler: async (args: any) => {
    const input = validateInput(setNewsletterSubscriptionSchema, args);
    logger.info('Setting newsletter subscription', { id: input.id, subscribed: input.subscribed });
    await wsapiClient.put(`/newsletters/${input.id}/subscription`, { subscribed: input.subscribed });
    return { success: true, message: `Newsletter ${input.subscribed ? 'subscribed' : 'unsubscribed'}` };
  },
};

export const muteNewsletter: ToolHandler = {
  name: 'whatsapp_mute_newsletter',
  description: 'Mute or unmute a newsletter.',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Newsletter JID' },
      mute: { type: 'boolean', description: 'True to mute, false to unmute' },
    },
    required: ['id', 'mute'],
  },
  handler: async (args: any) => {
    const input = validateInput(muteNewsletterSchema, args);
    logger.info('Setting newsletter mute', { id: input.id, mute: input.mute });
    await wsapiClient.put(`/newsletters/${input.id}/mute`, { mute: input.mute });
    return { success: true, message: `Newsletter ${input.mute ? 'muted' : 'unmuted'}` };
  },
};

export const newsletterTools = {
  listNewsletters, createNewsletter, getNewsletterByInvite,
  getNewsletter, setNewsletterSubscription, muteNewsletter,
};
