#!/usr/bin/env bun
/**
 * Environment for re-recording the README demos.
 *
 *   bun run recording:up     start the services, wait for them, write config
 *   vhs docs/vhs/hero.tape
 *   vhs docs/vhs/workflow.tape
 *   bun run recording:down   stop everything and remove the local config
 *
 * The GIFs went stale once because re-recording meant hand-configuring a stack.
 * This makes it one command.
 *
 * Writes `.tsarr.json` and `.recording-bin/tsarr` — both gitignored. The tapes
 * put `.recording-bin` first on PATH so `tsarr` runs from source.
 */

import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';

const COMPOSE_FILE = './docs/vhs/compose.recording.yml';
const CONFIG_FILE = './.tsarr.json';
const CONFIG_BACKUP = './.tsarr.json.pre-recording';
const BIN_DIR = './.recording-bin';

interface Service {
  name: string;
  container: string;
  baseUrl: string;
}

const SERVICES: Service[] = [
  { name: 'radarr', container: 'tsarr-rec-radarr', baseUrl: 'http://localhost:17878' },
  { name: 'sonarr', container: 'tsarr-rec-sonarr', baseUrl: 'http://localhost:18989' },
  { name: 'lidarr', container: 'tsarr-rec-lidarr', baseUrl: 'http://localhost:18686' },
  { name: 'prowlarr', container: 'tsarr-rec-prowlarr', baseUrl: 'http://localhost:19696' },
];

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function run(cmd: string[]) {
  const proc = Bun.spawnSync(cmd, { stdout: 'inherit', stderr: 'pipe' });
  if (proc.exitCode !== 0) {
    throw new Error(
      `Command failed: ${cmd.join(' ')}\n${proc.stderr ? new TextDecoder().decode(proc.stderr) : ''}`
    );
  }
}

function capture(cmd: string[]): string {
  const proc = Bun.spawnSync(cmd, { stdout: 'pipe', stderr: 'pipe' });
  return proc.stdout ? new TextDecoder().decode(proc.stdout) : '';
}

/** The arr apps write their generated key into config.xml on first start. */
async function waitForApiKey(service: Service, timeoutMs = 240_000): Promise<string> {
  const start = Date.now();
  process.stdout.write(`⏳ ${service.name}`);
  while (Date.now() - start < timeoutMs) {
    const xml = capture(['docker', 'exec', service.container, 'cat', '/config/config.xml']);
    const key = xml.match(/<ApiKey>([^<]+)<\/ApiKey>/)?.[1];
    if (key) {
      // The key exists before the HTTP API is listening; wait for both.
      try {
        const response = await fetch(`${service.baseUrl}/api/v3/system/status`, {
          headers: { 'X-Api-Key': key },
          signal: AbortSignal.timeout(5000),
        });
        if (response.ok || response.status === 404) {
          console.log(`\n✅ ${service.name} ready at ${service.baseUrl}`);
          return key;
        }
      } catch {
        // not listening yet
      }
    }
    process.stdout.write('.');
    await sleep(3000);
  }
  throw new Error(`${service.name} did not become ready within ${timeoutMs}ms`);
}

/** Returns Jellyfin credentials only if the server actually responds. */
async function resolveJellyfin(): Promise<{ baseUrl: string; apiKey: string } | null> {
  if (!existsSync('./.env.test')) return null;
  const env = Object.fromEntries(
    readFileSync('./.env.test', 'utf-8')
      .split('\n')
      .filter(line => line.includes('='))
      .map(line => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)])
  );
  const baseUrl = env.JELLYFIN_BASE_URL;
  const apiKey = env.JELLYFIN_API_KEY;
  if (!baseUrl || !apiKey) return null;

  try {
    const response = await fetch(`${baseUrl}/System/Info`, {
      headers: { Authorization: `MediaBrowser Token="${apiKey}"` },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
  } catch {
    return null;
  }
  return { baseUrl, apiKey };
}

function writeShim() {
  mkdirSync(BIN_DIR, { recursive: true });
  const shim = `${BIN_DIR}/tsarr`;
  writeFileSync(
    shim,
    `#!/bin/sh\n# Runs the CLI from source so recordings show current behaviour.\nexec bun run "${process.cwd()}/src/cli/index.ts" "$@"\n`
  );
  chmodSync(shim, 0o755);
  console.log(`🔧 Wrote ${shim}`);
}

async function up() {
  console.log('🐳 Starting recording services...');
  run(['docker', 'compose', '-f', COMPOSE_FILE, 'up', '-d']);

  const services: Record<string, unknown> = {};
  for (const service of SERVICES) {
    services[service.name] = { baseUrl: service.baseUrl, apiKey: await waitForApiKey(service) };
  }

  // Reuse the Jellyfin the integration test bed provisions — but only if it is
  // actually answering. `.env.test` outlives a stopped test bed, and a config
  // pointing at a dead server would put an error row in the demo.
  const jellyfin = await resolveJellyfin();
  if (jellyfin) {
    services.jellyfin = jellyfin;
    console.log('✅ jellyfin picked up from the integration test bed');
  } else {
    console.log('ℹ️  Run `bun run testbed:up` first to include Jellyfin in the recording.');
  }

  // A contributor may have a real .tsarr.json pointing at their own homelab.
  // Move it aside rather than overwriting it, and put it back on `down`.
  if (existsSync(CONFIG_FILE) && !existsSync(CONFIG_BACKUP)) {
    renameSync(CONFIG_FILE, CONFIG_BACKUP);
    console.log(`💾 Moved your existing ${CONFIG_FILE} to ${CONFIG_BACKUP}`);
  }

  writeFileSync(CONFIG_FILE, `${JSON.stringify({ services }, null, 2)}\n`);
  console.log(`📝 Wrote ${CONFIG_FILE}`);
  writeShim();

  console.log('\n🎬 Ready to record:\n');
  console.log('   vhs docs/vhs/hero.tape');
  console.log('   vhs docs/vhs/workflow.tape');
  console.log('   bun run recording:down');
}

function down() {
  console.log('🧹 Stopping recording services...');
  run(['docker', 'compose', '-f', COMPOSE_FILE, 'down', '-v']);
  rmSync(CONFIG_FILE, { force: true });
  rmSync(BIN_DIR, { recursive: true, force: true });

  if (existsSync(CONFIG_BACKUP)) {
    renameSync(CONFIG_BACKUP, CONFIG_FILE);
    console.log(`♻️  Restored your original ${CONFIG_FILE}`);
  }
  console.log('✅ Recording environment removed');
}

const command = process.argv[2];
try {
  if (command === 'up') await up();
  else if (command === 'down') down();
  else {
    console.error('Usage: bun run scripts/recording.ts <up|down>');
    process.exit(1);
  }
} catch (error) {
  console.error(`\n💥 ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
