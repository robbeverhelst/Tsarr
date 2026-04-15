export interface ServarrClientConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface QBittorrentClientConfig {
  baseUrl: string;
  username: string;
  password: string;
  timeout?: number;
}
