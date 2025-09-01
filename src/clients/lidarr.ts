import { createServarrClient } from '../core/client.js';
import type { ServarrClientConfig } from '../core/types.js';
import * as LidarrApi from '../generated/lidarr/index.js';

export class LidarrClient {
  private clientConfig: ReturnType<typeof createServarrClient>;

  constructor(config: ServarrClientConfig) {
    this.clientConfig = createServarrClient(config);
    
    LidarrApi.client.setConfig({
      baseUrl: this.clientConfig.getBaseUrl(),
      headers: this.clientConfig.getHeaders(),
    });
  }

  // System APIs
  async getSystemStatus() {
    return LidarrApi.getApiV1SystemStatus();
  }

  async getHealth() {
    return LidarrApi.getApiV1Health();
  }

  // Artist APIs
  async getArtists() {
    return LidarrApi.getApiV1Artist();
  }

  async getArtist(id: number) {
    return LidarrApi.getApiV1ArtistById({ path: { id } });
  }

  async addArtist(artist: any) {
    return LidarrApi.postApiV1Artist({ body: artist });
  }

  async updateArtist(id: number, artist: any) {
    return LidarrApi.putApiV1ArtistById({ path: { id: String(id) }, body: artist });
  }

  async deleteArtist(id: number) {
    return LidarrApi.deleteApiV1ArtistById({ path: { id } });
  }

  // Album APIs
  async getAlbums() {
    return LidarrApi.getApiV1Album();
  }

  async getAlbum(id: number) {
    return LidarrApi.getApiV1AlbumById({ path: { id } });
  }

  // Search APIs
  async searchArtists(term: string) {
    return LidarrApi.getApiV1ArtistLookup({ query: { term } });
  }

  // Command APIs
  async runCommand(command: any) {
    return LidarrApi.postApiV1Command({ body: command });
  }

  async getCommands() {
    return LidarrApi.getApiV1Command();
  }

  // Root folder APIs
  async getRootFolders() {
    return LidarrApi.getApiV1Rootfolder();
  }

  async addRootFolder(path: string) {
    return LidarrApi.postApiV1Rootfolder({ 
      body: { path } 
    });
  }

  updateConfig(newConfig: Partial<ServarrClientConfig>) {
    const updatedConfig = { ...this.clientConfig.config, ...newConfig };
    this.clientConfig = createServarrClient(updatedConfig);
    
    LidarrApi.client.setConfig({
      baseUrl: this.clientConfig.getBaseUrl(),
      headers: this.clientConfig.getHeaders(),
    });
    
    return this.clientConfig.config;
  }
}