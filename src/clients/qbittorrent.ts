import { ConnectionError } from '../core/errors.js';
import type { QBittorrentClientConfig } from '../core/types.js';
import { client as qbittorrentClient } from '../generated/qbittorrent/client.gen.js';
import * as QBittorrentApi from '../generated/qbittorrent/index.js';
import type {
  TorrentInfo,
  TorrentsInfoPostData,
  TransferInfo,
} from '../generated/qbittorrent/types.gen.js';

type TorrentFilter = NonNullable<TorrentsInfoPostData['body']['filter']>;

/**
 * qBittorrent WebUI API client
 *
 * Uses cookie-based session authentication (SID) instead of API keys.
 *
 * @example
 * ```typescript
 * const qbit = new QBittorrentClient({
 *   baseUrl: 'http://localhost:8080',
 *   username: 'admin',
 *   password: 'adminadmin'
 * });
 *
 * const torrents = await qbit.getTorrents();
 * ```
 */
export class QBittorrentClient {
  private baseUrl: string;
  private username: string;
  private password: string;
  private sid: string | null = null;

  constructor(config: QBittorrentClientConfig) {
    if (!config.baseUrl) {
      throw new ConnectionError('No base URL provided');
    }

    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.username = config.username;
    this.password = config.password;

    qbittorrentClient.setConfig({
      baseUrl: `${this.baseUrl}/api/v2`,
      auth: () => this.ensureAuth(),
    });
  }

  private async ensureAuth(): Promise<string> {
    if (!this.sid) {
      await this.login();
    }
    return this.sid!;
  }

  private async login(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v2/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Referer: this.baseUrl,
      },
      body: new URLSearchParams({
        username: this.username,
        password: this.password,
      }),
    });

    if (!response.ok) {
      throw new ConnectionError(`qBittorrent login failed (${response.status})`);
    }

    const text = await response.text();
    if (text.trim() !== 'Ok.') {
      throw new ConnectionError('qBittorrent authentication failed: invalid username or password');
    }

    const setCookie = response.headers.get('set-cookie');
    const sidMatch = setCookie?.match(/SID=([^;]+)/);
    if (!sidMatch) {
      throw new ConnectionError('qBittorrent login succeeded but no SID cookie received');
    }

    this.sid = sidMatch[1];
  }

  // App APIs

  async getAppVersion(): Promise<string> {
    const result = await QBittorrentApi.appVersionGet();
    return (result.data as string) ?? '';
  }

  async getApiVersion(): Promise<string> {
    const result = await QBittorrentApi.appWebapiVersionGet();
    return (result.data as string) ?? '';
  }

  async getSystemStatus() {
    const version = await this.getAppVersion();
    return { version };
  }

  // Transfer APIs

  async getTransferInfo(): Promise<TransferInfo> {
    const result = await QBittorrentApi.transferInfoGet();
    return (result.data as TransferInfo) ?? {};
  }

  // Torrent APIs

  async getTorrents(filter?: TorrentFilter): Promise<TorrentInfo[]> {
    const result = await QBittorrentApi.torrentsInfoPost({
      body: {
        ...(filter ? { filter } : {}),
      },
    });
    return (result.data as TorrentInfo[]) ?? [];
  }

  async pauseTorrents(hashes: string): Promise<void> {
    await QBittorrentApi.torrentsPausePost({
      body: { hashes: hashes.split('|') },
    });
  }

  async resumeTorrents(hashes: string): Promise<void> {
    await QBittorrentApi.torrentsResumePost({
      body: { hashes: hashes.split('|') },
    });
  }

  async deleteTorrents(hashes: string, deleteFiles = false): Promise<void> {
    await QBittorrentApi.torrentsDeletePost({
      body: { hashes: hashes.split('|'), deleteFiles },
    });
  }
}

// Re-export types for external consumption
export * from './qbittorrent-types.js';
