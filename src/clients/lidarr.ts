import { ServarrBaseClient, type ServarrOps } from '../clients/base';
import type { ServarrClientConfig } from '../core/types';
import { client as lidarrClient } from '../generated/lidarr/client.gen';
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
  protected readonly ops: ServarrOps = {
    // System
    getSystemStatus: LidarrApi.getApiV1SystemStatus,
    getHealth: LidarrApi.getApiV1Health,

    // Tags
    getTags: LidarrApi.getApiV1Tag,
    createTag: LidarrApi.postApiV1Tag,
    getTagById: LidarrApi.getApiV1TagById,
    updateTagById: LidarrApi.putApiV1TagById,
    deleteTagById: LidarrApi.deleteApiV1TagById,
    getTagDetails: LidarrApi.getApiV1TagDetail,
    getTagDetailById: LidarrApi.getApiV1TagDetailById,

    // Notifications
    getNotifications: LidarrApi.getApiV1Notification,
    createNotification: LidarrApi.postApiV1Notification,
    getNotificationById: LidarrApi.getApiV1NotificationById,
    updateNotificationById: LidarrApi.putApiV1NotificationById,
    deleteNotificationById: LidarrApi.deleteApiV1NotificationById,
    getNotificationSchema: LidarrApi.getApiV1NotificationSchema,
    testNotification: LidarrApi.postApiV1NotificationTest,
    testAllNotifications: LidarrApi.postApiV1NotificationTestall,

    // Download Clients
    getDownloadClients: LidarrApi.getApiV1Downloadclient,
    createDownloadClient: LidarrApi.postApiV1Downloadclient,
    getDownloadClientById: LidarrApi.getApiV1DownloadclientById,
    updateDownloadClientById: LidarrApi.putApiV1DownloadclientById,
    deleteDownloadClientById: LidarrApi.deleteApiV1DownloadclientById,
    getDownloadClientSchema: LidarrApi.getApiV1DownloadclientSchema,
    testDownloadClient: LidarrApi.postApiV1DownloadclientTest,
    testAllDownloadClients: LidarrApi.postApiV1DownloadclientTestall,

    // Indexers
    getIndexers: LidarrApi.getApiV1Indexer,
    createIndexer: LidarrApi.postApiV1Indexer,
    getIndexerById: LidarrApi.getApiV1IndexerById,
    updateIndexerById: LidarrApi.putApiV1IndexerById,
    deleteIndexerById: LidarrApi.deleteApiV1IndexerById,
    getIndexerSchema: LidarrApi.getApiV1IndexerSchema,
    testIndexer: LidarrApi.postApiV1IndexerTest,
    testAllIndexers: LidarrApi.postApiV1IndexerTestall,

    // System Admin
    restartSystem: LidarrApi.postApiV1SystemRestart,
    shutdownSystem: LidarrApi.postApiV1SystemShutdown,
    getBackups: LidarrApi.getApiV1SystemBackup,
    deleteBackup: LidarrApi.deleteApiV1SystemBackupById,
    restoreBackup: LidarrApi.postApiV1SystemBackupRestoreById,
    uploadBackup: LidarrApi.postApiV1SystemBackupRestoreUpload,
    getLogFiles: LidarrApi.getApiV1LogFile,
    getLogFileByName: LidarrApi.getApiV1LogFileByFilename,

    // Commands
    runCommand: LidarrApi.postApiV1Command,
    getCommands: LidarrApi.getApiV1Command,

    // Host Config
    getHostConfig: LidarrApi.getApiV1ConfigHost,
    getHostConfigById: LidarrApi.getApiV1ConfigHostById,
    updateHostConfig: LidarrApi.putApiV1ConfigHostById,

    // UI Config
    getUiConfig: LidarrApi.getApiV1ConfigUi,
    getUiConfigById: LidarrApi.getApiV1ConfigUiById,
    updateUiConfig: LidarrApi.putApiV1ConfigUiById,
  };

  constructor(config: ServarrClientConfig) {
    super(config, lidarrClient);
  }

  // Artist APIs

  /**
   * Get all artists in the library
   */
  async getArtists() {
    return LidarrApi.getApiV1Artist();
  }

  async getArtist(id: number) {
    return LidarrApi.getApiV1ArtistById({ path: { id } });
  }

  async addArtist(artist: ArtistResource) {
    return LidarrApi.postApiV1Artist({ body: artist });
  }

  async updateArtist(id: number, artist: ArtistResource) {
    return LidarrApi.putApiV1ArtistById({ path: { id: String(id) }, body: artist });
  }

  async deleteArtist(id: number) {
    return LidarrApi.deleteApiV1ArtistById({ path: { id } });
  }

  // Album APIs
  async getAlbums() {
    return LidarrApi.getApiV1Album();
  }

  async getAlbum(id: number) {
    return LidarrApi.getApiV1AlbumById({ path: { id } });
  }

  // Search APIs

  /**
   * Search for artists using MusicBrainz database
   */
  async searchArtists(term: string) {
    return LidarrApi.getApiV1ArtistLookup({ query: { term } });
  }

  // Root folder APIs
  async getRootFolders() {
    return LidarrApi.getApiV1Rootfolder();
  }

  async addRootFolder(path: string) {
    return LidarrApi.postApiV1Rootfolder({
      body: { path },
    });
  }

  async deleteRootFolder(id: number) {
    return LidarrApi.deleteApiV1RootfolderById({ path: { id } });
  }

  // Album APIs (enhanced)
  async addAlbum(album: AlbumResource) {
    return LidarrApi.postApiV1Album({ body: album });
  }

  async updateAlbum(id: number, album: AlbumResource) {
    return LidarrApi.putApiV1AlbumById({ path: { id: String(id) }, body: album });
  }

  async deleteAlbum(id: number) {
    return LidarrApi.deleteApiV1AlbumById({ path: { id } });
  }

  async searchAlbums(term: string) {
    return LidarrApi.getApiV1AlbumLookup({ query: { term } });
  }

  // Calendar APIs
  async getCalendar(start?: string, end?: string, unmonitored?: boolean) {
    const query: Record<string, any> = {};
    if (start) query.start = start;
    if (end) query.end = end;
    if (unmonitored !== undefined) query.unmonitored = unmonitored;
    query.includeArtist = true;

    return LidarrApi.getApiV1Calendar(Object.keys(query).length > 0 ? { query } : {});
  }

  async getCalendarFeed(pastDays?: number, futureDays?: number, tags?: string) {
    const query: Record<string, any> = {};
    if (pastDays !== undefined) query.pastDays = pastDays;
    if (futureDays !== undefined) query.futureDays = futureDays;
    if (tags) query.tags = tags;

    return LidarrApi.getFeedV1CalendarLidarrIcs(Object.keys(query).length > 0 ? { query } : {});
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

    return LidarrApi.getApiV1Trackfile(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get a specific track file by ID
   */
  async getTrackFile(id: number) {
    return LidarrApi.getApiV1TrackfileById({ path: { id } });
  }

  /**
   * Update a track file
   */
  async updateTrackFile(id: string, trackFile: TrackFileResource) {
    return LidarrApi.putApiV1TrackfileById({ path: { id }, body: trackFile });
  }

  /**
   * Delete a track file from disk
   */
  async deleteTrackFile(id: number) {
    return LidarrApi.deleteApiV1TrackfileById({ path: { id } });
  }

  /**
   * Bulk update track files using the editor endpoint
   */
  async updateTrackFilesEditor(trackFileList: TrackFileListResource) {
    return LidarrApi.putApiV1TrackfileEditor({ body: trackFileList });
  }

  /**
   * Bulk delete track files
   */
  async deleteTrackFilesBulk(trackFileList: TrackFileListResource) {
    return LidarrApi.deleteApiV1TrackfileBulk({ body: trackFileList });
  }

  // Quality Profile APIs
  async getQualityProfiles() {
    return LidarrApi.getApiV1Qualityprofile();
  }

  async getQualityProfile(id: number) {
    return LidarrApi.getApiV1QualityprofileById({ path: { id } });
  }

  async addQualityProfile(profile: QualityProfileResource) {
    return LidarrApi.postApiV1Qualityprofile({ body: profile });
  }

  async updateQualityProfile(id: number, profile: QualityProfileResource) {
    return LidarrApi.putApiV1QualityprofileById({ path: { id: String(id) }, body: profile });
  }

  async deleteQualityProfile(id: number) {
    return LidarrApi.deleteApiV1QualityprofileById({ path: { id } });
  }

  async getQualityProfileSchema() {
    return LidarrApi.getApiV1QualityprofileSchema();
  }

  // Custom Format APIs
  async getCustomFormats() {
    return LidarrApi.getApiV1Customformat();
  }

  async getCustomFormat(id: number) {
    return LidarrApi.getApiV1CustomformatById({ path: { id } });
  }

  async addCustomFormat(format: CustomFormatResource) {
    return LidarrApi.postApiV1Customformat({ body: format });
  }

  async updateCustomFormat(id: number, format: CustomFormatResource) {
    return LidarrApi.putApiV1CustomformatById({ path: { id: String(id) }, body: format });
  }

  async deleteCustomFormat(id: number) {
    return LidarrApi.deleteApiV1CustomformatById({ path: { id } });
  }

  async updateCustomFormatsBulk(formats: CustomFormatBulkResource) {
    return LidarrApi.putApiV1CustomformatBulk({ body: formats });
  }

  async deleteCustomFormatsBulk(ids: number[]) {
    return LidarrApi.deleteApiV1CustomformatBulk({ body: { ids } });
  }

  async getCustomFormatSchema() {
    return LidarrApi.getApiV1CustomformatSchema();
  }

  // Configuration Management APIs

  /**
   * Get naming configuration settings
   */
  async getNamingConfig() {
    return LidarrApi.getApiV1ConfigNaming();
  }

  /**
   * Get naming configuration by ID
   */
  async getNamingConfigById(id: number) {
    return LidarrApi.getApiV1ConfigNamingById({ path: { id } });
  }

  /**
   * Update naming configuration
   */
  async updateNamingConfig(id: number, config: NamingConfigResource) {
    return LidarrApi.putApiV1ConfigNamingById({ path: { id: String(id) }, body: config });
  }

  /**
   * Get naming configuration examples
   */
  async getNamingConfigExamples() {
    return LidarrApi.getApiV1ConfigNamingExamples();
  }

  /**
   * Get media management configuration settings
   */
  async getMediaManagementConfig() {
    return LidarrApi.getApiV1ConfigMediamanagement();
  }

  /**
   * Get media management configuration by ID
   */
  async getMediaManagementConfigById(id: number) {
    return LidarrApi.getApiV1ConfigMediamanagementById({ path: { id } });
  }

  /**
   * Update media management configuration
   */
  async updateMediaManagementConfig(id: number, config: MediaManagementConfigResource) {
    return LidarrApi.putApiV1ConfigMediamanagementById({ path: { id: String(id) }, body: config });
  }

  /**
   * Get metadata provider configuration settings
   */
  async getMetadataProviderConfig() {
    return LidarrApi.getApiV1ConfigMetadataprovider();
  }

  /**
   * Get metadata provider configuration by ID
   */
  async getMetadataProviderConfigById(id: number) {
    return LidarrApi.getApiV1ConfigMetadataproviderById({ path: { id } });
  }

  /**
   * Update metadata provider configuration
   */
  async updateMetadataProviderConfig(id: number, config: MetadataProviderConfigResource) {
    return LidarrApi.putApiV1ConfigMetadataproviderById({ path: { id: String(id) }, body: config });
  }

  /**
   * Get system logs
   */
  async getSystemLogs() {
    return LidarrApi.getApiV1Log();
  }

  /**
   * Get disk space information
   */
  async getDiskSpace() {
    return LidarrApi.getApiV1Diskspace();
  }

  // Import List APIs

  /**
   * Get all import lists
   */
  async getImportLists() {
    return LidarrApi.getApiV1Importlist();
  }

  /**
   * Get a specific import list by ID
   */
  async getImportList(id: number) {
    return LidarrApi.getApiV1ImportlistById({ path: { id } });
  }

  /**
   * Add a new import list
   */
  async addImportList(importList: ImportListResource) {
    return LidarrApi.postApiV1Importlist({ body: importList });
  }

  /**
   * Update an existing import list
   */
  async updateImportList(id: number, importList: ImportListResource) {
    return LidarrApi.putApiV1ImportlistById({ path: { id }, body: importList });
  }

  /**
   * Delete an import list
   */
  async deleteImportList(id: number) {
    return LidarrApi.deleteApiV1ImportlistById({ path: { id } });
  }

  /**
   * Get import list schema for available list types
   */
  async getImportListSchema() {
    return LidarrApi.getApiV1ImportlistSchema();
  }

  /**
   * Test an import list configuration
   */
  async testImportList(importList: ImportListResource) {
    return LidarrApi.postApiV1ImportlistTest({ body: importList });
  }

  /**
   * Test all import lists
   */
  async testAllImportLists() {
    return LidarrApi.postApiV1ImportlistTestall();
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

    return LidarrApi.getApiV1History(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get history since a specific date
   */
  async getHistorySince(date: string, artistId?: number) {
    const query: any = { date };
    if (artistId !== undefined) query.artistId = artistId;

    return LidarrApi.getApiV1HistorySince({ query });
  }

  /**
   * Get history for a specific artist
   */
  async getArtistHistory(artistId: number, eventType?: any) {
    const query: any = { artistId };
    if (eventType !== undefined) query.eventType = eventType;

    return LidarrApi.getApiV1HistoryArtist({ query });
  }

  /**
   * Mark a failed download as failed in history
   */
  async markHistoryItemFailed(id: number) {
    return LidarrApi.postApiV1HistoryFailedById({ path: { id } });
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

    return LidarrApi.getApiV1Queue(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Remove an item from the download queue
   */
  async removeQueueItem(id: number, removeFromClient?: boolean, blocklist?: boolean) {
    const query: Record<string, any> = {};
    if (removeFromClient !== undefined) query.removeFromClient = removeFromClient;
    if (blocklist !== undefined) query.blocklist = blocklist;

    return LidarrApi.deleteApiV1QueueById({
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

    return LidarrApi.deleteApiV1QueueBulk({
      body: { ids },
      ...(Object.keys(query).length > 0 ? { query } : {}),
    });
  }

  /**
   * Force grab a queue item
   */
  async grabQueueItem(id: number) {
    return LidarrApi.postApiV1QueueGrabById({ path: { id } });
  }

  /**
   * Force grab multiple queue items
   */
  async grabQueueItemsBulk(ids: number[]) {
    return LidarrApi.postApiV1QueueGrabBulk({ body: { ids } });
  }

  /**
   * Get detailed queue information
   */
  async getQueueDetails(artistId?: number, includeUnknownArtistItems?: boolean) {
    const query: Record<string, any> = {};
    if (artistId !== undefined) query.artistId = artistId;
    if (includeUnknownArtistItems !== undefined)
      query.includeUnknownArtistItems = includeUnknownArtistItems;

    return LidarrApi.getApiV1QueueDetails(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get queue status summary
   */
  async getQueueStatus() {
    return LidarrApi.getApiV1QueueStatus();
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

    return LidarrApi.getApiV1Blocklist(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Remove a release from the blocklist
   */
  async removeBlocklistItem(id: number) {
    return LidarrApi.deleteApiV1BlocklistById({ path: { id } });
  }

  /**
   * Bulk remove releases from the blocklist
   */
  async removeBlocklistItemsBulk(ids: number[]) {
    return LidarrApi.deleteApiV1BlocklistBulk({ body: { ids } });
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

    return LidarrApi.getApiV1WantedMissing(Object.keys(query).length > 0 ? { query } : {});
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

    return LidarrApi.getApiV1WantedCutoff(Object.keys(query).length > 0 ? { query } : {});
  }
}

// Re-export types for external consumption
export * from './lidarr-types.js';
