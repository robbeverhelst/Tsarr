import { describe, expect, it } from 'bun:test';
import { RadarrClient } from '../src/index.js';

describe('Integration Tests', () => {
  // Only run if environment variables are set
  const shouldRun = process.env.RADARR_BASE_URL && process.env.RADARR_API_KEY;

  if (!shouldRun) {
    console.log('⏭️  Skipping integration tests (RADARR_BASE_URL/RADARR_API_KEY not set)');
    return;
  }

  const radarr = new RadarrClient({
    baseUrl: process.env.RADARR_BASE_URL!,
    apiKey: process.env.RADARR_API_KEY!,
  });

  describe('Radarr Integration', () => {
    it('should connect to Radarr instance', async () => {
      const status = await radarr.getSystemStatus();
      expect(status.data).toBeDefined();
      expect(status.data?.version).toBeDefined();
    });

    it('should get health status', async () => {
      const health = await radarr.getHealth();
      expect(health.data).toBeDefined();
      expect(Array.isArray(health.data)).toBe(true);
    });

    it('should get movies', async () => {
      const movies = await radarr.getMovies();
      expect(movies.data).toBeDefined();
      expect(Array.isArray(movies.data)).toBe(true);
    });

    it('should get root folders', async () => {
      const folders = await radarr.getRootFolders();
      expect(folders.data).toBeDefined();
      expect(Array.isArray(folders.data)).toBe(true);
    });

    it('should search for movies', async () => {
      const results = await radarr.searchMovies('Inception');
      expect(results.data).toBeDefined();
      expect(Array.isArray(results.data)).toBe(true);

      if (results.data && results.data.length > 0) {
        expect(results.data[0].title).toContain('Inception');
      }
    });
  });
});
