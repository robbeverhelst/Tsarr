import { bindApiClient } from '../core/bind-api';
import { createServarrClient } from '../core/client';
import type { ServarrClientConfig } from '../core/types';
import { createClient, createConfig } from '../generated/seerr/client';
import * as SeerrApi from '../generated/seerr/index';
import type {
  GetRequestData,
  GetSearchData,
  GetUserData,
  MediaRequest,
} from '../generated/seerr/types.gen';

type RequestFilter = NonNullable<GetRequestData['query']>['filter'];

/**
 * Seerr API client for media request management
 *
 * Works with Seerr, Jellyseerr, and Overseerr. Uses API key authentication
 * via the `X-Api-Key` header.
 *
 * @example
 * ```typescript
 * const seerr = new SeerrClient({
 *   baseUrl: 'http://localhost:5055',
 *   apiKey: 'your-api-key'
 * });
 *
 * const requests = await seerr.getRequests();
 * const results = await seerr.search('The Matrix');
 * ```
 */
export class SeerrClient {
  /** Own client instance — never the generated module singleton. See bindApiClient. */
  private readonly rawClient = createClient(createConfig({ baseUrl: 'http://localhost' }));
  private readonly api = bindApiClient(SeerrApi, this.rawClient);
  private clientConfig: ReturnType<typeof createServarrClient>;

  constructor(config: ServarrClientConfig) {
    this.clientConfig = createServarrClient(config);

    this.rawClient.setConfig({
      baseUrl: `${this.clientConfig.getBaseUrl()}/api/v1`,
      headers: {
        'X-Api-Key': this.clientConfig.config.apiKey,
        ...(this.clientConfig.config.headers ?? {}),
      },
      fetch: this.clientConfig.getFetch(),
    });
  }

  // Status APIs

  async getSystemStatus() {
    return this.api.getStatus();
  }

  // Request APIs

  async getRequests(options?: {
    take?: number;
    skip?: number;
    filter?: RequestFilter;
    sort?: 'added' | 'modified';
    sortDirection?: 'asc' | 'desc';
  }) {
    const query: GetRequestData['query'] = {};
    if (options?.take) query.take = options.take;
    if (options?.skip) query.skip = options.skip;
    if (options?.filter) query.filter = options.filter;
    if (options?.sort) query.sort = options.sort;
    if (options?.sortDirection) query.sortDirection = options.sortDirection;

    return this.api.getRequest(Object.keys(query).length > 0 ? { query } : {});
  }

  async getRequestById(requestId: string) {
    return this.api.getRequestByRequestId({ path: { requestId } });
  }

  async getRequestCount() {
    return this.api.getRequestCount();
  }

  async approveRequest(requestId: string): Promise<MediaRequest> {
    const result = await this.api.postRequestByRequestIdByStatus({
      path: { requestId, status: 'approve' },
    });
    return result.data as MediaRequest;
  }

  async declineRequest(requestId: string): Promise<MediaRequest> {
    const result = await this.api.postRequestByRequestIdByStatus({
      path: { requestId, status: 'decline' },
    });
    return result.data as MediaRequest;
  }

  // Search APIs

  async search(query: string, page?: number, language?: string) {
    const searchQuery: GetSearchData['query'] = { query };
    if (page) searchQuery.page = page;
    if (language) searchQuery.language = language;

    return this.api.getSearch({ query: searchQuery });
  }

  // User APIs

  async getUsers(options?: {
    take?: number;
    skip?: number;
    sort?: 'created' | 'updated' | 'requests' | 'displayname';
  }) {
    const query: GetUserData['query'] = {};
    if (options?.take) query.take = options.take;
    if (options?.skip) query.skip = options.skip;
    if (options?.sort) query.sort = options.sort;

    return this.api.getUser(Object.keys(query).length > 0 ? { query } : {});
  }

  async getUserById(userId: number) {
    return this.api.getUserByUserId({ path: { userId } });
  }

  // Media APIs

  async getMedia(options?: { take?: number; skip?: number }) {
    const query: Record<string, any> = {};
    if (options?.take) query.take = options.take;
    if (options?.skip) query.skip = options.skip;

    return this.api.getMedia(Object.keys(query).length > 0 ? { query } : {});
  }

  // Update configuration
  updateConfig(newConfig: Partial<ServarrClientConfig>) {
    const updatedConfig = { ...this.clientConfig.config, ...newConfig };
    this.clientConfig = createServarrClient(updatedConfig);
    this.rawClient.setConfig({
      baseUrl: `${this.clientConfig.getBaseUrl()}/api/v1`,
      headers: {
        'X-Api-Key': this.clientConfig.config.apiKey,
        ...(this.clientConfig.config.headers ?? {}),
      },
      fetch: this.clientConfig.getFetch(),
    });

    return this.clientConfig.config;
  }
}

// Re-export types for external consumption
export * from './seerr-types.js';
