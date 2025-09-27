#!/usr/bin/env node

// Add error logging to stderr for MCP debugging
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

try {
  console.error('Starting WSAPI MCP Server...');
  console.error('Environment variables check:');
  console.error('WSAPI_API_KEY:', process.env.WSAPI_API_KEY ? 'SET' : 'NOT SET');
  console.error('WSAPI_INSTANCE_ID:', process.env.WSAPI_INSTANCE_ID ? 'SET' : 'NOT SET');

  // Import with explicit error handling
  console.error('Importing server module...');
  const { mcpServer } = await import('./server.js');
  console.error('Server module imported successfully');

  console.error('Importing logger module...');
  const { createLogger } = await import('./utils/logger.js');
  console.error('Logger module imported successfully');

  const logger = createLogger('main');
  console.error('Logger created successfully');

  async function main(): Promise<void> {
    try {
      console.error('Attempting to start MCP server...');
      await mcpServer.start();
      console.error('MCP server started successfully');
    } catch (error) {
      console.error('Failed to start server:', error);
      logger.error('Failed to start server', { error: (error as Error).message });
      process.exit(1);
    }
  }

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.error('Received SIGINT, shutting down gracefully');
    logger.info('Received SIGINT, shutting down gracefully');
    try {
      await mcpServer.stop();
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      logger.error('Error during shutdown', { error: (error as Error).message });
      process.exit(1);
    }
  });

  process.on('SIGTERM', async () => {
    console.error('Received SIGTERM, shutting down gracefully');
    logger.info('Received SIGTERM, shutting down gracefully');
    try {
      await mcpServer.stop();
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      logger.error('Error during shutdown', { error: (error as Error).message });
      process.exit(1);
    }
  });

  // Start the server - simplified approach
  console.error('Starting main function...');
  main().catch((error) => {
    console.error('Unhandled error in main:', error);
    logger.error('Unhandled error in main', { error: error.message });
    process.exit(1);
  });

} catch (error) {
  console.error('Failed to import modules:', error);
  process.exit(1);
}

// Export the server for use as a module
export { mcpServer } from './server.js';