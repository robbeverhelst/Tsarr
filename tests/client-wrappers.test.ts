import { afterEach, describe, expect, it } from 'bun:test';
import { BazarrClient, SeerrClient, SonarrClient } from '../src/index.js';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

interface Captured {
  method: string;
  url: string;
  headers: Headers;
}

function captureRequests(body: unknown = { version: '4.0.0' }): Captured[] {
  const captured: Captured[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = input instanceof Request ? input : new Request(input, init);
    captured.push({ method: request.method, url: request.url, headers: request.headers });
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof globalThis.fetch;
  return captured;
}

describe('SonarrClient system endpoints', () => {
  const config = {
    baseUrl: 'http://sonarr:8989/',
    apiKey: 'SONARR-KEY',
    headers: { 'X-Custom': 'yes' },
  };

  it('getSystemStatus issues GET /api/v3/system/status and returns the parsed body', async () => {
    const captured = captureRequests({ version: '4.0.0' });
    const result = await new SonarrClient(config).getSystemStatus();

    expect(captured).toHaveLength(1);
    expect(captured[0].method).toBe('GET');
    expect(captured[0].url).toBe('http://sonarr:8989/api/v3/system/status');
    expect(captured[0].headers.get('x-api-key')).toBe('SONARR-KEY');
    expect(captured[0].headers.get('x-custom')).toBe('yes');
    expect(result.data).toEqual({ version: '4.0.0' });
    expect(result.error).toBeUndefined();
    expect(result.response.status).toBe(200);
  });

  it('getHealth issues GET /api/v3/health and returns the parsed body', async () => {
    const captured = captureRequests([{ type: 'warning', message: 'disk' }]);
    const result = await new SonarrClient(config).getHealth();

    expect(captured).toHaveLength(1);
    expect(captured[0].method).toBe('GET');
    expect(captured[0].url).toBe('http://sonarr:8989/api/v3/health');
    expect(captured[0].headers.get('x-api-key')).toBe('SONARR-KEY');
    expect(result.data).toEqual([{ type: 'warning', message: 'disk' }]);
  });

  it('uses the updated config after updateConfig', async () => {
    const captured = captureRequests();
    const client = new SonarrClient(config);
    client.updateConfig({ baseUrl: 'http://other:8989', apiKey: 'NEW-KEY' });
    await client.getSystemStatus();

    expect(captured[0].url).toBe('http://other:8989/api/v3/system/status');
    expect(captured[0].headers.get('x-api-key')).toBe('NEW-KEY');
  });
});

describe('SeerrClient configuration', () => {
  it('sends requests under /api/v1 with the API key and custom headers', async () => {
    const captured = captureRequests();
    await new SeerrClient({
      baseUrl: 'http://seerr:5055',
      apiKey: 'SEERR-KEY',
      headers: { 'X-Custom': 'yes' },
    }).getSystemStatus();

    expect(captured[0].url).toBe('http://seerr:5055/api/v1/status');
    expect(captured[0].headers.get('x-api-key')).toBe('SEERR-KEY');
    expect(captured[0].headers.get('x-custom')).toBe('yes');
  });

  it('applies updateConfig to later requests and returns the merged config', async () => {
    const captured = captureRequests();
    const client = new SeerrClient({ baseUrl: 'http://seerr:5055', apiKey: 'SEERR-KEY' });
    const updated = client.updateConfig({ baseUrl: 'http://other:5055/', apiKey: 'NEW-KEY' });
    await client.getSystemStatus();

    expect(updated).toEqual({ baseUrl: 'http://other:5055', apiKey: 'NEW-KEY' });
    expect(captured[0].url).toBe('http://other:5055/api/v1/status');
    expect(captured[0].headers.get('x-api-key')).toBe('NEW-KEY');
  });
});

describe('BazarrClient configuration', () => {
  it('sends the API key and custom headers', async () => {
    const captured = captureRequests();
    await new BazarrClient({
      baseUrl: 'http://bazarr:6767',
      apiKey: 'BAZARR-KEY',
      headers: { 'X-Custom': 'yes' },
    }).getSystemStatus();

    expect(captured[0].url).toBe('http://bazarr:6767/api/system/status');
    expect(captured[0].headers.get('x-api-key')).toBe('BAZARR-KEY');
    expect(captured[0].headers.get('x-custom')).toBe('yes');
  });

  it('applies updateConfig to later requests and returns the merged config', async () => {
    const captured = captureRequests();
    const client = new BazarrClient({ baseUrl: 'http://bazarr:6767', apiKey: 'BAZARR-KEY' });
    const updated = client.updateConfig({ baseUrl: 'http://other:6767/api', apiKey: 'NEW-KEY' });
    await client.getSystemStatus();

    expect(updated).toEqual({ baseUrl: 'http://other:6767/api', apiKey: 'NEW-KEY' });
    expect(captured[0].url).toBe('http://other:6767/api/system/status');
    expect(captured[0].headers.get('x-api-key')).toBe('NEW-KEY');
  });
});
