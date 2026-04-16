/**
 * Shared test fixtures and mock data.
 * Consolidates duplicated mock configs from clients.test.ts and clients-unit.test.ts.
 */

export const mockServarrConfig = {
  baseUrl: 'http://localhost:7878',
  apiKey: 'test-api-key',
};

export const mockQbitConfig = {
  baseUrl: 'http://localhost:8080',
  username: 'admin',
  password: 'adminadmin',
};

export const SERVICE_CONFIGS: Record<string, { baseUrl: string; apiKey: string }> = {
  radarr: { baseUrl: 'http://localhost:7878', apiKey: 'test-api-key' },
  sonarr: { baseUrl: 'http://localhost:8989', apiKey: 'test-api-key' },
  lidarr: { baseUrl: 'http://localhost:8686', apiKey: 'test-api-key' },
  readarr: { baseUrl: 'http://localhost:8787', apiKey: 'test-api-key' },
  prowlarr: { baseUrl: 'http://localhost:9696', apiKey: 'test-api-key' },
  bazarr: { baseUrl: 'http://localhost:6767', apiKey: 'test-api-key' },
  seerr: { baseUrl: 'http://localhost:5055', apiKey: 'test-api-key' },
};
