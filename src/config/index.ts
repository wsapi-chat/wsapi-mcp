import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration schema
const configSchema = z.object({
  wsapi: z.object({
    apiKey: z.string().min(1, 'WSAPI API key is required'),
    instanceId: z.string().min(1, 'WSAPI instance ID is required'),
    baseUrl: z.string().url().default('https://api.wsapi.chat'),
    timeout: z.number().positive().default(30000),
    retryAttempts: z.number().min(0).default(3),
    retryDelay: z.number().positive().default(1000),
    enabledCategories: z.string().default('').transform(s => s ? s.split(',').map(c => c.trim()).filter(Boolean) : []),
    enabledTools: z.string().default('').transform(s => s ? s.split(',').map(c => c.trim()).filter(Boolean) : []),
  }),
  server: z.object({
    port: z.number().positive().default(3000),
    logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  }),
  environment: z.enum(['development', 'production', 'test']).default('development'),
});

export type Config = z.infer<typeof configSchema>;

// Load and validate configuration
function loadConfig(): Config {
  const rawConfig = {
    wsapi: {
      apiKey: process.env.WSAPI_API_KEY,
      instanceId: process.env.WSAPI_INSTANCE_ID,
      baseUrl: process.env.WSAPI_BASE_URL,
      timeout: process.env.WSAPI_TIMEOUT ? parseInt(process.env.WSAPI_TIMEOUT, 10) : undefined,
      retryAttempts: process.env.WSAPI_RETRY_ATTEMPTS ? parseInt(process.env.WSAPI_RETRY_ATTEMPTS, 10) : undefined,
      retryDelay: process.env.WSAPI_RETRY_DELAY ? parseInt(process.env.WSAPI_RETRY_DELAY, 10) : undefined,
      enabledCategories: process.env.WSAPI_ENABLED_CATEGORIES,
      enabledTools: process.env.WSAPI_ENABLED_TOOLS,
    },
    server: {
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
      logLevel: process.env.LOG_LEVEL as any,
    },
    environment: process.env.NODE_ENV as any,
  };

  try {
    return configSchema.parse(rawConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`);
      const message = `Configuration validation failed: ${errorMessages.join(', ')}`;

      // Log to stderr for MCP debugging
      console.error('WSAPI MCP Server Configuration Error:', message);
      console.error('Please ensure the following environment variables are set:');
      console.error('- WSAPI_API_KEY: Your WSAPI API key');
      console.error('- WSAPI_INSTANCE_ID: Your WSAPI instance ID');
      console.error('');
      console.error('Example Claude Desktop configuration:');
      console.error(JSON.stringify({
        mcpServers: {
          wsapi: {
            command: 'npx',
            args: ['@wsapichat/mcp-server'],
            env: {
              WSAPI_API_KEY: 'your_api_key_here',
              WSAPI_INSTANCE_ID: 'your_instance_id_here'
            }
          }
        }
      }, null, 2));

      throw new Error(message);
    }
    throw error;
  }
}

// Export singleton config
export const config = loadConfig();

// Helper functions
export function isProduction(): boolean {
  return config.environment === 'production';
}

export function isDevelopment(): boolean {
  return config.environment === 'development';
}

export function isTest(): boolean {
  return config.environment === 'test';
}

// Additional validation is already handled in loadConfig function above