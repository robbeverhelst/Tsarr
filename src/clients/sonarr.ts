import { ServarrBaseClient, type ServarrOps } from '../clients/base';
import { bindApiClient } from '../core/bind-api';
import type { ServarrClientConfig } from '../core/types';
import { createClient, createConfig } from '../generated/sonarr/client';
import * as SonarrApi from '../generated/sonarr/index';
import type {
  CustomFormatBulkResource,
  CustomFormatResource,
  DownloadClientBulkResource,
  EpisodeFileListResource,
  EpisodeFileResource,
  EpisodeResource,
  ImportListResource,
  ManualImportReprocessResourceWritable,
  MediaManagementConfigResource,
  NamingConfigResource,
  QualityProfileResource,
  SeriesResource,
} from '../generated/sonarr/types.gen';

export type SonarrManualImportFilePayload = {
  path: string;
  seriesId: number;
  episodeIds: number[];
  quality: unknown;
  languages?: unknown;
  releaseGroup?: string;
  downloadId?: string;
  episodeFileId?: number;
};

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
  /** Own client instance — never the generated module singleton. See bindApiClient. */
  private readonly api = bindApiClient(SonarrApi, this.rawClient);

  protected readonly ops: ServarrOps = {
    // These are overridden as methods, but required by the interface
    getSystemStatus: () => Promise.resolve(),
    getHealth: () => Promise.resolve(),

    // Tags
    getTags: this.api.getApiV3Tag,
    createTag: this.api.postApiV3Tag,
    getTagById: this.api.getApiV3TagById,
    updateTagById: this.api.putApiV3TagById,
    deleteTagById: this.api.deleteApiV3TagById,
    getTagDetails: this.api.getApiV3TagDetail,
    getTagDetailById: this.api.getApiV3TagDetailById,

    // Notifications
    getNotifications: this.api.getApiV3Notification,
    createNotification: this.api.postApiV3Notification,
    getNotificationById: this.api.getApiV3NotificationById,
    updateNotificationById: this.api.putApiV3NotificationById,
    deleteNotificationById: this.api.deleteApiV3NotificationById,
    getNotificationSchema: this.api.getApiV3NotificationSchema,
    testNotification: this.api.postApiV3NotificationTest,
    testAllNotifications: this.api.postApiV3NotificationTestall,

    // Download Clients
    getDownloadClients: this.api.getApiV3Downloadclient,
    createDownloadClient: this.api.postApiV3Downloadclient,
    getDownloadClientById: this.api.getApiV3DownloadclientById,
    updateDownloadClientById: this.api.putApiV3DownloadclientById,
    deleteDownloadClientById: this.api.deleteApiV3DownloadclientById,
    getDownloadClientSchema: this.api.getApiV3DownloadclientSchema,
    testDownloadClient: this.api.postApiV3DownloadclientTest,
    testAllDownloadClients: this.api.postApiV3DownloadclientTestall,

    // Indexers
    getIndexers: this.api.getApiV3Indexer,
    createIndexer: this.api.postApiV3Indexer,
    getIndexerById: this.api.getApiV3IndexerById,
    updateIndexerById: this.api.putApiV3IndexerById,
    deleteIndexerById: this.api.deleteApiV3IndexerById,
    getIndexerSchema: this.api.getApiV3IndexerSchema,
    testIndexer: this.api.postApiV3IndexerTest,
    testAllIndexers: this.api.postApiV3IndexerTestall,

    // System Admin
    restartSystem: this.api.postApiV3SystemRestart,
    shutdownSystem: this.api.postApiV3SystemShutdown,
    getBackups: this.api.getApiV3SystemBackup,
    deleteBackup: this.api.deleteApiV3SystemBackupById,
    restoreBackup: this.api.postApiV3SystemBackupRestoreById,
    uploadBackup: this.api.postApiV3SystemBackupRestoreUpload,
    getLogFiles: this.api.getApiV3LogFile,
    getLogFileByName: this.api.getApiV3LogFileByFilename,

    // Commands
    runCommand: this.api.postApiV3Command,
    getCommands: this.api.getApiV3Command,

    // Host Config
    getHostConfig: this.api.getApiV3ConfigHost,
    getHostConfigById: this.api.getApiV3ConfigHostById,
    updateHostConfig: this.api.putApiV3ConfigHostById,

    // UI Config
    getUiConfig: this.api.getApiV3ConfigUi,
    getUiConfigById: this.api.getApiV3ConfigUiById,
    updateUiConfig: this.api.putApiV3ConfigUiById,
  };

  constructor(config: ServarrClientConfig) {
    super(config, createClient(createConfig({ baseUrl: 'http://localhost' })));
  }

  // Override since Sonarr doesn't have generated system status endpoints
  async getSystemStatus() {
    return this.rawClient.get({
      url: '/api/v3/system/status',
      headers: this.clientConfig.getHeaders(),
      baseUrl: this.clientConfig.getBaseUrl(),
    });
  }

  async getHealth() {
    return this.rawClient.get({
      url: '/api/v3/health',
      headers: this.clientConfig.getHeaders(),
      baseUrl: this.clientConfig.getBaseUrl(),
    });
  }

  // Basic API
  async getApi() {
    return this.api.getApi();
  }

  // Series APIs

  /**
   * Get all TV series in the library
   */
  async getSeries() {
    return this.api.getApiV3Series();
  }

  /**
   * Get a specific series by ID
   */
  async getSeriesById(id: number) {
    return this.api.getApiV3SeriesById({ path: { id } });
  }

  /**
   * Add a new series to the library
   */
  async addSeries(series: SeriesResource) {
    return this.api.postApiV3Series({ body: series });
  }

  /**
   * Update an existing series
   */
  async updateSeries(id: string, series: SeriesResource) {
    return this.api.putApiV3SeriesById({ path: { id }, body: series });
  }

  /**
   * Delete a series
   */
  async deleteSeries(
    id: number,
    options?: { deleteFiles?: boolean; addImportListExclusion?: boolean }
  ) {
    return this.api.deleteApiV3SeriesById({
      path: { id },
      ...(options ? { query: options } : {}),
    });
  }

  /**
   * Get series folder information
   */
  async getSeriesFolder(id: number) {
    return this.api.getApiV3SeriesByIdFolder({ path: { id } });
  }

  // Search APIs

  /**
   * Search for TV series using TVDB database
   */
  async searchSeries(term: string) {
    return this.api.getApiV3SeriesLookup({ query: { term } });
  }

  // Root folder APIs

  /**
   * Get all configured root folders
   */
  async getRootFolders() {
    return this.api.getApiV3Rootfolder();
  }

  /**
   * Add a new root folder
   */
  async addRootFolder(path: string) {
    return this.api.postApiV3Rootfolder({
      body: { path },
    });
  }

  /**
   * Delete a root folder by ID
   */
  async deleteRootFolder(id: number) {
    return this.api.deleteApiV3RootfolderById({ path: { id } });
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

    return this.api.getApiV3Log(Object.keys(query).length > 0 ? { query } : {});
  }

  // Update APIs

  /**
   * Get available updates
   */
  async getUpdates() {
    return this.api.getApiV3Update();
  }

  /**
   * Get update settings
   */
  async getUpdateSettings() {
    return this.api.getApiV3Update();
  }

  /**
   * Get a specific update setting
   */
  async getUpdateSetting() {
    return this.api.getApiV3Update();
  }

  // Configuration Management APIs

  /**
   * Get naming configuration settings
   */
  async getNamingConfig() {
    return this.api.getApiV3ConfigNaming();
  }

  /**
   * Get naming configuration by ID
   */
  async getNamingConfigById(id: number) {
    return this.api.getApiV3ConfigNamingById({ path: { id } });
  }

  /**
   * Update naming configuration
   */
  async updateNamingConfig(id: string, config: NamingConfigResource) {
    return this.api.putApiV3ConfigNamingById({ path: { id }, body: config });
  }

  /**
   * Get naming configuration examples
   */
  async getNamingConfigExamples() {
    return this.api.getApiV3ConfigNamingExamples();
  }

  /**
   * Get media management configuration settings
   */
  async getMediaManagementConfig() {
    return this.api.getApiV3ConfigMediamanagement();
  }

  /**
   * Get media management configuration by ID
   */
  async getMediaManagementConfigById(id: number) {
    return this.api.getApiV3ConfigMediamanagementById({ path: { id } });
  }

  /**
   * Update media management configuration
   */
  async updateMediaManagementConfig(id: string, config: MediaManagementConfigResource) {
    return this.api.putApiV3ConfigMediamanagementById({ path: { id }, body: config });
  }

  /**
   * Get disk space information
   */
  async getDiskSpace() {
    return this.api.getApiV3Diskspace();
  }

  // Episode APIs (Enhanced)

  /**
   * Get all episodes
   */
  async getEpisodes(seriesId?: number, episodeIds?: number[]) {
    const query: Record<string, any> = {};
    if (seriesId !== undefined) query.seriesId = seriesId;
    if (episodeIds !== undefined) query.episodeIds = episodeIds;

    return this.api.getApiV3Episode(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get a specific episode by ID
   */
  async getEpisode(id: number) {
    return this.api.getApiV3EpisodeById({ path: { id } });
  }

  /**
   * Update an episode
   */
  async updateEpisode(id: number, episode: EpisodeResource) {
    return this.api.putApiV3EpisodeById({ path: { id }, body: episode });
  }

  // Episode File APIs

  /**
   * Get episode files for a series or by specific IDs
   */
  async getEpisodeFiles(seriesId?: number, episodeFileIds?: number[]) {
    const query: Record<string, any> = {};
    if (seriesId !== undefined) query.seriesId = seriesId;
    if (episodeFileIds !== undefined) query.episodeFileIds = episodeFileIds;

    return this.api.getApiV3Episodefile(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get a specific episode file by ID
   */
  async getEpisodeFile(id: number) {
    return this.api.getApiV3EpisodefileById({ path: { id } });
  }

  /**
   * Update an episode file
   */
  async updateEpisodeFile(id: string, episodeFile: EpisodeFileResource) {
    return this.api.putApiV3EpisodefileById({ path: { id }, body: episodeFile });
  }

  /**
   * Delete an episode file from disk
   */
  async deleteEpisodeFile(id: number) {
    return this.api.deleteApiV3EpisodefileById({ path: { id } });
  }

  /**
   * Bulk update episode files using the editor endpoint
   */
  async updateEpisodeFilesEditor(episodeFileList: EpisodeFileListResource) {
    return this.api.putApiV3EpisodefileEditor({ body: episodeFileList });
  }

  /**
   * Bulk delete episode files
   */
  async deleteEpisodeFilesBulk(episodeFileList: EpisodeFileListResource) {
    return this.api.deleteApiV3EpisodefileBulk({ body: episodeFileList });
  }

  /**
   * Bulk update episode files
   */
  async updateEpisodeFilesBulk(episodeFiles: EpisodeFileResource[]) {
    return this.api.putApiV3EpisodefileBulk({ body: episodeFiles });
  }

  // Quality Profile APIs

  /**
   * Get all quality profiles
   */
  async getQualityProfiles() {
    return this.api.getApiV3Qualityprofile();
  }

  /**
   * Get a specific quality profile by ID
   */
  async getQualityProfile(id: number) {
    return this.api.getApiV3QualityprofileById({ path: { id } });
  }

  /**
   * Create a new quality profile
   */
  async addQualityProfile(profile: QualityProfileResource) {
    return this.api.postApiV3Qualityprofile({ body: profile });
  }

  /**
   * Update an existing quality profile
   */
  async updateQualityProfile(id: string, profile: QualityProfileResource) {
    return this.api.putApiV3QualityprofileById({ path: { id }, body: profile });
  }

  /**
   * Delete a quality profile
   */
  async deleteQualityProfile(id: number) {
    return this.api.deleteApiV3QualityprofileById({ path: { id } });
  }

  /**
   * Get quality profile schema
   */
  async getQualityProfileSchema() {
    return this.api.getApiV3QualityprofileSchema();
  }

  // Custom Format APIs

  /**
   * Get all custom formats
   */
  async getCustomFormats() {
    return this.api.getApiV3Customformat();
  }

  /**
   * Get a specific custom format by ID
   */
  async getCustomFormat(id: number) {
    return this.api.getApiV3CustomformatById({ path: { id } });
  }

  /**
   * Create a new custom format
   */
  async addCustomFormat(format: CustomFormatResource) {
    return this.api.postApiV3Customformat({ body: format });
  }

  /**
   * Update an existing custom format
   */
  async updateCustomFormat(id: string, format: CustomFormatResource) {
    return this.api.putApiV3CustomformatById({ path: { id }, body: format });
  }

  /**
   * Delete a custom format
   */
  async deleteCustomFormat(id: number) {
    return this.api.deleteApiV3CustomformatById({ path: { id } });
  }

  /**
   * Bulk update custom formats
   */
  async updateCustomFormatsBulk(formats: CustomFormatBulkResource) {
    return this.api.putApiV3CustomformatBulk({ body: formats });
  }

  /**
   * Bulk delete custom formats
   */
  async deleteCustomFormatsBulk(ids: number[]) {
    return this.api.deleteApiV3CustomformatBulk({ body: { ids } });
  }

  /**
   * Get custom format schema
   */
  async getCustomFormatSchema() {
    return this.api.getApiV3CustomformatSchema();
  }

  // Download Client Bulk APIs (Sonarr-specific)

  /**
   * Bulk update download clients
   */
  async updateDownloadClientsBulk(clients: DownloadClientBulkResource) {
    return this.api.putApiV3DownloadclientBulk({ body: clients });
  }

  /**
   * Bulk delete download clients
   */
  async deleteDownloadClientsBulk(ids: number[]) {
    return this.api.deleteApiV3DownloadclientBulk({ body: { ids } });
  }

  // Import List APIs

  /**
   * Get all import lists
   */
  async getImportLists() {
    return this.api.getApiV3Importlist();
  }

  /**
   * Get a specific import list by ID
   */
  async getImportList(id: number) {
    return this.api.getApiV3ImportlistById({ path: { id } });
  }

  /**
   * Add a new import list
   */
  async addImportList(importList: ImportListResource) {
    return this.api.postApiV3Importlist({ body: importList });
  }

  /**
   * Update an existing import list
   */
  async updateImportList(id: number, importList: ImportListResource) {
    return this.api.putApiV3ImportlistById({ path: { id }, body: importList });
  }

  /**
   * Delete an import list
   */
  async deleteImportList(id: number) {
    return this.api.deleteApiV3ImportlistById({ path: { id } });
  }

  /**
   * Get import list schema
   */
  async getImportListSchema() {
    return this.api.getApiV3ImportlistSchema();
  }

  /**
   * Test an import list configuration
   */
  async testImportList(importList: ImportListResource) {
    return this.api.postApiV3ImportlistTest({ body: importList });
  }

  /**
   * Test all import lists
   */
  async testAllImportLists() {
    return this.api.postApiV3ImportlistTestall();
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

    return this.api.getApiV3History(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get history since a specific date
   */
  async getHistorySince(date: string, seriesId?: number) {
    const query: any = { date };
    if (seriesId !== undefined) query.seriesId = seriesId;

    return this.api.getApiV3HistorySince({ query });
  }

  /**
   * Get history for a specific series
   */
  async getSeriesHistory(seriesId: number, seasonNumber?: number, eventType?: any) {
    const query: any = { seriesId };
    if (seasonNumber !== undefined) query.seasonNumber = seasonNumber;
    if (eventType !== undefined) query.eventType = eventType;

    return this.api.getApiV3HistorySeries({ query });
  }

  /**
   * Mark a failed download as failed in history
   */
  async markHistoryItemFailed(id: number) {
    return this.api.postApiV3HistoryFailedById({ path: { id } });
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

    return this.api.getApiV3Calendar(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get calendar feed in iCal format
   */
  async getCalendarFeed(pastDays?: number, futureDays?: number, tags?: string) {
    const query: Record<string, any> = {};
    if (pastDays !== undefined) query.pastDays = pastDays;
    if (futureDays !== undefined) query.futureDays = futureDays;
    if (tags) query.tags = tags;

    return this.api.getFeedV3CalendarSonarrIcs(Object.keys(query).length > 0 ? { query } : {});
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

    return this.api.getApiV3Queue(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Remove an item from the download queue
   */
  async removeQueueItem(id: number, removeFromClient?: boolean, blocklist?: boolean) {
    const query: Record<string, any> = {};
    if (removeFromClient !== undefined) query.removeFromClient = removeFromClient;
    if (blocklist !== undefined) query.blocklist = blocklist;

    return this.api.deleteApiV3QueueById({
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

    return this.api.deleteApiV3QueueBulk({
      body: { ids },
      ...(Object.keys(query).length > 0 ? { query } : {}),
    });
  }

  /**
   * Force grab a queue item
   */
  async grabQueueItem(id: number) {
    return this.api.postApiV3QueueGrabById({ path: { id } });
  }

  /**
   * Force grab multiple queue items
   */
  async grabQueueItemsBulk(ids: number[]) {
    return this.api.postApiV3QueueGrabBulk({ body: { ids } });
  }

  /**
   * Get detailed queue information
   */
  async getQueueDetails(seriesId?: number, includeUnknownSeriesItems?: boolean) {
    const query: Record<string, any> = {};
    if (seriesId !== undefined) query.seriesId = seriesId;
    if (includeUnknownSeriesItems !== undefined)
      query.includeUnknownSeriesItems = includeUnknownSeriesItems;

    return this.api.getApiV3QueueDetails(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get queue status summary
   */
  async getQueueStatus() {
    return this.api.getApiV3QueueStatus();
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

    return this.api.getApiV3Blocklist(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Remove a release from the blocklist
   */
  async removeBlocklistItem(id: number) {
    return this.api.deleteApiV3BlocklistById({ path: { id } });
  }

  /**
   * Bulk remove releases from the blocklist
   */
  async removeBlocklistItemsBulk(ids: number[]) {
    return this.api.deleteApiV3BlocklistBulk({ body: { ids } });
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

    return this.api.getApiV3WantedMissing(Object.keys(query).length > 0 ? { query } : {});
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

    return this.api.getApiV3WantedCutoff(Object.keys(query).length > 0 ? { query } : {});
  }

  // Parse APIs

  /**
   * Parse episode information from release names
   */
  async parseEpisodeInfo(title: string) {
    return this.api.getApiV3Parse({ query: { title } });
  }

  // Manual Import APIs

  /**
   * Get manual import candidates for a folder or download
   */
  async getManualImport(
    options: {
      folder?: string;
      downloadId?: string;
      seriesId?: number;
      filterExistingFiles?: boolean;
    } = {}
  ) {
    const query: Record<string, any> = {};
    if (options.folder) query.folder = options.folder;
    if (options.downloadId) query.downloadId = options.downloadId;
    if (options.seriesId !== undefined) query.seriesId = options.seriesId;
    if (options.filterExistingFiles !== undefined)
      query.filterExistingFiles = options.filterExistingFiles;

    return this.api.getApiV3Manualimport(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Reprocess manual import candidates to refresh quality/match metadata.
   * Does NOT perform the actual import — use {@link applyManualImport} for that.
   */
  async reprocessManualImport(files: ManualImportReprocessResourceWritable[]) {
    return this.api.postApiV3Manualimport({ body: files });
  }

  /**
   * @deprecated Use {@link reprocessManualImport}. This method only reprocesses
   * candidates; it does not perform the import.
   */
  async processManualImport(files: ManualImportReprocessResourceWritable[]) {
    return this.reprocessManualImport(files);
  }

  /**
   * Execute a manual import via the command queue. Returns the command resource.
   */
  async applyManualImport(
    files: SonarrManualImportFilePayload[],
    importMode: 'auto' | 'copy' | 'move' = 'auto'
  ) {
    return this.runCommand({ name: 'ManualImport', files, importMode });
  }

  /**
   * Get command by ID
   */
  async getCommand(id: number) {
    return this.api.getApiV3CommandById({ path: { id } });
  }
}

// Re-export types for external consumption
export * from './sonarr-types.js';
