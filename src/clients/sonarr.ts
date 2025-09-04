import { createServarrClient } from '../core/client.js';
import type { ServarrClientConfig } from '../core/types.js';
import { client as sonarrClient } from '../generated/sonarr/client.gen.js';
import * as SonarrApi from '../generated/sonarr/index.js';
import type {
  CommandResource,
  CustomFormatBulkResource,
  CustomFormatResource,
  DownloadClientBulkResource,
  DownloadClientResource,
  EpisodeResource,
  HostConfigResource,
  ImportListResource,
  IndexerResource,
  MediaManagementConfigResource,
  NamingConfigResource,
  NotificationResource,
  QualityProfileResource,
  SeriesResource,
  TagResource,
  UiConfigResource,
} from '../generated/sonarr/types.gen.js';

/**
 * Sonarr API client for TV show management
 *
 * @example
 * ```typescript
 * const sonarr = new SonarrClient({
 *   baseUrl: 'http://localhost:8989',
 *   apiKey: 'your-api-key'
 * });
 *
 * const series = await sonarr.getSeries();
 * ```
 */
export class SonarrClient {
  private clientConfig: ReturnType<typeof createServarrClient>;

  constructor(config: ServarrClientConfig) {
    this.clientConfig = createServarrClient(config);

    // Configure the raw client for manual endpoints
    sonarrClient.setConfig({
      baseUrl: this.clientConfig.getBaseUrl(),
      headers: this.clientConfig.getHeaders(),
    });
  }

  // Basic API
  async getApi() {
    return SonarrApi.getApi();
  }

  async getSystemStatus() {
    return sonarrClient.get({
      url: '/api/v3/system/status',
      headers: this.clientConfig.getHeaders(),
      baseUrl: this.clientConfig.getBaseUrl(),
    });
  }

  async getHealth() {
    return sonarrClient.get({
      url: '/api/v3/health',
      headers: this.clientConfig.getHeaders(),
      baseUrl: this.clientConfig.getBaseUrl(),
    });
  }

  // Series APIs

  /**
   * Get all TV series in the library
   */
  async getSeries() {
    return SonarrApi.getApiV3Series();
  }

  /**
   * Get a specific series by ID
   */
  async getSeriesById(id: number) {
    return SonarrApi.getApiV3SeriesById({ path: { id } });
  }

  /**
   * Add a new series to the library
   */
  async addSeries(series: SeriesResource) {
    return SonarrApi.postApiV3Series({ body: series });
  }

  /**
   * Update an existing series
   */
  async updateSeries(id: string, series: SeriesResource) {
    return SonarrApi.putApiV3SeriesById({ path: { id }, body: series });
  }

  /**
   * Delete a series
   */
  async deleteSeries(id: number) {
    return SonarrApi.deleteApiV3SeriesById({ path: { id } });
  }

  /**
   * Get series folder information
   */
  async getSeriesFolder(id: number) {
    return SonarrApi.getApiV3SeriesByIdFolder({ path: { id } });
  }

  // Search APIs

  /**
   * Search for TV series using TVDB database
   */
  async searchSeries(term: string) {
    return SonarrApi.getApiV3SeriesLookup({ query: { term } });
  }

  // Root folder APIs

  /**
   * Get all configured root folders
   */
  async getRootFolders() {
    return SonarrApi.getApiV3Rootfolder();
  }

  /**
   * Add a new root folder
   */
  async addRootFolder(path: string) {
    return SonarrApi.postApiV3Rootfolder({
      body: { path },
    });
  }

  /**
   * Delete a root folder by ID
   */
  async deleteRootFolder(id: number) {
    return SonarrApi.deleteApiV3RootfolderById({ path: { id } });
  }

  // Log APIs

  /**
   * Get system logs with optional filtering
   */
  async getLogs(
    page?: number,
    pageSize?: number,
    sortKey?: string,
    sortDirection?: string,
    level?: string
  ) {
    const query: Record<string, any> = {};
    if (page !== undefined) query.page = page;
    if (pageSize !== undefined) query.pageSize = pageSize;
    if (sortKey) query.sortKey = sortKey;
    if (sortDirection) query.sortDirection = sortDirection;
    if (level) query.level = level;

    return SonarrApi.getApiV3Log(Object.keys(query).length > 0 ? { query } : {});
  }

  // Update APIs

  /**
   * Get available updates
   */
  async getUpdates() {
    return SonarrApi.getApiV3Update();
  }

  /**
   * Get update settings
   */
  async getUpdateSettings() {
    return SonarrApi.getApiV3Update();
  }

  /**
   * Get a specific update setting
   */
  async getUpdateSetting() {
    return SonarrApi.getApiV3Update();
  }

