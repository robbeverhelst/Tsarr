import { createServarrClient } from '../core/client.js';
import type { ServarrClientConfig } from '../core/types.js';
import { client as radarrClient } from '../generated/radarr/client.gen.js';
import * as RadarrApi from '../generated/radarr/index.js';
import type {
  CommandResource,
  CustomFormatBulkResource,
  CustomFormatResource,
  DownloadClientBulkResource,
  DownloadClientResource,
  HostConfigResource,
  ImportListResource,
  IndexerResource,
  MediaManagementConfigResource,
  MovieResource,
  NamingConfigResource,
  NotificationResource,
  QualityProfileResource,
  TagResource,
  UiConfigResource,
} from '../generated/radarr/types.gen.js';

/**
 * Radarr API client for movie management
 *
 * @example
 * ```typescript
 * const radarr = new RadarrClient({
 *   baseUrl: 'http://localhost:7878',
 *   apiKey: 'your-api-key'
 * });
 *
 * const movies = await radarr.getMovies();
 * ```
 */
export class RadarrClient {
  private clientConfig: ReturnType<typeof createServarrClient>;

  constructor(config: ServarrClientConfig) {
    this.clientConfig = createServarrClient(config);

    // Configure the raw client for manual endpoints
    radarrClient.setConfig({
      baseUrl: this.clientConfig.getBaseUrl(),
      headers: this.clientConfig.getHeaders(),
    });
  }

  // System APIs

  /**
   * Get Radarr system status and version information
   */
  async getSystemStatus() {
    return RadarrApi.getApiV3SystemStatus();
  }

  /**
   * Get system health check results
   */
  async getHealth() {
    return RadarrApi.getApiV3Health();
  }

  // Movie APIs

  /**
   * Get all movies in the library
   */
  async getMovies() {
    return RadarrApi.getApiV3Movie();
  }

  /**
   * Get a specific movie by ID
   */
  async getMovie(id: number) {
    return RadarrApi.getApiV3MovieById({ path: { id } });
  }

  /**
   * Add a new movie to the library
   */
  async addMovie(movie: MovieResource) {
    return RadarrApi.postApiV3Movie({ body: movie });
  }

  async updateMovie(id: number, movie: MovieResource) {
    return RadarrApi.putApiV3MovieById({ path: { id: String(id) }, body: movie });
  }

  async deleteMovie(id: number) {
    return RadarrApi.deleteApiV3MovieById({ path: { id } });
  }

  // Search APIs

  /**
   * Search for movies using TMDB database
   */
  async searchMovies(term: string) {
    return RadarrApi.getApiV3MovieLookup({ query: { term } });
  }

  // Command APIs

  /**
   * Execute a Radarr command (scan, search, etc.)
   */
  async runCommand(command: CommandResource) {
    return RadarrApi.postApiV3Command({ body: command });
  }

  async getCommands() {
    return RadarrApi.getApiV3Command();
  }

  // Root folder APIs

  /**
   * Get all configured root folders
   */
  async getRootFolders() {
    return RadarrApi.getApiV3Rootfolder();
  }

  async addRootFolder(path: string) {
    return RadarrApi.postApiV3Rootfolder({
      body: { path },
    });
  }

  async deleteRootFolder(id: number) {
    return RadarrApi.deleteApiV3RootfolderById({ path: { id } });
  }

  // Filesystem APIs
  async getFilesystem(path?: string) {
    return RadarrApi.getApiV3Filesystem(path ? { query: { path } } : {});
  }

  async getMediaFiles(path: string) {
    return RadarrApi.getApiV3FilesystemMediafiles({ query: { path } });
  }

  // Import APIs

  /**
   * Import physical movie files into the library
   */
  async importMovies(movies: any[]) {
    return RadarrApi.postApiV3MovieImport({ body: movies });
  }

  // Quality Profile APIs

  /**
   * Get all quality profiles
   */
  async getQualityProfiles() {
    return RadarrApi.getApiV3Qualityprofile();
  }

  /**
   * Get a specific quality profile by ID
   */
  async getQualityProfile(id: number) {
    return RadarrApi.getApiV3QualityprofileById({ path: { id } });
  }

  /**
   * Create a new quality profile
   */
  async addQualityProfile(profile: QualityProfileResource) {
    return RadarrApi.postApiV3Qualityprofile({ body: profile });
  }

