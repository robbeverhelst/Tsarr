import { ServarrBaseClient, type ServarrOps } from '../clients/base';
import { client as readarrClient } from '../generated/readarr/client.gen';
import * as ReadarrApi from '../generated/readarr/index';
import type {
  AuthorResourceWritable,
  BookFileListResource,
  BookFileResourceWritable,
  BookResource,
  CustomFormatResource,
  DevelopmentConfigResource,
  ImportListResource,
  MediaManagementConfigResource,
  MetadataProviderConfigResource,
  NamingConfigResource,
  QualityProfileResource,
} from '../generated/readarr/types.gen';

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
export class ReadarrClient extends ServarrBaseClient {
  protected readonly ops: ServarrOps = {
    // System
    getSystemStatus: ReadarrApi.getApiV1SystemStatus,
    getHealth: ReadarrApi.getApiV1Health,

    // Tags
    getTags: ReadarrApi.getApiV1Tag,
    createTag: ReadarrApi.postApiV1Tag,
    getTagById: ReadarrApi.getApiV1TagById,
    updateTagById: ReadarrApi.putApiV1TagById,
    deleteTagById: ReadarrApi.deleteApiV1TagById,
    getTagDetails: ReadarrApi.getApiV1TagDetail,
    getTagDetailById: ReadarrApi.getApiV1TagDetailById,

    // Notifications
    getNotifications: ReadarrApi.getApiV1Notification,
    createNotification: ReadarrApi.postApiV1Notification,
    getNotificationById: ReadarrApi.getApiV1NotificationById,
    updateNotificationById: ReadarrApi.putApiV1NotificationById,
    deleteNotificationById: ReadarrApi.deleteApiV1NotificationById,
    getNotificationSchema: ReadarrApi.getApiV1NotificationSchema,
    testNotification: ReadarrApi.postApiV1NotificationTest,
    testAllNotifications: ReadarrApi.postApiV1NotificationTestall,

    // Download Clients
    getDownloadClients: ReadarrApi.getApiV1Downloadclient,
    createDownloadClient: ReadarrApi.postApiV1Downloadclient,
    getDownloadClientById: ReadarrApi.getApiV1DownloadclientById,
    updateDownloadClientById: ReadarrApi.putApiV1DownloadclientById,
    deleteDownloadClientById: ReadarrApi.deleteApiV1DownloadclientById,
    getDownloadClientSchema: ReadarrApi.getApiV1DownloadclientSchema,
    testDownloadClient: ReadarrApi.postApiV1DownloadclientTest,
    testAllDownloadClients: ReadarrApi.postApiV1DownloadclientTestall,

    // Indexers
    getIndexers: ReadarrApi.getApiV1Indexer,
    createIndexer: ReadarrApi.postApiV1Indexer,
    getIndexerById: ReadarrApi.getApiV1IndexerById,
    updateIndexerById: ReadarrApi.putApiV1IndexerById,
    deleteIndexerById: ReadarrApi.deleteApiV1IndexerById,
    getIndexerSchema: ReadarrApi.getApiV1IndexerSchema,
    testIndexer: ReadarrApi.postApiV1IndexerTest,
    testAllIndexers: ReadarrApi.postApiV1IndexerTestall,

    // System Admin
    restartSystem: ReadarrApi.postApiV1SystemRestart,
    shutdownSystem: ReadarrApi.postApiV1SystemShutdown,
    getBackups: ReadarrApi.getApiV1SystemBackup,
    deleteBackup: ReadarrApi.deleteApiV1SystemBackupById,
    restoreBackup: ReadarrApi.postApiV1SystemBackupRestoreById,
    uploadBackup: ReadarrApi.postApiV1SystemBackupRestoreUpload,
    getLogFiles: ReadarrApi.getApiV1LogFile,
    getLogFileByName: ReadarrApi.getApiV1LogFileByFilename,

    // Commands
    runCommand: ReadarrApi.postApiV1Command,
    getCommands: ReadarrApi.getApiV1Command,

    // Host Config
    getHostConfig: ReadarrApi.getApiV1ConfigHost,
    getHostConfigById: ReadarrApi.getApiV1ConfigHostById,
    updateHostConfig: ReadarrApi.putApiV1ConfigHostById,

    // UI Config
    getUiConfig: ReadarrApi.getApiV1ConfigUi,
    getUiConfigById: ReadarrApi.getApiV1ConfigUiById,
    updateUiConfig: ReadarrApi.putApiV1ConfigUiById,
  };

