import { createServarrClient } from '../core/client.js';
import type { ServarrClientConfig } from '../core/types.js';
import { client as readarrClient } from '../generated/readarr/client.gen.js';
import * as ReadarrApi from '../generated/readarr/index.js';
import type {
  AuthorResource,
  BookResource,
  CommandResource,
  CustomFormatResource,
  DevelopmentConfigResource,
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
} from '../generated/readarr/types.gen.js';

/**
 * Readarr API client for book management
 *
 * @example
 * ```typescript
 * const readarr = new ReadarrClient({
 *   baseUrl: 'http://localhost:8787',
 *   apiKey: 'your-api-key'
 * });
 *
 * const authors = await readarr.getAuthors();
 * ```
 */
export class ReadarrClient {
  private clientConfig: ReturnType<typeof createServarrClient>;

  constructor(config: ServarrClientConfig) {
    this.clientConfig = createServarrClient(config);

    // Configure the raw client for manual endpoints
    readarrClient.setConfig({
      baseUrl: this.clientConfig.getBaseUrl(),
      headers: this.clientConfig.getHeaders(),
    });
  }

  // System APIs
  async getSystemStatus() {
    return ReadarrApi.getApiV1SystemStatus();
  }

  async getHealth() {
    return ReadarrApi.getApiV1Health();
  }

  // Author APIs

  /**
   * Get all authors in the library
   */
  async getAuthors() {
    return ReadarrApi.getApiV1Author();
  }

  async getAuthor(id: number) {
    return ReadarrApi.getApiV1AuthorById({ path: { id } });
  }

  async addAuthor(author: AuthorResource) {
    return ReadarrApi.postApiV1Author({ body: author });
  }

  async updateAuthor(id: number, author: AuthorResource) {
    return ReadarrApi.putApiV1AuthorById({ path: { id: String(id) }, body: author });
  }

  async deleteAuthor(id: number) {
    return ReadarrApi.deleteApiV1AuthorById({ path: { id } });
  }

  // Book APIs
  async getBooks() {
    return ReadarrApi.getApiV1Book();
  }

  async getBook(id: number) {
    return ReadarrApi.getApiV1BookById({ path: { id } });
  }

  // Search APIs

  /**
   * Search for authors using Goodreads database
   */
  async searchAuthors(term: string) {
    return ReadarrApi.getApiV1AuthorLookup({ query: { term } });
  }

  // Command APIs
  async runCommand(command: CommandResource) {
    return ReadarrApi.postApiV1Command({ body: command });
  }

  async getCommands() {
    return ReadarrApi.getApiV1Command();
  }

  // Root folder APIs
  async getRootFolders() {
    return ReadarrApi.getApiV1Rootfolder();
  }

  async addRootFolder(path: string) {
    return ReadarrApi.postApiV1Rootfolder({
      body: { path },
    });
  }

  // Configuration Management APIs

  /**
   * Get host configuration settings
   */
  async getHostConfig() {
    return ReadarrApi.getApiV1ConfigHost();
  }

  /**
   * Get host configuration by ID
   */
  async getHostConfigById(id: number) {
    return ReadarrApi.getApiV1ConfigHostById({ path: { id } });
  }

  /**
   * Update host configuration
   */
  async updateHostConfig(id: number, config: HostConfigResource) {
    return ReadarrApi.putApiV1ConfigHostById({ path: { id: String(id) }, body: config });
  }

  /**
   * Get naming configuration settings
   */
  async getNamingConfig() {
    return ReadarrApi.getApiV1ConfigNaming();
  }

  /**
   * Get naming configuration by ID
   */
  async getNamingConfigById(id: number) {
    return ReadarrApi.getApiV1ConfigNamingById({ path: { id } });
  }

  /**
   * Update naming configuration
   */
  async updateNamingConfig(id: number, config: NamingConfigResource) {
    return ReadarrApi.putApiV1ConfigNamingById({ path: { id: String(id) }, body: config });
  }

  /**
   * Get naming configuration examples
   */
  async getNamingConfigExamples() {
    return ReadarrApi.getApiV1ConfigNamingExamples();
  }

  /**
   * Get media management configuration settings
   */
  async getMediaManagementConfig() {
    return ReadarrApi.getApiV1ConfigMediamanagement();
  }

