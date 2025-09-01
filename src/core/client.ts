import { ApiKeyError, ConnectionError } from './errors.js';
import type { ServarrClientConfig } from './types.js';

export function createServarrClient(config: ServarrClientConfig) {
  if (!config.apiKey) {
    throw new ApiKeyError();
  }

  if (!config.baseUrl) {
    throw new ConnectionError('No base URL provided');
  }

  // Validate the configuration
  const validatedConfig = {
    ...config,
    baseUrl: config.baseUrl.replace(/\/$/, ''),
  };

  return {
    config: validatedConfig,
    getHeaders: () => ({
      'X-Api-Key': validatedConfig.apiKey,
      'Content-Type': 'application/json',
      ...validatedConfig.headers,
    }),
    getBaseUrl: () => validatedConfig.baseUrl,
  };
}

export function validateApiKey(apiKey: string | undefined): string {
  if (!apiKey || apiKey.trim() === '') {
    throw new ApiKeyError();
  }
  return apiKey.trim();
}

export function validateBaseUrl(baseUrl: string | undefined): string {
  if (!baseUrl || baseUrl.trim() === '') {
    throw new ConnectionError('No base URL provided');
  }

  // Ensure it's a valid URL
  try {
    new URL(baseUrl);
  } catch {
    throw new ConnectionError(`Invalid URL: ${baseUrl}`);
  }

  return baseUrl.trim().replace(/\/$/, '');
}
