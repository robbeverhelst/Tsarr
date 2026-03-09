import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// We test getServiceConfig and getEnvConfig indirectly through the exported functions.
// Since config.ts reads from filesystem and env vars, we use a temp dir approach.

describe('ServiceConfig headers support', () => {
  describe('environment variable parsing', () => {
    const originalEnv = { ...process.env };

    afterEach(() => {
      // Restore original env
      for (const key of Object.keys(process.env)) {
        if (key.startsWith('TSARR_')) {
          delete process.env[key];
        }
      }
      Object.assign(process.env, originalEnv);
    });

    it('should parse TSARR_RADARR_HEADERS as JSON', async () => {
      process.env.TSARR_RADARR_URL = 'http://localhost:7878';
      process.env.TSARR_RADARR_API_KEY = 'test-key';
      process.env.TSARR_RADARR_HEADERS = '{"X-Auth-Token":"secret","Authorization":"Bearer tok"}';

      // Re-import to pick up fresh env
      const { getServiceConfig } = await import('../src/cli/config.js');
      const config = getServiceConfig('radarr');

      expect(config).not.toBeNull();
      expect(config!.headers).toEqual({
        'X-Auth-Token': 'secret',
        Authorization: 'Bearer tok',
      });
    });

    it('should ignore invalid JSON in TSARR_RADARR_HEADERS', async () => {
      process.env.TSARR_RADARR_URL = 'http://localhost:7878';
      process.env.TSARR_RADARR_API_KEY = 'test-key';
      process.env.TSARR_RADARR_HEADERS = 'not-valid-json';

      const { getServiceConfig } = await import('../src/cli/config.js');
      const config = getServiceConfig('radarr');

      expect(config).not.toBeNull();
      expect(config!.headers).toBeUndefined();
    });

    it('should not include headers when env var is not set', async () => {
      process.env.TSARR_SONARR_URL = 'http://localhost:8989';
      process.env.TSARR_SONARR_API_KEY = 'test-key';

      const { getServiceConfig } = await import('../src/cli/config.js');
      const config = getServiceConfig('sonarr');

      expect(config).not.toBeNull();
      expect(config!.headers).toBeUndefined();
    });
  });

  describe('headers flow to ServarrClientConfig', () => {
    it('should pass headers from config to createServarrClient', () => {
      const { createServarrClient } = require('../src/core/client.js');

      const client = createServarrClient({
        baseUrl: 'http://localhost:7878',
        apiKey: 'test-key',
        headers: {
          'X-Auth-Token': 'my-token',
          'X-Custom': 'value',
        },
      });

      const headers = client.getHeaders();
      expect(headers['X-Api-Key']).toBe('test-key');
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['X-Auth-Token']).toBe('my-token');
      expect(headers['X-Custom']).toBe('value');
    });

    it('should not allow custom headers to override API key', () => {
      const { createServarrClient } = require('../src/core/client.js');

      const client = createServarrClient({
        baseUrl: 'http://localhost:7878',
        apiKey: 'test-key',
        headers: {
          'X-Api-Key': 'override-attempt',
        },
      });

      const headers = client.getHeaders();
      // API key header takes precedence over custom headers
      expect(headers['X-Api-Key']).toBe('test-key');
    });
  });
});
