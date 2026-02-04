import { createServarrClient } from '../core/client.js';
import type { ServarrClientConfig } from '../core/types.js';
import { client as bazarrClient } from '../generated/bazarr/client.gen.js';
import * as BazarrApi from '../generated/bazarr/index.js';

/**
 * Bazarr API client for subtitle management
 *
 * @example
 * ```typescript
 * const bazarr = new BazarrClient({
 *   baseUrl: 'http://localhost:6767',
 *   apiKey: 'your-api-key'
 * });
 *
 * const wantedMovies = await bazarr.getMoviesWanted();
 * const providers = await bazarr.getProviders();
 * ```
 */
export class BazarrClient {
  private clientConfig: ReturnType<typeof createServarrClient>;

  constructor(config: ServarrClientConfig) {
    this.clientConfig = createServarrClient(config);

    bazarrClient.setConfig({
      baseUrl: this.clientConfig.getBaseUrl(),
      headers: this.clientConfig.getHeaders(),
    });
  }

  // System APIs

  /**
   * Get Bazarr system status and version information
   */
  async getSystemStatus() {
    return BazarrApi.getSystemStatus();
  }

  /**
   * Get system health check results
   */
  async getSystemHealth() {
    return BazarrApi.getSystemHealth();
  }

  /**
   * Ping the Bazarr instance
   */
  async ping() {
    return BazarrApi.getSystemPing();
  }

  /**
   * Get Bazarr releases
   */
  async getSystemReleases() {
    return BazarrApi.getSystemReleases();
  }

  /**
   * Get system announcements
   */
  async getSystemAnnouncements() {
    return BazarrApi.getSystemAnnouncements();
  }

  /**
   * Dismiss an announcement by hash
   */
  async dismissAnnouncement(hash: string) {
    return BazarrApi.postSystemAnnouncements({ query: { hash } });
  }

  /**
   * Get system logs
   */
  async getSystemLogs() {
    return BazarrApi.getSystemLogs();
  }

  /**
   * Force log rotation
   */
  async rotateLogs() {
    return BazarrApi.deleteSystemLogs();
  }

  /**
   * Get system tasks
   */
  async getSystemTasks() {
    return BazarrApi.getSystemTasks();
  }

  /**
   * Run a system task
   */
  async runSystemTask(taskId: string) {
    return BazarrApi.postSystemTasks({ query: { taskid: taskId } });
  }

  // Backup APIs

  /**
   * List backup files
   */
  async getBackups() {
    return BazarrApi.getSystemBackups();
  }

  /**
   * Create a new backup
   */
  async createBackup() {
    return BazarrApi.postSystemBackups();
  }

  /**
   * Restore a backup
   */
  async restoreBackup(filename: string) {
    return BazarrApi.patchSystemBackups({ query: { filename } });
  }

  /**
   * Delete a backup file
   */
  async deleteBackup(filename: string) {
    return BazarrApi.deleteSystemBackups({ query: { filename } });
  }

  // Job Queue APIs

