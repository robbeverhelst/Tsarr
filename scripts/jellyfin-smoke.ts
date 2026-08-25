#!/usr/bin/env bun
/**
 * Exercises every `tsarr jellyfin` command against the local test bed.
 *
 *   bun run testbed:up
 *   bun run testbed:smoke
 *
 * This drives the real CLI as a subprocess — the same binary a user runs — so it
 * covers argument parsing, output formatting and error handling, not just the
 * client wrapper. Read-only commands run first; mutations run last against
 * fixtures the test bed owns.
 */

import { existsSync, readFileSync } from 'node:fs';

const ENV_FILE = './.env.test';

if (!existsSync(ENV_FILE)) {
  console.error(`${ENV_FILE} not found. Run \`bun run testbed:up\` first.`);
  process.exit(1);
}

const testbedEnv = Object.fromEntries(
  readFileSync(ENV_FILE, 'utf-8')
    .split('\n')
    .filter(line => line.includes('='))
    .map(line => {
      const index = line.indexOf('=');
      return [line.slice(0, index), line.slice(index + 1)];
    })
);

const env = { ...process.env, ...testbedEnv };
const userId = testbedEnv.JELLYFIN_USER_ID;

interface Result {
  name: string;
  argv: string[];
  ok: boolean;
  detail: string;
}

const results: Result[] = [];

function cli(args: string[]): { code: number; stdout: string; stderr: string } {
  const proc = Bun.spawnSync(['bun', 'run', 'src/cli/index.ts', ...args], {
    env,
    stdout: 'pipe',
    stderr: 'pipe',
  });
  return {
    code: proc.exitCode ?? 1,
    stdout: new TextDecoder().decode(proc.stdout),
    stderr: new TextDecoder().decode(proc.stderr),
  };
}

/** Run a command and assert on its output. */
function check(name: string, args: string[], assert?: (stdout: string) => string | null) {
  const { code, stdout, stderr } = cli(args);
  if (code !== 0) {
    results.push({
      name,
      argv: args,
      ok: false,
      detail: stderr.trim().split('\n')[0] || `exit ${code}`,
    });
    return null;
  }
  const problem = assert?.(stdout) ?? null;
  results.push({
    name,
    argv: args,
    ok: problem === null,
    detail: problem ?? 'ok',
  });
  return stdout;
}

function json(stdout: string): any {
  try {
    return JSON.parse(stdout);
  } catch {
    return null;
  }
}

function expectJsonArray(min: number) {
  return (stdout: string) => {
    const data = json(stdout);
    if (!Array.isArray(data)) return 'expected a JSON array';
    if (data.length < min) return `expected at least ${min} item(s), got ${data.length}`;
    return null;
  };
}

function expectField(field: string) {
  return (stdout: string) => {
    const data = json(stdout);
    const record = Array.isArray(data) ? data[0] : data;
    if (!record || record[field] === undefined) return `missing field "${field}"`;
    return null;
  };
}

console.log('🔍 Exercising the Jellyfin CLI against the test bed...\n');

// ---- system -------------------------------------------------------------
check('system status', ['jellyfin', 'system', 'status', '--json'], expectField('Version'));
check('system status (table)', ['jellyfin', 'system', 'status', '--table'], stdout =>
  stdout.includes('10.11') || stdout.includes('12.') ? null : 'no version in table output'
);
check(
  'system activity',
  ['jellyfin', 'system', 'activity', '--limit', '5', '--json'],
  expectJsonArray(1)
);

// ---- doctor -------------------------------------------------------------
check('doctor sees jellyfin', ['doctor', '--json'], stdout => {
  const data = json(stdout);
  const row = (data ?? []).find((r: any) => r.service === 'jellyfin');
  if (!row) return 'jellyfin missing from doctor output';
  if (row.status !== 'ok') return `doctor status is "${row.status}"`;
  if (!row.version) return 'doctor reported no version';
  return null;
});