  /**
   * Get media management configuration by ID
   */
  async getMediaManagementConfigById(id: number) {
    return ReadarrApi.getApiV1ConfigMediamanagementById({ path: { id } });
  }

  /**
   * Update media management configuration
   */
  async updateMediaManagementConfig(id: number, config: MediaManagementConfigResource) {
    return ReadarrApi.putApiV1ConfigMediamanagementById({ path: { id: String(id) }, body: config });
  }

  /**
   * Get UI configuration settings
   */
  async getUiConfig() {
    return ReadarrApi.getApiV1ConfigUi();
  }

  /**
   * Get UI configuration by ID
   */
  async getUiConfigById(id: number) {
    return ReadarrApi.getApiV1ConfigUiById({ path: { id } });
  }

  /**
   * Update UI configuration
   */
  async updateUiConfig(id: number, config: UiConfigResource) {
    return ReadarrApi.putApiV1ConfigUiById({ path: { id: String(id) }, body: config });
  }

  /**
   * Get development configuration settings
   */
  async getDevelopmentConfig() {
    return ReadarrApi.getApiV1ConfigDevelopment();
  }

  /**
   * Get development configuration by ID
   */
  async getDevelopmentConfigById(id: number) {
    return ReadarrApi.getApiV1ConfigDevelopmentById({ path: { id } });
  }

  /**
   * Update development configuration
   */
  async updateDevelopmentConfig(id: number, config: DevelopmentConfigResource) {
    return ReadarrApi.putApiV1ConfigDevelopmentById({ path: { id: String(id) }, body: config });
  }

  /**
   * Get metadata provider configuration settings
   */
  async getMetadataProviderConfig() {
    return ReadarrApi.getApiV1ConfigMetadataprovider();
  }

  /**
   * Get metadata provider configuration by ID
   */
  async getMetadataProviderConfigById(id: number) {
    return ReadarrApi.getApiV1ConfigMetadataproviderById({ path: { id } });
  }

  /**
   * Update metadata provider configuration
   */
  async updateMetadataProviderConfig(id: number, config: MetadataProviderConfigResource) {
    return ReadarrApi.putApiV1ConfigMetadataproviderById({
      path: { id: String(id) },
      body: config,
    });
  }

  // System Administration APIs

  /**
   * Restart the Readarr application
   */
  async restartSystem() {
    return ReadarrApi.postApiV1SystemRestart();
  }

  /**
   * Shutdown the Readarr application
   */
  async shutdownSystem() {
    return ReadarrApi.postApiV1SystemShutdown();
  }

  /**
   * Get system backup files
   */
  async getSystemBackups() {
    return ReadarrApi.getApiV1SystemBackup();
  }

  /**
   * Delete a system backup by ID
   */
  async deleteSystemBackup(id: number) {
    return ReadarrApi.deleteApiV1SystemBackupById({ path: { id } });
  }

  /**
   * Restore system backup by ID
   */
  async restoreSystemBackup(id: number) {
    return ReadarrApi.postApiV1SystemBackupRestoreById({ path: { id } });
  }

  /**
   * Upload and restore system backup
   */
  async uploadSystemBackup() {
    return ReadarrApi.postApiV1SystemBackupRestoreUpload();
  }

  /**
   * Get system logs
   */
  async getSystemLogs() {
    return ReadarrApi.getApiV1Log();
  }

  /**
   * Get log files
   */
  async getLogFiles() {
    return ReadarrApi.getApiV1LogFile();
  }

  /**
   * Get specific log file by filename
   */
  async getLogFileByName(filename: string) {
    return ReadarrApi.getApiV1LogFileByFilename({ path: { filename } });
  }

  /**
   * Get disk space information
   */
  async getDiskSpace() {
    return ReadarrApi.getApiV1Diskspace();
  }

  // Tag Management APIs

  /**
   * Get all tags
   */
  async getTags() {
    return ReadarrApi.getApiV1Tag();
  }

  /**
   * Add a new tag
   */
  async addTag(tag: TagResource) {
    return ReadarrApi.postApiV1Tag({ body: tag });
  }

  /**
   * Get a specific tag by ID
   */
  async getTag(id: number) {
    return ReadarrApi.getApiV1TagById({ path: { id } });
  }

