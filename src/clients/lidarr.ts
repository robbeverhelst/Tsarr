import { createServarrClient } from '../core/client.js';
import type { ServarrClientConfig } from '../core/types.js';
import { client as lidarrClient } from '../generated/lidarr/client.gen.js';
import * as LidarrApi from '../generated/lidarr/index.js';
import type {
  AlbumResource,
  ArtistResource,
  CustomFormatBulkResource,
  CustomFormatResource,
  DownloadClientBulkResource,
  DownloadClientResource,
  HostConfigResource,
  ImportListResource,
  IndexerResource,
  MediaManagementConfigResource,
  MetadataProviderConfigResource,
  NamingConfigResource,
  NotificationResource,
  QualityProfileResource,
  TagResource,
  UiConfigResource,
} from '../generated/lidarr/types.gen.js';

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
export class LidarrClient {
  private clientConfig: ReturnType<typeof createServarrClient>;

  constructor(config: ServarrClientConfig) {
    this.clientConfig = createServarrClient(config);

    // Configure the raw client for manual endpoints
    lidarrClient.setConfig({
      baseUrl: this.clientConfig.getBaseUrl(),
      headers: this.clientConfig.getHeaders(),
    });
  }

  // System APIs
  async getSystemStatus() {
    return LidarrApi.getApiV1SystemStatus();
  }

