import { ServarrBaseClient, type ServarrOps } from '../clients/base';
import type { ServarrClientConfig } from '../core/types';
import { client as sonarrClient } from '../generated/sonarr/client.gen';
import * as SonarrApi from '../generated/sonarr/index';
import type {
  CustomFormatBulkResource,
  CustomFormatResource,
  DownloadClientBulkResource,
  EpisodeFileListResource,
  EpisodeFileResource,
  EpisodeResource,
  ImportListResource,
  MediaManagementConfigResource,
  NamingConfigResource,
  QualityProfileResource,
  SeriesResource,
} from '../generated/sonarr/types.gen';

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
export class SonarrClient extends ServarrBaseClient {
  protected readonly ops: ServarrOps = {
    // These are overridden as methods, but required by the interface
    getSystemStatus: () => Promise.resolve(),
    getHealth: () => Promise.resolve(),

    // Tags
    getTags: SonarrApi.getApiV3Tag,
    createTag: SonarrApi.postApiV3Tag,
    getTagById: SonarrApi.getApiV3TagById,
    updateTagById: SonarrApi.putApiV3TagById,
    deleteTagById: SonarrApi.deleteApiV3TagById,
    getTagDetails: SonarrApi.getApiV3TagDetail,
    getTagDetailById: SonarrApi.getApiV3TagDetailById,

    // Notifications
    getNotifications: SonarrApi.getApiV3Notification,
    createNotification: SonarrApi.postApiV3Notification,
    getNotificationById: SonarrApi.getApiV3NotificationById,
    updateNotificationById: SonarrApi.putApiV3NotificationById,
    deleteNotificationById: SonarrApi.deleteApiV3NotificationById,
    getNotificationSchema: SonarrApi.getApiV3NotificationSchema,
    testNotification: SonarrApi.postApiV3NotificationTest,
    testAllNotifications: SonarrApi.postApiV3NotificationTestall,

    // Download Clients
    getDownloadClients: SonarrApi.getApiV3Downloadclient,
    createDownloadClient: SonarrApi.postApiV3Downloadclient,
    getDownloadClientById: SonarrApi.getApiV3DownloadclientById,
    updateDownloadClientById: SonarrApi.putApiV3DownloadclientById,
    deleteDownloadClientById: SonarrApi.deleteApiV3DownloadclientById,
    getDownloadClientSchema: SonarrApi.getApiV3DownloadclientSchema,
    testDownloadClient: SonarrApi.postApiV3DownloadclientTest,
    testAllDownloadClients: SonarrApi.postApiV3DownloadclientTestall,

    // Indexers
    getIndexers: SonarrApi.getApiV3Indexer,
    createIndexer: SonarrApi.postApiV3Indexer,
    getIndexerById: SonarrApi.getApiV3IndexerById,
    updateIndexerById: SonarrApi.putApiV3IndexerById,
    deleteIndexerById: SonarrApi.deleteApiV3IndexerById,
    getIndexerSchema: SonarrApi.getApiV3IndexerSchema,
    testIndexer: SonarrApi.postApiV3IndexerTest,
    testAllIndexers: SonarrApi.postApiV3IndexerTestall,

    // System Admin
    restartSystem: SonarrApi.postApiV3SystemRestart,
    shutdownSystem: SonarrApi.postApiV3SystemShutdown,
    getBackups: SonarrApi.getApiV3SystemBackup,
    deleteBackup: SonarrApi.deleteApiV3SystemBackupById,
    restoreBackup: SonarrApi.postApiV3SystemBackupRestoreById,
    uploadBackup: SonarrApi.postApiV3SystemBackupRestoreUpload,
    getLogFiles: SonarrApi.getApiV3LogFile,
    getLogFileByName: SonarrApi.getApiV3LogFileByFilename,

    // Commands
    runCommand: SonarrApi.postApiV3Command,
    getCommands: SonarrApi.getApiV3Command,

    // Host Config
    getHostConfig: SonarrApi.getApiV3ConfigHost,
    getHostConfigById: SonarrApi.getApiV3ConfigHostById,
    updateHostConfig: SonarrApi.putApiV3ConfigHostById,

    // UI Config
    getUiConfig: SonarrApi.getApiV3ConfigUi,
    getUiConfigById: SonarrApi.getApiV3ConfigUiById,
    updateUiConfig: SonarrApi.putApiV3ConfigUiById,
  };

  constructor(config: ServarrClientConfig) {
    super(config, sonarrClient);
  }

  // Override since Sonarr doesn't have generated system status endpoints
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

