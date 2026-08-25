#!/usr/bin/env bun

/**
 * Local integration test bed.
 *
 *   bun run testbed:up      start Jellyfin, run its setup wizard, seed a library
 *   bun run testbed:env     print shell exports for the running test bed
 *   bun run testbed:down    stop everything and delete all state
 *
 * `up` is idempotent: re-running it against a live test bed reuses the existing
 * API key rather than re-running the wizard.
 */

import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const COMPOSE_FILE = './docker/compose.test.yml';
const MEDIA_ROOT = './docker/testdata/media';
const ENV_FILE = './.env.test';
const BASE_URL = process.env.TESTBED_JELLYFIN_URL ?? 'http://localhost:18096';

const USERNAME = 'tsarr';
const PASSWORD = 'tsarr-testbed';
const CLIENT_AUTH =
  'MediaBrowser Client="tsarr-testbed", Device="testbed", DeviceId="tsarr-testbed", Version="1.0.0"';

/** Fixture media. Jellyfin identifies these from the filename alone. */
const MEDIA_FIXTURES = [
  'movies/The Matrix (1999)/The Matrix (1999).mkv',
  'movies/Blade Runner (1982)/Blade Runner (1982).mkv',
  'shows/Firefly (2002)/Season 01/Firefly (2002) - S01E01 - Serenity.mkv',
  'shows/Firefly (2002)/Season 01/Firefly (2002) - S01E02 - The Train Job.mkv',
];

const LIBRARIES = [
  { name: 'Movies', collectionType: 'movies', path: '/media/movies' },
  { name: 'Shows', collectionType: 'tvshows', path: '/media/shows' },
];

function run(cmd: string[], opts: { quiet?: boolean } = {}) {
  const proc = Bun.spawnSync(cmd, { stdout: opts.quiet ? 'pipe' : 'inherit', stderr: 'pipe' });
  if (proc.exitCode !== 0) {
    const stderr = proc.stderr ? new TextDecoder().decode(proc.stderr) : '';
    throw new Error(`Command failed: ${cmd.join(' ')}\n${stderr}`);
  }
  return proc.stdout ? new TextDecoder().decode(proc.stdout) : '';
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface ApiResult {
  status: number;
  json: any;
  text: string;
}

async function api(
  method: string,
  path: string,
  options: { body?: unknown; auth?: string } = {}
): Promise<ApiResult> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.auth) headers.Authorization = options.auth;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await response.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // Several Jellyfin endpoints return 204 with an empty body.
  }
  return { status: response.status, json, text };
}

function seedMedia() {
  rmSync(MEDIA_ROOT, { recursive: true, force: true });
  for (const fixture of MEDIA_FIXTURES) {
    const target = join(MEDIA_ROOT, fixture);
    mkdirSync(dirname(target), { recursive: true });
    // Jellyfin only needs a non-empty file; it matches metadata on the filename.
    writeFileSync(target, randomBytes(64 * 1024));
  }
  console.log(`🎬 Seeded ${MEDIA_FIXTURES.length} media fixtures in ${MEDIA_ROOT}`);
}

/**
 * Jellyfin answers on the port well before it can serve the API, and returns a
 * 503 "Jellyfin Startup" HTML page in the meantime. Only a JSON body carrying a
 * Version means the server is genuinely ready.
 */
async function waitForServer(label = 'Jellyfin', timeoutMs = 240_000) {
  const start = Date.now();
  process.stdout.write(`⏳ Waiting for ${label}`);
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(`${BASE_URL}/System/Info/Public`);
      if (response.ok) {
        const contentType = response.headers.get('content-type') ?? '';
        if (contentType.includes('application/json')) {
          const info = await response.json();
          if (info?.Version) {
            console.log(`\n✅ Jellyfin ${info.Version} is up at ${BASE_URL}`);
            return info;
          }
        }
      }
    } catch {
      // not listening yet
    }
    process.stdout.write('.');
    await sleep(2000);
  }
  throw new Error(`${label} did not become ready within ${timeoutMs}ms`);
}

