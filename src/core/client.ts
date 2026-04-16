import { ApiKeyError, ConnectionError } from './errors';
import type { ServarrClientConfig } from './types';

const DEFAULT_TIMEOUT_MS = 30_000;

export function createServarrClient(config: ServarrClientConfig) {
  if (!config.apiKey) {
    throw new ApiKeyError();
  }

  if (!config.baseUrl) {
    throw new ConnectionError('No base URL provided');
  }

  const validatedConfig = {
    ...config,
    baseUrl: config.baseUrl.replace(/\/$/, ''),
  };

  const timeoutMs = validatedConfig.timeout ?? DEFAULT_TIMEOUT_MS;

  return {
    config: validatedConfig,
    getHeaders: () => ({
      'X-Api-Key': validatedConfig.apiKey,
      'Content-Type': 'application/json',
      ...validatedConfig.headers,
    }),
    getBaseUrl: () => validatedConfig.baseUrl,
    getTimeout: () => timeoutMs,
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

  let parsed: URL;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new ConnectionError(`Failed to connect: Invalid URL: ${baseUrl}`);
  }

  if (parsed.protocol === 'http:' && !isLocalhost(parsed.hostname)) {
    console.warn(
      `Warning: Using unencrypted HTTP for remote URL "${parsed.host}". Consider using HTTPS to protect your API key in transit.`
    );
  }

  return baseUrl.trim().replace(/\/$/, '');
}

function isLocalhost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.local') ||
    /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(hostname)
  );
}
