import { createServarrClient } from '../core/client.js';
import type { ServarrClientConfig } from '../core/types.js';
import * as LidarrApi from '../generated/lidarr/index.js';
import type {
  AlbumResource,
  ArtistResource,
  CustomFormatBulkResource,
  CustomFormatResource,
  QualityProfileResource,
} from '../generated/lidarr/types.gen.js';

/**
 * Lidarr API client for music management
 *
 * @example
 * ```typescript
 * const lidarr = new LidarrClient({
 *   baseUrl: 'http://localhost:8686',
 *   apiKey: 'your-api-key'
 * });
 *
 * const artists = await lidarr.getArtists();
 * ```
 */
export class LidarrClient {
  private clientConfig: ReturnType<typeof createServarrClient>;

  constructor(config: ServarrClientConfig) {
    this.clientConfig = createServarrClient(config);
  }

  // System APIs
  async getSystemStatus() {
    return LidarrApi.getApiV1SystemStatus();
  }

  async getHealth() {
    return LidarrApi.getApiV1Health();
  }

  // Artist APIs

  /**
   * Get all artists in the library
   */
  async getArtists() {
    return LidarrApi.getApiV1Artist();
  }

  async getArtist(id: number) {
    return LidarrApi.getApiV1ArtistById({ path: { id } });
  }

  async addArtist(artist: ArtistResource) {
    return LidarrApi.postApiV1Artist({ body: artist });
  }

  async updateArtist(id: number, artist: ArtistResource) {
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

  /**
   * Search for artists using MusicBrainz database
   */
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
      body: { path },
    });
  }

  // Album APIs (enhanced)
  async addAlbum(album: AlbumResource) {
    return LidarrApi.postApiV1Album({ body: album });
  }

  async updateAlbum(id: number, album: AlbumResource) {
    return LidarrApi.putApiV1AlbumById({ path: { id: String(id) }, body: album });
  }

  async deleteAlbum(id: number) {
    return LidarrApi.deleteApiV1AlbumById({ path: { id } });
  }

  async searchAlbums(term: string) {
    return LidarrApi.getApiV1AlbumLookup({ query: { term } });
  }

  // Calendar APIs
  async getCalendar(start?: string, end?: string, unmonitored?: boolean) {
    const query: Record<string, any> = {};
    if (start) query.start = start;
    if (end) query.end = end;
    if (unmonitored !== undefined) query.unmonitored = unmonitored;

    return LidarrApi.getApiV1Calendar(Object.keys(query).length > 0 ? { query } : {});
  }

  async getCalendarFeed(pastDays?: number, futureDays?: number, tags?: string) {
    const query: Record<string, any> = {};
    if (pastDays !== undefined) query.pastDays = pastDays;
    if (futureDays !== undefined) query.futureDays = futureDays;
    if (tags) query.tags = tags;

    return LidarrApi.getFeedV1CalendarLidarrIcs(Object.keys(query).length > 0 ? { query } : {});
  }

  // Quality Profile APIs
  async getQualityProfiles() {
    return LidarrApi.getApiV1Qualityprofile();
  }

  async getQualityProfile(id: number) {
    return LidarrApi.getApiV1QualityprofileById({ path: { id } });
  }

  async addQualityProfile(profile: QualityProfileResource) {
    return LidarrApi.postApiV1Qualityprofile({ body: profile });
  }

  async updateQualityProfile(id: number, profile: QualityProfileResource) {
    return LidarrApi.putApiV1QualityprofileById({ path: { id: String(id) }, body: profile });
  }

  async deleteQualityProfile(id: number) {
    return LidarrApi.deleteApiV1QualityprofileById({ path: { id } });
  }

  async getQualityProfileSchema() {
    return LidarrApi.getApiV1QualityprofileSchema();
  }

  // Custom Format APIs
  async getCustomFormats() {
    return LidarrApi.getApiV1Customformat();
  }

  async getCustomFormat(id: number) {
    return LidarrApi.getApiV1CustomformatById({ path: { id } });
  }

  async addCustomFormat(format: CustomFormatResource) {
    return LidarrApi.postApiV1Customformat({ body: format });
  }

  async updateCustomFormat(id: number, format: CustomFormatResource) {
    return LidarrApi.putApiV1CustomformatById({ path: { id: String(id) }, body: format });
  }

  async deleteCustomFormat(id: number) {
    return LidarrApi.deleteApiV1CustomformatById({ path: { id } });
  }

  async updateCustomFormatsBulk(formats: CustomFormatBulkResource) {
    return LidarrApi.putApiV1CustomformatBulk({ body: formats });
  }

  async deleteCustomFormatsBulk(ids: number[]) {
    return LidarrApi.deleteApiV1CustomformatBulk({ body: { ids } });
  }

  async getCustomFormatSchema() {
    return LidarrApi.getApiV1CustomformatSchema();
  }

  updateConfig(newConfig: Partial<ServarrClientConfig>) {
    const updatedConfig = { ...this.clientConfig.config, ...newConfig };
    this.clientConfig = createServarrClient(updatedConfig);

    return this.clientConfig.config;
  }
}
