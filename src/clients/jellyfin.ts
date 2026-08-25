import { createServarrClient } from '../core/client';
import type { ServarrClientConfig } from '../core/types';
import { client as jellyfinClient } from '../generated/jellyfin/client.gen';
import * as JellyfinApi from '../generated/jellyfin/index';
import type {
  AddVirtualFolderData,
  GetItemsData,
  GetLatestMediaData,
  GetLogEntriesData,
  GetNextUpData,
  GetResumeItemsData,
  GetSearchHintsData,
  GetSessionsData,
  RefreshItemData,
} from '../generated/jellyfin/types.gen';

type ItemsQuery = NonNullable<GetItemsData['query']>;
type LatestQuery = NonNullable<GetLatestMediaData['query']>;
type NextUpQuery = NonNullable<GetNextUpData['query']>;
type ResumeQuery = NonNullable<GetResumeItemsData['query']>;
type SearchQuery = NonNullable<GetSearchHintsData['query']>;
type SessionsQuery = NonNullable<GetSessionsData['query']>;
type ActivityQuery = NonNullable<GetLogEntriesData['query']>;
type RefreshItemQuery = NonNullable<RefreshItemData['query']>;
type CollectionType = NonNullable<NonNullable<AddVirtualFolderData['query']>['collectionType']>;

/**
 * Jellyfin marks `userId` optional on user-scoped endpoints, but the server
 * returns 400 without it when authenticating with an API key (verified against
 * 10.11.11). These wrappers require it so the failure is a type error, not a
 * confusing runtime 400.
 */
type UserScoped<T> = Omit<T, 'userId'> & { userId: string };

/**
 * Jellyfin API client for media server management
 *
 * Closes the automation loop: trigger library scans after imports, read watched
 * state back out, and check for active playback before running maintenance.
 *
 * Authenticates with an API key (Dashboard -> Advanced -> API Keys) using
 * Jellyfin's `MediaBrowser` authorization scheme.
 *
 * @example
 * ```typescript
 * const jellyfin = new JellyfinClient({
 *   baseUrl: 'http://localhost:8096',
 *   apiKey: 'your-api-key'
 * });
 *
 * await jellyfin.refreshLibrary();
 * const sessions = await jellyfin.getSessions();
 * ```
 */
export class JellyfinClient {
  private clientConfig: ReturnType<typeof createServarrClient>;

  constructor(config: ServarrClientConfig) {
    this.clientConfig = createServarrClient(config);
    this.applyConfig();
  }

  private applyConfig() {
    jellyfinClient.setConfig({
      baseUrl: this.clientConfig.getBaseUrl(),
      headers: {
        // Jellyfin's own auth scheme. `X-Emby-Token` also works today but is
        // legacy and can be disabled from 10.11 onwards via EnableLegacyAuthorization.
        Authorization: `MediaBrowser Token="${this.clientConfig.config.apiKey}"`,
        ...(this.clientConfig.config.headers ?? {}),
      },
      fetch: this.clientConfig.getFetch(),
    });
  }

  // System APIs

  async getSystemStatus() {
    return JellyfinApi.getSystemInfo();
  }

  async getPublicSystemInfo() {
    return JellyfinApi.getPublicSystemInfo();
  }

  async ping() {
    return JellyfinApi.getPingSystem();
  }

  async getActivityLog(options?: ActivityQuery) {
    return JellyfinApi.getLogEntries(options ? { query: options } : {});
  }

  // Library APIs

  /** Trigger a full library scan. Returns immediately; the scan runs in the background. */
  async refreshLibrary() {
    return JellyfinApi.refreshLibrary();
  }

  /** Refresh metadata for a single item. */
  async refreshItem(itemId: string, options?: RefreshItemQuery) {
    return JellyfinApi.refreshItem({
      path: { itemId },
      ...(options ? { query: options } : {}),
    });
  }

  async getVirtualFolders() {
    return JellyfinApi.getVirtualFolders();
  }

  async addVirtualFolder(
    name: string,
    options?: { collectionType?: CollectionType; paths?: string[]; refreshLibrary?: boolean }
  ) {
    return JellyfinApi.addVirtualFolder({ query: { name, ...(options ?? {}) } });
  }

  async removeVirtualFolder(name: string, refreshLibrary?: boolean) {
    return JellyfinApi.removeVirtualFolder({
      query: { name, ...(refreshLibrary !== undefined ? { refreshLibrary } : {}) },
    });
  }

  async getMediaFolders() {
    return JellyfinApi.getMediaFolders();
  }

  // Item APIs

  async getItems(options?: ItemsQuery) {
    return JellyfinApi.getItems(options ? { query: options } : {});
  }

  async getItem(itemId: string, userId: string) {
    return JellyfinApi.getItem({ path: { itemId }, query: { userId } });
  }

  async deleteItem(itemId: string) {
    return JellyfinApi.deleteItem({ path: { itemId } });
  }

  async getItemCounts(userId?: string) {
    return JellyfinApi.getItemCounts(userId ? { query: { userId } } : {});
  }

  async getLatestMedia(options: UserScoped<LatestQuery>) {
    return JellyfinApi.getLatestMedia({ query: options });
  }

  async getNextUp(options: UserScoped<NextUpQuery>) {
    return JellyfinApi.getNextUp({ query: options });
  }

  async getResumeItems(options: UserScoped<ResumeQuery>) {
    return JellyfinApi.getResumeItems({ query: options });
  }

  async search(searchTerm: string, options?: Omit<SearchQuery, 'searchTerm'>) {
    return JellyfinApi.getSearchHints({ query: { searchTerm, ...(options ?? {}) } });
  }

  // Watched-state APIs

  async getItemUserData(itemId: string, userId: string) {
    return JellyfinApi.getItemUserData({ path: { itemId }, query: { userId } });
  }

  async markPlayed(itemId: string, userId: string) {
    return JellyfinApi.markPlayedItem({ path: { itemId }, query: { userId } });
  }

  async markUnplayed(itemId: string, userId: string) {
    return JellyfinApi.markUnplayedItem({ path: { itemId }, query: { userId } });
  }

  async markFavorite(itemId: string, userId: string) {
    return JellyfinApi.markFavoriteItem({ path: { itemId }, query: { userId } });
  }

  async unmarkFavorite(itemId: string, userId: string) {
    return JellyfinApi.unmarkFavoriteItem({ path: { itemId }, query: { userId } });
  }

  // Session APIs

  async getSessions(options?: SessionsQuery) {
    return JellyfinApi.getSessions(options ? { query: options } : {});
  }

  // User APIs

  async getUsers() {
    return JellyfinApi.getUsers();
  }

  async getUserById(userId: string) {
    return JellyfinApi.getUserById({ path: { userId } });
  }

  async getCurrentUser() {
    return JellyfinApi.getCurrentUser();
  }

  // Scheduled task APIs

  async getTasks() {
    return JellyfinApi.getTasks();
  }

  async startTask(taskId: string) {
    return JellyfinApi.startTask({ path: { taskId } });
  }

  async stopTask(taskId: string) {
    return JellyfinApi.stopTask({ path: { taskId } });
  }

  // Update configuration
  updateConfig(newConfig: Partial<ServarrClientConfig>) {
    const updatedConfig = { ...this.clientConfig.config, ...newConfig };
    this.clientConfig = createServarrClient(updatedConfig);
    this.applyConfig();

    return this.clientConfig.config;
  }
}

// Re-export types for external consumption
export * from './jellyfin-types.js';
