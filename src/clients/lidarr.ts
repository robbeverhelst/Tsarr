import { ServarrBaseClient, type ServarrOps } from '../clients/base';
import { bindApiClient } from '../core/bind-api';
import type { ServarrClientConfig } from '../core/types';
import { createClient, createConfig } from '../generated/lidarr/client';
import * as LidarrApi from '../generated/lidarr/index';
import type {
  AlbumResource,
  ArtistResource,
  CustomFormatBulkResource,
  CustomFormatResource,
  ImportListResource,
  MediaManagementConfigResource,
  MetadataProviderConfigResource,
  NamingConfigResource,
  QualityProfileResource,
  ReleaseResource,
  TrackFileListResource,
  TrackFileResource,
} from '../generated/lidarr/types.gen';

/**
 * Lidarr API client for music management
 *
 * @example
 * ```typescript
 * const lidarr = new LidarrClient({
 *   baseUrl: 'http://localhost:8686',
 *   apiKey: 'your-api-key'
 * });
 *
 * const artists = await lidarr.getArtists();
 * ```
 */
export class LidarrClient extends ServarrBaseClient {
  /** Own client instance — never the generated module singleton. See bindApiClient. */
  private readonly api = bindApiClient(LidarrApi, this.rawClient);

  protected readonly ops: ServarrOps = {
    // System
    getSystemStatus: this.api.getApiV1SystemStatus,
    getHealth: this.api.getApiV1Health,

    // Tags
    getTags: this.api.getApiV1Tag,
    createTag: this.api.postApiV1Tag,
    getTagById: this.api.getApiV1TagById,
    updateTagById: this.api.putApiV1TagById,
    deleteTagById: this.api.deleteApiV1TagById,
    getTagDetails: this.api.getApiV1TagDetail,
    getTagDetailById: this.api.getApiV1TagDetailById,

    // Notifications
    getNotifications: this.api.getApiV1Notification,
    createNotification: this.api.postApiV1Notification,
    getNotificationById: this.api.getApiV1NotificationById,
    updateNotificationById: this.api.putApiV1NotificationById,
    deleteNotificationById: this.api.deleteApiV1NotificationById,
    getNotificationSchema: this.api.getApiV1NotificationSchema,
    testNotification: this.api.postApiV1NotificationTest,
    testAllNotifications: this.api.postApiV1NotificationTestall,

    // Download Clients
    getDownloadClients: this.api.getApiV1Downloadclient,
    createDownloadClient: this.api.postApiV1Downloadclient,
    getDownloadClientById: this.api.getApiV1DownloadclientById,
    updateDownloadClientById: this.api.putApiV1DownloadclientById,
    deleteDownloadClientById: this.api.deleteApiV1DownloadclientById,
    getDownloadClientSchema: this.api.getApiV1DownloadclientSchema,
    testDownloadClient: this.api.postApiV1DownloadclientTest,
    testAllDownloadClients: this.api.postApiV1DownloadclientTestall,

    // Indexers
    getIndexers: this.api.getApiV1Indexer,
    createIndexer: this.api.postApiV1Indexer,
    getIndexerById: this.api.getApiV1IndexerById,
    updateIndexerById: this.api.putApiV1IndexerById,
    deleteIndexerById: this.api.deleteApiV1IndexerById,
    getIndexerSchema: this.api.getApiV1IndexerSchema,
    testIndexer: this.api.postApiV1IndexerTest,
    testAllIndexers: this.api.postApiV1IndexerTestall,

    // System Admin
    restartSystem: this.api.postApiV1SystemRestart,
    shutdownSystem: this.api.postApiV1SystemShutdown,
    getBackups: this.api.getApiV1SystemBackup,
    deleteBackup: this.api.deleteApiV1SystemBackupById,
    restoreBackup: this.api.postApiV1SystemBackupRestoreById,
    uploadBackup: this.api.postApiV1SystemBackupRestoreUpload,
    getLogFiles: this.api.getApiV1LogFile,
    getLogFileByName: this.api.getApiV1LogFileByFilename,

    // Commands
    runCommand: this.api.postApiV1Command,
    getCommands: this.api.getApiV1Command,

    // Host Config
    getHostConfig: this.api.getApiV1ConfigHost,
    getHostConfigById: this.api.getApiV1ConfigHostById,
    updateHostConfig: this.api.putApiV1ConfigHostById,

    // UI Config
    getUiConfig: this.api.getApiV1ConfigUi,
    getUiConfigById: this.api.getApiV1ConfigUiById,
    updateUiConfig: this.api.putApiV1ConfigUiById,
  };

