import { ServarrBaseClient, type ServarrOps } from '../clients/base';
import { bindApiClient } from '../core/bind-api';
import type { ServarrClientConfig } from '../core/types';
import { createClient, createConfig } from '../generated/readarr/client';
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
  /** Own client instance — never the generated module singleton. See bindApiClient. */
  private readonly api = bindApiClient(ReadarrApi, this.rawClient);

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

  // Author APIs

  /**
   * Get all authors in the library
   */
  async getAuthors() {
    return this.api.getApiV1Author();
  }

  async getAuthor(id: number) {
    return this.api.getApiV1AuthorById({ path: { id } });
  }

  async addAuthor(author: AuthorResourceWritable) {
    return this.api.postApiV1Author({ body: author });
  }

  async updateAuthor(id: number, author: AuthorResourceWritable) {
    return this.api.putApiV1AuthorById({ path: { id: String(id) }, body: author });
  }

  async deleteAuthor(id: number) {
    return this.api.deleteApiV1AuthorById({ path: { id } });
  }

  // Book APIs
  async getBooks() {
    return this.api.getApiV1Book();
  }

  async getBook(id: number) {
    return this.api.getApiV1BookById({ path: { id } });
  }

  // Search APIs

  /**
   * Search for authors using Goodreads database
   */
  async searchAuthors(term: string) {
    return this.api.getApiV1AuthorLookup({ query: { term } });
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
   * Get development configuration settings
   */
  async getDevelopmentConfig() {
    return this.api.getApiV1ConfigDevelopment();
  }

  /**
   * Get development configuration by ID
   */
  async getDevelopmentConfigById(id: number) {
    return this.api.getApiV1ConfigDevelopmentById({ path: { id } });
  }

  /**
   * Update development configuration
   */
  async updateDevelopmentConfig(id: number, config: DevelopmentConfigResource) {
    return this.api.putApiV1ConfigDevelopmentById({ path: { id: String(id) }, body: config });
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
    return this.api.putApiV1ConfigMetadataproviderById({
      path: { id: String(id) },
      body: config,
    });
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

  // Book Management APIs (Enhanced)

  /**
   * Add a new book
   */
  async addBook(book: BookResource) {
    return this.api.postApiV1Book({ body: book as never });
  }

  /**
   * Update an existing book
   */
  async updateBook(id: number, book: BookResource) {
    return this.api.putApiV1BookById({ path: { id: String(id) }, body: book as never });
  }

  /**
   * Delete a book
   */
  async deleteBook(id: number) {
    return this.api.deleteApiV1BookById({ path: { id } });
  }

  /**
   * Search for books
   */
  async searchBooks(term: string) {
    return this.api.getApiV1BookLookup({ query: { term } });
  }

  // Calendar APIs
  async getCalendar(start?: string, end?: string, unmonitored?: boolean) {
    const query: Record<string, any> = { includeAuthor: true };
    if (start) query.start = start;
    if (end) query.end = end;
    if (unmonitored !== undefined) query.unmonitored = unmonitored;

    return this.api.getApiV1Calendar(Object.keys(query).length > 0 ? { query } : {});
  }

  async getCalendarFeed(pastDays?: number, futureDays?: number, tagList?: string) {
    const query: Record<string, any> = {};
    if (pastDays !== undefined) query.pastDays = pastDays;
    if (futureDays !== undefined) query.futureDays = futureDays;
    if (tagList) query.tagList = tagList;

    return this.api.getFeedV1CalendarReadarrIcs(Object.keys(query).length > 0 ? { query } : {});
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

    return this.api.getApiV1Bookfile(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get a specific book file by ID
   */
  async getBookFile(id: number) {
    return this.api.getApiV1BookfileById({ path: { id } });
  }

  /**
   * Update a book file
   */
  async updateBookFile(id: string, bookFile: BookFileResourceWritable) {
    return this.api.putApiV1BookfileById({ path: { id }, body: bookFile });
  }

  /**
   * Delete a book file from disk
   */
  async deleteBookFile(id: number) {
    return this.api.deleteApiV1BookfileById({ path: { id } });
  }

  /**
   * Bulk update book files using the editor endpoint
   */
  async updateBookFilesEditor(bookFileList: BookFileListResource) {
    return this.api.putApiV1BookfileEditor({ body: bookFileList });
  }

  /**
   * Bulk delete book files
   */
  async deleteBookFilesBulk(bookFileList: BookFileListResource) {
    return this.api.deleteApiV1BookfileBulk({ body: bookFileList });
  }

  // Quality Profile APIs

  /**
   * Get all quality profiles
   */
  async getQualityProfiles() {
    return this.api.getApiV1Qualityprofile();
  }

  /**
   * Get a specific quality profile by ID
   */
  async getQualityProfile(id: number) {
    return this.api.getApiV1QualityprofileById({ path: { id } });
  }

  /**
   * Create a new quality profile
   */
  async addQualityProfile(profile: QualityProfileResource) {
    return this.api.postApiV1Qualityprofile({ body: profile });
  }

  /**
   * Update an existing quality profile
   */
  async updateQualityProfile(id: number, profile: QualityProfileResource) {
    return this.api.putApiV1QualityprofileById({ path: { id: String(id) }, body: profile });
  }

  /**
   * Delete a quality profile
   */
  async deleteQualityProfile(id: number) {
    return this.api.deleteApiV1QualityprofileById({ path: { id } });
  }

  /**
   * Get quality profile schema
   */
  async getQualityProfileSchema() {
    return this.api.getApiV1QualityprofileSchema();
  }

  // Custom Format APIs

  /**
   * Get all custom formats
   */
  async getCustomFormats() {
    return this.api.getApiV1Customformat();
  }

  /**
   * Get a specific custom format by ID
   */
  async getCustomFormat(id: number) {
    return this.api.getApiV1CustomformatById({ path: { id } });
  }

  /**
   * Create a new custom format
   */
  async addCustomFormat(format: CustomFormatResource) {
    return this.api.postApiV1Customformat({ body: format });
  }

  /**
   * Update an existing custom format
   */
  async updateCustomFormat(id: number, format: CustomFormatResource) {
    return this.api.putApiV1CustomformatById({ path: { id: String(id) }, body: format });
  }

  /**
   * Delete a custom format
   */
  async deleteCustomFormat(id: number) {
    return this.api.deleteApiV1CustomformatById({ path: { id } });
  }

  /**
   * Get custom format schema
   */
  async getCustomFormatSchema() {
    return this.api.getApiV1CustomformatSchema();
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
    return this.api.putApiV1ImportlistById({ path: { id: String(id) }, body: importList });
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

    return this.api.getApiV1History(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get history since a specific date
   */
  async getHistorySince(date: string, authorId?: number) {
    const query: any = { date };
    if (authorId !== undefined) query.authorId = authorId;

    return this.api.getApiV1HistorySince({ query });
  }

  /**
   * Get history for a specific author
   */
  async getAuthorHistory(authorId: number, bookId?: number, eventType?: any) {
    const query: any = { authorId };
    if (bookId !== undefined) query.bookId = bookId;
    if (eventType !== undefined) query.eventType = eventType;

    return this.api.getApiV1HistoryAuthor({ query });
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
    includeUnknownAuthorItems?: boolean
  ) {
    const query: Record<string, any> = {};
    if (page !== undefined) query.page = page;
    if (pageSize !== undefined) query.pageSize = pageSize;
    if (sortKey) query.sortKey = sortKey;
    if (sortDirection) query.sortDirection = sortDirection;
    if (includeUnknownAuthorItems !== undefined)
      query.includeUnknownAuthorItems = includeUnknownAuthorItems;

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
  async getQueueDetails(authorId?: number, includeUnknownAuthorItems?: boolean) {
    const query: Record<string, any> = {};
    if (authorId !== undefined) query.authorId = authorId;
    if (includeUnknownAuthorItems !== undefined)
      query.includeUnknownAuthorItems = includeUnknownAuthorItems;

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

    return this.api.getApiV1WantedMissing(Object.keys(query).length > 0 ? { query } : {});
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

    return this.api.getApiV1WantedCutoff(Object.keys(query).length > 0 ? { query } : {});
  }
}

// Re-export types for external consumption
export * from './readarr-types.js';