  /**
   * Update an existing tag
   */
  async updateTag(id: number, tag: TagResource) {
    return ReadarrApi.putApiV1TagById({ path: { id: String(id) }, body: tag });
  }

  /**
   * Delete a tag
   */
  async deleteTag(id: number) {
    return ReadarrApi.deleteApiV1TagById({ path: { id } });
  }

  /**
   * Get detailed tag information
   */
  async getTagDetails() {
    return ReadarrApi.getApiV1TagDetail();
  }

  /**
   * Get detailed tag information by ID
   */
  async getTagDetailById(id: number) {
    return ReadarrApi.getApiV1TagDetailById({ path: { id } });
  }

  // Book Management APIs (Enhanced)

  /**
   * Add a new book
   */
  async addBook(book: BookResource) {
    return ReadarrApi.postApiV1Book({ body: book });
  }

  /**
   * Update an existing book
   */
  async updateBook(id: number, book: BookResource) {
    return ReadarrApi.putApiV1BookById({ path: { id: String(id) }, body: book });
  }

  /**
   * Delete a book
   */
  async deleteBook(id: number) {
    return ReadarrApi.deleteApiV1BookById({ path: { id } });
  }

  /**
   * Search for books
   */
  async searchBooks(term: string) {
    return ReadarrApi.getApiV1BookLookup({ query: { term } });
  }

  // Quality Profile APIs

  /**
   * Get all quality profiles
   */
  async getQualityProfiles() {
    return ReadarrApi.getApiV1Qualityprofile();
  }

  /**
   * Get a specific quality profile by ID
   */
  async getQualityProfile(id: number) {
    return ReadarrApi.getApiV1QualityprofileById({ path: { id } });
  }

  /**
   * Create a new quality profile
   */
  async addQualityProfile(profile: QualityProfileResource) {
    return ReadarrApi.postApiV1Qualityprofile({ body: profile });
  }

  /**
   * Update an existing quality profile
   */
  async updateQualityProfile(id: number, profile: QualityProfileResource) {
    return ReadarrApi.putApiV1QualityprofileById({ path: { id: String(id) }, body: profile });
  }

  /**
   * Delete a quality profile
   */
  async deleteQualityProfile(id: number) {
    return ReadarrApi.deleteApiV1QualityprofileById({ path: { id } });
  }

  /**
   * Get quality profile schema
   */
  async getQualityProfileSchema() {
    return ReadarrApi.getApiV1QualityprofileSchema();
  }

  // Custom Format APIs

  /**
   * Get all custom formats
   */
  async getCustomFormats() {
    return ReadarrApi.getApiV1Customformat();
  }

  /**
   * Get a specific custom format by ID
   */
  async getCustomFormat(id: number) {
    return ReadarrApi.getApiV1CustomformatById({ path: { id } });
  }

  /**
   * Create a new custom format
   */
  async addCustomFormat(format: CustomFormatResource) {
    return ReadarrApi.postApiV1Customformat({ body: format });
  }

  /**
   * Update an existing custom format
   */
  async updateCustomFormat(id: number, format: CustomFormatResource) {
    return ReadarrApi.putApiV1CustomformatById({ path: { id: String(id) }, body: format });
  }

  /**
   * Delete a custom format
   */
  async deleteCustomFormat(id: number) {
    return ReadarrApi.deleteApiV1CustomformatById({ path: { id } });
  }

  /**
   * Get custom format schema
   */
  async getCustomFormatSchema() {
    return ReadarrApi.getApiV1CustomformatSchema();
  }

  // Download Client APIs

  /**
   * Get all download clients
   */
  async getDownloadClients() {
    return ReadarrApi.getApiV1Downloadclient();
  }

  /**
   * Get a specific download client by ID
   */
  async getDownloadClient(id: number) {
    return ReadarrApi.getApiV1DownloadclientById({ path: { id } });
  }

  /**
   * Add a new download client
   */
  async addDownloadClient(client: DownloadClientResource) {
    return ReadarrApi.postApiV1Downloadclient({ body: client });
  }

  /**
   * Update an existing download client
   */
  async updateDownloadClient(id: number, client: DownloadClientResource) {
    return ReadarrApi.putApiV1DownloadclientById({ path: { id: String(id) }, body: client });
  }

  /**
   * Delete a download client
   */
  async deleteDownloadClient(id: number) {
    return ReadarrApi.deleteApiV1DownloadclientById({ path: { id } });
  }

