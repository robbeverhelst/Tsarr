import { describe, expect, it } from 'bun:test';
import { createServarrClient, validateApiKey, validateBaseUrl } from '../src/core/client.js';
import { ApiKeyError, ConnectionError } from '../src/core/errors.js';

describe('Core Client Functions', () => {
  describe('createServarrClient', () => {
    it('should create client with valid config', () => {
      const config = {
        baseUrl: 'http://localhost:7878',
        apiKey: 'valid-api-key',
      };

      const client = createServarrClient(config);

      expect(client).toBeDefined();
      expect(client.config).toBeDefined();
      expect(client.getHeaders).toBeFunction();
      expect(client.getBaseUrl).toBeFunction();
    });

    it('should normalize base URL', () => {
      const config = {
        baseUrl: 'http://localhost:7878/',
        apiKey: 'valid-api-key',
      };

      const client = createServarrClient(config);
      expect(client.config.baseUrl).toBe('http://localhost:7878');
    });

    it('should throw ApiKeyError for missing API key', () => {
      expect(() => {
        createServarrClient({
          baseUrl: 'http://localhost:7878',
          apiKey: '',
        });
      }).toThrow(ApiKeyError);
    });

    it('should throw ConnectionError for missing base URL', () => {
      expect(() => {
        createServarrClient({
          baseUrl: '',
          apiKey: 'valid-key',
        });
      }).toThrow(ConnectionError);
    });

    it('should include custom headers', () => {
      const config = {
        baseUrl: 'http://localhost:7878',
        apiKey: 'valid-api-key',
        headers: {
          'User-Agent': 'TsArr/1.0.0',
        },
      };

      const client = createServarrClient(config);
      const headers = client.getHeaders();

      expect(headers['X-Api-Key']).toBe('valid-api-key');
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['User-Agent']).toBe('TsArr/1.0.0');
    });
  });

  describe('validateApiKey', () => {
    it('should return trimmed valid API key', () => {
      const result = validateApiKey('  valid-api-key  ');
      expect(result).toBe('valid-api-key');
    });

    it('should throw ApiKeyError for undefined', () => {
      expect(() => validateApiKey(undefined)).toThrow(ApiKeyError);
    });

    it('should throw ApiKeyError for empty string', () => {
      expect(() => validateApiKey('')).toThrow(ApiKeyError);
    });

    it('should throw ApiKeyError for whitespace only', () => {
      expect(() => validateApiKey('   ')).toThrow(ApiKeyError);
    });

    it('should accept API keys with special characters', () => {
      const apiKey = 'abc123-def456_ghi789';
      const result = validateApiKey(apiKey);
      expect(result).toBe(apiKey);
    });

    it('should accept long API keys', () => {
      const apiKey = 'a'.repeat(64);
      const result = validateApiKey(apiKey);
      expect(result).toBe(apiKey);
    });
  });

  describe('validateBaseUrl', () => {
    it('should return normalized valid URL', () => {
      const result = validateBaseUrl('http://localhost:7878/');
      expect(result).toBe('http://localhost:7878');
    });

    it('should accept HTTPS URLs', () => {
      const result = validateBaseUrl('https://radarr.example.com');
      expect(result).toBe('https://radarr.example.com');
    });

    it('should accept URLs with ports', () => {
      const result = validateBaseUrl('http://192.168.1.100:7878');
      expect(result).toBe('http://192.168.1.100:7878');
    });

    it('should accept URLs with paths', () => {
      const result = validateBaseUrl('http://example.com/radarr');
      expect(result).toBe('http://example.com/radarr');
    });

    it('should throw ConnectionError for undefined', () => {
      expect(() => validateBaseUrl(undefined)).toThrow(ConnectionError);
      expect(() => validateBaseUrl(undefined)).toThrow('No base URL provided');
    });

    it('should throw ConnectionError for empty string', () => {
      expect(() => validateBaseUrl('')).toThrow(ConnectionError);
      expect(() => validateBaseUrl('')).toThrow('No base URL provided');
    });

    it('should throw ConnectionError for whitespace only', () => {
      expect(() => validateBaseUrl('   ')).toThrow(ConnectionError);
      expect(() => validateBaseUrl('   ')).toThrow('No base URL provided');
    });

    it('should throw ConnectionError for invalid URLs', () => {
      const invalidUrls = ['not-a-url', 'http://', 'https://', '://example.com'];

      for (const url of invalidUrls) {
        expect(() => validateBaseUrl(url)).toThrow(ConnectionError);
      }
    });

    it('should trim whitespace', () => {
      const result = validateBaseUrl('  http://localhost:7878  ');
      expect(result).toBe('http://localhost:7878');
    });

    it('should remove trailing slashes', () => {
      const result = validateBaseUrl('http://localhost:7878/');
      expect(result).toBe('http://localhost:7878');
    });
  });
});