  // Basic API
  async getApi() {
    return SonarrApi.getApi();
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
  async deleteSeries(
    id: number,
    options?: { deleteFiles?: boolean; addImportListExclusion?: boolean }
  ) {
    return SonarrApi.deleteApiV3SeriesById({
      path: { id },
      ...(options ? { query: options } : {}),
    });
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
   * Get disk space information
   */
  async getDiskSpace() {
    return SonarrApi.getApiV3Diskspace();
  }

  // Episode APIs (Enhanced)

  /**
   * Get all episodes
   */
  async getEpisodes(seriesId?: number, episodeIds?: number[]) {
    const query: Record<string, any> = {};
    if (seriesId !== undefined) query.seriesId = seriesId;
    if (episodeIds !== undefined) query.episodeIds = episodeIds;

    return SonarrApi.getApiV3Episode(Object.keys(query).length > 0 ? { query } : {});
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

  // Episode File APIs

  /**
   * Get episode files for a series or by specific IDs
   */
  async getEpisodeFiles(seriesId?: number, episodeFileIds?: number[]) {
    const query: Record<string, any> = {};
    if (seriesId !== undefined) query.seriesId = seriesId;
    if (episodeFileIds !== undefined) query.episodeFileIds = episodeFileIds;

    return SonarrApi.getApiV3Episodefile(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get a specific episode file by ID
   */
  async getEpisodeFile(id: number) {
    return SonarrApi.getApiV3EpisodefileById({ path: { id } });
  }

  /**
   * Update an episode file
   */
  async updateEpisodeFile(id: string, episodeFile: EpisodeFileResource) {
    return SonarrApi.putApiV3EpisodefileById({ path: { id }, body: episodeFile });
  }

  /**
   * Delete an episode file from disk
   */
  async deleteEpisodeFile(id: number) {
    return SonarrApi.deleteApiV3EpisodefileById({ path: { id } });
  }

  /**
   * Bulk update episode files using the editor endpoint
   */
  async updateEpisodeFilesEditor(episodeFileList: EpisodeFileListResource) {
    return SonarrApi.putApiV3EpisodefileEditor({ body: episodeFileList });
  }

  /**
   * Bulk delete episode files
   */
  async deleteEpisodeFilesBulk(episodeFileList: EpisodeFileListResource) {
    return SonarrApi.deleteApiV3EpisodefileBulk({ body: episodeFileList });
  }

  /**
   * Bulk update episode files
   */
  async updateEpisodeFilesBulk(episodeFiles: EpisodeFileResource[]) {
    return SonarrApi.putApiV3EpisodefileBulk({ body: episodeFiles });
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

  // Download Client Bulk APIs (Sonarr-specific)

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

  // History APIs

  /**
   * Get activity history
   */
  async getHistory(
    page?: number,
    pageSize?: number,
    sortKey?: string,
    sortDirection?: string,
    seriesId?: number,
    downloadId?: string
  ) {
    const query: Record<string, any> = {};
    if (page !== undefined) query.page = page;
    if (pageSize !== undefined) query.pageSize = pageSize;
    if (sortKey) query.sortKey = sortKey;
    if (sortDirection) query.sortDirection = sortDirection;
    if (seriesId !== undefined) query.seriesIds = [seriesId];
    if (downloadId) query.downloadId = downloadId;

    return SonarrApi.getApiV3History(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get history since a specific date
   */
  async getHistorySince(date: string, seriesId?: number) {
    const query: any = { date };
    if (seriesId !== undefined) query.seriesId = seriesId;

    return SonarrApi.getApiV3HistorySince({ query });
  }

  /**
   * Get history for a specific series
   */
  async getSeriesHistory(seriesId: number, seasonNumber?: number, eventType?: any) {
    const query: any = { seriesId };
    if (seasonNumber !== undefined) query.seasonNumber = seasonNumber;
    if (eventType !== undefined) query.eventType = eventType;

    return SonarrApi.getApiV3HistorySeries({ query });
  }

  /**
   * Mark a failed download as failed in history
   */
  async markHistoryItemFailed(id: number) {
    return SonarrApi.postApiV3HistoryFailedById({ path: { id } });
  }

  // Calendar APIs

  /**
   * Get upcoming TV show releases in calendar format
   */
  async getCalendar(startDate?: string, endDate?: string, unmonitored?: boolean) {
    const query: Record<string, any> = {};
    if (startDate) query.start = startDate;
    if (endDate) query.end = endDate;
    if (unmonitored !== undefined) query.unmonitored = unmonitored;
    query.includeSeries = true;

    return SonarrApi.getApiV3Calendar(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get calendar feed in iCal format
   */
  async getCalendarFeed(pastDays?: number, futureDays?: number, tags?: string) {
    const query: Record<string, any> = {};
    if (pastDays !== undefined) query.pastDays = pastDays;
    if (futureDays !== undefined) query.futureDays = futureDays;
    if (tags) query.tags = tags;

    return SonarrApi.getFeedV3CalendarSonarrIcs(Object.keys(query).length > 0 ? { query } : {});
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
    includeUnknownSeriesItems?: boolean,
    seriesId?: number
  ) {
    const query: Record<string, any> = {};
    if (page !== undefined) query.page = page;
    if (pageSize !== undefined) query.pageSize = pageSize;
    if (sortKey) query.sortKey = sortKey;
    if (sortDirection) query.sortDirection = sortDirection;
    if (includeUnknownSeriesItems !== undefined)
      query.includeUnknownSeriesItems = includeUnknownSeriesItems;
    if (seriesId !== undefined) query.seriesIds = [seriesId];

    return SonarrApi.getApiV3Queue(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Remove an item from the download queue
   */
  async removeQueueItem(id: number, removeFromClient?: boolean, blocklist?: boolean) {
    const query: Record<string, any> = {};
    if (removeFromClient !== undefined) query.removeFromClient = removeFromClient;
    if (blocklist !== undefined) query.blocklist = blocklist;

    return SonarrApi.deleteApiV3QueueById({
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

    return SonarrApi.deleteApiV3QueueBulk({
      body: { ids },
      ...(Object.keys(query).length > 0 ? { query } : {}),
    });
  }

  /**
   * Force grab a queue item
   */
  async grabQueueItem(id: number) {
    return SonarrApi.postApiV3QueueGrabById({ path: { id } });
  }

  /**
   * Force grab multiple queue items
   */
  async grabQueueItemsBulk(ids: number[]) {
    return SonarrApi.postApiV3QueueGrabBulk({ body: { ids } });
  }

  /**
   * Get detailed queue information
   */
  async getQueueDetails(seriesId?: number, includeUnknownSeriesItems?: boolean) {
    const query: Record<string, any> = {};
    if (seriesId !== undefined) query.seriesId = seriesId;
    if (includeUnknownSeriesItems !== undefined)
      query.includeUnknownSeriesItems = includeUnknownSeriesItems;

    return SonarrApi.getApiV3QueueDetails(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get queue status summary
   */
  async getQueueStatus() {
    return SonarrApi.getApiV3QueueStatus();
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

    return SonarrApi.getApiV3Blocklist(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Remove a release from the blocklist
   */
  async removeBlocklistItem(id: number) {
    return SonarrApi.deleteApiV3BlocklistById({ path: { id } });
  }

  /**
   * Bulk remove releases from the blocklist
   */
  async removeBlocklistItemsBulk(ids: number[]) {
    return SonarrApi.deleteApiV3BlocklistBulk({ body: { ids } });
  }

  // Wanted/Missing APIs

  /**
   * Get missing episodes
   */
  async getWantedMissing(
    page?: number,
    pageSize?: number,
    sortKey?: string,
    sortDirection?: string
  ) {
    const query: Record<string, any> = {};
    if (page !== undefined) query.page = page;
    if (pageSize !== undefined) query.pageSize = pageSize;
    if (sortKey) query.sortKey = sortKey;
    if (sortDirection) query.sortDirection = sortDirection;

    return SonarrApi.getApiV3WantedMissing(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get episodes below quality cutoff
   */
  async getWantedCutoff(
    page?: number,
    pageSize?: number,
    sortKey?: string,
    sortDirection?: string
  ) {
    const query: Record<string, any> = {};
    if (page !== undefined) query.page = page;
    if (pageSize !== undefined) query.pageSize = pageSize;
    if (sortKey) query.sortKey = sortKey;
    if (sortDirection) query.sortDirection = sortDirection;

    return SonarrApi.getApiV3WantedCutoff(Object.keys(query).length > 0 ? { query } : {});
  }

  // Parse APIs

  /**
   * Parse episode information from release names
   */
  async parseEpisodeInfo(title: string) {
    return SonarrApi.getApiV3Parse({ query: { title } });
  }

  // Manual Import APIs

  /**
   * Get manual import candidates
   */
  async getManualImport(
    folder?: string,
    downloadId?: string,
    seriesId?: number,
    filterExistingFiles?: boolean
  ) {
    const query: Record<string, any> = {};
    if (folder) query.folder = folder;
    if (downloadId) query.downloadId = downloadId;
    if (seriesId !== undefined) query.seriesId = seriesId;
    if (filterExistingFiles !== undefined) query.filterExistingFiles = filterExistingFiles;

    return SonarrApi.getApiV3Manualimport(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Process manual import
   */
  async processManualImport(files: any[]) {
    return SonarrApi.postApiV3Manualimport({ body: files });
  }

  /**
   * Get command by ID
   */
  async getCommand(id: number) {
    return SonarrApi.getApiV3CommandById({ path: { id } });
  }
}

// Re-export types for external consumption
export * from './sonarr-types.js';
