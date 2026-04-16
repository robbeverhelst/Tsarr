import { createServarrClient } from '../core/client';
import type { ServarrClientConfig } from '../core/types';
import { client as seerrClient } from '../generated/seerr/client.gen';
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
  private clientConfig: ReturnType<typeof createServarrClient>;

  constructor(config: ServarrClientConfig) {
    this.clientConfig = createServarrClient(config);

    seerrClient.setConfig({
      baseUrl: `${this.clientConfig.getBaseUrl()}/api/v1`,
      headers: {
        'X-Api-Key': this.clientConfig.config.apiKey,
        ...(this.clientConfig.config.headers ?? {}),
      },
    });
  }

  // Status APIs

  async getSystemStatus() {
    return SeerrApi.getStatus();
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

    return SeerrApi.getRequest(Object.keys(query).length > 0 ? { query } : {});
  }

  async getRequestById(requestId: string) {
    return SeerrApi.getRequestByRequestId({ path: { requestId } });
  }

  async getRequestCount() {
    return SeerrApi.getRequestCount();
  }

  async approveRequest(requestId: string): Promise<MediaRequest> {
    const result = await SeerrApi.postRequestByRequestIdByStatus({
      path: { requestId, status: 'approve' },
    });
    return result.data as MediaRequest;
  }

  async declineRequest(requestId: string): Promise<MediaRequest> {
    const result = await SeerrApi.postRequestByRequestIdByStatus({
      path: { requestId, status: 'decline' },
    });
    return result.data as MediaRequest;
  }

  // Search APIs

  async search(query: string, page?: number, language?: string) {
    const searchQuery: GetSearchData['query'] = { query };
    if (page) searchQuery.page = page;
    if (language) searchQuery.language = language;

    return SeerrApi.getSearch({ query: searchQuery });
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

    return SeerrApi.getUser(Object.keys(query).length > 0 ? { query } : {});
  }

  async getUserById(userId: number) {
    return SeerrApi.getUserByUserId({ path: { userId } });
  }

  // Media APIs

  async getMedia(options?: { take?: number; skip?: number }) {
    const query: Record<string, any> = {};
    if (options?.take) query.take = options.take;
    if (options?.skip) query.skip = options.skip;

    return SeerrApi.getMedia(Object.keys(query).length > 0 ? { query } : {});
  }

  // Update configuration
  updateConfig(newConfig: Partial<ServarrClientConfig>) {
    const updatedConfig = { ...this.clientConfig.config, ...newConfig };
    this.clientConfig = createServarrClient(updatedConfig);
    seerrClient.setConfig({
      baseUrl: `${this.clientConfig.getBaseUrl()}/api/v1`,
      headers: {
        'X-Api-Key': this.clientConfig.config.apiKey,
        ...(this.clientConfig.config.headers ?? {}),
      },
    });

    return this.clientConfig.config;
  }
}

// Re-export types for external consumption
export * from './seerr-types.js';
