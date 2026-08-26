import { afterEach, describe, expect, it } from 'bun:test';
import {
  BazarrClient,
  JellyfinClient,
  LidarrClient,
  ProwlarrClient,
  QBittorrentClient,
  RadarrClient,
  ReadarrClient,
  SeerrClient,
  SonarrClient,
} from '../src/index.js';

/**
 * Each generated client module exports a singleton that every operation falls
 * back to. Configuring a wrapper by mutating that singleton meant the last
 * client constructed won: a second instance silently rebound the first one's
 * base URL and credentials, sending API keys to the wrong server with no error.
 *
 * These tests pin the isolation. See src/core/bind-api.ts.
 */

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

interface Captured {
  url: string;
  auth: string | null;
}

function captureRequests(): Captured[] {
  const captured: Captured[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input instanceof Request ? input.url : String(input);
    const headers = new Headers(input instanceof Request ? input.headers : (init?.headers ?? {}));
    captured.push({
      url,
      auth: headers.get('authorization') ?? headers.get('x-api-key') ?? null,
    });
    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
  }) as typeof globalThis.fetch;
  return captured;
}

const apiKeyClients: Array<
  [string, (baseUrl: string, apiKey: string) => { getSystemStatus: () => Promise<unknown> }]
> = [
  ['RadarrClient', (baseUrl, apiKey) => new RadarrClient({ baseUrl, apiKey })],
  ['SonarrClient', (baseUrl, apiKey) => new SonarrClient({ baseUrl, apiKey })],
  ['LidarrClient', (baseUrl, apiKey) => new LidarrClient({ baseUrl, apiKey })],
  ['ReadarrClient', (baseUrl, apiKey) => new ReadarrClient({ baseUrl, apiKey })],
  ['ProwlarrClient', (baseUrl, apiKey) => new ProwlarrClient({ baseUrl, apiKey })],
  ['BazarrClient', (baseUrl, apiKey) => new BazarrClient({ baseUrl, apiKey })],
  ['SeerrClient', (baseUrl, apiKey) => new SeerrClient({ baseUrl, apiKey })],
  ['JellyfinClient', (baseUrl, apiKey) => new JellyfinClient({ baseUrl, apiKey })],
];

describe('client instance isolation', () => {
  for (const [name, create] of apiKeyClients) {
    it(`${name} does not leak config to another instance`, async () => {
      const captured = captureRequests();

      const alpha = create('http://alpha', 'KEY-ALPHA');
      // Constructing beta must not rebind alpha.
      const beta = create('http://beta', 'KEY-BETA');

      await alpha.getSystemStatus();
      await beta.getSystemStatus();

      expect(captured).toHaveLength(2);
      expect(captured[0].url).toContain('alpha');
      expect(captured[1].url).toContain('beta');
      expect(captured[0].url).not.toContain('beta');
    });

    it(`${name} sends each instance its own credential`, async () => {
      const captured = captureRequests();

      const alpha = create('http://alpha', 'KEY-ALPHA');
      create('http://beta', 'KEY-BETA');
      await alpha.getSystemStatus();

      expect(captured).toHaveLength(1);
      // A credential leak is the dangerous half of this bug: the wrong server
      // receiving a key it should never see.
      expect(captured[0].auth ?? '').toContain('KEY-ALPHA');
      expect(captured[0].auth ?? '').not.toContain('KEY-BETA');
    });
  }

  it('QBittorrentClient does not leak config to another instance', async () => {
    const captured = captureRequests();

    const alpha = new QBittorrentClient({
      baseUrl: 'http://alpha',
      username: 'a',
      password: 'a',
    });
    new QBittorrentClient({ baseUrl: 'http://beta', username: 'b', password: 'b' });

    await alpha.getSystemStatus();

    expect(captured.length).toBeGreaterThan(0);
    expect(captured.every(c => c.url.includes('alpha'))).toBe(true);
  });

  it('updateConfig on one client does not affect another', async () => {
    const captured = captureRequests();

    const alpha = new JellyfinClient({ baseUrl: 'http://alpha', apiKey: 'KEY-ALPHA' });
    const beta = new JellyfinClient({ baseUrl: 'http://beta', apiKey: 'KEY-BETA' });

    beta.updateConfig({ baseUrl: 'http://gamma' });
    await alpha.getSystemStatus();

    expect(captured).toHaveLength(1);
    expect(captured[0].url).toContain('alpha');
  });
});
