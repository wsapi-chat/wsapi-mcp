import type { ToolHandler } from '../server.js';
import { wsapiClient } from '../client/index.js';
import { createLogger } from '../utils/logger.js';
import { validateInput, updateInstanceSettingsSchema } from '../validation/schemas.js';

const logger = createLogger('instance-tools');

export const getInstanceSettings: ToolHandler = {
  name: 'whatsapp_get_instance_settings',
  description: 'Get current instance settings.',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => {
    logger.info('Getting instance settings');
    const result = await wsapiClient.get('/instance/settings');
    return { success: true, settings: result, message: 'Instance settings retrieved successfully' };
  },
};

export const updateInstanceSettings: ToolHandler = {
  name: 'whatsapp_update_instance_settings',
  description: 'Update instance settings.',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Instance name', optional: true },
      description: { type: 'string', description: 'Instance description', optional: true },
      pullMode: { type: 'boolean', description: 'Enable pull mode for events', optional: true },
    },
  },
  handler: async (args: any) => {
    const input = validateInput(updateInstanceSettingsSchema, args);
    logger.info('Updating instance settings');
    const result = await wsapiClient.put('/instance/settings', input);
    return { success: true, settings: result, message: 'Instance settings updated successfully' };
  },
};

export const restartInstance: ToolHandler = {
  name: 'whatsapp_restart_instance',
  description: 'Restart the WhatsApp instance.',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => {
    logger.info('Restarting instance');
    await wsapiClient.put('/instance/restart', {});
    return { success: true, message: 'Instance restarted successfully' };
  },
};

export const updateApiKey: ToolHandler = {
  name: 'whatsapp_update_api_key',
  description: 'Generate a new API key for the instance.',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => {
    logger.info('Updating API key');
    const result = await wsapiClient.put('/instance/apikey', {});
    return { success: true, apiKey: result, message: 'API key updated successfully' };
  },
};

export const instanceTools = { getInstanceSettings, updateInstanceSettings, restartInstance, updateApiKey };