  async getHealth() {
    return LidarrApi.getApiV1Health();
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

  // Command APIs
  async runCommand(command: any) {
    return LidarrApi.postApiV1Command({ body: command });
  }

  async getCommands() {
    return LidarrApi.getApiV1Command();
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

    return LidarrApi.getApiV1Calendar(Object.keys(query).length > 0 ? { query } : {});
  }

  async getCalendarFeed(pastDays?: number, futureDays?: number, tags?: string) {
    const query: Record<string, any> = {};
    if (pastDays !== undefined) query.pastDays = pastDays;
    if (futureDays !== undefined) query.futureDays = futureDays;
    if (tags) query.tags = tags;

    return LidarrApi.getFeedV1CalendarLidarrIcs(Object.keys(query).length > 0 ? { query } : {});
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
   * Get host configuration settings
   */
  async getHostConfig() {
    return LidarrApi.getApiV1ConfigHost();
  }

  /**
   * Get host configuration by ID
   */
  async getHostConfigById(id: number) {
    return LidarrApi.getApiV1ConfigHostById({ path: { id } });
  }

  /**
   * Update host configuration
   */
  async updateHostConfig(id: number, config: HostConfigResource) {
    return LidarrApi.putApiV1ConfigHostById({ path: { id: String(id) }, body: config });
  }

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
   * Get UI configuration settings
   */
  async getUiConfig() {
    return LidarrApi.getApiV1ConfigUi();
  }

  /**
   * Get UI configuration by ID
   */
  async getUiConfigById(id: number) {
    return LidarrApi.getApiV1ConfigUiById({ path: { id } });
  }

  /**
   * Update UI configuration
   */
  async updateUiConfig(id: number, config: UiConfigResource) {
    return LidarrApi.putApiV1ConfigUiById({ path: { id: String(id) }, body: config });
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

  // System Administration APIs

  /**
   * Restart the Lidarr application
   */
  async restartSystem() {
    return LidarrApi.postApiV1SystemRestart();
  }

  /**
   * Shutdown the Lidarr application
   */
  async shutdownSystem() {
    return LidarrApi.postApiV1SystemShutdown();
  }

  /**
   * Get system backup files
   */
  async getSystemBackups() {
    return LidarrApi.getApiV1SystemBackup();
  }

  /**
   * Delete a system backup by ID
   */
  async deleteSystemBackup(id: number) {
    return LidarrApi.deleteApiV1SystemBackupById({ path: { id } });
  }

  /**
   * Restore system backup by ID
   */
  async restoreSystemBackup(id: number) {
    return LidarrApi.postApiV1SystemBackupRestoreById({ path: { id } });
  }

  /**
   * Upload and restore system backup
   */
  async uploadSystemBackup() {
    return LidarrApi.postApiV1SystemBackupRestoreUpload();
  }

  /**
   * Get system logs
   */
  async getSystemLogs() {
    return LidarrApi.getApiV1Log();
  }

  /**
   * Get log files
   */
  async getLogFiles() {
    return LidarrApi.getApiV1LogFile();
  }

  /**
   * Get specific log file by filename
   */
  async getLogFileByName(filename: string) {
    return LidarrApi.getApiV1LogFileByFilename({ path: { filename } });
  }

  /**
   * Get disk space information
   */
  async getDiskSpace() {
    return LidarrApi.getApiV1Diskspace();
  }

  // Tag Management APIs

  /**
   * Get all tags
   */
  async getTags() {
    return LidarrApi.getApiV1Tag();
  }

  /**
   * Add a new tag
   */
  async addTag(tag: TagResource) {
    return LidarrApi.postApiV1Tag({ body: tag });
  }

  /**
   * Get a specific tag by ID
   */
  async getTag(id: number) {
    return LidarrApi.getApiV1TagById({ path: { id } });
  }

  /**
   * Update an existing tag
   */
  async updateTag(id: number, tag: TagResource) {
    return LidarrApi.putApiV1TagById({ path: { id: String(id) }, body: tag });
  }

  /**
   * Delete a tag
   */
  async deleteTag(id: number) {
    return LidarrApi.deleteApiV1TagById({ path: { id } });
  }

  /**
   * Get detailed tag information
   */
  async getTagDetails() {
    return LidarrApi.getApiV1TagDetail();
  }

  /**
   * Get detailed tag information by ID
   */
  async getTagDetailById(id: number) {
    return LidarrApi.getApiV1TagDetailById({ path: { id } });
  }

  // Download Client APIs

  /**
   * Get all download clients
   */
  async getDownloadClients() {
    return LidarrApi.getApiV1Downloadclient();
  }

  /**
   * Get a specific download client by ID
   */
  async getDownloadClient(id: number) {
    return LidarrApi.getApiV1DownloadclientById({ path: { id } });
  }

  /**
   * Add a new download client
   */
  async addDownloadClient(client: DownloadClientResource) {
    return LidarrApi.postApiV1Downloadclient({ body: client });
  }

  /**
   * Update an existing download client
   */
  async updateDownloadClient(id: number, client: DownloadClientResource) {
    return LidarrApi.putApiV1DownloadclientById({ path: { id }, body: client });
  }

  /**
   * Delete a download client
   */
  async deleteDownloadClient(id: number) {
    return LidarrApi.deleteApiV1DownloadclientById({ path: { id } });
  }

  /**
   * Bulk update download clients
   */
  async updateDownloadClientsBulk(clients: DownloadClientBulkResource) {
    return LidarrApi.putApiV1DownloadclientBulk({ body: clients });
  }

  /**
   * Bulk delete download clients
   */
  async deleteDownloadClientsBulk(ids: number[]) {
    return LidarrApi.deleteApiV1DownloadclientBulk({ body: { ids } });
  }

  /**
   * Get download client schema for available client types
   */
  async getDownloadClientSchema() {
    return LidarrApi.getApiV1DownloadclientSchema();
  }

  /**
   * Test a download client configuration
   */
  async testDownloadClient(client: DownloadClientResource) {
    return LidarrApi.postApiV1DownloadclientTest({ body: client });
  }

  /**
   * Test all download clients
   */
  async testAllDownloadClients() {
    return LidarrApi.postApiV1DownloadclientTestall();
  }

  // Indexer APIs

  /**
   * Get all indexers
   */
  async getIndexers() {
    return LidarrApi.getApiV1Indexer();
  }

  /**
   * Get a specific indexer by ID
   */
  async getIndexer(id: number) {
    return LidarrApi.getApiV1IndexerById({ path: { id } });
  }

  /**
   * Add a new indexer
   */
  async addIndexer(indexer: IndexerResource) {
    return LidarrApi.postApiV1Indexer({ body: indexer });
  }

  /**
   * Update an existing indexer
   */
  async updateIndexer(id: number, indexer: IndexerResource) {
    return LidarrApi.putApiV1IndexerById({ path: { id }, body: indexer });
  }

  /**
   * Delete an indexer
   */
  async deleteIndexer(id: number) {
    return LidarrApi.deleteApiV1IndexerById({ path: { id } });
  }

  /**
   * Get indexer schema for available indexer types
   */
  async getIndexerSchema() {
    return LidarrApi.getApiV1IndexerSchema();
  }

  /**
   * Test an indexer configuration
   */
  async testIndexer(indexer: IndexerResource) {
    return LidarrApi.postApiV1IndexerTest({ body: indexer });
  }

  /**
   * Test all indexers
   */
  async testAllIndexers() {
    return LidarrApi.postApiV1IndexerTestall();
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

  // Notification APIs

  /**
   * Get all notification providers
   */
  async getNotifications() {
    return LidarrApi.getApiV1Notification();
  }

  /**
   * Get a specific notification provider by ID
   */
  async getNotification(id: number) {
    return LidarrApi.getApiV1NotificationById({ path: { id } });
  }

  /**
   * Add a new notification provider
   */
  async addNotification(notification: NotificationResource) {
    return LidarrApi.postApiV1Notification({ body: notification });
  }

  /**
   * Update an existing notification provider
   */
  async updateNotification(id: number, notification: NotificationResource) {
    return LidarrApi.putApiV1NotificationById({ path: { id }, body: notification });
  }

  /**
   * Delete a notification provider
   */
  async deleteNotification(id: number) {
    return LidarrApi.deleteApiV1NotificationById({ path: { id } });
  }

  /**
   * Get notification schema for available notification types
   */
  async getNotificationSchema() {
    return LidarrApi.getApiV1NotificationSchema();
  }

  /**
   * Test a notification configuration
   */
  async testNotification(notification: NotificationResource) {
    return LidarrApi.postApiV1NotificationTest({ body: notification });
  }

  /**
   * Test all notifications
   */
  async testAllNotifications() {
    return LidarrApi.postApiV1NotificationTestall();
  }

  updateConfig(newConfig: Partial<ServarrClientConfig>) {
    const updatedConfig = { ...this.clientConfig.config, ...newConfig };
    this.clientConfig = createServarrClient(updatedConfig);

    return this.clientConfig.config;
  }
}

// Re-export types for external consumption
export * from './lidarr-types.js';
