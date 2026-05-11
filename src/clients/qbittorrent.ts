import { ConnectionError } from '../core/errors';
import { createResilientFetch } from '../core/fetch';
import type { QBittorrentClientConfig } from '../core/types';
import { client as qbittorrentClient } from '../generated/qbittorrent/client.gen';
import * as QBittorrentApi from '../generated/qbittorrent/index';
import type {
  TorrentInfo,
  TorrentsInfoPostData,
  TransferInfo,
} from '../generated/qbittorrent/types.gen';

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
const DEFAULT_TIMEOUT_MS = 30_000;

export class QBittorrentClient {
  private baseUrl: string;
  private username: string;
  private password: string;
  private sid: string | null = null;
  // qBT 4.x ships the session cookie as `SID`; qBT 5.x ships it as
  // `QBT_SID_<port>`. The generated SDK hardcodes `SID`, so we capture
  // the real name at login and rewrite outgoing Cookie headers.
  private cookieName = 'SID';
  private fetch: typeof globalThis.fetch;

  constructor(config: QBittorrentClientConfig) {
    if (!config.baseUrl) {
      throw new ConnectionError('No base URL provided');
    }

    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.username = config.username;
    this.password = config.password;
    const baseFetch = createResilientFetch({
      timeout: config.timeout ?? DEFAULT_TIMEOUT_MS,
      retry: config.retry,
    });
    this.fetch = ((input: RequestInfo | URL, init?: RequestInit) =>
      this.fetchWithCookieName(baseFetch, input, init)) as typeof globalThis.fetch;

    qbittorrentClient.setConfig({
      baseUrl: `${this.baseUrl}/api/v2`,
      auth: () => this.ensureAuth(),
      fetch: this.fetch,
    });
  }

  private async fetchWithCookieName(
    baseFetch: typeof globalThis.fetch,
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    if (!init?.headers || this.cookieName === 'SID') {
      return baseFetch(input, init);
    }
    const headers = new Headers(init.headers);
    const cookie = headers.get('cookie');
    if (cookie?.includes('SID=')) {
      headers.set('cookie', cookie.replace(/(^|;\s*)SID=/, `$1${this.cookieName}=`));
      return baseFetch(input, { ...init, headers });
    }
    return baseFetch(input, init);
  }

  private async ensureAuth(): Promise<string> {
    if (!this.sid) {
      await this.login();
    }
    return this.sid!;
  }

  private async login(): Promise<void> {
    const response = await this.fetch(`${this.baseUrl}/api/v2/auth/login`, {
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

    // qBT 4.x returns 200 + "Ok."; qBT 5.x returns 204 with an empty body.
    // Treat both as success — the real signal is the SID cookie below.
    const text = (await response.text()).trim();
    if (text && text !== 'Ok.') {
      throw new ConnectionError('qBittorrent authentication failed: invalid username or password');
    }

    const setCookie = response.headers.get('set-cookie');
    const sidMatch = setCookie?.match(/(SID|QBT_SID_\d+)=([^;]+)/);
    if (!sidMatch) {
      throw new ConnectionError('qBittorrent login succeeded but no SID cookie received');
    }

    this.cookieName = sidMatch[1];
    this.sid = sidMatch[2];
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
