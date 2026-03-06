import type { ToolHandler } from '../server.js';
import { wsapiClient } from '../client/index.js';
import { createLogger } from '../utils/logger.js';
import { validateInput, downloadMediaSchema } from '../validation/schemas.js';

const logger = createLogger('media-tools');

export const downloadMedia: ToolHandler = {
  name: 'whatsapp_download_media',
  description: 'Download media by ID. Use the media.id field from incoming message events.',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Media ID from a received message event' },
    },
    required: ['id'],
  },
  handler: async (args: any) => {
    const input = validateInput(downloadMediaSchema, args);
    logger.info('Downloading media', { id: input.id });
    const result = await wsapiClient.get('/media/download', { id: input.id });
    return { success: true, media: result, message: 'Media downloaded' };
  },
};

export const mediaTools = { downloadMedia };
