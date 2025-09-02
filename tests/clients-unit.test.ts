import { describe, expect, it } from 'bun:test';
import { ApiKeyError, ConnectionError } from '../src/core/errors.js';
import {
  LidarrClient,
  ProwlarrClient,
  RadarrClient,
  ReadarrClient,
  SonarrClient,
} from '../src/index.js';

describe('Client Unit Tests', () => {
  describe('RadarrClient', () => {
    const validConfig = {
      baseUrl: 'http://localhost:7878',
      apiKey: 'valid-api-key',
    };

    it('should create client with valid config', () => {
      const client = new RadarrClient(validConfig);
      expect(client).toBeInstanceOf(RadarrClient);
    });

    it('should throw ApiKeyError for missing API key', () => {
      expect(() => {
        new RadarrClient({
          baseUrl: 'http://localhost:7878',
          apiKey: '',
        });
      }).toThrow(ApiKeyError);
    });

    it('should throw ConnectionError for missing base URL', () => {
      expect(() => {
        new RadarrClient({
          baseUrl: '',
          apiKey: 'valid-key',
        });
      }).toThrow(ConnectionError);
    });

    it('should have all required methods', () => {
      const client = new RadarrClient(validConfig);

      // System methods
      expect(typeof client.getSystemStatus).toBe('function');
      expect(typeof client.getHealth).toBe('function');

      // Movie methods
      expect(typeof client.getMovies).toBe('function');
      expect(typeof client.getMovie).toBe('function');
      expect(typeof client.addMovie).toBe('function');
      expect(typeof client.updateMovie).toBe('function');
      expect(typeof client.deleteMovie).toBe('function');
      expect(typeof client.searchMovies).toBe('function');

      // Command methods
      expect(typeof client.runCommand).toBe('function');
      expect(typeof client.getCommands).toBe('function');

      // Filesystem methods
      expect(typeof client.getRootFolders).toBe('function');
      expect(typeof client.addRootFolder).toBe('function');
      expect(typeof client.deleteRootFolder).toBe('function');
      expect(typeof client.getFilesystem).toBe('function');
      expect(typeof client.getMediaFiles).toBe('function');

      // Import methods
      expect(typeof client.importMovies).toBe('function');

      // Quality Profile methods
      expect(typeof client.getQualityProfiles).toBe('function');
      expect(typeof client.getQualityProfile).toBe('function');
      expect(typeof client.addQualityProfile).toBe('function');
      expect(typeof client.updateQualityProfile).toBe('function');
      expect(typeof client.deleteQualityProfile).toBe('function');
      expect(typeof client.getQualityProfileSchema).toBe('function');

      // Custom Format methods
      expect(typeof client.getCustomFormats).toBe('function');
      expect(typeof client.getCustomFormat).toBe('function');
      expect(typeof client.addCustomFormat).toBe('function');
      expect(typeof client.updateCustomFormat).toBe('function');
      expect(typeof client.deleteCustomFormat).toBe('function');
      expect(typeof client.updateCustomFormatsBulk).toBe('function');
      expect(typeof client.deleteCustomFormatsBulk).toBe('function');
      expect(typeof client.getCustomFormatSchema).toBe('function');

      // Download Client methods
      expect(typeof client.getDownloadClients).toBe('function');
      expect(typeof client.getDownloadClient).toBe('function');
      expect(typeof client.addDownloadClient).toBe('function');
      expect(typeof client.updateDownloadClient).toBe('function');
      expect(typeof client.deleteDownloadClient).toBe('function');
      expect(typeof client.updateDownloadClientsBulk).toBe('function');
      expect(typeof client.deleteDownloadClientsBulk).toBe('function');
      expect(typeof client.getDownloadClientSchema).toBe('function');
      expect(typeof client.testDownloadClient).toBe('function');
      expect(typeof client.testAllDownloadClients).toBe('function');

      // Notification methods
      expect(typeof client.getNotifications).toBe('function');
      expect(typeof client.getNotification).toBe('function');
      expect(typeof client.addNotification).toBe('function');
      expect(typeof client.updateNotification).toBe('function');
      expect(typeof client.deleteNotification).toBe('function');
      expect(typeof client.getNotificationSchema).toBe('function');
      expect(typeof client.testNotification).toBe('function');
      expect(typeof client.testAllNotifications).toBe('function');

      // Calendar methods
      expect(typeof client.getCalendar).toBe('function');
      expect(typeof client.getCalendarFeed).toBe('function');

      // Queue methods
      expect(typeof client.getQueue).toBe('function');
      expect(typeof client.removeQueueItem).toBe('function');
      expect(typeof client.removeQueueItemsBulk).toBe('function');
      expect(typeof client.grabQueueItem).toBe('function');
      expect(typeof client.grabQueueItemsBulk).toBe('function');
      expect(typeof client.getQueueDetails).toBe('function');
      expect(typeof client.getQueueStatus).toBe('function');

      // Import List methods
      expect(typeof client.getImportLists).toBe('function');
      expect(typeof client.getImportList).toBe('function');
      expect(typeof client.addImportList).toBe('function');
      expect(typeof client.updateImportList).toBe('function');
      expect(typeof client.deleteImportList).toBe('function');
      expect(typeof client.getImportListSchema).toBe('function');
      expect(typeof client.testImportList).toBe('function');
      expect(typeof client.testAllImportLists).toBe('function');

      // Indexer methods
      expect(typeof client.getIndexers).toBe('function');
      expect(typeof client.getIndexer).toBe('function');
      expect(typeof client.addIndexer).toBe('function');
      expect(typeof client.updateIndexer).toBe('function');
      expect(typeof client.deleteIndexer).toBe('function');
      expect(typeof client.getIndexerSchema).toBe('function');
      expect(typeof client.testIndexer).toBe('function');
      expect(typeof client.testAllIndexers).toBe('function');

      // History methods
      expect(typeof client.getHistory).toBe('function');
      expect(typeof client.getHistorySince).toBe('function');
      expect(typeof client.getMovieHistory).toBe('function');
      expect(typeof client.markHistoryItemFailed).toBe('function');

      // Config methods
      expect(typeof client.updateConfig).toBe('function');
    });

    it('should update configuration and return new config', () => {
      const client = new RadarrClient(validConfig);

      const newConfig = {
        baseUrl: 'http://new-host:7878',
        apiKey: 'new-api-key',
      };

      const updatedConfig = client.updateConfig(newConfig);

      expect(updatedConfig.baseUrl).toBe(newConfig.baseUrl);
      expect(updatedConfig.apiKey).toBe(newConfig.apiKey);
    });
  });

  describe('SonarrClient', () => {
    const validConfig = {
      baseUrl: 'http://localhost:8989',
      apiKey: 'valid-api-key',
    };

    it('should create client with valid config', () => {
      const client = new SonarrClient(validConfig);
      expect(client).toBeInstanceOf(SonarrClient);
    });

    it('should throw ApiKeyError for missing API key', () => {
      expect(() => {
        new SonarrClient({
          baseUrl: 'http://localhost:8989',
          apiKey: '',
        });
      }).toThrow(ApiKeyError);
    });

    it('should have required methods', () => {
      const client = new SonarrClient(validConfig);

      expect(typeof client.getApi).toBe('function');
      expect(typeof client.getSystemStatus).toBe('function');
      expect(typeof client.getHealth).toBe('function');
      expect(typeof client.getSeries).toBe('function');
      expect(typeof client.getSeriesById).toBe('function');
      expect(typeof client.addSeries).toBe('function');
      expect(typeof client.updateSeries).toBe('function');
      expect(typeof client.deleteSeries).toBe('function');
      expect(typeof client.getSeriesFolder).toBe('function');
      expect(typeof client.searchSeries).toBe('function');
      expect(typeof client.getLogs).toBe('function');
      expect(typeof client.getUpdates).toBe('function');
      expect(typeof client.getUpdateSettings).toBe('function');
      expect(typeof client.getUpdateSetting).toBe('function');
      expect(typeof client.updateConfig).toBe('function');
    });
  });

  describe('LidarrClient', () => {
    const validConfig = {
      baseUrl: 'http://localhost:8686',
      apiKey: 'valid-api-key',
    };

    it('should create client with valid config', () => {
      const client = new LidarrClient(validConfig);
      expect(client).toBeInstanceOf(LidarrClient);
    });

    it('should have required methods', () => {
      const client = new LidarrClient(validConfig);

      expect(typeof client.getSystemStatus).toBe('function');
      expect(typeof client.getArtists).toBe('function');
      expect(typeof client.addArtist).toBe('function');
      expect(typeof client.searchArtists).toBe('function');
      expect(typeof client.getRootFolders).toBe('function');
      expect(typeof client.updateConfig).toBe('function');
    });
  });

  describe('ReadarrClient', () => {
    const validConfig = {
      baseUrl: 'http://localhost:8787',
      apiKey: 'valid-api-key',
    };

    it('should create client with valid config', () => {
      const client = new ReadarrClient(validConfig);
      expect(client).toBeInstanceOf(ReadarrClient);
    });

    it('should have required methods', () => {
      const client = new ReadarrClient(validConfig);

      expect(typeof client.getSystemStatus).toBe('function');
      expect(typeof client.getAuthors).toBe('function');
      expect(typeof client.getBooks).toBe('function');
      expect(typeof client.addAuthor).toBe('function');
      expect(typeof client.searchAuthors).toBe('function');
      expect(typeof client.getRootFolders).toBe('function');
      expect(typeof client.updateConfig).toBe('function');
    });
  });

  describe('ProwlarrClient', () => {
    const validConfig = {
      baseUrl: 'http://localhost:9696',
      apiKey: 'valid-api-key',
    };

    it('should create client with valid config', () => {
      const client = new ProwlarrClient(validConfig);
      expect(client).toBeInstanceOf(ProwlarrClient);
    });

    it('should have required methods', () => {
      const client = new ProwlarrClient(validConfig);

      expect(typeof client.getSystemStatus).toBe('function');
      expect(typeof client.getIndexers).toBe('function');
      expect(typeof client.search).toBe('function');
      expect(typeof client.updateConfig).toBe('function');
    });
  });

  describe('Error Handling Consistency', () => {
    it('should throw ApiKeyError across all clients for missing keys', () => {
      expect(() => {
        new RadarrClient({ baseUrl: 'http://localhost:7878', apiKey: '' });
      }).toThrow(ApiKeyError);

      expect(() => {
        new SonarrClient({ baseUrl: 'http://localhost:8989', apiKey: '' });
      }).toThrow(ApiKeyError);

      expect(() => {
        new LidarrClient({ baseUrl: 'http://localhost:8686', apiKey: '' });
      }).toThrow(ApiKeyError);

      expect(() => {
        new ReadarrClient({ baseUrl: 'http://localhost:8787', apiKey: '' });
      }).toThrow(ApiKeyError);

      expect(() => {
        new ProwlarrClient({ baseUrl: 'http://localhost:9696', apiKey: '' });
      }).toThrow(ApiKeyError);
    });

    it('should throw ConnectionError across all clients for empty URLs', () => {
      expect(() => {
        new RadarrClient({ baseUrl: '', apiKey: 'key' });
      }).toThrow(ConnectionError);

      expect(() => {
        new SonarrClient({ baseUrl: '', apiKey: 'key' });
      }).toThrow(ConnectionError);

      expect(() => {
        new LidarrClient({ baseUrl: '', apiKey: 'key' });
      }).toThrow(ConnectionError);

      expect(() => {
        new ReadarrClient({ baseUrl: '', apiKey: 'key' });
      }).toThrow(ConnectionError);

      expect(() => {
        new ProwlarrClient({ baseUrl: '', apiKey: 'key' });
      }).toThrow(ConnectionError);
    });
  });

  describe('Configuration Updates', () => {
    it('should update RadarrClient configuration', () => {
      const client = new RadarrClient({
        baseUrl: 'http://localhost:7878',
        apiKey: 'original-key',
      });

      const newConfig = { baseUrl: 'https://new-host.com', apiKey: 'new-key' };
      const updatedConfig = client.updateConfig(newConfig);

      expect(updatedConfig.baseUrl).toBe('https://new-host.com');
      expect(updatedConfig.apiKey).toBe('new-key');
    });

    it('should update SonarrClient configuration', () => {
      const client = new SonarrClient({
        baseUrl: 'http://localhost:8989',
        apiKey: 'original-key',
      });

      const newConfig = { baseUrl: 'https://new-sonarr.com' };
      const updatedConfig = client.updateConfig(newConfig);

      expect(updatedConfig.baseUrl).toBe('https://new-sonarr.com');
      expect(updatedConfig.apiKey).toBe('original-key'); // Should preserve
    });
  });
});
