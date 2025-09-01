import { createServarrClient } from '../core/client.js';
import type { ServarrClientConfig } from '../core/types.js';
import * as RadarrApi from '../generated/radarr/index.js';

/**
 * Radarr API client for movie management
 *
 * @example
 * ```typescript
 * const radarr = new RadarrClient({
 *   baseUrl: 'http://localhost:7878',
 *   apiKey: 'your-api-key'
 * });
 *
 * const movies = await radarr.getMovies();
 * ```
 */
export class RadarrClient {
  private clientConfig: ReturnType<typeof createServarrClient>;

  constructor(config: ServarrClientConfig) {
    this.clientConfig = createServarrClient(config);

    // Configure the generated client
    RadarrApi.client.setConfig({
      baseUrl: this.clientConfig.getBaseUrl(),
      headers: this.clientConfig.getHeaders(),
    });
  }

  // System APIs

  /**
   * Get Radarr system status and version information
   */
  async getSystemStatus() {
    return RadarrApi.getApiV3SystemStatus();
  }

  /**
   * Get system health check results
   */
  async getHealth() {
    return RadarrApi.getApiV3Health();
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
  async addMovie(movie: any) {
    return RadarrApi.postApiV3Movie({ body: movie });
  }

  async updateMovie(id: number, movie: any) {
    return RadarrApi.putApiV3MovieById({ path: { id: String(id) }, body: movie });
  }

  async deleteMovie(id: number) {
    return RadarrApi.deleteApiV3MovieById({ path: { id } });
  }

  // Search APIs

  /**
   * Search for movies using TMDB database
   */
  async searchMovies(term: string) {
    return RadarrApi.getApiV3MovieLookup({ query: { term } });
  }

  // Command APIs

  /**
   * Execute a Radarr command (scan, search, etc.)
   */
  async runCommand(command: any) {
    return RadarrApi.postApiV3Command({ body: command });
  }

  async getCommands() {
    return RadarrApi.getApiV3Command();
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

  // Update configuration
  updateConfig(newConfig: Partial<ServarrClientConfig>) {
    const updatedConfig = { ...this.clientConfig.config, ...newConfig };
    this.clientConfig = createServarrClient(updatedConfig);

    RadarrApi.client.setConfig({
      baseUrl: this.clientConfig.getBaseUrl(),
      headers: this.clientConfig.getHeaders(),
    });

    return this.clientConfig.config;
  }
}