async function completeWizard() {
  const info = await api('GET', '/System/Info/Public');
  if (info.json?.StartupWizardCompleted) {
    console.log('↩️  Setup wizard already completed, skipping');
    return;
  }

  console.log('🧙 Running setup wizard...');
  await api('POST', '/Startup/Configuration', {
    body: { UICulture: 'en-US', MetadataCountryCode: 'US', PreferredMetadataLanguage: 'en' },
  });
  // Must be called before POST /Startup/User or the latter 404s.
  await api('GET', '/Startup/FirstUser');
  await api('POST', '/Startup/User', { body: { Name: USERNAME, Password: PASSWORD } });
  await api('POST', '/Startup/RemoteAccess', {
    body: { EnableRemoteAccess: true, EnableAutomaticPortMapping: false },
  });
  await api('POST', '/Startup/Complete');
  console.log('✅ Wizard complete');
  // Completing the wizard reloads the server; it briefly 503s again.
  await sleep(2000);
  await waitForServer('Jellyfin (post-wizard)');
}

async function authenticate(): Promise<{ token: string; userId: string }> {
  const auth = await api('POST', '/Users/AuthenticateByName', {
    body: { Username: USERNAME, Pw: PASSWORD },
    auth: CLIENT_AUTH,
  });
  if (auth.status !== 200 || !auth.json?.AccessToken) {
    throw new Error(`Authentication failed (${auth.status}): ${auth.text.slice(0, 200)}`);
  }
  return { token: auth.json.AccessToken, userId: auth.json.User.Id };
}

async function ensureApiKey(userToken: string): Promise<string> {
  const auth = `MediaBrowser Token="${userToken}"`;
  const existing = await api('GET', '/Auth/Keys', { auth });
  const found = (existing.json?.Items ?? []).find((key: any) => key.AppName === 'tsarr-testbed');
  if (found?.AccessToken) {
    console.log('🔑 Reusing existing API key');
    return found.AccessToken;
  }

  await api('POST', '/Auth/Keys?App=tsarr-testbed', { auth });
  const refreshed = await api('GET', '/Auth/Keys', { auth });
  const key = (refreshed.json?.Items ?? []).find((k: any) => k.AppName === 'tsarr-testbed');
  if (!key?.AccessToken) throw new Error('Failed to create an API key');
  console.log('🔑 Created API key');
  return key.AccessToken;
}

/** Retry a request that can transiently fail while the server settles. */
async function withRetry(
  label: string,
  fn: () => Promise<ApiResult>,
  attempts = 5
): Promise<ApiResult> {
  let last: ApiResult | null = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    last = await fn();
    if (last.status < 400) return last;
    if (attempt < attempts) {
      console.log(`   ↻ ${label} returned ${last.status}, retrying (${attempt}/${attempts - 1})`);
      await sleep(3000);
    }
  }
  return last as ApiResult;
}

async function ensureLibraries(apiKey: string) {
  const auth = `MediaBrowser Token="${apiKey}"`;
  const existing = await api('GET', '/Library/VirtualFolders', { auth });
  const names = new Set((existing.json ?? []).map((f: any) => f.Name));

  for (const library of LIBRARIES) {
    if (names.has(library.name)) {
      console.log(`↩️  Library "${library.name}" already exists`);
      continue;
    }
    const query = new URLSearchParams({
      name: library.name,
      collectionType: library.collectionType,
      refreshLibrary: 'true',
    });
    query.append('paths', library.path);
    // The server can still be initialising just after the wizard and reject
    // library creation with a 400, so retry a few times before giving up.
    const result = await withRetry(`add library "${library.name}"`, () =>
      api('POST', `/Library/VirtualFolders?${query}`, {
        auth,
        // Reduce work and network chatter during the scan. Note this does NOT
        // fully suppress provider metadata (Jellyfin still resolves items it has
        // already matched), so integration assertions must stay provider-agnostic.
        body: {
          LibraryOptions: {
            EnableInternetProviders: false,
            SaveLocalMetadata: false,
            EnableChapterImageExtraction: false,
            EnableTrickplayImageExtraction: false,
          },
        },
      })
    );
    if (result.status >= 400) {
      throw new Error(`Failed to add library ${library.name} (${result.status})`);
    }
    console.log(`📚 Added library "${library.name}" -> ${library.path}`);
  }
}

