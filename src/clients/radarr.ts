import { ServarrBaseClient, type ServarrOps } from '../clients/base';
import { client as radarrClient } from '../generated/radarr/client.gen';
import * as RadarrApi from '../generated/radarr/index';
import type {
  CustomFormatBulkResource,
  CustomFormatResource,
  DownloadClientBulkResource,
  ImportListResource,
  MediaManagementConfigResource,
  MovieFileListResource,
  MovieFileResource,
  MovieResource,
  NamingConfigResource,
  QualityProfileResource,
} from '../generated/radarr/types.gen';

export class RadarrClient extends ServarrBaseClient {
  protected readonly ops: ServarrOps = {
    // System
    getSystemStatus: RadarrApi.getApiV3SystemStatus,
    getHealth: RadarrApi.getApiV3Health,

    // Tags
    getTags: RadarrApi.getApiV3Tag,
    createTag: RadarrApi.postApiV3Tag,
    getTagById: RadarrApi.getApiV3TagById,
    updateTagById: RadarrApi.putApiV3TagById,
    deleteTagById: RadarrApi.deleteApiV3TagById,
    getTagDetails: RadarrApi.getApiV3TagDetail,
    getTagDetailById: RadarrApi.getApiV3TagDetailById,

    // Notifications
    getNotifications: RadarrApi.getApiV3Notification,
    createNotification: RadarrApi.postApiV3Notification,
    getNotificationById: RadarrApi.getApiV3NotificationById,
    updateNotificationById: RadarrApi.putApiV3NotificationById,
    deleteNotificationById: RadarrApi.deleteApiV3NotificationById,
    getNotificationSchema: RadarrApi.getApiV3NotificationSchema,
    testNotification: RadarrApi.postApiV3NotificationTest,
    testAllNotifications: RadarrApi.postApiV3NotificationTestall,

    // Download Clients
    getDownloadClients: RadarrApi.getApiV3Downloadclient,
    createDownloadClient: RadarrApi.postApiV3Downloadclient,
    getDownloadClientById: RadarrApi.getApiV3DownloadclientById,
    updateDownloadClientById: RadarrApi.putApiV3DownloadclientById,
    deleteDownloadClientById: RadarrApi.deleteApiV3DownloadclientById,
    getDownloadClientSchema: RadarrApi.getApiV3DownloadclientSchema,
    testDownloadClient: RadarrApi.postApiV3DownloadclientTest,
    testAllDownloadClients: RadarrApi.postApiV3DownloadclientTestall,

    // Indexers
    getIndexers: RadarrApi.getApiV3Indexer,
    createIndexer: RadarrApi.postApiV3Indexer,
    getIndexerById: RadarrApi.getApiV3IndexerById,
    updateIndexerById: RadarrApi.putApiV3IndexerById,
    deleteIndexerById: RadarrApi.deleteApiV3IndexerById,
    getIndexerSchema: RadarrApi.getApiV3IndexerSchema,
    testIndexer: RadarrApi.postApiV3IndexerTest,
    testAllIndexers: RadarrApi.postApiV3IndexerTestall,

    // System Admin
    restartSystem: RadarrApi.postApiV3SystemRestart,
    shutdownSystem: RadarrApi.postApiV3SystemShutdown,
    getBackups: RadarrApi.getApiV3SystemBackup,
    deleteBackup: RadarrApi.deleteApiV3SystemBackupById,
    restoreBackup: RadarrApi.postApiV3SystemBackupRestoreById,
    uploadBackup: RadarrApi.postApiV3SystemBackupRestoreUpload,
    getLogFiles: RadarrApi.getApiV3LogFile,
    getLogFileByName: RadarrApi.getApiV3LogFileByFilename,

    // Commands
    runCommand: RadarrApi.postApiV3Command,
    getCommands: RadarrApi.getApiV3Command,

    // Host Config
    getHostConfig: RadarrApi.getApiV3ConfigHost,
    getHostConfigById: RadarrApi.getApiV3ConfigHostById,
    updateHostConfig: RadarrApi.putApiV3ConfigHostById,

    // UI Config
    getUiConfig: RadarrApi.getApiV3ConfigUi,
    getUiConfigById: RadarrApi.getApiV3ConfigUiById,
    updateUiConfig: RadarrApi.putApiV3ConfigUiById,
  };

