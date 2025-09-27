import winston from 'winston';
import { config } from '../config/index.js';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Get the project root directory (handle both dev and production scenarios)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to find the correct logs directory
let logsDir: string;
if (__dirname.includes('/dist/')) {
  // Production: we're in dist/utils, go up to project root
  logsDir = join(__dirname, '../../logs');
} else {
  // Development: we're in src/utils, go up to project root
  logsDir = join(__dirname, '../../logs');
}

// Silently try to create logs directory
try {
  mkdirSync(logsDir, { recursive: true });
} catch (error) {
  // Fallback to current directory
  logsDir = './logs';
  try {
    mkdirSync(logsDir, { recursive: true });
  } catch (fallbackError) {
    // Continue silently - we'll use file logging or no-op
  }
}

// Create logger instance with only file transports
// MCP servers MUST NOT write to stdout/stderr as it interferes with JSON protocol
const transports: winston.transport[] = [];

// Always try to use file logging
try {
  transports.push(
    new winston.transports.File({
      filename: join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
} catch (error) {
  // If file logging fails, just continue with empty transports
  // Winston will handle this gracefully
}

export const logger = winston.createLogger({
  level: config.server.logLevel,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'wsapi-mcp-server',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports,
  // Prevent any output to stdout/stderr
  silent: false,
  exitOnError: false,
});

// Helper functions for structured logging
export const createLogger = (component: string) => {
  return {
    error: (message: string, meta?: object) => logger.error(message, { component, ...meta }),
    warn: (message: string, meta?: object) => logger.warn(message, { component, ...meta }),
    info: (message: string, meta?: object) => logger.info(message, { component, ...meta }),
    debug: (message: string, meta?: object) => logger.debug(message, { component, ...meta }),
  };
};

// Request logging helper
export const logRequest = (method: string, url: string, statusCode?: number, duration?: number) => {
  logger.info('API Request', {
    component: 'http-client',
    method,
    url,
    statusCode,
    duration,
  });
};

// Error logging helper
export const logError = (error: Error, context?: object) => {
  logger.error('Error occurred', {
    component: 'error-handler',
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    ...context,
  });
};

export default logger;