  constructor(config: ServarrClientConfig) {
    super(config, createClient(createConfig({ baseUrl: 'http://localhost' })));
  }

  // Artist APIs

  /**
   * Get all artists in the library
   */
  async getArtists() {
    return this.api.getApiV1Artist();
  }

  async getArtist(id: number) {
    return this.api.getApiV1ArtistById({ path: { id } });
  }

  async addArtist(artist: ArtistResource) {
    return this.api.postApiV1Artist({ body: artist });
  }

  async updateArtist(id: number, artist: ArtistResource) {
    return this.api.putApiV1ArtistById({ path: { id: String(id) }, body: artist });
  }

  async deleteArtist(id: number) {
    return this.api.deleteApiV1ArtistById({ path: { id } });
  }

  // Album APIs
  async getAlbums(artistId?: number) {
    return this.api.getApiV1Album(artistId === undefined ? {} : { query: { artistId } });
  }

  async getAlbum(id: number) {
    return this.api.getApiV1AlbumById({ path: { id } });
  }

  // Search APIs

  /**
   * Search for artists using MusicBrainz database
   */
  async searchArtists(term: string) {
    return this.api.getApiV1ArtistLookup({ query: { term } });
  }

  // Root folder APIs
  async getRootFolders() {
    return this.api.getApiV1Rootfolder();
  }

  async addRootFolder(path: string) {
    return this.api.postApiV1Rootfolder({
      body: { path },
    });
  }

  async deleteRootFolder(id: number) {
    return this.api.deleteApiV1RootfolderById({ path: { id } });
  }

  // Album APIs (enhanced)
  async addAlbum(album: AlbumResource) {
    return this.api.postApiV1Album({ body: album });
  }

  async updateAlbum(id: number, album: AlbumResource) {
    return this.api.putApiV1AlbumById({ path: { id: String(id) }, body: album });
  }

  async deleteAlbum(id: number) {
    return this.api.deleteApiV1AlbumById({ path: { id } });
  }

  async searchAlbums(term: string) {
    return this.api.getApiV1AlbumLookup({ query: { term } });
  }

  // Calendar APIs
  async getCalendar(start?: string, end?: string, unmonitored?: boolean) {
    const query: Record<string, any> = {};
    if (start) query.start = start;
    if (end) query.end = end;
    if (unmonitored !== undefined) query.unmonitored = unmonitored;
    query.includeArtist = true;

    return this.api.getApiV1Calendar(Object.keys(query).length > 0 ? { query } : {});
  }

  async getCalendarFeed(pastDays?: number, futureDays?: number, tags?: string) {
    const query: Record<string, any> = {};
    if (pastDays !== undefined) query.pastDays = pastDays;
    if (futureDays !== undefined) query.futureDays = futureDays;
    if (tags) query.tags = tags;

    return this.api.getFeedV1CalendarLidarrIcs(Object.keys(query).length > 0 ? { query } : {});
  }

  // Track File APIs

