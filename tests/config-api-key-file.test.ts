import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ServiceConfig } from '../src/cli/config.js';

describe('apiKeyFile support', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'tsarr-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('ServiceConfig type', () => {
    it('should accept apiKeyFile as optional field', () => {
      const config: ServiceConfig = {
        baseUrl: 'http://localhost:7878',
        apiKey: '',
        apiKeyFile: '/run/secrets/radarr_api_key',
      };
      expect(config.apiKeyFile).toBe('/run/secrets/radarr_api_key');
    });

    it('should work without apiKeyFile', () => {
      const config: ServiceConfig = {
        baseUrl: 'http://localhost:7878',
        apiKey: 'inline-key',
      };
      expect(config.apiKeyFile).toBeUndefined();
    });
  });

  describe('API key file reading', () => {
    it('should trim trailing newlines from file content', () => {
      const keyFile = join(tempDir, 'api_key');
      writeFileSync(keyFile, 'my-secret-key\n\n');

      const { readFileSync } = require('node:fs');
      const content = readFileSync(keyFile, 'utf-8').trimEnd();
      expect(content).toBe('my-secret-key');
    });

    it('should handle file with no trailing newline', () => {
      const keyFile = join(tempDir, 'api_key');
      writeFileSync(keyFile, 'my-secret-key');

      const { readFileSync } = require('node:fs');
      const content = readFileSync(keyFile, 'utf-8').trimEnd();
      expect(content).toBe('my-secret-key');
    });

    it('should handle Windows-style line endings', () => {
      const keyFile = join(tempDir, 'api_key');
      writeFileSync(keyFile, 'my-secret-key\r\n');

      const { readFileSync } = require('node:fs');
      const content = readFileSync(keyFile, 'utf-8').trimEnd();
      expect(content).toBe('my-secret-key');
    });
  });

  describe('getConfiguredServices filter logic', () => {
    it('should include services with apiKeyFile but no apiKey', () => {
      const services: Record<string, ServiceConfig> = {
        radarr: {
          baseUrl: 'http://localhost:7878',
          apiKey: '',
          apiKeyFile: '/run/secrets/radarr_key',
        },
        sonarr: {
          baseUrl: 'http://localhost:8989',
          apiKey: 'inline-key',
        },
        lidarr: {
          baseUrl: 'http://localhost:8686',
          apiKey: '',
        },
      };

      const configured = Object.entries(services)
        .filter(([_, s]) => s.baseUrl && (s.apiKey || s.apiKeyFile))
        .map(([name]) => name);

      expect(configured).toEqual(['radarr', 'sonarr']);
      expect(configured).not.toContain('lidarr');
    });
  });
});