// ---- library ------------------------------------------------------------
check('library folders', ['jellyfin', 'library', 'folders', '--json'], expectJsonArray(2));
check('library refresh', ['jellyfin', 'library', 'refresh']);

// ---- users --------------------------------------------------------------
check('user list', ['jellyfin', 'user', 'list', '--json'], expectJsonArray(1));
check('user get', ['jellyfin', 'user', 'get', '--id', userId, '--json'], expectField('Name'));

// ---- items --------------------------------------------------------------
const moviesOut = check(
  'item list (movies)',
  ['jellyfin', 'item', 'list', '--type', 'Movie', '--json'],
  expectJsonArray(2)
);
const movies = json(moviesOut ?? '[]') ?? [];
const movieId: string | undefined = movies[0]?.Id;

check(
  'item list (search)',
  ['jellyfin', 'item', 'list', '--search', 'Matrix', '--json'],
  expectJsonArray(1)
);
check(
  'item list (limit)',
  ['jellyfin', 'item', 'list', '--type', 'Movie', '--limit', '1', '--json'],
  stdout => {
    const data = json(stdout);
    return Array.isArray(data) && data.length === 1 ? null : 'limit was not applied';
  }
);
check(
  'item list (episodes)',
  ['jellyfin', 'item', 'list', '--type', 'Episode', '--json'],
  expectJsonArray(2)
);
check('item list (quiet)', ['jellyfin', 'item', 'list', '--type', 'Movie', '--quiet'], stdout =>
  stdout.trim().split('\n').length >= 2 ? null : 'expected one ID per line'
);
check(
  'item list (select)',
  ['jellyfin', 'item', 'list', '--type', 'Movie', '--json', '--select', 'Id,Name'],
  stdout => {
    const data = json(stdout);
    const keys = Object.keys(data?.[0] ?? {});
    return keys.length === 2 && keys.includes('Id') && keys.includes('Name')
      ? null
      : `unexpected keys: ${keys.join(',')}`;
  }
);
check(
  'item list (plain/TSV)',
  ['jellyfin', 'item', 'list', '--type', 'Movie', '--plain'],
  stdout => (stdout.includes('\t') ? null : 'expected tab-separated output')
);
check('item counts', ['jellyfin', 'item', 'counts', '--json'], expectField('MovieCount'));
check(
  'item latest',
  ['jellyfin', 'item', 'latest', '--user', userId, '--json'],
  expectJsonArray(1)
);
check('item nextup', ['jellyfin', 'item', 'nextup', '--user', userId, '--json']);
check('item resume', ['jellyfin', 'item', 'resume', '--user', userId, '--json']);

if (movieId) {
  check(
    'item get',
    ['jellyfin', 'item', 'get', '--id', movieId, '--user', userId, '--json'],
    expectField('Name')
  );
  check('item refresh', ['jellyfin', 'item', 'refresh', '--id', movieId, '--mode', 'FullRefresh']);
}

// ---- search -------------------------------------------------------------
check(
  'search query',
  ['jellyfin', 'search', 'query', '--query', 'Matrix', '--json'],
  expectJsonArray(1)
);

// ---- sessions -----------------------------------------------------------
check('session list', ['jellyfin', 'session', 'list', '--json']);
check('session list (active-within)', [
  'jellyfin',
  'session',
  'list',
  '--active-within',
  '300',
  '--json',
]);

// ---- tasks --------------------------------------------------------------
const tasksOut = check('task list', ['jellyfin', 'task', 'list', '--json'], expectJsonArray(5));
const tasks = json(tasksOut ?? '[]') ?? [];
const cacheTask = tasks.find((t: any) => t.Name === 'Clean Cache Directory');
if (cacheTask) {
  check('task start', ['jellyfin', 'task', 'start', '--id', cacheTask.Id]);
}