  // Configuration Management APIs

  /**
   * Get host configuration settings
   */
  async getHostConfig() {
    return SonarrApi.getApiV3ConfigHost();
  }

  /**
   * Get host configuration by ID
   */
  async getHostConfigById(id: number) {
    return SonarrApi.getApiV3ConfigHostById({ path: { id } });
  }

  /**
   * Update host configuration
   */
  async updateHostConfig(id: string, config: HostConfigResource) {
    return SonarrApi.putApiV3ConfigHostById({ path: { id }, body: config });
  }

  /**
   * Get naming configuration settings
   */
  async getNamingConfig() {
    return SonarrApi.getApiV3ConfigNaming();
  }

  /**
   * Get naming configuration by ID
   */
  async getNamingConfigById(id: number) {
    return SonarrApi.getApiV3ConfigNamingById({ path: { id } });
  }

  /**
   * Update naming configuration
   */
  async updateNamingConfig(id: string, config: NamingConfigResource) {
    return SonarrApi.putApiV3ConfigNamingById({ path: { id }, body: config });
  }

  /**
   * Get naming configuration examples
   */
  async getNamingConfigExamples() {
    return SonarrApi.getApiV3ConfigNamingExamples();
  }

  /**
   * Get media management configuration settings
   */
  async getMediaManagementConfig() {
    return SonarrApi.getApiV3ConfigMediamanagement();
  }

  /**
   * Get media management configuration by ID
   */
  async getMediaManagementConfigById(id: number) {
    return SonarrApi.getApiV3ConfigMediamanagementById({ path: { id } });
  }

  /**
   * Update media management configuration
   */
  async updateMediaManagementConfig(id: string, config: MediaManagementConfigResource) {
    return SonarrApi.putApiV3ConfigMediamanagementById({ path: { id }, body: config });
  }

  /**
   * Get UI configuration settings
   */
  async getUiConfig() {
    return SonarrApi.getApiV3ConfigUi();
  }

  /**
   * Get UI configuration by ID
   */
  async getUiConfigById(id: number) {
    return SonarrApi.getApiV3ConfigUiById({ path: { id } });
  }

  /**
   * Update UI configuration
   */
  async updateUiConfig(id: string, config: UiConfigResource) {
    return SonarrApi.putApiV3ConfigUiById({ path: { id }, body: config });
  }

  // System Administration APIs

  /**
   * Restart the Sonarr application
   */
  async restartSystem() {
    return SonarrApi.postApiV3SystemRestart();
  }

  /**
   * Shutdown the Sonarr application
   */
  async shutdownSystem() {
    return SonarrApi.postApiV3SystemShutdown();
  }

  /**
   * Get system backup files
   */
  async getSystemBackups() {
    return SonarrApi.getApiV3SystemBackup();
  }

  /**
   * Delete a system backup by ID
   */
  async deleteSystemBackup(id: number) {
    return SonarrApi.deleteApiV3SystemBackupById({ path: { id } });
  }

  /**
   * Restore system backup by ID
   */
  async restoreSystemBackup(id: number) {
    return SonarrApi.postApiV3SystemBackupRestoreById({ path: { id } });
  }

  /**
   * Upload and restore system backup
   */
  async uploadSystemBackup() {
    return SonarrApi.postApiV3SystemBackupRestoreUpload();
  }

  /**
   * Get disk space information
   */
  async getDiskSpace() {
    return SonarrApi.getApiV3Diskspace();
  }

  // Tag Management APIs

  /**
   * Get all tags
   */
  async getTags() {
    return SonarrApi.getApiV3Tag();
  }

  /**
   * Add a new tag
   */
  async addTag(tag: TagResource) {
    return SonarrApi.postApiV3Tag({ body: tag });
  }

  /**
   * Get a specific tag by ID
   */
  async getTag(id: number) {
    return SonarrApi.getApiV3TagById({ path: { id } });
  }

  /**
   * Update an existing tag
   */
  async updateTag(id: string, tag: TagResource) {
    return SonarrApi.putApiV3TagById({ path: { id }, body: tag });
  }

  /**
   * Delete a tag
   */
  async deleteTag(id: number) {
    return SonarrApi.deleteApiV3TagById({ path: { id } });
  }

  /**
   * Get detailed tag information
   */
  async getTagDetails() {
    return SonarrApi.getApiV3TagDetail();
  }

  /**
   * Get detailed tag information by ID
   */
  async getTagDetailById(id: number) {
    return SonarrApi.getApiV3TagDetailById({ path: { id } });
  }

  // Episode APIs (Enhanced)

  /**
   * Get all episodes
   */
  async getEpisodes() {
    return SonarrApi.getApiV3Episode();
  }

