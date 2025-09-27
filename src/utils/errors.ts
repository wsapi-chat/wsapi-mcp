import { AxiosError } from 'axios';
import { logError } from './logger.js';

// Base error class for WSAPI MCP Server
export class WSAPIError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly context?: object;

  constructor(message: string, code: string, statusCode?: number, context?: object) {
    super(message);
    this.name = 'WSAPIError';
    this.code = code;
    this.statusCode = statusCode || undefined;
    this.context = context || undefined;
  }
}

// API-specific errors
export class WSAPIAuthenticationError extends WSAPIError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'WSAPIAuthenticationError';
  }
}

export class WSAPIValidationError extends WSAPIError {
  constructor(message: string, context?: object) {
    super(message, 'VALIDATION_ERROR', 400, context);
    this.name = 'WSAPIValidationError';
  }
}

export class WSAPINetworkError extends WSAPIError {
  constructor(message: string = 'Network error occurred') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'WSAPINetworkError';
  }
}

export class WSAPIRateLimitError extends WSAPIError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'WSAPIRateLimitError';
  }
}

export class WSAPIInstanceError extends WSAPIError {
  constructor(message: string = 'Instance error') {
    super(message, 'INSTANCE_ERROR', 500);
    this.name = 'WSAPIInstanceError';
  }
}

export class WSAPISessionError extends WSAPIError {
  constructor(message: string = 'Session error') {
    super(message, 'SESSION_ERROR', 403);
    this.name = 'WSAPISessionError';
  }
}

// MCP-specific errors
export class MCPToolError extends WSAPIError {
  constructor(message: string, context?: object) {
    super(message, 'MCP_TOOL_ERROR', undefined, context);
    this.name = 'MCPToolError';
  }
}

// Error mapping from HTTP status codes
export function mapHttpError(error: AxiosError): WSAPIError {
  const status = error.response?.status;
  const message = (error.response?.data as any)?.detail || error.message;
  const context = {
    url: error.config?.url,
    method: error.config?.method,
    status,
  };

  switch (status) {
    case 400:
      return new WSAPIValidationError(message, context);
    case 401:
      return new WSAPIAuthenticationError(message);
    case 403:
      return new WSAPISessionError(message);
    case 429:
      return new WSAPIRateLimitError(message);
    case 500:
    case 502:
    case 503:
    case 504:
      return new WSAPIInstanceError(message);
    default:
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return new WSAPINetworkError(`Network error: ${error.message}`);
      }
      return new WSAPIError(message, 'UNKNOWN_ERROR', status, context);
  }
}

// Error handling utility
export function handleError(error: unknown, context?: object): WSAPIError {
  let wsapiError: WSAPIError;

  if (error instanceof WSAPIError) {
    wsapiError = error;
  } else if (error instanceof AxiosError) {
    wsapiError = mapHttpError(error);
  } else if (error instanceof Error) {
    wsapiError = new WSAPIError(error.message, 'UNKNOWN_ERROR', undefined, context);
  } else {
    wsapiError = new WSAPIError('An unknown error occurred', 'UNKNOWN_ERROR', undefined, context);
  }

  // Log the error
  logError(wsapiError, context);

  return wsapiError;
}

// User-friendly error messages
export function getUserFriendlyMessage(error: WSAPIError): string {
  switch (error.code) {
    case 'AUTHENTICATION_ERROR':
      return 'Invalid API key or authentication failed. Please check your credentials.';
    case 'VALIDATION_ERROR':
      return `Invalid input: ${error.message}`;
    case 'NETWORK_ERROR':
      return 'Unable to connect to WhatsApp API. Please check your internet connection.';
    case 'RATE_LIMIT_ERROR':
      return 'Too many requests. Please wait a moment before trying again.';
    case 'INSTANCE_ERROR':
      return 'WhatsApp instance error. Please check your instance status.';
    case 'SESSION_ERROR':
      return 'WhatsApp session error. You may need to login again.';
    case 'MCP_TOOL_ERROR':
      return `Tool error: ${error.message}`;
    default:
      return error.message || 'An unexpected error occurred.';
  }
}

// Retry logic helper
export interface RetryOptions {
  maxAttempts: number;
  delay: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const { maxAttempts, delay, backoffMultiplier = 2, retryableErrors = ['NETWORK_ERROR', 'INSTANCE_ERROR'] } = options;

  let lastError: WSAPIError;
  let currentDelay = delay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = handleError(error, { attempt, maxAttempts });

      // Don't retry if it's the last attempt or the error is not retryable
      if (attempt === maxAttempts || !retryableErrors.includes(lastError.code)) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      currentDelay *= backoffMultiplier;
    }
  }

  throw lastError!;
}