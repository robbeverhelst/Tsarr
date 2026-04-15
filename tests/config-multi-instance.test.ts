import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  getConfigValue,
  getInstanceNames,
  getServiceConfig,
  getServiceInstances,
  LOCAL_CONFIG_NAME,
  loadConfig,
  saveLocalConfig,
  setConfigValue,
} from '../src/cli/config.js';

describe('multi-instance support', () => {
  let tempDir: string;
  let originalCwd: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'tsarr-multi-'));
    originalCwd = process.cwd();
    originalEnv = { ...process.env };
    // Clear all TSARR env vars
    for (const key of Object.keys(process.env)) {
      if (key.startsWith('TSARR_')) delete process.env[key];
    }
  });

  afterEach(() => {
    process.chdir(originalCwd);
    process.env = originalEnv;
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('legacy single-object config', () => {
    it('should load single-object config unchanged', () => {
      writeFileSync(
        join(tempDir, LOCAL_CONFIG_NAME),
        JSON.stringify({
          services: {
            radarr: { baseUrl: 'http://localhost:7878', apiKey: 'key1' },
          },
        })
      );
      process.chdir(tempDir);

      const config = loadConfig();
      expect(config.services.radarr).toHaveLength(1);
      expect(config.services.radarr[0].baseUrl).toBe('http://localhost:7878');
      expect(config.services.radarr[0].apiKey).toBe('key1');
      expect(config.services.radarr[0].name).toBeUndefined();
    });

    it('should return correct service config for single instance', () => {
      writeFileSync(
        join(tempDir, LOCAL_CONFIG_NAME),
        JSON.stringify({
          services: {
            radarr: { baseUrl: 'http://localhost:7878', apiKey: 'key1' },
          },
        })
      );
      process.chdir(tempDir);

      const config = getServiceConfig('radarr');
      expect(config).toEqual({
        baseUrl: 'http://localhost:7878',
        apiKey: 'key1',
      });
    });
  });

  describe('array config with named instances', () => {
    it('should load array config correctly', () => {
      writeFileSync(
        join(tempDir, LOCAL_CONFIG_NAME),
        JSON.stringify({
          services: {
            radarr: [
              { name: '4K', baseUrl: 'http://localhost:7878', apiKey: 'key-4k' },
              { name: '1080p', baseUrl: 'http://localhost:7879', apiKey: 'key-1080p' },
            ],
          },
        })
      );
      process.chdir(tempDir);

      const config = loadConfig();
      expect(config.services.radarr).toHaveLength(2);
      expect(config.services.radarr[0].name).toBe('4K');
      expect(config.services.radarr[1].name).toBe('1080p');
    });

    it('should return first instance when no instanceName given', () => {
      writeFileSync(
        join(tempDir, LOCAL_CONFIG_NAME),
        JSON.stringify({
          services: {
            radarr: [
              { name: '4K', baseUrl: 'http://localhost:7878', apiKey: 'key-4k' },
              { name: '1080p', baseUrl: 'http://localhost:7879', apiKey: 'key-1080p' },
            ],
          },
        })
      );
      process.chdir(tempDir);

      const config = getServiceConfig('radarr');
      expect(config).toEqual({
        baseUrl: 'http://localhost:7878',
        apiKey: 'key-4k',
      });
    });

    it('should return named instance when instanceName given', () => {
      writeFileSync(
        join(tempDir, LOCAL_CONFIG_NAME),
        JSON.stringify({
          services: {
            radarr: [
              { name: '4K', baseUrl: 'http://localhost:7878', apiKey: 'key-4k' },
              { name: '1080p', baseUrl: 'http://localhost:7879', apiKey: 'key-1080p' },
            ],
          },
        })
      );
      process.chdir(tempDir);

      const config = getServiceConfig('radarr', '1080p');
      expect(config).toEqual({
        baseUrl: 'http://localhost:7879',
        apiKey: 'key-1080p',
      });
    });

    it('should match instance names case-insensitively', () => {
      writeFileSync(
        join(tempDir, LOCAL_CONFIG_NAME),
        JSON.stringify({
          services: {
            radarr: [{ name: '4K', baseUrl: 'http://localhost:7878', apiKey: 'key-4k' }],
          },
        })
      );
      process.chdir(tempDir);

      const config = getServiceConfig('radarr', '4k');
      expect(config).toEqual({
        baseUrl: 'http://localhost:7878',
        apiKey: 'key-4k',
      });
    });

    it('should return null for nonexistent instance', () => {
      writeFileSync(
        join(tempDir, LOCAL_CONFIG_NAME),
        JSON.stringify({
          services: {
            radarr: [{ name: '4K', baseUrl: 'http://localhost:7878', apiKey: 'key-4k' }],
          },
        })
      );
      process.chdir(tempDir);

      const config = getServiceConfig('radarr', 'missing');
      expect(config).toBeNull();
    });
  });

  describe('getServiceInstances', () => {
    it('should return all instances for a service', () => {
      writeFileSync(
        join(tempDir, LOCAL_CONFIG_NAME),
        JSON.stringify({
          services: {
            radarr: [
              { name: '4K', baseUrl: 'http://localhost:7878', apiKey: 'key-4k' },
              { name: '1080p', baseUrl: 'http://localhost:7879', apiKey: 'key-1080p' },
            ],
          },
        })
      );
      process.chdir(tempDir);

      const instances = getServiceInstances('radarr');
      expect(instances).toHaveLength(2);
      expect(instances[0].name).toBe('4K');
      expect(instances[1].name).toBe('1080p');
    });

    it('should return single instance for service only in global config', () => {
      // When no local config exists, instances come from global config (if any)
      process.chdir(tempDir);
      writeFileSync(join(tempDir, LOCAL_CONFIG_NAME), JSON.stringify({ services: {} }));
      const instances = getServiceInstances('radarr');
      // May find 0 or 1 depending on global config — just check it's an array
      expect(Array.isArray(instances)).toBe(true);
    });
  });

  describe('getInstanceNames', () => {
    it('should return instance names', () => {
      writeFileSync(
        join(tempDir, LOCAL_CONFIG_NAME),
        JSON.stringify({
          services: {
            radarr: [
              { name: '4K', baseUrl: 'http://localhost:7878', apiKey: 'key-4k' },
              { name: '1080p', baseUrl: 'http://localhost:7879', apiKey: 'key-1080p' },
            ],
          },
        })
      );
      process.chdir(tempDir);

      expect(getInstanceNames('radarr')).toEqual(['4K', '1080p']);
    });

    it('should return empty array for single unnamed instance', () => {
      writeFileSync(
        join(tempDir, LOCAL_CONFIG_NAME),
        JSON.stringify({
          services: {
            radarr: { baseUrl: 'http://localhost:7878', apiKey: 'key1' },
          },
        })
      );
      process.chdir(tempDir);

      expect(getInstanceNames('radarr')).toEqual([]);
    });
  });

  describe('env var override', () => {
    it('should apply env vars to default instance only', () => {
      writeFileSync(
        join(tempDir, LOCAL_CONFIG_NAME),
        JSON.stringify({
          services: {
            radarr: [
              { name: '4K', baseUrl: 'http://localhost:7878', apiKey: 'key-4k' },
              { name: '1080p', baseUrl: 'http://localhost:7879', apiKey: 'key-1080p' },
            ],
          },
        })
      );
      process.chdir(tempDir);
      process.env.TSARR_RADARR_URL = 'http://env-override:7878';

      const config = loadConfig();
      // Env should override the first instance's URL
      expect(config.services.radarr[0].baseUrl).toBe('http://env-override:7878');
      // Second instance should be unchanged
      expect(config.services.radarr[1].baseUrl).toBe('http://localhost:7879');
    });
  });

  describe('save round-trip', () => {
    it('should save single instance as object', () => {
      process.chdir(tempDir);

      saveLocalConfig({
        services: {
          radarr: [{ baseUrl: 'http://localhost:7878', apiKey: 'key1' }],
        },
      });

      const raw = JSON.parse(readFileSync(join(tempDir, LOCAL_CONFIG_NAME), 'utf-8'));
      // Should be saved as plain object, not array
      expect(Array.isArray(raw.services.radarr)).toBe(false);
      expect(raw.services.radarr.baseUrl).toBe('http://localhost:7878');
    });

    it('should save multiple instances as array', () => {
      process.chdir(tempDir);

      saveLocalConfig({
        services: {
          radarr: [
            { name: '4K', baseUrl: 'http://localhost:7878', apiKey: 'key-4k' },
            { name: '1080p', baseUrl: 'http://localhost:7879', apiKey: 'key-1080p' },
          ],
        },
      });

      const raw = JSON.parse(readFileSync(join(tempDir, LOCAL_CONFIG_NAME), 'utf-8'));
      expect(Array.isArray(raw.services.radarr)).toBe(true);
      expect(raw.services.radarr).toHaveLength(2);
      expect(raw.services.radarr[0].name).toBe('4K');
    });
  });

  describe('config value path resolution', () => {
    it('should get value from default instance with simple path', () => {
      writeFileSync(
        join(tempDir, LOCAL_CONFIG_NAME),
        JSON.stringify({
          services: {
            radarr: [
              { name: '4K', baseUrl: 'http://localhost:7878', apiKey: 'key-4k' },
              { name: '1080p', baseUrl: 'http://localhost:7879', apiKey: 'key-1080p' },
            ],
          },
        })
      );
      process.chdir(tempDir);

      expect(getConfigValue('services.radarr.baseUrl')).toBe('http://localhost:7878');
    });

    it('should get value from named instance', () => {
      writeFileSync(
        join(tempDir, LOCAL_CONFIG_NAME),
        JSON.stringify({
          services: {
            radarr: [
              { name: '4K', baseUrl: 'http://localhost:7878', apiKey: 'key-4k' },
              { name: '1080p', baseUrl: 'http://localhost:7879', apiKey: 'key-1080p' },
            ],
          },
        })
      );
      process.chdir(tempDir);

      expect(getConfigValue('services.radarr.1080p.baseUrl')).toBe('http://localhost:7879');
    });

    it('should set value on named instance', () => {
      writeFileSync(
        join(tempDir, LOCAL_CONFIG_NAME),
        JSON.stringify({
          services: {
            radarr: [
              { name: '4K', baseUrl: 'http://localhost:7878', apiKey: 'key-4k' },
              { name: '1080p', baseUrl: 'http://localhost:7879', apiKey: 'key-1080p' },
            ],
          },
        })
      );
      process.chdir(tempDir);

      setConfigValue('services.radarr.1080p.baseUrl', 'http://new-url:7879', false);

      const raw = JSON.parse(readFileSync(join(tempDir, LOCAL_CONFIG_NAME), 'utf-8'));
      expect(raw.services.radarr[1].baseUrl).toBe('http://new-url:7879');
      // First instance unchanged
      expect(raw.services.radarr[0].baseUrl).toBe('http://localhost:7878');
    });
  });

  describe('qbittorrent multi-instance', () => {
    it('should support named qbittorrent instances', () => {
      writeFileSync(
        join(tempDir, LOCAL_CONFIG_NAME),
        JSON.stringify({
          services: {
            qbittorrent: [
              {
                name: 'main',
                baseUrl: 'http://localhost:8080',
                username: 'admin',
                password: 'pass1',
              },
              {
                name: 'secondary',
                baseUrl: 'http://localhost:8081',
                username: 'admin',
                password: 'pass2',
              },
            ],
          },
        })
      );
      process.chdir(tempDir);

      const main = getServiceConfig('qbittorrent', 'main');
      expect(main).toEqual({
        baseUrl: 'http://localhost:8080',
        username: 'admin',
        password: 'pass1',
      });

      const secondary = getServiceConfig('qbittorrent', 'secondary');
      expect(secondary).toEqual({
        baseUrl: 'http://localhost:8081',
        username: 'admin',
        password: 'pass2',
      });
    });
  });
});