  /**
   * Get a specific episode by ID
   */
  async getEpisode(id: number) {
    return SonarrApi.getApiV3EpisodeById({ path: { id } });
  }

  /**
   * Update an episode
   */
  async updateEpisode(id: number, episode: EpisodeResource) {
    return SonarrApi.putApiV3EpisodeById({ path: { id }, body: episode });
  }

  // Quality Profile APIs

  /**
   * Get all quality profiles
   */
  async getQualityProfiles() {
    return SonarrApi.getApiV3Qualityprofile();
  }

  /**
   * Get a specific quality profile by ID
   */
  async getQualityProfile(id: number) {
    return SonarrApi.getApiV3QualityprofileById({ path: { id } });
  }

  /**
   * Create a new quality profile
   */
  async addQualityProfile(profile: QualityProfileResource) {
    return SonarrApi.postApiV3Qualityprofile({ body: profile });
  }

  /**
   * Update an existing quality profile
   */
  async updateQualityProfile(id: string, profile: QualityProfileResource) {
    return SonarrApi.putApiV3QualityprofileById({ path: { id }, body: profile });
  }

  /**
   * Delete a quality profile
   */
  async deleteQualityProfile(id: number) {
    return SonarrApi.deleteApiV3QualityprofileById({ path: { id } });
  }

  /**
   * Get quality profile schema
   */
  async getQualityProfileSchema() {
    return SonarrApi.getApiV3QualityprofileSchema();
  }

  // Custom Format APIs

  /**
   * Get all custom formats
   */
  async getCustomFormats() {
    return SonarrApi.getApiV3Customformat();
  }

  /**
   * Get a specific custom format by ID
   */
  async getCustomFormat(id: number) {
    return SonarrApi.getApiV3CustomformatById({ path: { id } });
  }

  /**
   * Create a new custom format
   */
  async addCustomFormat(format: CustomFormatResource) {
    return SonarrApi.postApiV3Customformat({ body: format });
  }

  /**
   * Update an existing custom format
   */
  async updateCustomFormat(id: string, format: CustomFormatResource) {
    return SonarrApi.putApiV3CustomformatById({ path: { id }, body: format });
  }

  /**
   * Delete a custom format
   */
  async deleteCustomFormat(id: number) {
    return SonarrApi.deleteApiV3CustomformatById({ path: { id } });
  }

  /**
   * Bulk update custom formats
   */
  async updateCustomFormatsBulk(formats: CustomFormatBulkResource) {
    return SonarrApi.putApiV3CustomformatBulk({ body: formats });
  }

  /**
   * Bulk delete custom formats
   */
  async deleteCustomFormatsBulk(ids: number[]) {
    return SonarrApi.deleteApiV3CustomformatBulk({ body: { ids } });
  }

  /**
   * Get custom format schema
   */
  async getCustomFormatSchema() {
    return SonarrApi.getApiV3CustomformatSchema();
  }

  // Download Client APIs

  /**
   * Get all download clients
   */
  async getDownloadClients() {
    return SonarrApi.getApiV3Downloadclient();
  }

  /**
   * Get a specific download client by ID
   */
  async getDownloadClient(id: number) {
    return SonarrApi.getApiV3DownloadclientById({ path: { id } });
  }

  /**
   * Add a new download client
   */
  async addDownloadClient(client: DownloadClientResource) {
    return SonarrApi.postApiV3Downloadclient({ body: client });
  }

  /**
   * Update an existing download client
   */
  async updateDownloadClient(id: number, client: DownloadClientResource) {
    return SonarrApi.putApiV3DownloadclientById({ path: { id }, body: client });
  }

  /**
   * Delete a download client
   */
  async deleteDownloadClient(id: number) {
    return SonarrApi.deleteApiV3DownloadclientById({ path: { id } });
  }

  /**
   * Bulk update download clients
   */
  async updateDownloadClientsBulk(clients: DownloadClientBulkResource) {
    return SonarrApi.putApiV3DownloadclientBulk({ body: clients });
  }

  /**
   * Bulk delete download clients
   */
  async deleteDownloadClientsBulk(ids: number[]) {
    return SonarrApi.deleteApiV3DownloadclientBulk({ body: { ids } });
  }

  /**
   * Get download client schema
   */
  async getDownloadClientSchema() {
    return SonarrApi.getApiV3DownloadclientSchema();
  }

  /**
   * Test a download client configuration
   */
  async testDownloadClient(client: DownloadClientResource) {
    return SonarrApi.postApiV3DownloadclientTest({ body: client });
  }

