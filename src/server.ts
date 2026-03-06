import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolResult,
  ListToolsResult,
} from '@modelcontextprotocol/sdk/types.js';
import { createLogger } from './utils/logger.js';
import { handleError, getUserFriendlyMessage } from './utils/errors.js';
import { wsapiClient } from './client/index.js';
import { config } from './config/index.js';

// Import tool handlers
import { messagingTools } from './tools/messaging.js';
import { contactTools } from './tools/contacts.js';
import { groupTools } from './tools/groups.js';
import { chatTools } from './tools/chats.js';
import { sessionTools } from './tools/session.js';
import { userTools } from './tools/users.js';
import { communityTools } from './tools/communities.js';
import { newsletterTools } from './tools/newsletters.js';
import { statusTools } from './tools/status.js';
import { callTools } from './tools/calls.js';
import { mediaTools } from './tools/media.js';

const logger = createLogger('mcp-server');

export interface ToolHandler {
  name: string;
  description: string;
  inputSchema: any;
  handler: (args: any) => Promise<any>;
}

export class WSAPIMCPServer {
  private server: Server;
  private tools: Map<string, ToolHandler> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: 'wsapi-mcp-server',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupServerHandlers();
  }

  private setupToolHandlers(): void {
    logger.info('Setting up tool handlers');

    // Named category map for filtering support
    const allCategories: Record<string, Record<string, ToolHandler>> = {
      messaging: messagingTools,
      contacts: contactTools,
      groups: groupTools,
      chats: chatTools,
      session: sessionTools,
      users: userTools,
      communities: communityTools,
      newsletters: newsletterTools,
      status: statusTools,
      calls: callTools,
      media: mediaTools,
    };

    const { enabledCategories, enabledTools } = config.wsapi;
    const isFiltered = enabledCategories.length > 0 || enabledTools.length > 0;

    let toolsToRegister: ToolHandler[];

    if (!isFiltered) {
      // No filtering — register all tools
      toolsToRegister = Object.values(allCategories).flatMap(cat => Object.values(cat));
      logger.info('Loading all tool categories');
    } else {
      toolsToRegister = [];

      // Step 1: Collect tools from enabled categories
      if (enabledCategories.length > 0) {
        const validCategories = enabledCategories.filter(c => c in allCategories);
        const invalidCategories = enabledCategories.filter(c => !(c in allCategories));

        if (invalidCategories.length > 0) {
          logger.warn(`Unknown tool categories: ${invalidCategories.join(', ')}. Valid categories: ${Object.keys(allCategories).join(', ')}`);
        }

        for (const name of validCategories) {
          toolsToRegister.push(...Object.values(allCategories[name]!));
        }

        logger.info(`Enabled categories: ${validCategories.join(', ')}`);
      }

      // Step 2: Add individually enabled tools from any category
      if (enabledTools.length > 0) {
        const allToolsList = Object.values(allCategories).flatMap(cat => Object.values(cat));
        const registeredNames = new Set(toolsToRegister.map(t => t.name));

        for (const toolName of enabledTools) {
          if (registeredNames.has(toolName)) continue;
          const tool = allToolsList.find(t => t.name === toolName);
          if (tool) {
            toolsToRegister.push(tool);
          } else {
            logger.warn(`Unknown tool: ${toolName}`);
          }
        }

        logger.info(`Additionally enabled tools: ${enabledTools.join(', ')}`);
      }
    }

    for (const tool of toolsToRegister) {
      if (this.tools.has(tool.name)) {
        logger.warn(`Tool ${tool.name} already registered, skipping`);
        continue;
      }
      this.tools.set(tool.name, tool);
      logger.debug(`Registered tool: ${tool.name}`);
    }

    logger.info(`Registered ${this.tools.size} tools`);
  }

  private setupServerHandlers(): void {
    // Handle tool listing
    this.server.setRequestHandler(ListToolsRequestSchema, async (): Promise<ListToolsResult> => {
      logger.debug('Handling list_tools request');

      const tools = Array.from(this.tools.values()).map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      }));

      logger.debug(`Returning ${tools.length} tools`);
      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
      const { name, arguments: args } = request.params;

      logger.info(`Executing tool: ${name}`, { args: this.sanitizeArgs(args) });

      try {
        const tool = this.tools.get(name);
        if (!tool) {
          throw new Error(`Unknown tool: ${name}`);
        }

        // Execute the tool
        const result = await tool.handler(args || {});

        logger.info(`Tool ${name} executed successfully`);

        return {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const wsapiError = handleError(error, { tool: name, args: this.sanitizeArgs(args) });
        const userMessage = getUserFriendlyMessage(wsapiError);

        logger.error(`Tool ${name} failed`, { error: wsapiError.message });

        return {
          content: [
            {
              type: 'text',
              text: `Error: ${userMessage}`,
            },
          ],
          isError: true,
        };
      }
    });

    // Error handling
    this.server.onerror = (error) => {
      logger.error('Server error', { error: error.message, stack: error.stack });
    };

    logger.info('Server handlers setup complete');
  }

  // Sanitize arguments for logging (remove sensitive data)
  private sanitizeArgs(args: any): any {
    if (!args || typeof args !== 'object') {
      return args;
    }

    const sanitized = { ...args };

    // Remove sensitive fields
    const sensitiveFields = ['apiKey', 'token', 'password', 'data', 'picture', 'pictureBase64'];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  async start(): Promise<void> {
    logger.info('Starting WSAPI MCP Server', {
      environment: config.environment,
      instanceId: config.wsapi.instanceId,
      toolCount: this.tools.size,
    });

    // Health check
    try {
      const isHealthy = await wsapiClient.healthCheck();
      if (!isHealthy) {
        logger.warn('API health check failed, but continuing startup');
      } else {
        logger.info('API health check passed');
      }
    } catch (error) {
      logger.warn('Could not perform health check', { error: (error as Error).message });
    }

    // Start the server
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    logger.info('WSAPI MCP Server started successfully');
  }

  async stop(): Promise<void> {
    logger.info('Stopping WSAPI MCP Server');
    await this.server.close();
    logger.info('WSAPI MCP Server stopped');
  }

  // Get server info
  getServerInfo(): object {
    return {
      name: 'wsapi-mcp-server',
      version: '2.0.0',
      toolCount: this.tools.size,
      tools: Array.from(this.tools.keys()),
      config: {
        environment: config.environment,
        instanceId: config.wsapi.instanceId,
        baseUrl: config.wsapi.baseUrl,
      },
    };
  }
}

// Create and export server instance
export const mcpServer = new WSAPIMCPServer();

// Default export for the main entry point
export default mcpServer;
