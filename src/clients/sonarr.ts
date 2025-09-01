import { createServarrClient } from '../core/client.js';
import type { ServarrClientConfig } from '../core/types.js';
import * as SonarrApi from '../generated/sonarr/index.js';

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

    // Configure the generated client
    SonarrApi.client.setConfig({
      baseUrl: this.clientConfig.getBaseUrl(),
      headers: this.clientConfig.getHeaders(),
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
    return SonarrApi.getApiV5Series();
  }

  async getSeriesById(id: number) {
    return SonarrApi.getApiV5SeriesById({ path: { id } });
  }

  async addSeries(series: any) {
    return SonarrApi.postApiV5Series({ body: series });
  }

  async updateSeries(id: number, series: any) {
    return SonarrApi.putApiV5SeriesById({ path: { id: String(id) }, body: series });
  }

  async deleteSeries(id: number) {
    return SonarrApi.deleteApiV5SeriesById({ path: { id } });
  }

  // Note: Episode APIs may not be available in v5

  // Search APIs

  /**
   * Search for TV series using TVDB database
   */
  async searchSeries(term: string) {
    return SonarrApi.getApiV5SeriesLookup({ query: { term } });
  }

  // Note: Command APIs may not be available in v5

  // Update configuration
  updateConfig(newConfig: Partial<ServarrClientConfig>) {
    const updatedConfig = { ...this.clientConfig.config, ...newConfig };
    this.clientConfig = createServarrClient(updatedConfig);

    SonarrApi.client.setConfig({
      baseUrl: this.clientConfig.getBaseUrl(),
      headers: this.clientConfig.getHeaders(),
    });

    return this.clientConfig.config;
  }
}