  /**
   * Test all download clients
   */
  async testAllDownloadClients() {
    return SonarrApi.postApiV3DownloadclientTestall();
  }

  // Indexer APIs

  /**
   * Get all indexers
   */
  async getIndexers() {
    return SonarrApi.getApiV3Indexer();
  }

  /**
   * Get a specific indexer by ID
   */
  async getIndexer(id: number) {
    return SonarrApi.getApiV3IndexerById({ path: { id } });
  }

  /**
   * Add a new indexer
   */
  async addIndexer(indexer: IndexerResource) {
    return SonarrApi.postApiV3Indexer({ body: indexer });
  }

  /**
   * Update an existing indexer
   */
  async updateIndexer(id: number, indexer: IndexerResource) {
    return SonarrApi.putApiV3IndexerById({ path: { id }, body: indexer });
  }

  /**
   * Delete an indexer
   */
  async deleteIndexer(id: number) {
    return SonarrApi.deleteApiV3IndexerById({ path: { id } });
  }

  /**
   * Get indexer schema
   */
  async getIndexerSchema() {
    return SonarrApi.getApiV3IndexerSchema();
  }

  /**
   * Test an indexer configuration
   */
  async testIndexer(indexer: IndexerResource) {
    return SonarrApi.postApiV3IndexerTest({ body: indexer });
  }

  /**
   * Test all indexers
   */
  async testAllIndexers() {
    return SonarrApi.postApiV3IndexerTestall();
  }

  // Import List APIs

  /**
   * Get all import lists
   */
  async getImportLists() {
    return SonarrApi.getApiV3Importlist();
  }

  /**
   * Get a specific import list by ID
   */
  async getImportList(id: number) {
    return SonarrApi.getApiV3ImportlistById({ path: { id } });
  }

  /**
   * Add a new import list
   */
  async addImportList(importList: ImportListResource) {
    return SonarrApi.postApiV3Importlist({ body: importList });
  }

  /**
   * Update an existing import list
   */
  async updateImportList(id: number, importList: ImportListResource) {
    return SonarrApi.putApiV3ImportlistById({ path: { id }, body: importList });
  }

  /**
   * Delete an import list
   */
  async deleteImportList(id: number) {
    return SonarrApi.deleteApiV3ImportlistById({ path: { id } });
  }

  /**
   * Get import list schema
   */
  async getImportListSchema() {
    return SonarrApi.getApiV3ImportlistSchema();
  }

  /**
   * Test an import list configuration
   */
  async testImportList(importList: ImportListResource) {
    return SonarrApi.postApiV3ImportlistTest({ body: importList });
  }

  /**
   * Test all import lists
   */
  async testAllImportLists() {
    return SonarrApi.postApiV3ImportlistTestall();
  }

  // Notification APIs

  /**
   * Get all notification providers
   */
  async getNotifications() {
    return SonarrApi.getApiV3Notification();
  }

  /**
   * Get a specific notification provider by ID
   */
  async getNotification(id: number) {
    return SonarrApi.getApiV3NotificationById({ path: { id } });
  }

  /**
   * Add a new notification provider
   */
  async addNotification(notification: NotificationResource) {
    return SonarrApi.postApiV3Notification({ body: notification });
  }

  /**
   * Update an existing notification provider
   */
  async updateNotification(id: number, notification: NotificationResource) {
    return SonarrApi.putApiV3NotificationById({ path: { id }, body: notification });
  }

  /**
   * Delete a notification provider
   */
  async deleteNotification(id: number) {
    return SonarrApi.deleteApiV3NotificationById({ path: { id } });
  }

  /**
   * Get notification schema
   */
  async getNotificationSchema() {
    return SonarrApi.getApiV3NotificationSchema();
  }

  /**
   * Test a notification configuration
   */
  async testNotification(notification: NotificationResource) {
    return SonarrApi.postApiV3NotificationTest({ body: notification });
  }

  /**
   * Test all notifications
   */
  async testAllNotifications() {
    return SonarrApi.postApiV3NotificationTestall();
  }

  // Command APIs

  /**
   * Execute a Sonarr command
   */
  async runCommand(command: CommandResource) {
    return SonarrApi.postApiV3Command({ body: command });
  }

  /**
   * Get all commands
   */
  async getCommands() {
    return SonarrApi.getApiV3Command();
  }

  /**
   * Get command by ID
   */
  async getCommand(id: number) {
    return SonarrApi.getApiV3CommandById({ path: { id } });
  }

  updateConfig(newConfig: Partial<ServarrClientConfig>) {
    const updatedConfig = { ...this.clientConfig.config, ...newConfig };
    this.clientConfig = createServarrClient(updatedConfig);

    return this.clientConfig.config;
  }
}
