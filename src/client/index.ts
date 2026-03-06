import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../config/index.js';
import { createLogger, logRequest } from '../utils/logger.js';
import { handleError, withRetry } from '../utils/errors.js';

const logger = createLogger('wsapi-client');

export class WSAPIClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.wsapi.baseUrl,
      timeout: config.wsapi.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': config.wsapi.apiKey,
        'X-Instance-Id': config.wsapi.instanceId,
        'User-Agent': 'WSAPI-MCP-Server/2.0.0',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const startTime = Date.now();
        (config as any).metadata = { startTime };

        logger.debug('Making API request', {
          method: config.method?.toUpperCase(),
          url: config.url,
          headers: { ...config.headers, 'X-Api-Key': '[REDACTED]' },
        });

        return config;
      },
      (error) => {
        logger.error('Request interceptor error', { error: error.message });
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse & { config: AxiosRequestConfig & { metadata?: { startTime: number } } }) => {
        const duration = response.config.metadata?.startTime
          ? Date.now() - response.config.metadata.startTime
          : undefined;

        logRequest(
          response.config.method?.toUpperCase() || 'UNKNOWN',
          response.config.url || 'UNKNOWN',
          response.status,
          duration
        );

        logger.debug('API request successful', {
          method: response.config.method?.toUpperCase(),
          url: response.config.url,
          status: response.status,
          duration,
        });

        return response;
      },
      (error) => {
        const duration = error.config?.metadata?.startTime
          ? Date.now() - error.config.metadata.startTime
          : undefined;

        logRequest(
          error.config?.method?.toUpperCase() || 'UNKNOWN',
          error.config?.url || 'UNKNOWN',
          error.response?.status,
          duration
        );

        return Promise.reject(error);
      }
    );
  }

  // Generic request method with retry logic
  private async request<T>(requestConfig: AxiosRequestConfig): Promise<T> {
    return withRetry(
      async () => {
        try {
          const response = await this.client.request<T>(requestConfig);
          return response.data;
        } catch (error) {
          throw handleError(error, {
            method: requestConfig.method,
            url: requestConfig.url,
          });
        }
      },
      {
        maxAttempts: config.wsapi.retryAttempts,
        delay: config.wsapi.retryDelay,
        retryableErrors: ['NETWORK_ERROR', 'INSTANCE_ERROR'],
      }
    );
  }

  // GET request
  async get(path: string, params?: any): Promise<any> {
    const url = this.buildUrl(path, params);
    return this.request<any>({
      method: 'GET',
      url,
    });
  }

  // POST request
  async post(path: string, data: any, params?: any): Promise<any> {
    const url = this.buildUrl(path, params);
    return this.request<any>({
      method: 'POST',
      url,
      data,
    });
  }

  // PUT request
  async put(path: string, data: any, params?: any): Promise<any> {
    const url = this.buildUrl(path, params);
    return this.request<any>({
      method: 'PUT',
      url,
      data,
    });
  }

  // DELETE request
  async delete(path: string, params?: any): Promise<void> {
    const url = this.buildUrl(path, params);
    return this.request<void>({
      method: 'DELETE',
      url,
    });
  }

  // Helper to build URL with path parameters
  private buildUrl(path: string, params?: any): string {
    let url = path;

    if (params) {
      // Replace path parameters
      Object.entries(params).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number') {
          url = url.replace(`{${key}}`, encodeURIComponent(value.toString()));
        }
      });

      // Add query parameters
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number') {
          if (!path.includes(`{${key}}`)) {
            queryParams.append(key, value.toString());
          }
        }
      });

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
    }

    return url;
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/session/status');
      return true;
    } catch (error) {
      logger.warn('Health check failed', { error: (error as Error).message });
      return false;
    }
  }

}

// Export singleton instance
export const wsapiClient = new WSAPIClient();
export default WSAPIClient;