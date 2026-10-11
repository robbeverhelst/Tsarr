import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import consola from 'consola';
import { testConnection } from '../src/cli/commands/config.js';

/**
 * End-to-end checks for how `doctor` and service commands report a server
 * that answers with an error, or does not answer at all. Each case runs the
 * real CLI against a local stub server.
 */

const CLI_ENTRY = resolve(process.cwd(), 'src/cli/index.ts');
const SERVICES = [
  'radarr',
  'sonarr',
  'lidarr',
  'readarr',
  'prowlarr',
  'bazarr',
  'qbittorrent',
  'seerr',
  'jellyfin',
];

let server: ReturnType<typeof Bun.serve>;
let closedPortUrl: string;
let tempHome: string;

beforeAll(() => {
  tempHome = mkdtempSync(join(tmpdir(), 'tsarr-conn-'));
  server = Bun.serve({
    port: 0,
    fetch(req) {
      const path = new URL(req.url).pathname;
      if (path.startsWith('/ok/')) return Response.json({ version: '5.1.0' });
      if (path.startsWith('/bazarr/')) return Response.json({ data: { bazarr_version: '1.4.2' } });
      if (path.startsWith('/unauthorized/')) return new Response('', { status: 401 });
      if (path.startsWith('/missing/')) return new Response('', { status: 404 });
      return Response.json({ message: 'Boom from server' }, { status: 500 });
    },
  });
  const probe = Bun.serve({ port: 0, fetch: () => new Response('') });
  closedPortUrl = `http://127.0.0.1:${probe.port}`;
  probe.stop(true);
});

afterAll(() => {
  server.stop(true);
  rmSync(tempHome, { recursive: true, force: true });
});

function serverUrl(prefix: string): string {
  return `http://127.0.0.1:${server.port}/${prefix}`;
}

async function runCli(args: string[], env: Record<string, string>) {
  const blanked: Record<string, string> = {};
  for (const service of SERVICES) {
    const upper = service.toUpperCase();
    for (const suffix of ['URL', 'API_KEY', 'TIMEOUT', 'USERNAME', 'PASSWORD']) {
      blanked[`TSARR_${upper}_${suffix}`] = '';
    }
  }
  const proc = Bun.spawn(['bun', 'run', CLI_ENTRY, ...args], {
    cwd: tempHome,
    env: { ...process.env, ...blanked, HOME: tempHome, ...env },
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { stdout, stderr, exitCode };
}

async function doctorEntry(service: string, url: string) {
  const upper = service.toUpperCase();
  const result = await runCli(['doctor', '--json'], {
    [`TSARR_${upper}_URL`]: url,
    [`TSARR_${upper}_API_KEY`]: 'test-key',
  });
  const entries = JSON.parse(result.stdout) as Array<Record<string, unknown>>;
  return entries.find(e => e.service === service);
}

describe('doctor connection reporting', () => {
  it('reports ok with the server version', async () => {
    const entry = await doctorEntry('radarr', serverUrl('ok'));
    expect(entry).toMatchObject({ status: 'ok', configured: true, version: '5.1.0' });
  });

  it("reads Bazarr's nested version field", async () => {
    const entry = await doctorEntry('bazarr', serverUrl('bazarr'));
    expect(entry).toMatchObject({ status: 'ok', version: '1.4.2' });
  });

  it('reports a failure when the server rejects the API key', async () => {
    const entry = await doctorEntry('radarr', serverUrl('unauthorized'));
    expect(entry).toMatchObject({ status: 'fail', error: 'Unknown API error' });
  });

  it('passes through an API error message', async () => {
    const entry = await doctorEntry('radarr', serverUrl('boom'));
    expect(entry).toMatchObject({ status: 'fail', error: 'Boom from server' });
  });

  it('classifies a refused connection', async () => {
    const entry = await doctorEntry('radarr', closedPortUrl);
    expect(entry).toMatchObject({
      status: 'fail',
      error: 'Connection refused - is the service running?',
    });
  });
});

describe('service command error reporting', () => {
  async function systemStatus(url: string) {
    return runCli(['radarr', 'system', 'status', '--json'], {
      TSARR_RADARR_URL: url,
      TSARR_RADARR_API_KEY: 'test-key',
    });
  }

  it('prints the result on success', async () => {
    const result = await systemStatus(serverUrl('ok'));
    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({ version: '5.1.0' });
  });

  it('explains a 401', async () => {
    const result = await systemStatus(serverUrl('unauthorized'));
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Unauthorized. Check your API key.');
  });

  it('explains a 404', async () => {
    const result = await systemStatus(serverUrl('missing'));
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Not found.');
  });

  it('passes through an API error message', async () => {
    const result = await systemStatus(serverUrl('boom'));
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Boom from server');
  });

  it('classifies a refused connection', async () => {
    const result = await systemStatus(closedPortUrl);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Connection refused. Is radarr running?');
    expect(result.stderr).toContain('Run `tsarr doctor` to diagnose.');
  });
});

describe('config init connection test', () => {
  async function capture(service: 'radarr' | 'bazarr', baseUrl: string, name?: string) {
    const messages: Array<[string, string]> = [];
    const original = { success: consola.success, warn: consola.warn };
    consola.success = ((msg: string) => messages.push(['success', msg])) as typeof consola.success;
    consola.warn = ((msg: string) => messages.push(['warn', msg])) as typeof consola.warn;
    try {
      await testConnection(service, { baseUrl, apiKey: 'test-key', ...(name ? { name } : {}) });
    } finally {
      consola.success = original.success;
      consola.warn = original.warn;
    }
    return messages;
  }

  it('reports the connected version', async () => {
    expect(await capture('radarr', serverUrl('ok'))).toEqual([
      ['success', 'Connected to radarr v5.1.0'],
    ]);
  });

  it("reads Bazarr's nested version field", async () => {
    expect(await capture('bazarr', serverUrl('bazarr'), 'main')).toEqual([
      ['success', 'Connected to bazarr (main) v1.4.2'],
    ]);
  });

  it('does not claim success when the server rejects the API key', async () => {
    expect(await capture('radarr', serverUrl('unauthorized'))).toEqual([
      ['warn', 'Could not connect to radarr — config saved anyway.'],
    ]);
  });

  it('warns when the server is unreachable', async () => {
    expect(await capture('radarr', closedPortUrl)).toEqual([
      ['warn', 'Could not connect to radarr — config saved anyway.'],
    ]);
  });
});
