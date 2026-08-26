import { bindApiClient } from '../core/bind-api';
import { createServarrClient } from '../core/client';
import type { ServarrClientConfig } from '../core/types';
import { createClient, createConfig } from '../generated/bazarr/client';
import * as BazarrApi from '../generated/bazarr/index';

function getBazarrApiBaseUrl(baseUrl: string): string {
  // Generated SDK paths already include /api/ prefix, so strip it from the base URL
  // to avoid double-prefixing (e.g. /api/api/system/status)
  return baseUrl.replace(/\/+$/, '').replace(/\/api$/, '');
}

function getBazarrHeaders(config: ReturnType<typeof createServarrClient>) {
  return {
    'Content-Type': 'application/json',
    ...(config.config.headers ?? {}),
  };
}

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
  /** Own client instance — never the generated module singleton. See bindApiClient. */
  private readonly rawClient = createClient(createConfig({ baseUrl: 'http://localhost' }));
  private readonly api = bindApiClient(BazarrApi, this.rawClient);
  private clientConfig: ReturnType<typeof createServarrClient>;

  constructor(config: ServarrClientConfig) {
    this.clientConfig = createServarrClient(config);

    this.rawClient.setConfig({
      baseUrl: getBazarrApiBaseUrl(this.clientConfig.getBaseUrl()),
      headers: getBazarrHeaders(this.clientConfig),
      auth: this.clientConfig.config.apiKey,
      fetch: this.clientConfig.getFetch(),
    });
  }

  // System APIs

  /**
   * Get Bazarr system status and version information
   */
  async getSystemStatus() {
    return this.api.getSystemStatus();
  }

  /**
   * Get system health check results
   */
  async getSystemHealth() {
    return this.api.getSystemHealth();
  }

  /**
   * Ping the Bazarr instance
   */
  async ping() {
    return this.api.getSystemPing();
  }

  /**
   * Get Bazarr releases
   */
  async getSystemReleases() {
    return this.api.getSystemReleases();
  }

  /**
   * Get system announcements
   */
  async getSystemAnnouncements() {
    return this.api.getSystemAnnouncements();
  }

  /**
   * Dismiss an announcement by hash
   */
  async dismissAnnouncement(hash: string) {
    return this.api.postSystemAnnouncements({ query: { hash } });
  }

  /**
   * Get system logs
   */
  async getSystemLogs() {
    return this.api.getSystemLogs();
  }

  /**
   * Force log rotation
   */
  async rotateLogs() {
    return this.api.deleteSystemLogs();
  }

  /**
   * Get system tasks
   */
  async getSystemTasks() {
    return this.api.getSystemTasks();
  }

  /**
   * Run a system task
   */
  async runSystemTask(taskId: string) {
    return this.api.postSystemTasks({ query: { taskid: taskId } });
  }

  // Backup APIs

  /**
   * List backup files
   */
  async getBackups() {
    return this.api.getSystemBackups();
  }

  /**
   * Create a new backup
   */
  async createBackup() {
    return this.api.postSystemBackups();
  }

  /**
   * Restore a backup
   */
  async restoreBackup(filename: string) {
    return this.api.patchSystemBackups({ query: { filename } });
  }

  /**
   * Delete a backup file
   */
  async deleteBackup(filename: string) {
    return this.api.deleteSystemBackups({ query: { filename } });
  }

  // Job Queue APIs

  /**
   * List jobs in the queue
   */
  async getJobs(id?: number, status?: 'pending' | 'running' | 'failed' | 'completed') {
    const query: Record<string, any> = {};
    if (id !== undefined) query.id = id;
    if (status) query.status = status;

    return this.api.getSystemJobs(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Force start, move to top, or move to bottom a job
   */
  async manageJob(id: number, action: string) {
    return this.api.postSystemJobs({ query: { id, action } });
  }

  /**
   * Delete a job from the queue
   */
  async deleteJob(id: number) {
    return this.api.deleteSystemJobs({ query: { id } });
  }

  /**
   * Empty a specific jobs queue
   */
  async emptyJobQueue(queueName: 'pending' | 'failed' | 'completed') {
    return this.api.patchSystemJobs({ query: { queueName } });
  }

  // Language APIs

  /**
   * List available languages
   */
  async getLanguages(history?: string) {
    return this.api.getLanguages(history ? { query: { history } } : {});
  }

  /**
   * List language profiles
   */
  async getLanguageProfiles() {
    return this.api.getLanguagesProfiles();
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

    return this.api.getSeries(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Update series language profile
   */
  async updateSeriesLanguageProfile(seriesId?: number[], profileId?: string[]) {
    const query: Record<string, any> = {};
    if (seriesId) query.seriesid = seriesId;
    if (profileId) query.profileid = profileId;

    return this.api.postSeries(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Run actions on specific series (scan-disk, search-missing, search-wanted, sync)
   */
  async runSeriesAction(seriesId?: number, action?: string) {
    const query: Record<string, any> = {};
    if (seriesId !== undefined) query.seriesid = seriesId;
    if (action) query.action = action;

    return this.api.patchSeries(Object.keys(query).length > 0 ? { query } : {});
  }

  // Episodes APIs

  /**
   * List episodes metadata
   */
  async getEpisodes(seriesIds?: number[], episodeIds?: number[]) {
    const query: Record<string, any> = {};
    if (seriesIds) query['seriesid[]'] = seriesIds;
    if (episodeIds) query['episodeid[]'] = episodeIds;

    return this.api.getEpisodes(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get episodes with wanted subtitles
   */
  async getEpisodesWanted(start?: number, length?: number, episodeIds?: number[]) {
    const query: Record<string, any> = {};
    if (start !== undefined) query.start = start;
    if (length !== undefined) query.length = length;
    if (episodeIds) query['episodeid[]'] = episodeIds;

    return this.api.getEpisodesWanted(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get episode history events
   */
  async getEpisodesHistory(start?: number, length?: number, episodeId?: number) {
    const query: Record<string, any> = {};
    if (start !== undefined) query.start = start;
    if (length !== undefined) query.length = length;
    if (episodeId !== undefined) query.episodeid = episodeId;

    return this.api.getEpisodesHistory(Object.keys(query).length > 0 ? { query } : {});
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
    return this.api.patchEpisodesSubtitles({
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
    return this.api.postEpisodesSubtitles({
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
    return this.api.deleteEpisodesSubtitles({
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

    return this.api.getEpisodesBlacklist(Object.keys(query).length > 0 ? { query } : {});
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
    return this.api.postEpisodesBlacklist({
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

    return this.api.deleteEpisodesBlacklist(Object.keys(query).length > 0 ? { query } : {});
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

    return this.api.getMovies(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Update movies language profile
   */
  async updateMoviesLanguageProfile(radarrId?: number[], profileId?: string[]) {
    const query: Record<string, any> = {};
    if (radarrId) query.radarrid = radarrId;
    if (profileId) query.profileid = profileId;

    return this.api.postMovies(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Run actions on specific movies (scan-disk, search-missing, search-wanted, sync)
   */
  async runMovieAction(radarrId?: number, action?: string) {
    const query: Record<string, any> = {};
    if (radarrId !== undefined) query.radarrid = radarrId;
    if (action) query.action = action;

    return this.api.patchMovies(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get movies with wanted subtitles
   */
  async getMoviesWanted(start?: number, length?: number, radarrIds?: number[]) {
    const query: Record<string, any> = {};
    if (start !== undefined) query.start = start;
    if (length !== undefined) query.length = length;
    if (radarrIds) query['radarrid[]'] = radarrIds;

    return this.api.getMoviesWanted(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Get movie history events
   */
  async getMoviesHistory(start?: number, length?: number, radarrId?: number) {
    const query: Record<string, any> = {};
    if (start !== undefined) query.start = start;
    if (length !== undefined) query.length = length;
    if (radarrId !== undefined) query.radarrid = radarrId;

    return this.api.getMoviesHistory(Object.keys(query).length > 0 ? { query } : {});
  }

  /**
   * Download movie subtitles
   */
  async downloadMovieSubtitles(radarrId: number, language: string, forced: string, hi: string) {
    return this.api.patchMoviesSubtitles({
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
    return this.api.postMoviesSubtitles({
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
    return this.api.deleteMoviesSubtitles({
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

    return this.api.getMoviesBlacklist(Object.keys(query).length > 0 ? { query } : {});
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
    return this.api.postMoviesBlacklist({
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

    return this.api.deleteMoviesBlacklist(Object.keys(query).length > 0 ? { query } : {});
  }

  // Provider APIs

  /**
   * Get subtitle providers status
   */
  async getProviders() {
    return this.api.getProviders();
  }

  /**
   * Reset subtitle providers
   */
  async resetProviders() {
    return this.api.postProviders({ query: { action: 'reset' } });
  }

  /**
   * Search for episode subtitles from providers
   */
  async searchEpisodeSubtitles(episodeId: number) {
    return this.api.getProviderEpisodes({ query: { episodeid: episodeId } });
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
    return this.api.postProviderEpisodes({
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
    return this.api.getProviderMovies({ query: { radarrid: radarrId } });
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
    return this.api.postProviderMovies({
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
  async getSubtitles(data: Parameters<typeof this.api.getSubtitles>[0]) {
    return this.api.getSubtitles(data);
  }

  /**
   * Apply mods/tools on external subtitles
   */
  async applySubtitleMods(data: Parameters<typeof this.api.patchSubtitles>[0]) {
    return this.api.patchSubtitles(data);
  }

  /**
   * Get subtitle name info via guessit
   */
  async getSubtitleNameInfo(data: Parameters<typeof this.api.getSubtitleNameInfo>[0]) {
    return this.api.getSubtitleNameInfo(data);
  }

  // History APIs

  /**
   * Get history statistics
   */
  async getHistoryStats() {
    return this.api.getHistoryStats();
  }

  // Badges APIs

  /**
   * Get UI badge counts
   */
  async getBadges() {
    return this.api.getBadges();
  }

  // Search APIs

  /**
   * Search across the system
   */
  async search(data: Parameters<typeof this.api.getSearches>[0]) {
    return this.api.getSearches(data);
  }

  // Filesystem APIs

  /**
   * Browse Bazarr file system
   */
  async browseBazarrFs(path?: string) {
    return this.api.getBrowseBazarrFs(path ? { query: { path } } : {});
  }

  /**
   * Browse Radarr file system
   */
  async browseRadarrFs(path?: string) {
    return this.api.getBrowseRadarrFs(path ? { query: { path } } : {});
  }

  /**
   * Browse Sonarr file system
   */
  async browseSonarrFs(path?: string) {
    return this.api.getBrowseSonarrFs(path ? { query: { path } } : {});
  }

  // Webhook APIs

  /**
   * Test external webhook connection
   */
  async testWebhook() {
    return this.api.postSystemWebhookTest();
  }

  /**
   * Trigger Plex webhook
   */
  async triggerPlexWebhook(payload: string) {
    return this.api.postWebHooksPlex({ query: { payload } });
  }

  /**
   * Trigger Radarr webhook
   */
  async triggerRadarrWebhook(data: Parameters<typeof this.api.postWebHooksRadarr>[0]) {
    return this.api.postWebHooksRadarr(data);
  }

  /**
   * Trigger Sonarr webhook
   */
  async triggerSonarrWebhook(data: Parameters<typeof this.api.postWebHooksSonarr>[0]) {
    return this.api.postWebHooksSonarr(data);
  }

  // Update configuration
  updateConfig(newConfig: Partial<ServarrClientConfig>) {
    const updatedConfig = { ...this.clientConfig.config, ...newConfig };
    this.clientConfig = createServarrClient(updatedConfig);
    this.rawClient.setConfig({
      baseUrl: getBazarrApiBaseUrl(this.clientConfig.getBaseUrl()),
      headers: getBazarrHeaders(this.clientConfig),
      auth: this.clientConfig.config.apiKey,
      fetch: this.clientConfig.getFetch(),
    });

    return this.clientConfig.config;
  }
}

// Re-export types for external consumption
export * from './bazarr-types.js';