  protected configureRawClient(): void {
    readarrClient.setConfig({
      baseUrl: this.clientConfig.getBaseUrl(),
      headers: this.clientConfig.getHeaders(),
      signal: AbortSignal.timeout(this.clientConfig.getTimeout()),
    });
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

  async addAuthor(author: AuthorResourceWritable) {
    return ReadarrApi.postApiV1Author({ body: author });
  }

  async updateAuthor(id: number, author: AuthorResourceWritable) {
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

  // Root folder APIs
  async getRootFolders() {
    return ReadarrApi.getApiV1Rootfolder();
  }

  async addRootFolder(path: string) {
    return ReadarrApi.postApiV1Rootfolder({
      body: { path },
    });
  }

  async deleteRootFolder(id: number) {
    return ReadarrApi.deleteApiV1RootfolderById({ path: { id } });
  }

  // Configuration Management APIs

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

  /**
   * Get system logs
   */
  async getSystemLogs() {
    return ReadarrApi.getApiV1Log();
  }

  /**
   * Get disk space information
   */
  async getDiskSpace() {
    return ReadarrApi.getApiV1Diskspace();
  }

  // Book Management APIs (Enhanced)

  /**
   * Add a new book
   */
  async addBook(book: BookResource) {
    return ReadarrApi.postApiV1Book({ body: book as never });
  }

  /**
   * Update an existing book
   */
  async updateBook(id: number, book: BookResource) {
    return ReadarrApi.putApiV1BookById({ path: { id: String(id) }, body: book as never });
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

  // Calendar APIs
  async getCalendar(start?: string, end?: string, unmonitored?: boolean) {
    const query: Record<string, any> = { includeAuthor: true };
    if (start) query.start = start;
    if (end) query.end = end;
    if (unmonitored !== undefined) query.unmonitored = unmonitored;

    return ReadarrApi.getApiV1Calendar(Object.keys(query).length > 0 ? { query } : {});
  }

  async getCalendarFeed(pastDays?: number, futureDays?: number, tagList?: string) {
    const query: Record<string, any> = {};
    if (pastDays !== undefined) query.pastDays = pastDays;
    if (futureDays !== undefined) query.futureDays = futureDays;
    if (tagList) query.tagList = tagList;

    return ReadarrApi.getFeedV1CalendarReadarrIcs(Object.keys(query).length > 0 ? { query } : {});
  }

  // Book File APIs

  /**
   * Get book files by author, book, or specific file IDs
   */
  async getBookFiles(
    authorId?: number,
    bookFileIds?: number[],
    bookId?: number[],
    unmapped?: boolean
  ) {
    const query: Record<string, any> = {};
    if (authorId !== undefined) query.authorId = authorId;
    if (bookFileIds !== undefined) query.bookFileIds = bookFileIds;
    if (bookId !== undefined) query.bookId = bookId;
    if (unmapped !== undefined) query.unmapped = unmapped;

    return ReadarrApi.getApiV1Bookfile(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get a specific book file by ID
   */
  async getBookFile(id: number) {
    return ReadarrApi.getApiV1BookfileById({ path: { id } });
  }

  /**
   * Update a book file
   */
  async updateBookFile(id: string, bookFile: BookFileResourceWritable) {
    return ReadarrApi.putApiV1BookfileById({ path: { id }, body: bookFile });
  }

  /**
   * Delete a book file from disk
   */
  async deleteBookFile(id: number) {
    return ReadarrApi.deleteApiV1BookfileById({ path: { id } });
  }

  /**
   * Bulk update book files using the editor endpoint
   */
  async updateBookFilesEditor(bookFileList: BookFileListResource) {
    return ReadarrApi.putApiV1BookfileEditor({ body: bookFileList });
  }

  /**
   * Bulk delete book files
   */
  async deleteBookFilesBulk(bookFileList: BookFileListResource) {
    return ReadarrApi.deleteApiV1BookfileBulk({ body: bookFileList });
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

  /**
   * Get books with missing files
   */
  async getWantedMissing(
    page?: number,
    pageSize?: number,
    sortKey?: string,
    sortDirection?: string,
    monitored?: boolean
  ) {
    const query: Record<string, any> = { includeAuthor: true };
    if (page !== undefined) query.page = page;
    if (pageSize !== undefined) query.pageSize = pageSize;
    if (sortKey) query.sortKey = sortKey;
    if (sortDirection) query.sortDirection = sortDirection;
    if (monitored !== undefined) query.monitored = monitored;

    return ReadarrApi.getApiV1WantedMissing(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get books below cutoff quality
   */
  async getWantedCutoff(
    page?: number,
    pageSize?: number,
    sortKey?: string,
    sortDirection?: string,
    monitored?: boolean
  ) {
    const query: Record<string, any> = { includeAuthor: true };
    if (page !== undefined) query.page = page;
    if (pageSize !== undefined) query.pageSize = pageSize;
    if (sortKey) query.sortKey = sortKey;
    if (sortDirection) query.sortDirection = sortDirection;
    if (monitored !== undefined) query.monitored = monitored;

    return ReadarrApi.getApiV1WantedCutoff(Object.keys(query).length > 0 ? { query } : {});
  }
}

// Re-export types for external consumption
export * from './readarr-types.js';