// ---- watched state round-trip -------------------------------------------
if (movieId) {
  check(
    'watched status (initial)',
    ['jellyfin', 'watched', 'status', '--id', movieId, '--user', userId, '--json'],
    stdout => {
      const data = json(stdout);
      return data?.Played === false ? null : `expected Played=false, got ${data?.Played}`;
    }
  );
  check('watched mark', ['jellyfin', 'watched', 'mark', '--id', movieId, '--user', userId]);
  check(
    'watched status (after mark)',
    ['jellyfin', 'watched', 'status', '--id', movieId, '--user', userId, '--json'],
    stdout => {
      const data = json(stdout);
      return data?.Played === true ? null : `expected Played=true, got ${data?.Played}`;
    }
  );
  check('watched unmark', ['jellyfin', 'watched', 'unmark', '--id', movieId, '--user', userId]);
  check(
    'watched status (after unmark)',
    ['jellyfin', 'watched', 'status', '--id', movieId, '--user', userId, '--json'],
    stdout => {
      const data = json(stdout);
      return data?.Played === false ? null : `expected Played=false, got ${data?.Played}`;
    }
  );
  check('watched favorite', ['jellyfin', 'watched', 'favorite', '--id', movieId, '--user', userId]);
  check(
    'watched status (favorited)',
    ['jellyfin', 'watched', 'status', '--id', movieId, '--user', userId, '--json'],
    stdout => {
      const data = json(stdout);
      return data?.IsFavorite === true ? null : `expected IsFavorite=true, got ${data?.IsFavorite}`;
    }
  );
  check('watched unfavorite', [
    'jellyfin',
    'watched',
    'unfavorite',
    '--id',
    movieId,
    '--user',
    userId,
  ]);
}

// ---- dry run and confirmation guards ------------------------------------
check(
  'dry-run skips execution',
  ['jellyfin', 'library', 'refresh', '--dry-run', '--json'],
  stdout => {
    const data = json(stdout);
    return data?.dryRun === true && data?.service === 'jellyfin'
      ? null
      : 'unexpected dry-run payload';
  }
);
if (movieId) {
  check(
    'item delete honours --dry-run',
    ['jellyfin', 'item', 'delete', '--id', movieId, '--dry-run', '--json'],
    stdout => {
      const data = json(stdout);
      return data?.dryRun === true ? null : 'delete did not respect --dry-run';
    }
  );
}

// ---- library add/remove round-trip --------------------------------------
check('library add', [
  'jellyfin',
  'library',
  'add',
  '--name',
  'SmokeTest',
  '--collection-type',
  'movies',
  '--paths',
  '/media/movies',
]);
check(
  'library folders includes new library',
  ['jellyfin', 'library', 'folders', '--json'],
  stdout => {
    const data = json(stdout);
    return (data ?? []).some((f: any) => f.Name === 'SmokeTest')
      ? null
      : 'SmokeTest library not found';
  }
);
check('library remove', ['jellyfin', 'library', 'remove', '--name', 'SmokeTest', '--yes']);
check('library folders after remove', ['jellyfin', 'library', 'folders', '--json'], stdout => {
  const data = json(stdout);
  return (data ?? []).some((f: any) => f.Name === 'SmokeTest')
    ? 'SmokeTest library still present'
    : null;
});

// ---- playlists ----------------------------------------------------------
if (movieId) {
  const createdOut = check(
    'playlist create',
    ['jellyfin', 'playlist', 'create', '--name', 'SmokePlaylist', '--user', userId, '--json'],
    expectField('Id')
  );
  const playlistId = json(createdOut ?? '{}')?.Id;

  if (playlistId) {
    check('playlist add', [
      'jellyfin',
      'playlist',
      'add',
      '--id',
      playlistId,
      '--items',
      movieId,
      '--user',
      userId,
    ]);
    const itemsOut = check(
      'playlist items',
      ['jellyfin', 'playlist', 'items', '--id', playlistId, '--user', userId, '--json'],
      expectJsonArray(1)
    );
    const entryId = (json(itemsOut ?? '[]') ?? [])[0]?.PlaylistItemId;

    // A playlist is an item, so its details come from `item get`. There is no
    // `playlist get` because GetPlaylist needs a user-context token.
    check(
      'playlist details via item get',
      ['jellyfin', 'item', 'get', '--id', playlistId, '--user', userId, '--json'],
      expectField('Name')
    );
    if (entryId) {
      check('playlist remove', [
        'jellyfin',
        'playlist',
        'remove',
        '--id',
        playlistId,
        '--entries',
        entryId,
        '--yes',
      ]);
      check(
        'playlist empty after remove',
        ['jellyfin', 'playlist', 'items', '--id', playlistId, '--user', userId, '--json'],
        stdout => {
          const data = json(stdout);
          return Array.isArray(data) && data.length === 0 ? null : 'entries were not removed';
        }
      );
    }
    cli(['jellyfin', 'item', 'delete', '--id', playlistId, '--yes']);
  }
}