  /**
   * Get download client schema for available client types
   */
  async getDownloadClientSchema() {
    return ReadarrApi.getApiV1DownloadclientSchema();
  }

  /**
   * Test a download client configuration
   */
  async testDownloadClient(client: DownloadClientResource) {
    return ReadarrApi.postApiV1DownloadclientTest({ body: client });
  }

  /**
   * Test all download clients
   */
  async testAllDownloadClients() {
    return ReadarrApi.postApiV1DownloadclientTestall();
  }

  // Indexer APIs

  /**
   * Get all indexers
   */
  async getIndexers() {
    return ReadarrApi.getApiV1Indexer();
  }

  /**
   * Get a specific indexer by ID
   */
  async getIndexer(id: number) {
    return ReadarrApi.getApiV1IndexerById({ path: { id } });
  }

  /**
   * Add a new indexer
   */
  async addIndexer(indexer: IndexerResource) {
    return ReadarrApi.postApiV1Indexer({ body: indexer });
  }

  /**
   * Update an existing indexer
   */
  async updateIndexer(id: number, indexer: IndexerResource) {
    return ReadarrApi.putApiV1IndexerById({ path: { id: String(id) }, body: indexer });
  }

  /**
   * Delete an indexer
   */
  async deleteIndexer(id: number) {
    return ReadarrApi.deleteApiV1IndexerById({ path: { id } });
  }

  /**
   * Get indexer schema for available indexer types
   */
  async getIndexerSchema() {
    return ReadarrApi.getApiV1IndexerSchema();
  }

  /**
   * Test an indexer configuration
   */
  async testIndexer(indexer: IndexerResource) {
    return ReadarrApi.postApiV1IndexerTest({ body: indexer });
  }

  /**
   * Test all indexers
   */
  async testAllIndexers() {
    return ReadarrApi.postApiV1IndexerTestall();
  }

  // Import List APIs

  /**
   * Get all import lists
   */
  async getImportLists() {
    return ReadarrApi.getApiV1Importlist();
  }

  /**
   * Get a specific import list by ID
   */
  async getImportList(id: number) {
    return ReadarrApi.getApiV1ImportlistById({ path: { id } });
  }

  /**
   * Add a new import list
   */
  async addImportList(importList: ImportListResource) {
    return ReadarrApi.postApiV1Importlist({ body: importList });
  }

  /**
   * Update an existing import list
   */
  async updateImportList(id: number, importList: ImportListResource) {
    return ReadarrApi.putApiV1ImportlistById({ path: { id: String(id) }, body: importList });
  }

  /**
   * Delete an import list
   */
  async deleteImportList(id: number) {
    return ReadarrApi.deleteApiV1ImportlistById({ path: { id } });
  }

  /**
   * Get import list schema for available list types
   */
  async getImportListSchema() {
    return ReadarrApi.getApiV1ImportlistSchema();
  }

  /**
   * Test an import list configuration
   */
  async testImportList(importList: ImportListResource) {
    return ReadarrApi.postApiV1ImportlistTest({ body: importList });
  }

  /**
   * Test all import lists
   */
  async testAllImportLists() {
    return ReadarrApi.postApiV1ImportlistTestall();
  }

  // Notification APIs

  /**
   * Get all notification providers
   */
  async getNotifications() {
    return ReadarrApi.getApiV1Notification();
  }

  /**
   * Get a specific notification provider by ID
   */
  async getNotification(id: number) {
    return ReadarrApi.getApiV1NotificationById({ path: { id } });
  }

  /**
   * Add a new notification provider
   */
  async addNotification(notification: NotificationResource) {
    return ReadarrApi.postApiV1Notification({ body: notification });
  }

  /**
   * Update an existing notification provider
   */
  async updateNotification(id: number, notification: NotificationResource) {
    return ReadarrApi.putApiV1NotificationById({ path: { id: String(id) }, body: notification });
  }

  /**
   * Delete a notification provider
   */
  async deleteNotification(id: number) {
    return ReadarrApi.deleteApiV1NotificationById({ path: { id } });
  }

  /**
   * Get notification schema for available notification types
   */
  async getNotificationSchema() {
    return ReadarrApi.getApiV1NotificationSchema();
  }

