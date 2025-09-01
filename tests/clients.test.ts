import { beforeEach, describe, expect, it } from 'bun:test';
import {
  LidarrClient,
  ProwlarrClient,
  RadarrClient,
  ReadarrClient,
  SonarrClient,
} from '../src/index.js';

describe('TsArr Client Tests', () => {
  const mockConfig = {
    baseUrl: 'http://localhost:7878',
    apiKey: 'test-key',
  };

  describe('Client Initialization', () => {
    it('should initialize RadarrClient', () => {
      const client = new RadarrClient(mockConfig);
      expect(client).toBeInstanceOf(RadarrClient);
    });

    it('should initialize SonarrClient', () => {
      const client = new SonarrClient(mockConfig);
      expect(client).toBeInstanceOf(SonarrClient);
    });

    it('should initialize LidarrClient', () => {
      const client = new LidarrClient(mockConfig);
      expect(client).toBeInstanceOf(LidarrClient);
    });

    it('should initialize ReadarrClient', () => {
      const client = new ReadarrClient(mockConfig);
      expect(client).toBeInstanceOf(ReadarrClient);
    });

    it('should initialize ProwlarrClient', () => {
      const client = new ProwlarrClient(mockConfig);
      expect(client).toBeInstanceOf(ProwlarrClient);
    });
  });

  describe('Configuration', () => {
    let radarr: RadarrClient;

    beforeEach(() => {
      radarr = new RadarrClient(mockConfig);
    });

    it('should update configuration', () => {
      const newConfig = {
        baseUrl: 'http://new-host:7878',
        apiKey: 'new-key',
      };

      const updatedConfig = radarr.updateConfig(newConfig);
      expect(updatedConfig.baseUrl).toBe(newConfig.baseUrl);
      expect(updatedConfig.apiKey).toBe(newConfig.apiKey);
    });
  });

  describe('Method Availability', () => {
    it('should have all required RadarrClient methods', () => {
      const radarr = new RadarrClient(mockConfig);

      expect(typeof radarr.getSystemStatus).toBe('function');
      expect(typeof radarr.getHealth).toBe('function');
      expect(typeof radarr.getMovies).toBe('function');
      expect(typeof radarr.getMovie).toBe('function');
      expect(typeof radarr.addMovie).toBe('function');
      expect(typeof radarr.searchMovies).toBe('function');
      expect(typeof radarr.runCommand).toBe('function');
      expect(typeof radarr.getRootFolders).toBe('function');
      expect(typeof radarr.importMovies).toBe('function');
    });

    it('should have all required SonarrClient methods', () => {
      const sonarr = new SonarrClient(mockConfig);

      expect(typeof sonarr.getApi).toBe('function');
      expect(typeof sonarr.getSeries).toBe('function');
      expect(typeof sonarr.getSeriesById).toBe('function');
      expect(typeof sonarr.addSeries).toBe('function');
      expect(typeof sonarr.searchSeries).toBe('function');
    });

    it('should have all required LidarrClient methods', () => {
      const lidarr = new LidarrClient(mockConfig);

      expect(typeof lidarr.getSystemStatus).toBe('function');
      expect(typeof lidarr.getArtists).toBe('function');
      expect(typeof lidarr.addArtist).toBe('function');
      expect(typeof lidarr.searchArtists).toBe('function');
      expect(typeof lidarr.getRootFolders).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('should throw ApiKeyError for invalid configuration', () => {
      expect(() => {
        new RadarrClient({
          baseUrl: '',
          apiKey: '',
        });
      }).toThrow('Invalid or missing API key');
    });
  });
});
