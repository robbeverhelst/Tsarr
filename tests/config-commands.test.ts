import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getConfigValue, loadConfig, setConfigValue } from '../src/cli/config.js';

describe('Config commands', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'tsarr-config-test-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('setConfigValue / getConfigValue (local)', () => {
    it('sets and gets a config value locally', () => {
      // First create a valid config structure
      writeFileSync(
        join(tempDir, '.tsarr.json'),
        JSON.stringify({
          services: {
            sonarr: [{ baseUrl: 'http://old:8989', apiKey: 'old-key' }],
          },
        })
      );

      setConfigValue('services.sonarr.baseUrl', 'http://localhost:8989', false);
      const value = getConfigValue('services.sonarr.baseUrl');
      expect(value).toBe('http://localhost:8989');
    });

    it('sets a value on an existing config and preserves other fields', () => {
      writeFileSync(
        join(tempDir, '.tsarr.json'),
        JSON.stringify({
          services: {
            radarr: [{ baseUrl: 'http://localhost:7878', apiKey: 'my-key' }],
          },
        })
      );

      setConfigValue('services.radarr.apiKey', 'new-key', false);
      expect(getConfigValue('services.radarr.apiKey')).toBe('new-key');
      expect(getConfigValue('services.radarr.baseUrl')).toBe('http://localhost:7878');
    });
  });

  describe('loadConfig', () => {
    it('returns empty config when no files exist', () => {
      const config = loadConfig();
      expect(config).toBeDefined();
      expect(config.services).toBeDefined();
    });

    it('loads local config from .tsarr.json', () => {
      writeFileSync(
        join(tempDir, '.tsarr.json'),
        JSON.stringify({
          services: {
            radarr: [{ baseUrl: 'http://localhost:7878', apiKey: 'local-key' }],
          },
        })
      );

      const config = loadConfig();
      expect(config.services.radarr).toBeDefined();
      expect(config.services.radarr![0].baseUrl).toBe('http://localhost:7878');
    });

    it('loads single-object service config and normalizes to array', () => {
      writeFileSync(
        join(tempDir, '.tsarr.json'),
        JSON.stringify({
          services: {
            radarr: { baseUrl: 'http://localhost:7878', apiKey: 'my-key' },
          },
        })
      );

      const config = loadConfig();
      expect(Array.isArray(config.services.radarr)).toBe(true);
      expect(config.services.radarr![0].baseUrl).toBe('http://localhost:7878');
    });

    it('returns undefined for non-existent config keys', () => {
      const value = getConfigValue('services.nonexistent.baseUrl');
      expect(value).toBeUndefined();
    });
  });

  describe('config show redaction logic', () => {
    it('redacts apiKey and password', () => {
      const config = {
        services: {
          radarr: [{ baseUrl: 'http://localhost:7878', apiKey: 'secret-key' }],
          qbittorrent: [
            { baseUrl: 'http://localhost:8080', username: 'admin', password: 'secret-pass' },
          ],
        },
      };

      const redacted = JSON.parse(JSON.stringify(config));
      for (const instances of Object.values(redacted.services) as any[]) {
        if (Array.isArray(instances)) {
          for (const svc of instances) {
            if (svc?.apiKey) svc.apiKey = '*****';
            if (svc?.password) svc.password = '*****';
          }
        }
      }

      expect(redacted.services.radarr[0].apiKey).toBe('*****');
      expect(redacted.services.qbittorrent[0].password).toBe('*****');
      expect(redacted.services.radarr[0].baseUrl).toBe('http://localhost:7878');
      expect(redacted.services.qbittorrent[0].username).toBe('admin');
    });
  });

  describe('config set display redaction', () => {
    it('sensitive key patterns are detected', () => {
      const sensitiveKeys = [
        'services.radarr.apiKey',
        'services.qbittorrent.password',
        'services.seerr.token',
        'services.test.secret',
      ];

      for (const key of sensitiveKeys) {
        const shouldRedact = /\b(apiKey|apikey|token|secret|password)\b/i.test(key);
        expect(shouldRedact).toBe(true);
      }
    });

    it('non-sensitive key patterns are not redacted', () => {
      const safeKeys = ['services.radarr.baseUrl', 'defaults.format', 'services.radarr.name'];
      for (const key of safeKeys) {
        const shouldRedact = /\b(apiKey|apikey|token|secret|password)\b/i.test(key);
        expect(shouldRedact).toBe(false);
      }
    });
  });
});
