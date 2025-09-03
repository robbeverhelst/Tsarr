import { createServarrClient } from '../core/client.js';
import type { ServarrClientConfig } from '../core/types.js';
import { client as sonarrClient } from '../generated/sonarr/client.gen.js';
import * as SonarrApi from '../generated/sonarr/index.js';
import type { SeriesResource } from '../generated/sonarr/types.gen.js';

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
    return SonarrApi.getApiV5Series();
  }

  /**
   * Get a specific series by ID
   */
  async getSeriesById(id: number) {
    return SonarrApi.getApiV5SeriesById({ path: { id } });
  }

  /**
   * Add a new series to the library
   */
  async addSeries(series: SeriesResource) {
    return SonarrApi.postApiV5Series({ body: series });
  }

  /**
   * Update an existing series
   */
  async updateSeries(id: number, series: SeriesResource) {
    return SonarrApi.putApiV5SeriesById({ path: { id: String(id) }, body: series });
  }

  /**
   * Delete a series
   */
  async deleteSeries(id: number) {
    return SonarrApi.deleteApiV5SeriesById({ path: { id } });
  }

  /**
   * Get series folder information
   */
  async getSeriesFolder(id: number) {
    return SonarrApi.getApiV5SeriesByIdFolder({ path: { id } });
  }

  // Search APIs

  /**
   * Search for TV series using TVDB database
   */
  async searchSeries(term: string) {
    return SonarrApi.getApiV5SeriesLookup({ query: { term } });
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

    return SonarrApi.getApiV5Log(Object.keys(query).length > 0 ? { query } : {});
  }

  // Update APIs

  /**
   * Get available updates
   */
  async getUpdates() {
    return SonarrApi.getApiV5Update();
  }

  /**
   * Get update settings
   */
  async getUpdateSettings() {
    return SonarrApi.getApiV5SettingsUpdate();
  }

  /**
   * Get specific update setting by ID
   */
  async getUpdateSetting(id: number) {
    return SonarrApi.getApiV5SettingsUpdateById({ path: { id } });
  }

  updateConfig(newConfig: Partial<ServarrClientConfig>) {
    const updatedConfig = { ...this.clientConfig.config, ...newConfig };
    this.clientConfig = createServarrClient(updatedConfig);

    return this.clientConfig.config;
  }
}
