import type { ToolHandler } from '../server.js';
import { wsapiClient } from '../client/index.js';
import { createLogger } from '../utils/logger.js';
import {
  validateInput,
  postTextStatusSchema,
  postMediaStatusSchema,
  deleteStatusSchema,
} from '../validation/schemas.js';

const logger = createLogger('status-tools');

export const getStatusPrivacy: ToolHandler = {
  name: 'whatsapp_get_status_privacy',
  description: 'Get status broadcast privacy settings.',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => {
    logger.info('Getting status privacy');
    const result = await wsapiClient.get('/status/privacy');
    return { success: true, privacy: result };
  },
};

export const postTextStatus: ToolHandler = {
  name: 'whatsapp_post_text_status',
  description: 'Post a text status update (story).',
  inputSchema: {
    type: 'object',
    properties: { text: { type: 'string', description: 'Status text content' } },
    required: ['text'],
  },
  handler: async (args: any) => {
    const input = validateInput(postTextStatusSchema, args);
    logger.info('Posting text status');
    const result = await wsapiClient.post('/status/text', { text: input.text });
    return { success: true, messageId: result.id, message: 'Text status posted' };
  },
};

export const postImageStatus: ToolHandler = {
  name: 'whatsapp_post_image_status',
  description: 'Post an image status update. Provide either data (base64) or url.',
  inputSchema: {
    type: 'object',
    properties: {
      data: { type: 'string', description: 'Base64-encoded image data' },
      url: { type: 'string', description: 'URL of the image' },
      mimeType: { type: 'string', description: 'MIME type' },
      caption: { type: 'string', description: 'Caption' },
    },
  },
  handler: async (args: any) => {
    const input = validateInput(postMediaStatusSchema, args);
    logger.info('Posting image status');
    const result = await wsapiClient.post('/status/image', input);
    return { success: true, messageId: result.id, message: 'Image status posted' };
  },
};

export const postVideoStatus: ToolHandler = {
  name: 'whatsapp_post_video_status',
  description: 'Post a video status update. Provide either data (base64) or url.',
  inputSchema: {
    type: 'object',
    properties: {
      data: { type: 'string', description: 'Base64-encoded video data' },
      url: { type: 'string', description: 'URL of the video' },
      mimeType: { type: 'string', description: 'MIME type' },
      caption: { type: 'string', description: 'Caption' },
    },
  },
  handler: async (args: any) => {
    const input = validateInput(postMediaStatusSchema, args);
    logger.info('Posting video status');
    const result = await wsapiClient.post('/status/video', input);
    return { success: true, messageId: result.id, message: 'Video status posted' };
  },
};

export const deleteStatus: ToolHandler = {
  name: 'whatsapp_delete_status',
  description: 'Delete a previously posted status update.',
  inputSchema: {
    type: 'object',
    properties: { messageId: { type: 'string', description: 'Status message ID' } },
    required: ['messageId'],
  },
  handler: async (args: any) => {
    const input = validateInput(deleteStatusSchema, args);
    logger.info('Deleting status', { messageId: input.messageId });
    await wsapiClient.post(`/status/${input.messageId}/delete`, {});
    return { success: true, message: 'Status deleted' };
  },
};

export const statusTools = {
  getStatusPrivacy, postTextStatus, postImageStatus, postVideoStatus, deleteStatus,
};
