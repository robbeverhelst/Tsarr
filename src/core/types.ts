import type { RetryOptions } from './fetch';

export interface ServarrClientConfig {
  baseUrl: string;
  apiKey: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Retry configuration for transient failures */
  retry?: RetryOptions;
  headers?: Record<string, string>;
}

export interface QBittorrentClientConfig {
  baseUrl: string;
  username: string;
  password: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Retry configuration for transient failures */
  retry?: RetryOptions;
}
