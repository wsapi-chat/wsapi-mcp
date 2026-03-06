import type { ToolHandler } from '../server.js';
import { wsapiClient } from '../client/index.js';
import { createLogger } from '../utils/logger.js';
import { validateInput, rejectCallSchema } from '../validation/schemas.js';

const logger = createLogger('call-tools');

export const rejectCall: ToolHandler = {
  name: 'whatsapp_reject_call',
  description: 'Reject an incoming call.',
  inputSchema: {
    type: 'object',
    properties: {
      callId: { type: 'string', description: 'Call ID from the call event' },
      callerId: { type: 'string', description: 'JID of the caller' },
    },
    required: ['callId', 'callerId'],
  },
  handler: async (args: any) => {
    const input = validateInput(rejectCallSchema, args);
    logger.info('Rejecting call', { callId: input.callId });
    await wsapiClient.post(`/calls/${input.callId}/reject`, { callerId: input.callerId });
    return { success: true, message: 'Call rejected' };
  },
};

export const callTools = { rejectCall };
