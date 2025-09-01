export interface ServarrClientConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ServarrClient {
  config: ServarrClientConfig;
  setConfig(config: Partial<ServarrClientConfig>): void;
}

export type ServarrApp = 'radarr' | 'sonarr' | 'lidarr' | 'readarr' | 'prowlarr';
