import { beforeEach, describe, expect, it } from 'bun:test';
import {
  JellyfinClient,
  LidarrClient,
  ProwlarrClient,
  QBittorrentClient,
  RadarrClient,
  ReadarrClient,
  SeerrClient,
  SonarrClient,
} from '../src/index.js';
import { mockQbitConfig, mockServarrConfig } from './fixtures.js';

describe('Tsarr Client Tests', () => {
  const mockConfig = mockServarrConfig;

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

    it('should initialize SeerrClient', () => {
      const client = new SeerrClient(mockConfig);
      expect(client).toBeInstanceOf(SeerrClient);
    });

    it('should initialize JellyfinClient', () => {
      const client = new JellyfinClient(mockConfig);
      expect(client).toBeInstanceOf(JellyfinClient);
    });

    it('should initialize QBittorrentClient', () => {
      const client = new QBittorrentClient(mockQbitConfig);
      expect(client).toBeInstanceOf(QBittorrentClient);
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
      expect(typeof lidarr.getMetadataProfiles).toBe('function');
      expect(typeof lidarr.getMetadataProfile).toBe('function');
      expect(typeof lidarr.getRelease).toBe('function');
      expect(typeof lidarr.addRelease).toBe('function');
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

    it('should throw ConnectionError for QBittorrentClient without baseUrl', () => {
      expect(() => {
        new QBittorrentClient({
          baseUrl: '',
          username: 'admin',
          password: 'admin',
        });
      }).toThrow('No base URL provided');
    });
  });

  describe('SeerrClient Method Availability', () => {
    it('should have all required methods', () => {
      const seerr = new SeerrClient(mockConfig);

      expect(typeof seerr.getSystemStatus).toBe('function');
      expect(typeof seerr.getRequests).toBe('function');
      expect(typeof seerr.getRequestCount).toBe('function');
      expect(typeof seerr.approveRequest).toBe('function');
      expect(typeof seerr.declineRequest).toBe('function');
      expect(typeof seerr.search).toBe('function');
      expect(typeof seerr.getUsers).toBe('function');
      expect(typeof seerr.getUserById).toBe('function');
      expect(typeof seerr.getMedia).toBe('function');
    });
  });

  describe('JellyfinClient Method Availability', () => {
    it('should have all required methods', () => {
      const jellyfin = new JellyfinClient(mockConfig);

      expect(typeof jellyfin.getSystemStatus).toBe('function');
      expect(typeof jellyfin.refreshLibrary).toBe('function');
      expect(typeof jellyfin.refreshItem).toBe('function');
      expect(typeof jellyfin.getVirtualFolders).toBe('function');
      expect(typeof jellyfin.getItems).toBe('function');
      expect(typeof jellyfin.getItem).toBe('function');
      expect(typeof jellyfin.deleteItem).toBe('function');
      expect(typeof jellyfin.getItemUserData).toBe('function');
      expect(typeof jellyfin.markPlayed).toBe('function');
      expect(typeof jellyfin.markUnplayed).toBe('function');
      expect(typeof jellyfin.getSessions).toBe('function');
      expect(typeof jellyfin.getUsers).toBe('function');
      expect(typeof jellyfin.getTasks).toBe('function');
      expect(typeof jellyfin.search).toBe('function');
    });

    it('should expose session remote control, playlist and collection methods', () => {
      const jellyfin = new JellyfinClient(mockConfig);

      expect(typeof jellyfin.sendPlaystateCommand).toBe('function');
      expect(typeof jellyfin.sendGeneralCommand).toBe('function');
      expect(typeof jellyfin.sendSystemCommand).toBe('function');
      expect(typeof jellyfin.sendMessage).toBe('function');
      expect(typeof jellyfin.playOnSession).toBe('function');
      expect(typeof jellyfin.displayContent).toBe('function');
      expect(typeof jellyfin.addUserToSession).toBe('function');
      expect(typeof jellyfin.removeUserFromSession).toBe('function');

      expect(typeof jellyfin.createPlaylist).toBe('function');
      expect(typeof jellyfin.getPlaylistItems).toBe('function');
      expect(typeof jellyfin.addToPlaylist).toBe('function');
      expect(typeof jellyfin.removeFromPlaylist).toBe('function');

      expect(typeof jellyfin.createCollection).toBe('function');
      expect(typeof jellyfin.addToCollection).toBe('function');
      expect(typeof jellyfin.removeFromCollection).toBe('function');
    });
  });

  describe('JellyfinClient auth', () => {
    it('sends the MediaBrowser authorization scheme', async () => {
      const originalFetch = globalThis.fetch;
      let authHeader: string | null = null;

      globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(
          input instanceof Request ? input.headers : (init?.headers ?? {})
        );
        authHeader = headers.get('authorization');
        return new Response(JSON.stringify({ Version: '10.11.11' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }) as typeof globalThis.fetch;

      try {
        const jellyfin = new JellyfinClient({
          baseUrl: 'http://localhost:8096',
          apiKey: 'test-key',
        });
        await jellyfin.getSystemStatus();
      } finally {
        globalThis.fetch = originalFetch;
      }

      expect(authHeader).toBe('MediaBrowser Token="test-key"');
    });
  });

  describe('QBittorrentClient Method Availability', () => {
    it('should have all required methods', () => {
      const qbit = new QBittorrentClient(mockQbitConfig);

      expect(typeof qbit.getAppVersion).toBe('function');
      expect(typeof qbit.getApiVersion).toBe('function');
      expect(typeof qbit.getSystemStatus).toBe('function');
      expect(typeof qbit.getTransferInfo).toBe('function');
      expect(typeof qbit.getTorrents).toBe('function');
      expect(typeof qbit.pauseTorrents).toBe('function');
      expect(typeof qbit.resumeTorrents).toBe('function');
      expect(typeof qbit.deleteTorrents).toBe('function');
    });
  });

  describe('QBittorrentClient auth flow', () => {
    type LoginResponse = () => Response;

    async function captureCookieOnApiCall(loginResponse: LoginResponse): Promise<string | null> {
      const calls: { url: string; cookie: string | null }[] = [];
      const originalFetch = globalThis.fetch;
      globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = input instanceof Request ? input.url : input.toString();
        const cookie =
          input instanceof Request
            ? input.headers.get('cookie')
            : init?.headers
              ? new Headers(init.headers).get('cookie')
              : null;
        calls.push({ url, cookie });
        if (url.endsWith('/api/v2/auth/login')) return loginResponse();
        if (url.endsWith('/api/v2/app/version')) return new Response('v5.0.0', { status: 200 });
        return new Response('not mocked', { status: 500 });
      }) as typeof globalThis.fetch;
      try {
        const client = new QBittorrentClient({
          baseUrl: 'http://localhost:8080',
          username: 'admin',
          password: 'adminadmin',
        });
        await client.getAppVersion();
        return calls.find(c => c.url.endsWith('/api/v2/app/version'))?.cookie ?? null;
      } finally {
        globalThis.fetch = originalFetch;
      }
    }

    it('sends SID cookie against qBT 4.x (200 + "Ok." + SID=)', async () => {
      const cookie = await captureCookieOnApiCall(
        () => new Response('Ok.', { status: 200, headers: { 'set-cookie': 'SID=abc123; path=/' } })
      );
      expect(cookie).toContain('SID=abc123');
    });

    it('sends QBT_SID_<port> cookie against qBT 5.x (204 + empty + QBT_SID_8080=)', async () => {
      const cookie = await captureCookieOnApiCall(
        () =>
          new Response(null, {
            status: 204,
            headers: { 'set-cookie': 'QBT_SID_8080=xyz789; path=/; HttpOnly' },
          })
      );
      expect(cookie).toContain('QBT_SID_8080=xyz789');
      expect(cookie).not.toContain('SID=xyz789');
    });
  });
});