/**
 * Item counts settle before the search index and parsed metadata do, so waiting
 * on counts alone leaves tests racing the scanner. Wait until a search by name
 * returns a fixture with its ProductionYear populated — that is the last thing
 * to land, and it is what the integration tests actually assert on.
 */
async function waitForScan(apiKey: string, timeoutMs = 180_000) {
  const auth = `MediaBrowser Token="${apiKey}"`;
  await api('POST', '/Library/Refresh', { auth });

  const start = Date.now();
  process.stdout.write('⏳ Waiting for library scan');
  while (Date.now() - start < timeoutMs) {
    const counts = await api('GET', '/Items/Counts', { auth });
    const movies = counts.json?.MovieCount ?? 0;
    const episodes = counts.json?.EpisodeCount ?? 0;

    if (movies >= 2 && episodes >= 2) {
      const [movieHit, episodeList] = await Promise.all([
        api('GET', '/Items?includeItemTypes=Movie&recursive=true&searchTerm=Matrix', { auth }),
        api('GET', '/Items?includeItemTypes=Episode&recursive=true', { auth }),
      ]);

      const movieReady = Boolean((movieHit.json?.Items ?? [])[0]?.ProductionYear);
      // Episodes are created before their season/episode numbers are filled in.
      const episodeItems = episodeList.json?.Items ?? [];
      const episodesReady =
        episodeItems.length >= 2 &&
        episodeItems.every(
          (item: any) => item.ParentIndexNumber != null && item.IndexNumber != null
        );

      if (movieReady && episodesReady) {
        console.log(
          `\n✅ Scan complete: ${movies} movies, ${episodes} episodes (metadata settled)`
        );
        return;
      }
    }
    process.stdout.write('.');
    await sleep(3000);
  }
  throw new Error('Library scan did not settle within the timeout');
}

function writeEnvFile(values: Record<string, string>) {
  const body = `${Object.entries(values)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')}\n`;
  writeFileSync(ENV_FILE, body);
  console.log(`📝 Wrote ${ENV_FILE}`);
}

function readEnvFile(): Record<string, string> {
  if (!existsSync(ENV_FILE)) {
    throw new Error(`${ENV_FILE} not found. Run \`bun run testbed:up\` first.`);
  }
  return Object.fromEntries(
    readFileSync(ENV_FILE, 'utf-8')
      .split('\n')
      .filter(line => line.includes('='))
      .map(line => {
        const index = line.indexOf('=');
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

async function up() {
  seedMedia();
  console.log('🐳 Starting containers...');
  run(['docker', 'compose', '-f', COMPOSE_FILE, 'up', '-d']);

  await waitForServer();
  await completeWizard();
  const { token, userId } = await authenticate();
  const apiKey = await ensureApiKey(token);
  await ensureLibraries(apiKey);
  await waitForScan(apiKey);

  writeEnvFile({
    TSARR_JELLYFIN_URL: BASE_URL,
    TSARR_JELLYFIN_API_KEY: apiKey,
    JELLYFIN_BASE_URL: BASE_URL,
    JELLYFIN_API_KEY: apiKey,
    JELLYFIN_USER_ID: userId,
  });

  console.log('\n🎉 Test bed ready.\n');
  console.log('   bun run test:integration        run the integration suite');
  console.log('   bun run testbed:smoke           exercise every Jellyfin CLI command');
  console.log('   eval "$(bun run testbed:env)"   load credentials into your shell');
  console.log('   bun run testbed:down            tear it all down');
}

function env() {
  const values = readEnvFile();
  for (const [key, value] of Object.entries(values)) {
    console.log(`export ${key}=${value}`);
  }
}

function down() {
  console.log('🧹 Stopping containers and removing volumes...');
  run(['docker', 'compose', '-f', COMPOSE_FILE, 'down', '-v']);
  rmSync(MEDIA_ROOT, { recursive: true, force: true });
  rmSync(ENV_FILE, { force: true });
  console.log('✅ Test bed removed');
}

const command = process.argv[2];
try {
  if (command === 'up') await up();
  else if (command === 'down') down();
  else if (command === 'env') env();
  else {
    console.error('Usage: bun run scripts/testbed.ts <up|down|env>');
    process.exit(1);
  }
} catch (error) {
  console.error(`\n💥 ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