  /**
   * Update an existing quality profile
   */
  async updateQualityProfile(id: number, profile: QualityProfileResource) {
    return RadarrApi.putApiV3QualityprofileById({ path: { id: String(id) }, body: profile });
  }

  /**
   * Delete a quality profile
   */
  async deleteQualityProfile(id: number) {
    return RadarrApi.deleteApiV3QualityprofileById({ path: { id } });
  }

  /**
   * Get quality profile schema for creating new profiles
   */
  async getQualityProfileSchema() {
    return RadarrApi.getApiV3QualityprofileSchema();
  }

  // Custom Format APIs

  /**
   * Get all custom formats
   */
  async getCustomFormats() {
    return RadarrApi.getApiV3Customformat();
  }

  /**
   * Get a specific custom format by ID
   */
  async getCustomFormat(id: number) {
    return RadarrApi.getApiV3CustomformatById({ path: { id } });
  }

  /**
   * Create a new custom format
   */
  async addCustomFormat(format: CustomFormatResource) {
    return RadarrApi.postApiV3Customformat({ body: format });
  }

  /**
   * Update an existing custom format
   */
  async updateCustomFormat(id: number, format: CustomFormatResource) {
    return RadarrApi.putApiV3CustomformatById({ path: { id: String(id) }, body: format });
  }

  /**
   * Delete a custom format
   */
  async deleteCustomFormat(id: number) {
    return RadarrApi.deleteApiV3CustomformatById({ path: { id } });
  }

  /**
   * Bulk update custom formats
   */
  async updateCustomFormatsBulk(formats: CustomFormatBulkResource) {
    return RadarrApi.putApiV3CustomformatBulk({ body: formats });
  }

  /**
   * Bulk delete custom formats
   */
  async deleteCustomFormatsBulk(ids: number[]) {
    return RadarrApi.deleteApiV3CustomformatBulk({ body: { ids } });
  }

  /**
   * Get custom format schema for creating new formats
   */
  async getCustomFormatSchema() {
    return RadarrApi.getApiV3CustomformatSchema();
  }

  // Download Client APIs

  /**
   * Get all download clients
   */
  async getDownloadClients() {
    return RadarrApi.getApiV3Downloadclient();
  }

  /**
   * Get a specific download client by ID
   */
  async getDownloadClient(id: number) {
    return RadarrApi.getApiV3DownloadclientById({ path: { id } });
  }

  /**
   * Add a new download client
   */
  async addDownloadClient(client: DownloadClientResource) {
    return RadarrApi.postApiV3Downloadclient({ body: client });
  }

  /**
   * Update an existing download client
   */
  async updateDownloadClient(id: number, client: DownloadClientResource) {
    return RadarrApi.putApiV3DownloadclientById({ path: { id }, body: client });
  }

  /**
   * Delete a download client
   */
  async deleteDownloadClient(id: number) {
    return RadarrApi.deleteApiV3DownloadclientById({ path: { id } });
  }

  /**
   * Bulk update download clients
   */
  async updateDownloadClientsBulk(clients: DownloadClientBulkResource) {
    return RadarrApi.putApiV3DownloadclientBulk({ body: clients });
  }

  /**
   * Bulk delete download clients
   */
  async deleteDownloadClientsBulk(ids: number[]) {
    return RadarrApi.deleteApiV3DownloadclientBulk({ body: { ids } });
  }

  /**
   * Get download client schema for available client types
   */
  async getDownloadClientSchema() {
    return RadarrApi.getApiV3DownloadclientSchema();
  }

  /**
   * Test a download client configuration
   */
  async testDownloadClient(client: DownloadClientResource) {
    return RadarrApi.postApiV3DownloadclientTest({ body: client });
  }

  /**
   * Test all download clients
   */
  async testAllDownloadClients() {
    return RadarrApi.postApiV3DownloadclientTestall();
  }

  // Notification APIs

  /**
   * Get all notification providers
   */
  async getNotifications() {
    return RadarrApi.getApiV3Notification();
  }

  /**
   * Get a specific notification provider by ID
   */
  async getNotification(id: number) {
    return RadarrApi.getApiV3NotificationById({ path: { id } });
  }

  /**
   * Add a new notification provider
   */
  async addNotification(notification: NotificationResource) {
    return RadarrApi.postApiV3Notification({ body: notification });
  }