  /**
   * Get track files by artist, album, or specific file IDs
   */
  async getTrackFiles(
    artistId?: number,
    trackFileIds?: number[],
    albumId?: number[],
    unmapped?: boolean
  ) {
    const query: Record<string, any> = {};
    if (artistId !== undefined) query.artistId = artistId;
    if (trackFileIds !== undefined) query.trackFileIds = trackFileIds;
    if (albumId !== undefined) query.albumId = albumId;
    if (unmapped !== undefined) query.unmapped = unmapped;

    return this.api.getApiV1Trackfile(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get a specific track file by ID
   */
  async getTrackFile(id: number) {
    return this.api.getApiV1TrackfileById({ path: { id } });
  }

  /**
   * Update a track file
   */
  async updateTrackFile(id: string, trackFile: TrackFileResource) {
    return this.api.putApiV1TrackfileById({ path: { id }, body: trackFile });
  }

  /**
   * Delete a track file from disk
   */
  async deleteTrackFile(id: number) {
    return this.api.deleteApiV1TrackfileById({ path: { id } });
  }

  /**
   * Bulk update track files using the editor endpoint
   */
  async updateTrackFilesEditor(trackFileList: TrackFileListResource) {
    return this.api.putApiV1TrackfileEditor({ body: trackFileList });
  }

  /**
   * Bulk delete track files
   */
  async deleteTrackFilesBulk(trackFileList: TrackFileListResource) {
    return this.api.deleteApiV1TrackfileBulk({ body: trackFileList });
  }

  // Quality Profile APIs
  async getQualityProfiles() {
    return this.api.getApiV1Qualityprofile();
  }

  async getQualityProfile(id: number) {
    return this.api.getApiV1QualityprofileById({ path: { id } });
  }

  async addQualityProfile(profile: QualityProfileResource) {
    return this.api.postApiV1Qualityprofile({ body: profile });
  }

  async updateQualityProfile(id: number, profile: QualityProfileResource) {
    return this.api.putApiV1QualityprofileById({ path: { id: String(id) }, body: profile });
  }

  async deleteQualityProfile(id: number) {
    return this.api.deleteApiV1QualityprofileById({ path: { id } });
  }

  async getQualityProfileSchema() {
    return this.api.getApiV1QualityprofileSchema();
  }

  // Metadata Profile APIs
  async getMetadataProfiles() {
    return this.api.getApiV1Metadataprofile();
  }

  async getMetadataProfile(id: number) {
    return this.api.getApiV1MetadataprofileById({ path: { id } });
  }

  // Custom Format APIs
  async getCustomFormats() {
    return this.api.getApiV1Customformat();
  }

  async getCustomFormat(id: number) {
    return this.api.getApiV1CustomformatById({ path: { id } });
  }

  async addCustomFormat(format: CustomFormatResource) {
    return this.api.postApiV1Customformat({ body: format });
  }

  async updateCustomFormat(id: number, format: CustomFormatResource) {
    return this.api.putApiV1CustomformatById({ path: { id: String(id) }, body: format });
  }

  async deleteCustomFormat(id: number) {
    return this.api.deleteApiV1CustomformatById({ path: { id } });
  }

  async updateCustomFormatsBulk(formats: CustomFormatBulkResource) {
    return this.api.putApiV1CustomformatBulk({ body: formats });
  }

  async deleteCustomFormatsBulk(ids: number[]) {
    return this.api.deleteApiV1CustomformatBulk({ body: { ids } });
  }

  async getCustomFormatSchema() {
    return this.api.getApiV1CustomformatSchema();
  }

  // Configuration Management APIs

  /**
   * Get naming configuration settings
   */
  async getNamingConfig() {
    return this.api.getApiV1ConfigNaming();
  }

  /**
   * Get naming configuration by ID
   */
  async getNamingConfigById(id: number) {
    return this.api.getApiV1ConfigNamingById({ path: { id } });
  }

  /**
   * Update naming configuration
   */
  async updateNamingConfig(id: number, config: NamingConfigResource) {
    return this.api.putApiV1ConfigNamingById({ path: { id: String(id) }, body: config });
  }

  /**
   * Get naming configuration examples
   */
  async getNamingConfigExamples() {
    return this.api.getApiV1ConfigNamingExamples();
  }

  /**
   * Get media management configuration settings
   */
  async getMediaManagementConfig() {
    return this.api.getApiV1ConfigMediamanagement();
  }

  /**
   * Get media management configuration by ID
   */
  async getMediaManagementConfigById(id: number) {
    return this.api.getApiV1ConfigMediamanagementById({ path: { id } });
  }

  /**
   * Update media management configuration
   */
  async updateMediaManagementConfig(id: number, config: MediaManagementConfigResource) {
    return this.api.putApiV1ConfigMediamanagementById({ path: { id: String(id) }, body: config });
  }

  /**
   * Get metadata provider configuration settings
   */
  async getMetadataProviderConfig() {
    return this.api.getApiV1ConfigMetadataprovider();
  }

  /**
   * Get metadata provider configuration by ID
   */
  async getMetadataProviderConfigById(id: number) {
    return this.api.getApiV1ConfigMetadataproviderById({ path: { id } });
  }

  /**
   * Update metadata provider configuration
   */
  async updateMetadataProviderConfig(id: number, config: MetadataProviderConfigResource) {
    return this.api.putApiV1ConfigMetadataproviderById({ path: { id: String(id) }, body: config });
  }

  /**
   * Get system logs
   */
  async getSystemLogs() {
    return this.api.getApiV1Log();
  }

  /**
   * Get disk space information
   */
  async getDiskSpace() {
    return this.api.getApiV1Diskspace();
  }

  // Release APIs

  /**
   * Search for release candidates scoped to an album or artist
   */
  async getRelease(albumId?: number, artistId?: number) {
    const query: { albumId?: number; artistId?: number } = {};
    if (albumId !== undefined) query.albumId = albumId;
    if (artistId !== undefined) query.artistId = artistId;

    return this.api.getApiV1Release(Object.keys(query).length === 0 ? {} : { query });
  }

  /**
   * Grab a complete release candidate returned by getRelease
   */
  async addRelease(release: ReleaseResource) {
    return this.api.postApiV1Release({ body: release });
  }

  // Import List APIs

  /**
   * Get all import lists
   */
  async getImportLists() {
    return this.api.getApiV1Importlist();
  }

  /**
   * Get a specific import list by ID
   */
  async getImportList(id: number) {
    return this.api.getApiV1ImportlistById({ path: { id } });
  }

  /**
   * Add a new import list
   */
  async addImportList(importList: ImportListResource) {
    return this.api.postApiV1Importlist({ body: importList });
  }

  /**
   * Update an existing import list
   */
  async updateImportList(id: number, importList: ImportListResource) {
    return this.api.putApiV1ImportlistById({ path: { id }, body: importList });
  }

  /**
   * Delete an import list
   */
  async deleteImportList(id: number) {
    return this.api.deleteApiV1ImportlistById({ path: { id } });
  }

  /**
   * Get import list schema for available list types
   */
  async getImportListSchema() {
    return this.api.getApiV1ImportlistSchema();
  }

  /**
   * Test an import list configuration
   */
  async testImportList(importList: ImportListResource) {
    return this.api.postApiV1ImportlistTest({ body: importList });
  }

  /**
   * Test all import lists
   */
  async testAllImportLists() {
    return this.api.postApiV1ImportlistTestall();
  }

  // History APIs

  /**
   * Get activity history
   */
  async getHistory(
    page?: number,
    pageSize?: number,
    sortKey?: string,
    sortDirection?: string,
    artistId?: number,
    downloadId?: string
  ) {
    const query: Record<string, any> = {};
    if (page !== undefined) query.page = page;
    if (pageSize !== undefined) query.pageSize = pageSize;
    if (sortKey) query.sortKey = sortKey;
    if (sortDirection) query.sortDirection = sortDirection;
    if (artistId !== undefined) query.artistId = artistId;
    if (downloadId) query.downloadId = downloadId;

    return this.api.getApiV1History(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get history since a specific date
   */
  async getHistorySince(date: string, artistId?: number) {
    const query: any = { date };
    if (artistId !== undefined) query.artistId = artistId;

    return this.api.getApiV1HistorySince({ query });
  }

  /**
   * Get history for a specific artist
   */
  async getArtistHistory(artistId: number, eventType?: any) {
    const query: any = { artistId };
    if (eventType !== undefined) query.eventType = eventType;

    return this.api.getApiV1HistoryArtist({ query });
  }

  /**
   * Mark a failed download as failed in history
   */
  async markHistoryItemFailed(id: number) {
    return this.api.postApiV1HistoryFailedById({ path: { id } });
  }

  // Queue APIs

  /**
   * Get download queue
   */
  async getQueue(
    page?: number,
    pageSize?: number,
    sortKey?: string,
    sortDirection?: string,
    includeUnknownArtistItems?: boolean
  ) {
    const query: Record<string, any> = {};
    if (page !== undefined) query.page = page;
    if (pageSize !== undefined) query.pageSize = pageSize;
    if (sortKey) query.sortKey = sortKey;
    if (sortDirection) query.sortDirection = sortDirection;
    if (includeUnknownArtistItems !== undefined)
      query.includeUnknownArtistItems = includeUnknownArtistItems;

    return this.api.getApiV1Queue(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Remove an item from the download queue
   */
  async removeQueueItem(id: number, removeFromClient?: boolean, blocklist?: boolean) {
    const query: Record<string, any> = {};
    if (removeFromClient !== undefined) query.removeFromClient = removeFromClient;
    if (blocklist !== undefined) query.blocklist = blocklist;

    return this.api.deleteApiV1QueueById({
      path: { id },
      ...(Object.keys(query).length > 0 ? { query } : {}),
    });
  }

  /**
   * Bulk remove items from the download queue
   */
  async removeQueueItemsBulk(ids: number[], removeFromClient?: boolean, blocklist?: boolean) {
    const query: Record<string, any> = {};
    if (removeFromClient !== undefined) query.removeFromClient = removeFromClient;
    if (blocklist !== undefined) query.blocklist = blocklist;

    return this.api.deleteApiV1QueueBulk({
      body: { ids },
      ...(Object.keys(query).length > 0 ? { query } : {}),
    });
  }

  /**
   * Force grab a queue item
   */
  async grabQueueItem(id: number) {
    return this.api.postApiV1QueueGrabById({ path: { id } });
  }

  /**
   * Force grab multiple queue items
   */
  async grabQueueItemsBulk(ids: number[]) {
    return this.api.postApiV1QueueGrabBulk({ body: { ids } });
  }

  /**
   * Get detailed queue information
   */
  async getQueueDetails(artistId?: number, includeUnknownArtistItems?: boolean) {
    const query: Record<string, any> = {};
    if (artistId !== undefined) query.artistId = artistId;
    if (includeUnknownArtistItems !== undefined)
      query.includeUnknownArtistItems = includeUnknownArtistItems;

    return this.api.getApiV1QueueDetails(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get queue status summary
   */
  async getQueueStatus() {
    return this.api.getApiV1QueueStatus();
  }

  // Blocklist APIs

  /**
   * Get blocked releases
   */
  async getBlocklist(page?: number, pageSize?: number, sortKey?: string, sortDirection?: string) {
    const query: Record<string, any> = {};
    if (page !== undefined) query.page = page;
    if (pageSize !== undefined) query.pageSize = pageSize;
    if (sortKey) query.sortKey = sortKey;
    if (sortDirection) query.sortDirection = sortDirection;

    return this.api.getApiV1Blocklist(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Remove a release from the blocklist
   */
  async removeBlocklistItem(id: number) {
    return this.api.deleteApiV1BlocklistById({ path: { id } });
  }

  /**
   * Bulk remove releases from the blocklist
   */
  async removeBlocklistItemsBulk(ids: number[]) {
    return this.api.deleteApiV1BlocklistBulk({ body: { ids } });
  }

  /**
   * Get albums with missing tracks
   */
  async getWantedMissing(
    page?: number,
    pageSize?: number,
    sortKey?: string,
    sortDirection?: string,
    monitored?: boolean
  ) {
    const query: Record<string, any> = { includeArtist: true };
    if (page !== undefined) query.page = page;
    if (pageSize !== undefined) query.pageSize = pageSize;
    if (sortKey) query.sortKey = sortKey;
    if (sortDirection) query.sortDirection = sortDirection;
    if (monitored !== undefined) query.monitored = monitored;

    return this.api.getApiV1WantedMissing(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get albums below cutoff quality
   */
  async getWantedCutoff(
    page?: number,
    pageSize?: number,
    sortKey?: string,
    sortDirection?: string,
    monitored?: boolean
  ) {
    const query: Record<string, any> = { includeArtist: true };
    if (page !== undefined) query.page = page;
    if (pageSize !== undefined) query.pageSize = pageSize;
    if (sortKey) query.sortKey = sortKey;
    if (sortDirection) query.sortDirection = sortDirection;
    if (monitored !== undefined) query.monitored = monitored;

    return this.api.getApiV1WantedCutoff(Object.keys(query).length > 0 ? { query } : {});
  }
}

// Re-export types for external consumption
export * from './lidarr-types.js';
