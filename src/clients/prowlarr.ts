import { createServarrClient } from '../core/client.js';
import type { ServarrClientConfig } from '../core/types.js';
import * as ProwlarrApi from '../generated/prowlarr/index.js';
import type { CommandResource, IndexerResource } from '../generated/prowlarr/types.gen.js';

/**
 * Prowlarr API client for indexer management
 *
 * @example
 * ```typescript
 * const prowlarr = new ProwlarrClient({
 *   baseUrl: 'http://localhost:9696',
 *   apiKey: 'your-api-key'
 * });
 *
 * const indexers = await prowlarr.getIndexers();
 * ```
 */
export class ProwlarrClient {
  private clientConfig: ReturnType<typeof createServarrClient>;

  constructor(config: ServarrClientConfig) {
    this.clientConfig = createServarrClient(config);

    ProwlarrApi.client.setConfig({
      baseUrl: this.clientConfig.getBaseUrl(),
      headers: this.clientConfig.getHeaders(),
    });
  }

  // System APIs
  async getSystemStatus() {
    return ProwlarrApi.getApiV1SystemStatus();
  }

  async getHealth() {
    return ProwlarrApi.getApiV1Health();
  }

  // Indexer APIs

  /**
   * Get all configured indexers
   */
  async getIndexers() {
    return ProwlarrApi.getApiV1Indexer();
  }

  async getIndexer(id: number) {
    return ProwlarrApi.getApiV1IndexerById({ path: { id } });
  }

  async addIndexer(indexer: IndexerResource) {
    return ProwlarrApi.postApiV1Indexer({ body: indexer });
  }

  async updateIndexer(id: number, indexer: IndexerResource) {
    return ProwlarrApi.putApiV1IndexerById({ path: { id: String(id) }, body: indexer });
  }

  async deleteIndexer(id: number) {
    return ProwlarrApi.deleteApiV1IndexerById({ path: { id } });
  }

  // Search APIs

  /**
   * Search across all or specific indexers
   */
  async search(query: string, indexerIds?: number[]) {
    return ProwlarrApi.getApiV1Search({
      query: {
        query,
        ...(indexerIds && { indexerIds }),
      },
    });
  }

  // Application APIs
  async getApplications() {
    return ProwlarrApi.getApiV1Applications();
  }

  // Command APIs
  async runCommand(command: CommandResource) {
    return ProwlarrApi.postApiV1Command({ body: command });
  }

  async getCommands() {
    return ProwlarrApi.getApiV1Command();
  }

  updateConfig(newConfig: Partial<ServarrClientConfig>) {
    const updatedConfig = { ...this.clientConfig.config, ...newConfig };
    this.clientConfig = createServarrClient(updatedConfig);

    ProwlarrApi.client.setConfig({
      baseUrl: this.clientConfig.getBaseUrl(),
      headers: this.clientConfig.getHeaders(),
    });

    return this.clientConfig.config;
  }
}