  protected configureRawClient(): void {
    radarrClient.setConfig({
      baseUrl: this.clientConfig.getBaseUrl(),
      headers: this.clientConfig.getHeaders(),
      signal: AbortSignal.timeout(this.clientConfig.getTimeout()),
    });
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

  async deleteMovie(id: number, options?: { deleteFiles?: boolean; addImportExclusion?: boolean }) {
    return RadarrApi.deleteApiV3MovieById({
      path: { id },
      ...(options ? { query: options } : {}),
    });
  }

  // Search APIs

  /**
   * Search for movies using TMDB database
   */
  async searchMovies(term: string) {
    return RadarrApi.getApiV3MovieLookup({ query: { term } });
  }

  /**
   * Search for a movie by TMDB ID
   * @param tmdbId - The TMDB ID of the movie (e.g., 4247)
   * @returns Movie details from TMDB
   */
  async lookupMovieByTmdbId(tmdbId: number) {
    return RadarrApi.getApiV3MovieLookupTmdb({ query: { tmdbId } });
  }

  /**
   * Search for a movie by IMDB ID
   * @param imdbId - The IMDB ID of the movie (e.g., 'tt0175142')
   * @returns Movie details from IMDB
   */
  async lookupMovieByImdbId(imdbId: string) {
    return RadarrApi.getApiV3MovieLookupImdb({ query: { imdbId } });
  }

  /**
   * Search for a movie by external ID (TMDB or IMDB)
   * @param id - Format: 'tmdb:123' or 'imdb:tt0175142'
   * @returns Movie details from the specified provider
   * @throws Error if the ID format is invalid or values don't meet requirements
   * @example
   * ```typescript
   * // Lookup by TMDB ID
   * const movie = await radarr.lookupMovieById('tmdb:4247');
   *
   * // Lookup by IMDB ID
   * const movie = await radarr.lookupMovieById('imdb:tt0175142');
   * ```
   */
  async lookupMovieById(id: string) {
    // Verify the ID contains exactly one colon
    const parts = id.split(':');
    if (parts.length !== 2) {
      throw new Error(
        'Invalid ID format. Must contain exactly one colon. Use "tmdb:123" or "imdb:tt0175142"'
      );
    }

    const [providerRaw, value] = parts;

    // Verify both provider and value are non-empty
    if (!providerRaw || !value) {
      throw new Error(
        'Invalid ID format. Both provider and value must be non-empty. Use "tmdb:123" or "imdb:tt0175142"'
      );
    }

    // Normalize provider to lowercase and validate
    const provider = providerRaw.toLowerCase();
    if (provider !== 'tmdb' && provider !== 'imdb') {
      throw new Error(`Invalid provider "${providerRaw}". Must be either "tmdb" or "imdb"`);
    }

    // Validate and process based on provider
    if (provider === 'tmdb') {
      // Parse and validate TMDB ID
      const tmdbId = Number.parseInt(value, 10);

      if (Number.isNaN(tmdbId)) {
        throw new Error(`Invalid TMDB ID "${value}". Must be a numeric value`);
      }

      if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
        throw new Error(`Invalid TMDB ID "${value}". Must be a positive integer`);
      }

      return RadarrApi.getApiV3MovieLookupTmdb({ query: { tmdbId } });
    }

    // Validate IMDB ID format (must be tt followed by digits)
    const imdbPattern = /^tt\d+$/;
    if (!imdbPattern.test(value)) {
      throw new Error(
        `Invalid IMDB ID "${value}". Must match pattern "tt" followed by digits (e.g., "tt0175142")`
      );
    }

    return RadarrApi.getApiV3MovieLookupImdb({ query: { imdbId: value } });
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

  // Movie File APIs

  /**
   * Get movie files by movie ID or specific file IDs
   */
  async getMovieFiles(movieId?: number[], movieFileIds?: number[]) {
    const query: Record<string, any> = {};
    if (movieId !== undefined) query.movieId = movieId;
    if (movieFileIds !== undefined) query.movieFileIds = movieFileIds;

    return RadarrApi.getApiV3Moviefile(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get a specific movie file by ID
   */
  async getMovieFile(id: number) {
    return RadarrApi.getApiV3MoviefileById({ path: { id } });
  }

  /**
   * Update a movie file
   */
  async updateMovieFile(id: string, movieFile: MovieFileResource) {
    return RadarrApi.putApiV3MoviefileById({ path: { id }, body: movieFile });
  }

  /**
   * Delete a movie file from disk
   */
  async deleteMovieFile(id: number) {
    return RadarrApi.deleteApiV3MoviefileById({ path: { id } });
  }

  /**
   * Bulk update movie files using the editor endpoint
   */
  async updateMovieFilesEditor(movieFileList: MovieFileListResource) {
    return RadarrApi.putApiV3MoviefileEditor({ body: movieFileList });
  }

  /**
   * Bulk delete movie files
   */
  async deleteMovieFilesBulk(movieFileList: MovieFileListResource) {
    return RadarrApi.deleteApiV3MoviefileBulk({ body: movieFileList });
  }

  /**
   * Bulk update movie files
   */
  async updateMovieFilesBulk(movieFiles: MovieFileResource[]) {
    return RadarrApi.putApiV3MoviefileBulk({ body: movieFiles });
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

  // Download Client APIs (Radarr-specific bulk operations)

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

  // History APIs

  /**
   * Get activity history
   */
  async getHistory(
    page?: number,
    pageSize?: number,
    sortKey?: string,
    sortDirection?: string,
    movieId?: number,
    downloadId?: string
  ) {
    const query: Record<string, any> = {};
    if (page !== undefined) query.page = page;
    if (pageSize !== undefined) query.pageSize = pageSize;
    if (sortKey) query.sortKey = sortKey;
    if (sortDirection) query.sortDirection = sortDirection;
    if (movieId !== undefined) query.movieId = movieId;
    if (downloadId) query.downloadId = downloadId;

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

    return RadarrApi.getApiV3Blocklist(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Remove a release from the blocklist
   */
  async removeBlocklistItem(id: number) {
    return RadarrApi.deleteApiV3BlocklistById({ path: { id } });
  }

  /**
   * Bulk remove releases from the blocklist
   */
  async removeBlocklistItemsBulk(ids: number[]) {
    return RadarrApi.deleteApiV3BlocklistBulk({ body: { ids } });
  }

  // Wanted APIs

  async getWantedMissing(page?: number, pageSize?: number) {
    const query: Record<string, any> = {};
    if (page !== undefined) query.page = page;
    if (pageSize !== undefined) query.pageSize = pageSize;
    return RadarrApi.getApiV3WantedMissing(Object.keys(query).length > 0 ? { query } : {});
  }

  async getWantedCutoff(page?: number, pageSize?: number) {
    const query: Record<string, any> = {};
    if (page !== undefined) query.page = page;
    if (pageSize !== undefined) query.pageSize = pageSize;
    return RadarrApi.getApiV3WantedCutoff(Object.keys(query).length > 0 ? { query } : {});
  }

  // Configuration Management APIs

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
   * Get system logs
   */
  async getSystemLogs() {
    return RadarrApi.getApiV3Log();
  }

  /**
   * Get disk space information
   */
  async getDiskSpace() {
    return RadarrApi.getApiV3Diskspace();
  }
}

// Re-export types for external consumption
export * from './radarr-types.js';
