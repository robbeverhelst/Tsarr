import { createServarrClient } from '../core/client.js';
import type { ServarrClientConfig } from '../core/types.js';
import * as RadarrApi from '../generated/radarr/index.js';

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
  async getSystemStatus() {
    return RadarrApi.getApiV3SystemStatus();
  }

  async getHealth() {
    return RadarrApi.getApiV3Health();
  }

  // Movie APIs
  async getMovies() {
    return RadarrApi.getApiV3Movie();
  }

  async getMovie(id: number) {
    return RadarrApi.getApiV3MovieById({ path: { id } });
  }

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
  async searchMovies(term: string) {
    return RadarrApi.getApiV3MovieLookup({ query: { term } });
  }

  // Command APIs
  async runCommand(command: any) {
    return RadarrApi.postApiV3Command({ body: command });
  }

  async getCommands() {
    return RadarrApi.getApiV3Command();
  }

  // Root folder APIs
  async getRootFolders() {
    return RadarrApi.getApiV3Rootfolder();
  }

  async addRootFolder(path: string) {
    return RadarrApi.postApiV3Rootfolder({ 
      body: { path } 
    });
  }

  async deleteRootFolder(id: number) {
    return RadarrApi.deleteApiV3RootfolderById({ path: { id } });
  }

  // Filesystem APIs
  async getFilesystem(path?: string) {
    return RadarrApi.getApiV3Filesystem(
      path ? { query: { path } } : {}
    );
  }

  async getMediaFiles(path: string) {
    return RadarrApi.getApiV3FilesystemMediafiles({ query: { path } });
  }

  // Import APIs
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