  /**
   * Test a notification configuration
   */
  async testNotification(notification: NotificationResource) {
    return ReadarrApi.postApiV1NotificationTest({ body: notification });
  }

  /**
   * Test all notifications
   */
  async testAllNotifications() {
    return ReadarrApi.postApiV1NotificationTestall();
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
    authorId?: number,
    downloadId?: string
  ) {
    const query: Record<string, any> = {};
    if (page !== undefined) query.page = page;
    if (pageSize !== undefined) query.pageSize = pageSize;
    if (sortKey) query.sortKey = sortKey;
    if (sortDirection) query.sortDirection = sortDirection;
    if (authorId !== undefined) query.authorId = authorId;
    if (downloadId) query.downloadId = downloadId;

    return ReadarrApi.getApiV1History(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get history since a specific date
   */
  async getHistorySince(date: string, authorId?: number) {
    const query: any = { date };
    if (authorId !== undefined) query.authorId = authorId;

    return ReadarrApi.getApiV1HistorySince({ query });
  }

  /**
   * Get history for a specific author
   */
  async getAuthorHistory(authorId: number, bookId?: number, eventType?: any) {
    const query: any = { authorId };
    if (bookId !== undefined) query.bookId = bookId;
    if (eventType !== undefined) query.eventType = eventType;

    return ReadarrApi.getApiV1HistoryAuthor({ query });
  }

  /**
   * Mark a failed download as failed in history
   */
  async markHistoryItemFailed(id: number) {
    return ReadarrApi.postApiV1HistoryFailedById({ path: { id } });
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
    includeUnknownAuthorItems?: boolean
  ) {
    const query: Record<string, any> = {};
    if (page !== undefined) query.page = page;
    if (pageSize !== undefined) query.pageSize = pageSize;
    if (sortKey) query.sortKey = sortKey;
    if (sortDirection) query.sortDirection = sortDirection;
    if (includeUnknownAuthorItems !== undefined)
      query.includeUnknownAuthorItems = includeUnknownAuthorItems;

    return ReadarrApi.getApiV1Queue(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Remove an item from the download queue
   */
  async removeQueueItem(id: number, removeFromClient?: boolean, blocklist?: boolean) {
    const query: Record<string, any> = {};
    if (removeFromClient !== undefined) query.removeFromClient = removeFromClient;
    if (blocklist !== undefined) query.blocklist = blocklist;

    return ReadarrApi.deleteApiV1QueueById({
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

    return ReadarrApi.deleteApiV1QueueBulk({
      body: { ids },
      ...(Object.keys(query).length > 0 ? { query } : {}),
    });
  }

  /**
   * Force grab a queue item
   */
  async grabQueueItem(id: number) {
    return ReadarrApi.postApiV1QueueGrabById({ path: { id } });
  }

  /**
   * Force grab multiple queue items
   */
  async grabQueueItemsBulk(ids: number[]) {
    return ReadarrApi.postApiV1QueueGrabBulk({ body: { ids } });
  }

  /**
   * Get detailed queue information
   */
  async getQueueDetails(authorId?: number, includeUnknownAuthorItems?: boolean) {
    const query: Record<string, any> = {};
    if (authorId !== undefined) query.authorId = authorId;
    if (includeUnknownAuthorItems !== undefined)
      query.includeUnknownAuthorItems = includeUnknownAuthorItems;

    return ReadarrApi.getApiV1QueueDetails(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get queue status summary
   */
  async getQueueStatus() {
    return ReadarrApi.getApiV1QueueStatus();
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

    return ReadarrApi.getApiV1Blocklist(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Remove a release from the blocklist
   */
  async removeBlocklistItem(id: number) {
    return ReadarrApi.deleteApiV1BlocklistById({ path: { id } });
  }

  /**
   * Bulk remove releases from the blocklist
   */
  async removeBlocklistItemsBulk(ids: number[]) {
    return ReadarrApi.deleteApiV1BlocklistBulk({ body: { ids } });
  }

  updateConfig(newConfig: Partial<ServarrClientConfig>) {
    const updatedConfig = { ...this.clientConfig.config, ...newConfig };
    this.clientConfig = createServarrClient(updatedConfig);

    return this.clientConfig.config;
  }
}

// Re-export types for external consumption
export * from './readarr-types.js';