// ---- collections --------------------------------------------------------
if (movieId) {
  const createdOut = check(
    'collection create',
    ['jellyfin', 'collection', 'create', '--name', 'SmokeCollection', '--json'],
    expectField('Id')
  );
  const collectionId = json(createdOut ?? '{}')?.Id;
  if (collectionId) {
    check('collection add', [
      'jellyfin',
      'collection',
      'add',
      '--id',
      collectionId,
      '--items',
      movieId,
    ]);
    check('collection remove', [
      'jellyfin',
      'collection',
      'remove',
      '--id',
      collectionId,
      '--items',
      movieId,
      '--yes',
    ]);
    cli(['jellyfin', 'item', 'delete', '--id', collectionId, '--yes']);
  }
}

// ---- session remote control ---------------------------------------------
{
  const sessions = json(cli(['jellyfin', 'session', 'list', '--json']).stdout) ?? [];
  const sessionId = sessions[0]?.Id;
  if (sessionId) {
    check('session message', [
      'jellyfin',
      'session',
      'message',
      '--id',
      sessionId,
      '--text',
      'tsarr smoke',
      '--header',
      'tsarr',
    ]);
  }
  // Commands against an unknown session must fail, not silently succeed.
  const { code } = cli([
    'jellyfin',
    'session',
    'pause',
    '--id',
    'deadbeefdeadbeefdeadbeefdeadbeef',
  ]);
  results.push({
    name: 'session pause on unknown session fails',
    argv: ['jellyfin', 'session', 'pause', '--id', '<bogus>'],
    ok: code !== 0,
    detail: code !== 0 ? 'ok' : 'expected a non-zero exit',
  });
}

// ---- invalid input handling ---------------------------------------------
{
  const { code, stderr } = cli([
    'jellyfin',
    'item',
    'get',
    '--id',
    'not-a-real-id',
    '--user',
    userId,
    '--json',
  ]);
  results.push({
    name: 'unknown item id fails cleanly',
    argv: ['jellyfin', 'item', 'get', '--id', 'not-a-real-id', '--user', '<userId>'],
    ok: code !== 0 && /not found|error/i.test(stderr),
    detail: code !== 0 ? 'ok' : 'expected a non-zero exit',
  });
}
{
  const { code, stderr } = cli(['jellyfin', 'item', 'refresh', '--id', 'x', '--mode', 'Bogus']);
  results.push({
    name: 'invalid --mode is rejected',
    argv: ['jellyfin', 'item', 'refresh', '--mode', 'Bogus'],
    ok: code !== 0 && /Invalid mode/i.test(stderr),
    detail: code !== 0 ? 'ok' : 'expected validation to reject the value',
  });
}

// ---- report -------------------------------------------------------------
console.log('');
const width = Math.max(...results.map(r => r.name.length));
for (const result of results) {
  const icon = result.ok ? '✅' : '❌';
  const detail = result.ok ? '' : `  ← ${result.detail}`;
  console.log(`${icon} ${result.name.padEnd(width)}${detail}`);
}

const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log('\nFailed commands:');
  for (const f of failed) console.log(`  tsarr ${f.argv.join(' ')}`);
  process.exit(1);
}
