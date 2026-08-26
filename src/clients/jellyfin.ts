import { bindApiClient } from '../core/bind-api';
import { createServarrClient } from '../core/client';
import type { ServarrClientConfig } from '../core/types';
import { createClient, createConfig } from '../generated/jellyfin/client';
import * as JellyfinApi from '../generated/jellyfin/index';
import type {
  AddItemToPlaylistData,
  AddVirtualFolderData,
  CreateCollectionData,
  CreatePlaylistData,
  DisplayContentData,
  GetItemsData,
  GetLatestMediaData,
  GetLogEntriesData,
  GetNextUpData,
  GetPlaylistItemsData,
  GetRemoteImagesData,
  GetResumeItemsData,
  GetSearchHintsData,
  GetSessionsData,
  MessageCommand,
  PlayData,
  RefreshItemData,
  SendGeneralCommandData,
  SendPlaystateCommandData,
  SendSystemCommandData,
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
 * 10.11.11 and 12.0). These wrappers require it so the failure is a type error, not a
 * confusing runtime 400.
 */
type UserScoped<T> = Omit<T, 'userId'> & { userId: string };

type PlaystateCommand = SendPlaystateCommandData['path']['command'];
type GeneralCommand = SendGeneralCommandData['path']['command'];
type SystemCommand = SendSystemCommandData['path']['command'];
type PlayCommand = PlayData['query']['playCommand'];
type PlayOptions = Omit<PlayData['query'], 'playCommand' | 'itemIds'>;
type DisplayItemType = DisplayContentData['query']['itemType'];
type PlaylistMediaType = NonNullable<NonNullable<CreatePlaylistData['query']>['mediaType']>;
type PlaylistItemsQuery = NonNullable<GetPlaylistItemsData['query']>;
type AddToPlaylistQuery = NonNullable<AddItemToPlaylistData['query']>;
type CollectionQuery = NonNullable<CreateCollectionData['query']>;
type ImageType = NonNullable<NonNullable<GetRemoteImagesData['query']>['type']>;
type RemoteImagesQuery = Omit<NonNullable<GetRemoteImagesData['query']>, 'type'>;

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
  /** Own client instance — never the generated module singleton. See bindApiClient. */
  private readonly rawClient = createClient(createConfig({ baseUrl: 'http://localhost' }));
  private readonly api = bindApiClient(JellyfinApi, this.rawClient);

  constructor(config: ServarrClientConfig) {
    this.clientConfig = createServarrClient(config);
    this.applyConfig();
  }

  private applyConfig() {
    this.rawClient.setConfig({
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
    return this.api.getSystemInfo();
  }

  async getPublicSystemInfo() {
    return this.api.getPublicSystemInfo();
  }

  async ping() {
    return this.api.getPingSystem();
  }

  async getActivityLog(options?: ActivityQuery) {
    return this.api.getLogEntries(options ? { query: options } : {});
  }

  // Library APIs

  /** Trigger a full library scan. Returns immediately; the scan runs in the background. */
  async refreshLibrary() {
    return this.api.refreshLibrary();
  }

  /** Refresh metadata for a single item. */
  async refreshItem(itemId: string, options?: RefreshItemQuery) {
    return this.api.refreshItem({
      path: { itemId },
      ...(options ? { query: options } : {}),
    });
  }

  async getVirtualFolders() {
    return this.api.getVirtualFolders();
  }

  async addVirtualFolder(
    name: string,
    options?: { collectionType?: CollectionType; paths?: string[]; refreshLibrary?: boolean }
  ) {
    return this.api.addVirtualFolder({ query: { name, ...(options ?? {}) } });
  }

  async removeVirtualFolder(name: string, refreshLibrary?: boolean) {
    return this.api.removeVirtualFolder({
      query: { name, ...(refreshLibrary !== undefined ? { refreshLibrary } : {}) },
    });
  }

  async getMediaFolders() {
    return this.api.getMediaFolders();
  }

  // Item APIs

  async getItems(options?: ItemsQuery) {
    return this.api.getItems(options ? { query: options } : {});
  }

  async getItem(itemId: string, userId: string) {
    return this.api.getItem({ path: { itemId }, query: { userId } });
  }

  async deleteItem(itemId: string) {
    return this.api.deleteItem({ path: { itemId } });
  }

  async getItemCounts(userId?: string) {
    return this.api.getItemCounts(userId ? { query: { userId } } : {});
  }

  async getLatestMedia(options: UserScoped<LatestQuery>) {
    return this.api.getLatestMedia({ query: options });
  }

  async getNextUp(options: UserScoped<NextUpQuery>) {
    return this.api.getNextUp({ query: options });
  }

  async getResumeItems(options: UserScoped<ResumeQuery>) {
    return this.api.getResumeItems({ query: options });
  }

  async search(searchTerm: string, options?: Omit<SearchQuery, 'searchTerm'>) {
    return this.api.getSearchHints({ query: { searchTerm, ...(options ?? {}) } });
  }

  // Watched-state APIs

  async getItemUserData(itemId: string, userId: string) {
    return this.api.getItemUserData({ path: { itemId }, query: { userId } });
  }

  async markPlayed(itemId: string, userId: string) {
    return this.api.markPlayedItem({ path: { itemId }, query: { userId } });
  }

  async markUnplayed(itemId: string, userId: string) {
    return this.api.markUnplayedItem({ path: { itemId }, query: { userId } });
  }

  async markFavorite(itemId: string, userId: string) {
    return this.api.markFavoriteItem({ path: { itemId }, query: { userId } });
  }

  async unmarkFavorite(itemId: string, userId: string) {
    return this.api.unmarkFavoriteItem({ path: { itemId }, query: { userId } });
  }

  // Session APIs

  async getSessions(options?: SessionsQuery) {
    return this.api.getSessions(options ? { query: options } : {});
  }

  // User APIs

  async getUsers() {
    return this.api.getUsers();
  }

  async getUserById(userId: string) {
    return this.api.getUserById({ path: { userId } });
  }

  async getCurrentUser() {
    return this.api.getCurrentUser();
  }

  // Scheduled task APIs

  async getTasks() {
    return this.api.getTasks();
  }

  async startTask(taskId: string) {
    return this.api.startTask({ path: { taskId } });
  }

  async stopTask(taskId: string) {
    return this.api.stopTask({ path: { taskId } });
  }

  // Session remote-control APIs

  /**
   * Send a playstate command to a session — pause, resume, seek, skip.
   *
   * `seekPositionTicks` is in .NET ticks (10,000 per millisecond), which is
   * what Jellyfin uses throughout its API.
   */
  async sendPlaystateCommand(
    sessionId: string,
    command: PlaystateCommand,
    options?: { seekPositionTicks?: number; controllingUserId?: string }
  ) {
    return this.api.sendPlaystateCommand({
      path: { sessionId, command },
      ...(options ? { query: options } : {}),
    });
  }

  /** Send a general command to a session — volume, navigation, subtitles. */
  async sendGeneralCommand(sessionId: string, command: GeneralCommand) {
    return this.api.sendGeneralCommand({ path: { sessionId, command } });
  }

  /** Send a system command to a session — GoHome, GoToSettings, TakeScreenshot. */
  async sendSystemCommand(sessionId: string, command: SystemCommand) {
    return this.api.sendSystemCommand({ path: { sessionId, command } });
  }

  /** Display a message on a session's screen. */
  async sendMessage(
    sessionId: string,
    text: string,
    options?: { header?: string; timeoutMs?: number }
  ) {
    const body: MessageCommand = {
      Text: text,
      ...(options?.header ? { Header: options.header } : {}),
      ...(options?.timeoutMs ? { TimeoutMs: options.timeoutMs } : {}),
    };
    return this.api.sendMessageCommand({ path: { sessionId }, body });
  }

  /** Instruct a session to play items. */
  async playOnSession(
    sessionId: string,
    playCommand: PlayCommand,
    itemIds: string[],
    options?: PlayOptions
  ) {
    return this.api.play({
      path: { sessionId },
      query: { playCommand, itemIds, ...(options ?? {}) },
    });
  }

  /** Instruct a session to display an item's detail page. */
  async displayContent(
    sessionId: string,
    itemId: string,
    itemName: string,
    itemType: DisplayItemType
  ) {
    return this.api.displayContent({
      path: { sessionId },
      query: { itemId, itemName, itemType },
    });
  }

  async addUserToSession(sessionId: string, userId: string) {
    return this.api.addUserToSession({ path: { sessionId, userId } });
  }

  async removeUserFromSession(sessionId: string, userId: string) {
    return this.api.removeUserFromSession({ path: { sessionId, userId } });
  }

  // Playlist APIs
  //
  // Playlists are user-owned, so every call here needs a userId. Two playlist
  // operations are deliberately not wrapped because they cannot work with an API
  // key at all: GetPlaylist (GET /Playlists/{id}) and MoveItem
  // (POST /Playlists/{id}/Items/{itemId}/Move/{index}) both require a
  // user-context token and expose no userId parameter — verified on 10.11.11 and 12.0 as
  // 400 under API-key auth and 200/204 under a user token.
  // Read a playlist's details with `getItem(playlistId, userId)` instead.

  async createPlaylist(
    name: string,
    options: { userId: string; ids?: string[]; mediaType?: PlaylistMediaType }
  ) {
    return this.api.createPlaylist({ query: { name, ...options } });
  }

  async getPlaylistItems(playlistId: string, options: UserScoped<PlaylistItemsQuery>) {
    return this.api.getPlaylistItems({ path: { playlistId }, query: options });
  }

  async addToPlaylist(
    playlistId: string,
    ids: string[],
    options: UserScoped<Omit<AddToPlaylistQuery, 'ids'>>
  ) {
    return this.api.addItemToPlaylist({ path: { playlistId }, query: { ids, ...options } });
  }

  /**
   * Remove entries from a playlist by entry ID. On 10.11.11 and 12.0 the entry ID equals
   * the underlying item ID, but read it from `getPlaylistItems`
   * (`PlaylistItemId`) rather than relying on that.
   */
  async removeFromPlaylist(playlistId: string, entryIds: string[]) {
    return this.api.removeItemFromPlaylist({ path: { playlistId }, query: { entryIds } });
  }

  // Collection APIs

  async createCollection(name: string, options?: Omit<CollectionQuery, 'name'>) {
    return this.api.createCollection({ query: { name, ...(options ?? {}) } });
  }

  async addToCollection(collectionId: string, ids: string[]) {
    return this.api.addToCollection({ path: { collectionId }, query: { ids } });
  }

  async removeFromCollection(collectionId: string, ids: string[]) {
    return this.api.removeFromCollection({ path: { collectionId }, query: { ids } });
  }

  // Artwork APIs
  //
  // Only image *management* is wrapped. The many `GET /Items/{id}/Images/...`
  // variants serve raw JPEG/PNG bytes and have no useful CLI or SDK shape.

  /** Which images an item already has, with dimensions — use to spot missing or low-quality artwork. */
  async getItemImages(itemId: string) {
    return this.api.getItemImageInfos({ path: { itemId } });
  }

  /**
   * Artwork candidates from metadata providers, with language and community
   * rating so a caller can pick a good one.
   *
   * Note: 10.11 reports `Width`/`Height` per candidate but **12.0 does not**,
   * even though the OpenAPI schema still declares them. Code that ranks
   * candidates by resolution must fall back to `CommunityRating`.
   */
  async getRemoteImages(itemId: string, type?: ImageType, options?: RemoteImagesQuery) {
    return this.api.getRemoteImages({
      path: { itemId },
      query: { ...(type ? { type } : {}), ...(options ?? {}) },
    });
  }

  async getRemoteImageProviders(itemId: string) {
    return this.api.getRemoteImageProviders({ path: { itemId } });
  }

  /**
   * Attach an image to an item from a URL, replacing any existing image of that
   * type. The URL does not have to come from `getRemoteImages` — any reachable
   * image URL works.
   */
  async downloadRemoteImage(itemId: string, type: ImageType, imageUrl?: string) {
    return this.api.downloadRemoteImage({
      path: { itemId },
      query: { type, ...(imageUrl ? { imageUrl } : {}) },
    });
  }

  async deleteItemImage(itemId: string, imageType: ImageType, imageIndex?: number) {
    return this.api.deleteItemImage({
      path: { itemId, imageType },
      ...(imageIndex !== undefined ? { query: { imageIndex } } : {}),
    });
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