  /**
   * List jobs in the queue
   */
  async getJobs(id?: number, status?: 'pending' | 'running' | 'failed' | 'completed') {
    const query: Record<string, any> = {};
    if (id !== undefined) query.id = id;
    if (status) query.status = status;

    return BazarrApi.getSystemJobs(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Force start, move to top, or move to bottom a job
   */
  async manageJob(id: number, action: string) {
    return BazarrApi.postSystemJobs({ query: { id, action } });
  }

  /**
   * Delete a job from the queue
   */
  async deleteJob(id: number) {
    return BazarrApi.deleteSystemJobs({ query: { id } });
  }

  /**
   * Empty a specific jobs queue
   */
  async emptyJobQueue(queueName: 'pending' | 'failed' | 'completed') {
    return BazarrApi.patchSystemJobs({ query: { queueName } });
  }

  // Language APIs

  /**
   * List available languages
   */
  async getLanguages(history?: string) {
    return BazarrApi.getLanguages(history ? { query: { history } } : {});
  }

  /**
   * List language profiles
   */
  async getLanguageProfiles() {
    return BazarrApi.getLanguagesProfiles();
  }

  // Series APIs

  /**
   * List series metadata
   */
  async getSeries(seriesIds?: number[], start?: number, length?: number) {
    const query: Record<string, any> = {};
    if (seriesIds) query['seriesid[]'] = seriesIds;
    if (start !== undefined) query.start = start;
    if (length !== undefined) query.length = length;

    return BazarrApi.getSeries(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Update series language profile
   */
  async updateSeriesLanguageProfile(seriesId?: number[], profileId?: string[]) {
    const query: Record<string, any> = {};
    if (seriesId) query.seriesid = seriesId;
    if (profileId) query.profileid = profileId;

    return BazarrApi.postSeries(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Run actions on specific series (scan-disk, search-missing, search-wanted, sync)
   */
  async runSeriesAction(seriesId?: number, action?: string) {
    const query: Record<string, any> = {};
    if (seriesId !== undefined) query.seriesid = seriesId;
    if (action) query.action = action;

    return BazarrApi.patchSeries(Object.keys(query).length > 0 ? { query } : {});
  }

  // Episodes APIs

  /**
   * List episodes metadata
   */
  async getEpisodes(seriesIds?: number[], episodeIds?: number[]) {
    const query: Record<string, any> = {};
    if (seriesIds) query['seriesid[]'] = seriesIds;
    if (episodeIds) query['episodeid[]'] = episodeIds;

    return BazarrApi.getEpisodes(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get episodes with wanted subtitles
   */
  async getEpisodesWanted(start?: number, length?: number, episodeIds?: number[]) {
    const query: Record<string, any> = {};
    if (start !== undefined) query.start = start;
    if (length !== undefined) query.length = length;
    if (episodeIds) query['episodeid[]'] = episodeIds;

    return BazarrApi.getEpisodesWanted(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get episode history events
   */
  async getEpisodesHistory(start?: number, length?: number, episodeId?: number) {
    const query: Record<string, any> = {};
    if (start !== undefined) query.start = start;
    if (length !== undefined) query.length = length;
    if (episodeId !== undefined) query.episodeid = episodeId;

    return BazarrApi.getEpisodesHistory(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Download episode subtitles
   */
  async downloadEpisodeSubtitles(
    seriesId: number,
    episodeId: number,
    language: string,
    forced: string,
    hi: string
  ) {
    return BazarrApi.patchEpisodesSubtitles({
      query: { seriesid: seriesId, episodeid: episodeId, language, forced, hi },
    });
  }

  /**
   * Upload episode subtitles
   */
  async uploadEpisodeSubtitles(
    seriesId: number,
    episodeId: number,
    language: string,
    forced: string,
    hi: string,
    file: Blob | File
  ) {
    return BazarrApi.postEpisodesSubtitles({
      body: { file },
      query: { seriesid: seriesId, episodeid: episodeId, language, forced, hi },
    });
  }

  /**
   * Delete episode subtitles
   */
  async deleteEpisodeSubtitles(
    seriesId: number,
    episodeId: number,
    language: string,
    forced: string,
    hi: string,
    path: string
  ) {
    return BazarrApi.deleteEpisodesSubtitles({
      query: { seriesid: seriesId, episodeid: episodeId, language, forced, hi, path },
    });
  }

  // Episodes Blacklist APIs

  /**
   * List blacklisted episode subtitles
   */
  async getEpisodesBlacklist(start?: number, length?: number) {
    const query: Record<string, any> = {};
    if (start !== undefined) query.start = start;
    if (length !== undefined) query.length = length;

    return BazarrApi.getEpisodesBlacklist(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Add episode subtitles to blacklist
   */
  async addEpisodeToBlacklist(
    seriesId: number,
    episodeId: number,
    provider: string,
    subsId: string,
    language: string,
    subtitlesPath: string
  ) {
    return BazarrApi.postEpisodesBlacklist({
      query: {
        seriesid: seriesId,
        episodeid: episodeId,
        provider,
        subs_id: subsId,
        language,
        subtitles_path: subtitlesPath,
      },
    });
  }

  /**
   * Remove episode subtitles from blacklist
   */
  async removeEpisodeFromBlacklist(all?: string, provider?: string, subsId?: string) {
    const query: Record<string, any> = {};
    if (all) query.all = all;
    if (provider) query.provider = provider;
    if (subsId) query.subs_id = subsId;

    return BazarrApi.deleteEpisodesBlacklist(Object.keys(query).length > 0 ? { query } : {});
  }

  // Movies APIs

  /**
   * List movies metadata
   */
  async getMovies(radarrIds?: number[], start?: number, length?: number) {
    const query: Record<string, any> = {};
    if (radarrIds) query['radarrid[]'] = radarrIds;
    if (start !== undefined) query.start = start;
    if (length !== undefined) query.length = length;

    return BazarrApi.getMovies(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Update movies language profile
   */
  async updateMoviesLanguageProfile(radarrId?: number[], profileId?: string[]) {
    const query: Record<string, any> = {};
    if (radarrId) query.radarrid = radarrId;
    if (profileId) query.profileid = profileId;

    return BazarrApi.postMovies(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Run actions on specific movies (scan-disk, search-missing, search-wanted, sync)
   */
  async runMovieAction(radarrId?: number, action?: string) {
    const query: Record<string, any> = {};
    if (radarrId !== undefined) query.radarrid = radarrId;
    if (action) query.action = action;

    return BazarrApi.patchMovies(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get movies with wanted subtitles
   */
  async getMoviesWanted(start?: number, length?: number, radarrIds?: number[]) {
    const query: Record<string, any> = {};
    if (start !== undefined) query.start = start;
    if (length !== undefined) query.length = length;
    if (radarrIds) query['radarrid[]'] = radarrIds;

    return BazarrApi.getMoviesWanted(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get movie history events
   */
  async getMoviesHistory(start?: number, length?: number, radarrId?: number) {
    const query: Record<string, any> = {};
    if (start !== undefined) query.start = start;
    if (length !== undefined) query.length = length;
    if (radarrId !== undefined) query.radarrid = radarrId;

    return BazarrApi.getMoviesHistory(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Download movie subtitles
   */
  async downloadMovieSubtitles(radarrId: number, language: string, forced: string, hi: string) {
    return BazarrApi.patchMoviesSubtitles({
      query: { radarrid: radarrId, language, forced, hi },
    });
  }

  /**
   * Upload movie subtitles
   */
  async uploadMovieSubtitles(
    radarrId: number,
    language: string,
    forced: string,
    hi: string,
    file: Blob | File
  ) {
    return BazarrApi.postMoviesSubtitles({
      body: { file },
      query: { radarrid: radarrId, language, forced, hi },
    });
  }

  /**
   * Delete movie subtitles
   */
  async deleteMovieSubtitles(
    radarrId: number,
    language: string,
    forced: string,
    hi: string,
    path: string
  ) {
    return BazarrApi.deleteMoviesSubtitles({
      query: { radarrid: radarrId, language, forced, hi, path },
    });
  }

  // Movies Blacklist APIs

  /**
   * List blacklisted movie subtitles
   */
  async getMoviesBlacklist(start?: number, length?: number) {
    const query: Record<string, any> = {};
    if (start !== undefined) query.start = start;
    if (length !== undefined) query.length = length;

    return BazarrApi.getMoviesBlacklist(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Add movie subtitles to blacklist
   */
  async addMovieToBlacklist(
    radarrId: number,
    provider: string,
    subsId: string,
    language: string,
    subtitlesPath: string
  ) {
    return BazarrApi.postMoviesBlacklist({
      query: {
        radarrid: radarrId,
        provider,
        subs_id: subsId,
        language,
        subtitles_path: subtitlesPath,
      },
    });
  }

  /**
   * Remove movie subtitles from blacklist
   */
  async removeMovieFromBlacklist(all?: string, provider?: string, subsId?: string) {
    const query: Record<string, any> = {};
    if (all) query.all = all;
    if (provider) query.provider = provider;
    if (subsId) query.subs_id = subsId;

    return BazarrApi.deleteMoviesBlacklist(Object.keys(query).length > 0 ? { query } : {});
  }

  // Provider APIs

  /**
   * Get subtitle providers status
   */
  async getProviders() {
    return BazarrApi.getProviders();
  }

  /**
   * Reset subtitle providers
   */
  async resetProviders() {
    return BazarrApi.postProviders({ query: { action: 'reset' } });
  }

  /**
   * Search for episode subtitles from providers
   */
  async searchEpisodeSubtitles(episodeId: number) {
    return BazarrApi.getProviderEpisodes({ query: { episodeid: episodeId } });
  }

  /**
   * Download episode subtitles from provider
   */
  async downloadProviderEpisodeSubtitles(
    seriesId: number,
    episodeId: number,
    hi: string,
    forced: string,
    originalFormat: string,
    provider: string,
    subtitle: string
  ) {
    return BazarrApi.postProviderEpisodes({
      query: {
        seriesid: seriesId,
        episodeid: episodeId,
        hi,
        forced,
        original_format: originalFormat,
        provider,
        subtitle,
      },
    });
  }

  /**
   * Search for movie subtitles from providers
   */
  async searchMovieSubtitles(radarrId: number) {
    return BazarrApi.getProviderMovies({ query: { radarrid: radarrId } });
  }

  /**
   * Download movie subtitles from provider
   */
  async downloadProviderMovieSubtitles(
    radarrId: number,
    hi: string,
    forced: string,
    originalFormat: string,
    provider: string,
    subtitle: string
  ) {
    return BazarrApi.postProviderMovies({
      query: {
        radarrid: radarrId,
        hi,
        forced,
        original_format: originalFormat,
        provider,
        subtitle,
      },
    });
  }

  // Subtitle APIs

  /**
   * Get subtitles tracks for a media file
   */
  async getSubtitles(data: Parameters<typeof BazarrApi.getSubtitles>[0]) {
    return BazarrApi.getSubtitles(data);
  }

  /**
   * Apply mods/tools on external subtitles
   */
  async applySubtitleMods(data: Parameters<typeof BazarrApi.patchSubtitles>[0]) {
    return BazarrApi.patchSubtitles(data);
  }

  /**
   * Get subtitle name info via guessit
   */
  async getSubtitleNameInfo(data: Parameters<typeof BazarrApi.getSubtitleNameInfo>[0]) {
    return BazarrApi.getSubtitleNameInfo(data);
  }

  // History APIs

  /**
   * Get history statistics
   */
  async getHistoryStats() {
    return BazarrApi.getHistoryStats();
  }

  // Badges APIs

  /**
   * Get UI badge counts
   */
  async getBadges() {
    return BazarrApi.getBadges();
  }

  // Search APIs

  /**
   * Search across the system
   */
  async search(data: Parameters<typeof BazarrApi.getSearches>[0]) {
    return BazarrApi.getSearches(data);
  }

  // Filesystem APIs

  /**
   * Browse Bazarr file system
   */
  async browseBazarrFs(path?: string) {
    return BazarrApi.getBrowseBazarrFs(path ? { query: { path } } : {});
  }

  /**
   * Browse Radarr file system
   */
  async browseRadarrFs(path?: string) {
    return BazarrApi.getBrowseRadarrFs(path ? { query: { path } } : {});
  }

  /**
   * Browse Sonarr file system
   */
  async browseSonarrFs(path?: string) {
    return BazarrApi.getBrowseSonarrFs(path ? { query: { path } } : {});
  }

  // Webhook APIs

  /**
   * Test external webhook connection
   */
  async testWebhook() {
    return BazarrApi.postSystemWebhookTest();
  }

  /**
   * Trigger Plex webhook
   */
  async triggerPlexWebhook(payload: string) {
    return BazarrApi.postWebHooksPlex({ query: { payload } });
  }

  /**
   * Trigger Radarr webhook
   */
  async triggerRadarrWebhook(data: Parameters<typeof BazarrApi.postWebHooksRadarr>[0]) {
    return BazarrApi.postWebHooksRadarr(data);
  }

  /**
   * Trigger Sonarr webhook
   */
  async triggerSonarrWebhook(data: Parameters<typeof BazarrApi.postWebHooksSonarr>[0]) {
    return BazarrApi.postWebHooksSonarr(data);
  }

  // Update configuration
  updateConfig(newConfig: Partial<ServarrClientConfig>) {
    const updatedConfig = { ...this.clientConfig.config, ...newConfig };
    this.clientConfig = createServarrClient(updatedConfig);

    return this.clientConfig.config;
  }
}

// Re-export types for external consumption
export * from './bazarr-types.js';