  /**
   * Update an existing notification provider
   */
  async updateNotification(id: number, notification: NotificationResource) {
    return RadarrApi.putApiV3NotificationById({ path: { id }, body: notification });
  }

  /**
   * Delete a notification provider
   */
  async deleteNotification(id: number) {
    return RadarrApi.deleteApiV3NotificationById({ path: { id } });
  }

  /**
   * Get notification schema for available notification types
   */
  async getNotificationSchema() {
    return RadarrApi.getApiV3NotificationSchema();
  }

  /**
   * Test a notification configuration
   */
  async testNotification(notification: NotificationResource) {
    return RadarrApi.postApiV3NotificationTest({ body: notification });
  }

  /**
   * Test all notifications
   */
  async testAllNotifications() {
    return RadarrApi.postApiV3NotificationTestall();
  }

  // Calendar APIs

  /**
   * Get upcoming movie releases in calendar format
   */
  async getCalendar(startDate?: string, endDate?: string, unmonitored?: boolean) {
    const query: Record<string, any> = {};
    if (startDate) query.start = startDate;
    if (endDate) query.end = endDate;
    if (unmonitored !== undefined) query.unmonitored = unmonitored;

    return RadarrApi.getApiV3Calendar(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get calendar feed in iCal format
   */
  async getCalendarFeed(pastDays?: number, futureDays?: number, tags?: string) {
    const query: Record<string, any> = {};
    if (pastDays !== undefined) query.pastDays = pastDays;
    if (futureDays !== undefined) query.futureDays = futureDays;
    if (tags) query.tags = tags;

    return RadarrApi.getFeedV3CalendarRadarrIcs(Object.keys(query).length > 0 ? { query } : {});
  }

  // Queue APIs

  /**
   * Get download queue with optional filtering
   */
  async getQueue(
    page?: number,
    pageSize?: number,
    sortKey?: string,
    sortDirection?: string,
    includeUnknownMovieItems?: boolean
  ) {
    const query: Record<string, any> = {};
    if (page !== undefined) query.page = page;
    if (pageSize !== undefined) query.pageSize = pageSize;
    if (sortKey) query.sortKey = sortKey;
    if (sortDirection) query.sortDirection = sortDirection;
    if (includeUnknownMovieItems !== undefined)
      query.includeUnknownMovieItems = includeUnknownMovieItems;

    return RadarrApi.getApiV3Queue(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Remove an item from the download queue
   */
  async removeQueueItem(id: number, removeFromClient?: boolean, blocklist?: boolean) {
    const query: Record<string, any> = {};
    if (removeFromClient !== undefined) query.removeFromClient = removeFromClient;
    if (blocklist !== undefined) query.blocklist = blocklist;

    return RadarrApi.deleteApiV3QueueById({
      path: { id },
      ...(Object.keys(query).length > 0 ? { query } : {}),
    });
  }

  /**
   * Bulk remove items from the download queue
   */
  async removeQueueItemsBulk(ids: number[], removeFromClient?: boolean, blocklist?: boolean) {
    const body: any = { ids };
    if (removeFromClient !== undefined) body.removeFromClient = removeFromClient;
    if (blocklist !== undefined) body.blocklist = blocklist;

    return RadarrApi.deleteApiV3QueueBulk({ body });
  }

  /**
   * Force grab/download a queue item
   */
  async grabQueueItem(id: number) {
    return RadarrApi.postApiV3QueueGrabById({ path: { id } });
  }

  /**
   * Force grab/download multiple queue items
   */
  async grabQueueItemsBulk(ids: number[]) {
    return RadarrApi.postApiV3QueueGrabBulk({ body: { ids } });
  }

  /**
   * Get detailed queue information
   */
  async getQueueDetails(movieId?: number, includeMovie?: boolean) {
    const query: Record<string, any> = {};
    if (movieId !== undefined) query.movieId = movieId;
    if (includeMovie !== undefined) query.includeMovie = includeMovie;

    return RadarrApi.getApiV3QueueDetails(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get queue status summary
   */
  async getQueueStatus() {
    return RadarrApi.getApiV3QueueStatus();
  }

  // Import List APIs

  /**
   * Get all import lists
   */
  async getImportLists() {
    return RadarrApi.getApiV3Importlist();
  }

  /**
   * Get a specific import list by ID
   */
  async getImportList(id: number) {
    return RadarrApi.getApiV3ImportlistById({ path: { id } });
  }

  /**
   * Add a new import list
   */
  async addImportList(importList: ImportListResource) {
    return RadarrApi.postApiV3Importlist({ body: importList });
  }

  /**
   * Update an existing import list
   */
  async updateImportList(id: number, importList: ImportListResource) {
    return RadarrApi.putApiV3ImportlistById({ path: { id }, body: importList });
  }

  /**
   * Delete an import list
   */
  async deleteImportList(id: number) {
    return RadarrApi.deleteApiV3ImportlistById({ path: { id } });
  }

  /**
   * Get import list schema for available list types
   */
  async getImportListSchema() {
    return RadarrApi.getApiV3ImportlistSchema();
  }

  /**
   * Test an import list configuration
   */
  async testImportList(importList: ImportListResource) {
    return RadarrApi.postApiV3ImportlistTest({ body: importList });
  }

  /**
   * Test all import lists
   */
  async testAllImportLists() {
    return RadarrApi.postApiV3ImportlistTestall();
  }

  // Indexer APIs

  /**
   * Get all indexers
   */
  async getIndexers() {
    return RadarrApi.getApiV3Indexer();
  }

  /**
   * Get a specific indexer by ID
   */
  async getIndexer(id: number) {
    return RadarrApi.getApiV3IndexerById({ path: { id } });
  }

  /**
   * Add a new indexer
   */
  async addIndexer(indexer: IndexerResource) {
    return RadarrApi.postApiV3Indexer({ body: indexer });
  }

  /**
   * Update an existing indexer
   */
  async updateIndexer(id: number, indexer: IndexerResource) {
    return RadarrApi.putApiV3IndexerById({ path: { id }, body: indexer });
  }

  /**
   * Delete an indexer
   */
  async deleteIndexer(id: number) {
    return RadarrApi.deleteApiV3IndexerById({ path: { id } });
  }

  /**
   * Get indexer schema for available indexer types
   */
  async getIndexerSchema() {
    return RadarrApi.getApiV3IndexerSchema();
  }

  /**
   * Test an indexer configuration
   */
  async testIndexer(indexer: IndexerResource) {
    return RadarrApi.postApiV3IndexerTest({ body: indexer });
  }

  /**
   * Test all indexers
   */
  async testAllIndexers() {
    return RadarrApi.postApiV3IndexerTestall();
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
    movieId?: number
  ) {
    const query: Record<string, any> = {};
    if (page !== undefined) query.page = page;
    if (pageSize !== undefined) query.pageSize = pageSize;
    if (sortKey) query.sortKey = sortKey;
    if (sortDirection) query.sortDirection = sortDirection;
    if (movieId !== undefined) query.movieId = movieId;

    return RadarrApi.getApiV3History(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get history since a specific date
   */
  async getHistorySince(date: string, movieId?: number) {
    const query: any = { date };
    if (movieId !== undefined) query.movieId = movieId;

    return RadarrApi.getApiV3HistorySince({ query });
  }

  /**
   * Get history for a specific movie
   */
  async getMovieHistory(movieId: number, eventType?: any) {
    const query: any = { movieId };
    if (eventType !== undefined) query.eventType = eventType;

    return RadarrApi.getApiV3HistoryMovie({ query });
  }

  /**
   * Mark a failed download as failed in history
   */
  async markHistoryItemFailed(id: number) {
    return RadarrApi.postApiV3HistoryFailedById({ path: { id } });
  }

  // Configuration Management APIs

  /**
   * Get host configuration settings
   */
  async getHostConfig() {
    return RadarrApi.getApiV3ConfigHost();
  }

  /**
   * Get host configuration by ID
   */
  async getHostConfigById(id: number) {
    return RadarrApi.getApiV3ConfigHostById({ path: { id } });
  }

  /**
   * Update host configuration
   */
  async updateHostConfig(id: number, config: HostConfigResource) {
    return RadarrApi.putApiV3ConfigHostById({ path: { id: String(id) }, body: config });
  }

  /**
   * Get naming configuration settings
   */
  async getNamingConfig() {
    return RadarrApi.getApiV3ConfigNaming();
  }

  /**
   * Get naming configuration by ID
   */
  async getNamingConfigById(id: number) {
    return RadarrApi.getApiV3ConfigNamingById({ path: { id } });
  }

  /**
   * Update naming configuration
   */
  async updateNamingConfig(id: number, config: NamingConfigResource) {
    return RadarrApi.putApiV3ConfigNamingById({ path: { id: String(id) }, body: config });
  }

  /**
   * Get naming configuration examples
   */
  async getNamingConfigExamples() {
    return RadarrApi.getApiV3ConfigNamingExamples();
  }

  /**
   * Get media management configuration settings
   */
  async getMediaManagementConfig() {
    return RadarrApi.getApiV3ConfigMediamanagement();
  }

  /**
   * Get media management configuration by ID
   */
  async getMediaManagementConfigById(id: number) {
    return RadarrApi.getApiV3ConfigMediamanagementById({ path: { id } });
  }

  /**
   * Update media management configuration
   */
  async updateMediaManagementConfig(id: number, config: MediaManagementConfigResource) {
    return RadarrApi.putApiV3ConfigMediamanagementById({ path: { id: String(id) }, body: config });
  }

  /**
   * Get UI configuration settings
   */
  async getUiConfig() {
    return RadarrApi.getApiV3ConfigUi();
  }

  /**
   * Get UI configuration by ID
   */
  async getUiConfigById(id: number) {
    return RadarrApi.getApiV3ConfigUiById({ path: { id } });
  }

  /**
   * Update UI configuration
   */
  async updateUiConfig(id: number, config: UiConfigResource) {
    return RadarrApi.putApiV3ConfigUiById({ path: { id: String(id) }, body: config });
  }

  // System Administration APIs

  /**
   * Restart the Radarr application
   */
  async restartSystem() {
    return RadarrApi.postApiV3SystemRestart();
  }

  /**
   * Shutdown the Radarr application
   */
  async shutdownSystem() {
    return RadarrApi.postApiV3SystemShutdown();
  }

  /**
   * Get system backup files
   */
  async getSystemBackups() {
    return RadarrApi.getApiV3SystemBackup();
  }

  /**
   * Delete a system backup by ID
   */
  async deleteSystemBackup(id: number) {
    return RadarrApi.deleteApiV3SystemBackupById({ path: { id } });
  }

  /**
   * Restore system backup by ID
   */
  async restoreSystemBackup(id: number) {
    return RadarrApi.postApiV3SystemBackupRestoreById({ path: { id } });
  }

  /**
   * Upload and restore system backup
   */
  async uploadSystemBackup() {
    return RadarrApi.postApiV3SystemBackupRestoreUpload();
  }

  /**
   * Get system logs
   */
  async getSystemLogs() {
    return RadarrApi.getApiV3Log();
  }

  /**
   * Get log files
   */
  async getLogFiles() {
    return RadarrApi.getApiV3LogFile();
  }

  /**
   * Get specific log file by filename
   */
  async getLogFileByName(filename: string) {
    return RadarrApi.getApiV3LogFileByFilename({ path: { filename } });
  }

  /**
   * Get disk space information
   */
  async getDiskSpace() {
    return RadarrApi.getApiV3Diskspace();
  }

  // Tag Management APIs

  /**
   * Get all tags
   */
  async getTags() {
    return RadarrApi.getApiV3Tag();
  }

  /**
   * Add a new tag
   */
  async addTag(tag: TagResource) {
    return RadarrApi.postApiV3Tag({ body: tag });
  }

  /**
   * Get a specific tag by ID
   */
  async getTag(id: number) {
    return RadarrApi.getApiV3TagById({ path: { id } });
  }

  /**
   * Update an existing tag
   */
  async updateTag(id: number, tag: TagResource) {
    return RadarrApi.putApiV3TagById({ path: { id: String(id) }, body: tag });
  }

  /**
   * Delete a tag
   */
  async deleteTag(id: number) {
    return RadarrApi.deleteApiV3TagById({ path: { id } });
  }

  /**
   * Get detailed tag information
   */
  async getTagDetails() {
    return RadarrApi.getApiV3TagDetail();
  }

  /**
   * Get detailed tag information by ID
   */
  async getTagDetailById(id: number) {
    return RadarrApi.getApiV3TagDetailById({ path: { id } });
  }

  // Update configuration
  updateConfig(newConfig: Partial<ServarrClientConfig>) {
    const updatedConfig = { ...this.clientConfig.config, ...newConfig };
    this.clientConfig = createServarrClient(updatedConfig);

    return this.clientConfig.config;
  }
}

// Re-export types for external consumption
export * from './radarr-types.js';
