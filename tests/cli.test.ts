import { describe, expect, it } from 'bun:test';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SERVICES } from '../src/cli/config';

const PACKAGE_VERSION = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8')) as {
  version: string;
};

/**
 * Blank every service credential so these smoke tests stay hermetic. Derived
 * from SERVICES rather than hardcoded, so a new service cannot silently leak
 * real config in — `bun test` auto-loads .env.test when the local integration
 * test bed is running.
 */
function buildCliEnv(homeDir: string): NodeJS.ProcessEnv {
  const blanked: NodeJS.ProcessEnv = {};
  for (const service of SERVICES) {
    const upper = service.toUpperCase();
    blanked[`TSARR_${upper}_URL`] = '';
    blanked[`TSARR_${upper}_API_KEY`] = '';
    blanked[`TSARR_${upper}_TIMEOUT`] = '';
    blanked[`TSARR_${upper}_USERNAME`] = '';
    blanked[`TSARR_${upper}_PASSWORD`] = '';
  }

  return {
    ...process.env,
    ...blanked,
    HOME: homeDir,
  };
}

function runCli(
  args: string[],
  env: NodeJS.ProcessEnv
): Promise<{ status: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn('bun', ['run', 'src/cli/index.ts', ...args], {
      cwd: process.cwd(),
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';

    child.stdout.setEncoding('utf-8');
    child.stderr.setEncoding('utf-8');
    child.stdout.on('data', chunk => {
      stdout += chunk;
    });
    child.stderr.on('data', chunk => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', status => resolve({ status, stdout, stderr }));
  });
}

describe('CLI smoke tests', () => {
  it('should report the package version in help output', () => {
    const tempHome = mkdtempSync(join(tmpdir(), 'tsarr-cli-'));

    try {
      const result = spawnSync('bun', ['run', 'src/cli/index.ts', '--help'], {
        cwd: process.cwd(),
        env: buildCliEnv(tempHome),
        encoding: 'utf-8',
      });

      expect(result.status).toBe(0);
      expect(result.stdout).toContain(`tsarr v${PACKAGE_VERSION.version}`);
    } finally {
      rmSync(tempHome, { recursive: true, force: true });
    }
  });

  it('should emit JSON for doctor --json', () => {
    const tempHome = mkdtempSync(join(tmpdir(), 'tsarr-cli-'));

    try {
      const result = spawnSync('bun', ['run', 'src/cli/index.ts', 'doctor', '--json'], {
        cwd: process.cwd(),
        env: buildCliEnv(tempHome),
        encoding: 'utf-8',
      });

      expect(result.status).toBe(1);

      const data = JSON.parse(result.stdout) as Array<{
        service: string;
        status: string;
        configured: boolean;
      }>;

      expect(data).toHaveLength(SERVICES.length);
      expect(data.map(item => item.service).sort()).toEqual([...SERVICES].sort());
      expect(data.every(item => item.status === 'not configured')).toBe(true);
      expect(data.every(item => item.configured === false)).toBe(true);
    } finally {
      rmSync(tempHome, { recursive: true, force: true });
    }
  });

  it('should expose non-interactive add flags for Radarr movie add', () => {
    const tempHome = mkdtempSync(join(tmpdir(), 'tsarr-cli-'));

    try {
      const result = spawnSync(
        'bun',
        ['run', 'src/cli/index.ts', 'radarr', 'movie', 'add', '--help'],
        {
          cwd: process.cwd(),
          env: buildCliEnv(tempHome),
          encoding: 'utf-8',
        }
      );

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('--tmdb-id');
      expect(result.stdout).toContain('--quality-profile-id');
      expect(result.stdout).toContain('--root-folder');
    } finally {
      rmSync(tempHome, { recursive: true, force: true });
    }
  });

  it('should expose non-interactive add flags for Sonarr series add', () => {
    const tempHome = mkdtempSync(join(tmpdir(), 'tsarr-cli-'));

    try {
      const result = spawnSync(
        'bun',
        ['run', 'src/cli/index.ts', 'sonarr', 'series', 'add', '--help'],
        {
          cwd: process.cwd(),
          env: buildCliEnv(tempHome),
          encoding: 'utf-8',
        }
      );

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('--tvdb-id');
      expect(result.stdout).toContain('--quality-profile-id');
      expect(result.stdout).toContain('--root-folder');
    } finally {
      rmSync(tempHome, { recursive: true, force: true });
    }
  });

  it('should expose Lidarr artist profile and acquisition controls', () => {
    const tempHome = mkdtempSync(join(tmpdir(), 'tsarr-cli-'));

    try {
      const result = spawnSync(
        'bun',
        ['run', 'src/cli/index.ts', 'lidarr', 'artist', 'add', '--help'],
        {
          cwd: process.cwd(),
          env: buildCliEnv(tempHome),
          encoding: 'utf-8',
        }
      );

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('--foreign-artist-id');
      expect(result.stdout).toContain('--quality-profile-id');
      expect(result.stdout).toContain('--metadata-profile-id');
      expect(result.stdout).toContain('--root-folder');
      expect(result.stdout).toContain('--no-search');

      const dryRun = spawnSync(
        'bun',
        [
          'run',
          'src/cli/index.ts',
          'lidarr',
          'artist',
          'add',
          '--term',
          'Radiohead',
          '--no-search',
          '--dry-run',
          '--json',
        ],
        {
          cwd: process.cwd(),
          env: {
            ...buildCliEnv(tempHome),
            TSARR_LIDARR_URL: 'http://localhost:8686',
            TSARR_LIDARR_API_KEY: 'test-key',
          },
          encoding: 'utf-8',
        }
      );

      expect(dryRun.status).toBe(0);
      expect(JSON.parse(dryRun.stdout).args.search).toBe(false);
    } finally {
      rmSync(tempHome, { recursive: true, force: true });
    }
  });

  it('should add a Lidarr artist non-interactively with an explicit foreign ID', async () => {
    const tempHome = mkdtempSync(join(tmpdir(), 'tsarr-cli-'));
    let postedArtist: Record<string, unknown> | undefined;
    let lookupTerm: string | null = null;
    const server = Bun.serve({
      hostname: '127.0.0.1',
      port: 0,
      async fetch(request) {
        const url = new URL(request.url);
        if (request.method === 'GET' && url.pathname === '/api/v1/artist/lookup') {
          lookupTerm = url.searchParams.get('term');
          if (lookupTerm === 'Unique Artist') {
            return Response.json([
              { artistName: 'Unique Artist', foreignArtistId: 'artist-unique' },
            ]);
          }
          return Response.json([
            { artistName: 'Radiohead Tribute', foreignArtistId: 'artist-tribute' },
            { artistName: 'Radiohead', foreignArtistId: 'artist-radiohead' },
          ]);
        }
        if (request.method === 'GET' && url.pathname === '/api/v1/qualityprofile') {
          return Response.json([{ id: 2, name: 'Lossless' }]);
        }
        if (request.method === 'GET' && url.pathname === '/api/v1/rootfolder') {
          return Response.json([{ id: 1, path: '/music', defaultMetadataProfileId: 4 }]);
        }
        if (request.method === 'GET' && url.pathname === '/api/v1/metadataprofile') {
          return Response.json([{ id: 4, name: 'Standard' }]);
        }
        if (request.method === 'POST' && url.pathname === '/api/v1/artist') {
          postedArtist = (await request.json()) as Record<string, unknown>;
          return Response.json({ ...postedArtist, id: 123 });
        }
        return new Response('Not found', { status: 404 });
      },
    });
    const buildArtistAddArgs = (term: string, foreignArtistId?: string) => [
      'lidarr',
      'artist',
      'add',
      '--term',
      term,
      ...(foreignArtistId === undefined ? [] : ['--foreign-artist-id', foreignArtistId]),
      '--quality-profile-id',
      '2',
      '--metadata-profile-id',
      '4',
      '--root-folder',
      '/music',
      '--no-search',
      '--yes',
      '--json',
    ];
    const env = {
      ...buildCliEnv(tempHome),
      TSARR_LIDARR_URL: `http://127.0.0.1:${server.port}`,
      TSARR_LIDARR_API_KEY: 'test-key',
    };

    try {
      const result = await runCli(buildArtistAddArgs('Radiohead', 'artist-radiohead'), env);

      expect(result.status).toBe(0);
      expect(result.stderr).not.toContain('Interactive selection requires a TTY.');
      expect(lookupTerm).toBe('Radiohead');
      expect(postedArtist).toMatchObject({
        artistName: 'Radiohead',
        foreignArtistId: 'artist-radiohead',
        qualityProfileId: 2,
        metadataProfileId: 4,
        rootFolderPath: '/music',
        monitored: true,
        addOptions: {
          monitor: 'all',
          searchForMissingAlbums: false,
        },
      });
      expect(JSON.parse(result.stdout)).toMatchObject({
        id: 123,
        foreignArtistId: 'artist-radiohead',
      });

      postedArtist = undefined;
      const uniqueResult = await runCli(buildArtistAddArgs('Unique Artist'), env);
      expect(uniqueResult.status).toBe(0);
      expect(postedArtist).toMatchObject({
        artistName: 'Unique Artist',
        foreignArtistId: 'artist-unique',
      });

      const ambiguousResult = await runCli(buildArtistAddArgs('Radiohead'), env);
      expect(ambiguousResult.status).toBe(1);
      expect(ambiguousResult.stderr).toContain(
        'Multiple artists matched "Radiohead". Use --foreign-artist-id <id>'
      );
    } finally {
      server.stop(true);
      rmSync(tempHome, { recursive: true, force: true });
    }
  });

  it('should expose the search limit flag for Radarr and Sonarr lookup commands', () => {
    const tempHome = mkdtempSync(join(tmpdir(), 'tsarr-cli-'));

    try {
      const commands = [
        ['run', 'src/cli/index.ts', 'radarr', 'movie', 'search', '--help'],
        ['run', 'src/cli/index.ts', 'sonarr', 'series', 'search', '--help'],
      ];

      for (const command of commands) {
        const result = spawnSync('bun', command, {
          cwd: process.cwd(),
          env: buildCliEnv(tempHome),
          encoding: 'utf-8',
        });

        expect(result.status).toBe(0);
        expect(result.stdout).toContain('--limit');
      }
    } finally {
      rmSync(tempHome, { recursive: true, force: true });
    }
  });

  it('should expose Sonarr queue and history list subcommands', () => {
    const tempHome = mkdtempSync(join(tmpdir(), 'tsarr-cli-'));

    try {
      const queueResult = spawnSync(
        'bun',
        ['run', 'src/cli/index.ts', 'sonarr', 'queue', 'list', '--help'],
        {
          cwd: process.cwd(),
          env: buildCliEnv(tempHome),
          encoding: 'utf-8',
        }
      );
      const historyResult = spawnSync(
        'bun',
        ['run', 'src/cli/index.ts', 'sonarr', 'history', 'list', '--help'],
        {
          cwd: process.cwd(),
          env: buildCliEnv(tempHome),
          encoding: 'utf-8',
        }
      );

      expect(queueResult.status).toBe(0);
      expect(queueResult.stdout).toContain('List queue items');
      expect(historyResult.status).toBe(0);
      expect(historyResult.stdout).toContain('List recent history');
    } finally {
      rmSync(tempHome, { recursive: true, force: true });
    }
  });

  it('should expose the missing Lidarr media workflow subcommands', () => {
    const tempHome = mkdtempSync(join(tmpdir(), 'tsarr-cli-'));

    try {
      const commands = [
        {
          args: ['run', 'src/cli/index.ts', 'lidarr', 'queue', 'list', '--help'],
          expected: 'List queue items',
        },
        {
          args: ['run', 'src/cli/index.ts', 'lidarr', 'history', 'list', '--help'],
          expected: 'List recent history',
        },
        {
          args: ['run', 'src/cli/index.ts', 'lidarr', 'calendar', 'list', '--help'],
          expected: 'List upcoming album releases',
        },
        {
          args: ['run', 'src/cli/index.ts', 'lidarr', 'wanted', 'missing', '--help'],
          expected: 'List albums with missing tracks',
        },
      ];

      for (const command of commands) {
        const result = spawnSync('bun', command.args, {
          cwd: process.cwd(),
          env: buildCliEnv(tempHome),
          encoding: 'utf-8',
        });

        expect(result.status).toBe(0);
        expect(result.stdout).toContain(command.expected);
      }
    } finally {
      rmSync(tempHome, { recursive: true, force: true });
    }
  });

  it('should expose the remaining missing Lidarr admin subcommands', () => {
    const tempHome = mkdtempSync(join(tmpdir(), 'tsarr-cli-'));

    try {
      const commands = [
        {
          args: ['run', 'src/cli/index.ts', 'lidarr', 'profile', 'get', '--help'],
          expected: 'Get a quality profile by ID',
        },
        {
          args: ['run', 'src/cli/index.ts', 'lidarr', 'album', 'add', '--help'],
          expected: 'Add an album from JSON file or stdin',
        },
        {
          args: ['run', 'src/cli/index.ts', 'lidarr', 'notification', 'test', '--help'],
          expected: 'Test all notifications',
        },
        {
          args: ['run', 'src/cli/index.ts', 'lidarr', 'downloadclient', 'test', '--help'],
          expected: 'Test all download clients',
        },
        {
          args: ['run', 'src/cli/index.ts', 'lidarr', 'blocklist', 'list', '--help'],
          expected: 'List blocked releases',
        },
        {
          args: ['run', 'src/cli/index.ts', 'lidarr', 'importlist', 'delete', '--help'],
          expected: 'Delete an import list',
        },
      ];

      for (const command of commands) {
        const result = spawnSync('bun', command.args, {
          cwd: process.cwd(),
          env: buildCliEnv(tempHome),
          encoding: 'utf-8',
        });

        expect(result.status).toBe(0);
        expect(result.stdout).toContain(command.expected);
      }
    } finally {
      rmSync(tempHome, { recursive: true, force: true });
    }
  });

  it('should expose Lidarr metadata-profile and release workflow subcommands', () => {
    const tempHome = mkdtempSync(join(tmpdir(), 'tsarr-cli-'));

    try {
      const commands = [
        {
          args: ['run', 'src/cli/index.ts', 'lidarr', 'metadataprofile', 'list', '--help'],
          expected: 'List metadata profiles',
        },
        {
          args: ['run', 'src/cli/index.ts', 'lidarr', 'release', 'list', '--help'],
          expected: 'List release candidates for one album or artist',
        },
        {
          args: ['run', 'src/cli/index.ts', 'lidarr', 'release', 'grab', '--help'],
          expected: 'Grab a complete release candidate',
        },
      ];

      for (const command of commands) {
        const result = spawnSync('bun', command.args, {
          cwd: process.cwd(),
          env: buildCliEnv(tempHome),
          encoding: 'utf-8',
        });

        expect(result.status).toBe(0);
        expect(result.stdout).toContain(command.expected);
      }
    } finally {
      rmSync(tempHome, { recursive: true, force: true });
    }
  });

  it('should expose the missing Readarr media workflow subcommands', () => {
    const tempHome = mkdtempSync(join(tmpdir(), 'tsarr-cli-'));

    try {
      const commands = [
        {
          args: ['run', 'src/cli/index.ts', 'readarr', 'queue', 'list', '--help'],
          expected: 'List queue items',
        },
        {
          args: ['run', 'src/cli/index.ts', 'readarr', 'history', 'list', '--help'],
          expected: 'List recent history',
        },
        {
          args: ['run', 'src/cli/index.ts', 'readarr', 'calendar', 'list', '--help'],
          expected: 'List upcoming book releases',
        },
        {
          args: ['run', 'src/cli/index.ts', 'readarr', 'wanted', 'missing', '--help'],
          expected: 'List books with missing files',
        },
      ];

      for (const command of commands) {
        const result = spawnSync('bun', command.args, {
          cwd: process.cwd(),
          env: buildCliEnv(tempHome),
          encoding: 'utf-8',
        });

        expect(result.status).toBe(0);
        expect(result.stdout).toContain(command.expected);
      }
    } finally {
      rmSync(tempHome, { recursive: true, force: true });
    }
  });

  it('should expose the remaining missing Readarr admin subcommands', () => {
    const tempHome = mkdtempSync(join(tmpdir(), 'tsarr-cli-'));

    try {
      const commands = [
        {
          args: ['run', 'src/cli/index.ts', 'readarr', 'profile', 'get', '--help'],
          expected: 'Get a quality profile by ID',
        },
        {
          args: ['run', 'src/cli/index.ts', 'readarr', 'book', 'add', '--help'],
          expected: 'Add a book from JSON file or stdin',
        },
        {
          args: ['run', 'src/cli/index.ts', 'readarr', 'notification', 'test', '--help'],
          expected: 'Test all notifications',
        },
        {
          args: ['run', 'src/cli/index.ts', 'readarr', 'downloadclient', 'test', '--help'],
          expected: 'Test all download clients',
        },
        {
          args: ['run', 'src/cli/index.ts', 'readarr', 'blocklist', 'list', '--help'],
          expected: 'List blocked releases',
        },
        {
          args: ['run', 'src/cli/index.ts', 'readarr', 'importlist', 'delete', '--help'],
          expected: 'Delete an import list',
        },
      ];

      for (const command of commands) {
        const result = spawnSync('bun', command.args, {
          cwd: process.cwd(),
          env: buildCliEnv(tempHome),
          encoding: 'utf-8',
        });

        expect(result.status).toBe(0);
        expect(result.stdout).toContain(command.expected);
      }
    } finally {
      rmSync(tempHome, { recursive: true, force: true });
    }
  });

  it('should expose tag create and delete subcommands across supported services', () => {
    const tempHome = mkdtempSync(join(tmpdir(), 'tsarr-cli-'));

    try {
      for (const service of ['radarr', 'sonarr', 'lidarr', 'readarr', 'prowlarr']) {
        const createResult = spawnSync(
          'bun',
          ['run', 'src/cli/index.ts', service, 'tag', 'create', '--help'],
          {
            cwd: process.cwd(),
            env: buildCliEnv(tempHome),
            encoding: 'utf-8',
          }
        );
        const deleteResult = spawnSync(
          'bun',
          ['run', 'src/cli/index.ts', service, 'tag', 'delete', '--help'],
          {
            cwd: process.cwd(),
            env: buildCliEnv(tempHome),
            encoding: 'utf-8',
          }
        );

        expect(createResult.status).toBe(0);
        expect(createResult.stdout).toContain('Create a tag');
        expect(deleteResult.status).toBe(0);
        expect(deleteResult.stdout).toContain('Delete a tag');
      }
    } finally {
      rmSync(tempHome, { recursive: true, force: true });
    }
  }, 15000);

  it('should expose both --term and --query for Prowlarr search', () => {
    const tempHome = mkdtempSync(join(tmpdir(), 'tsarr-cli-'));

    try {
      const result = spawnSync(
        'bun',
        ['run', 'src/cli/index.ts', 'prowlarr', 'search', 'run', '--help'],
        {
          cwd: process.cwd(),
          env: buildCliEnv(tempHome),
          encoding: 'utf-8',
        }
      );

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('--term');
      expect(result.stdout).toContain('--query');
    } finally {
      rmSync(tempHome, { recursive: true, force: true });
    }
  });

  it('should expose optional --id for Prowlarr indexer test', () => {
    const tempHome = mkdtempSync(join(tmpdir(), 'tsarr-cli-'));

    try {
      const result = spawnSync(
        'bun',
        ['run', 'src/cli/index.ts', 'prowlarr', 'indexer', 'test', '--help'],
        {
          cwd: process.cwd(),
          env: buildCliEnv(tempHome),
          encoding: 'utf-8',
        }
      );

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('--id');
      expect(result.stdout).toContain('Test one indexer or all configured indexers');
    } finally {
      rmSync(tempHome, { recursive: true, force: true });
    }
  });
});
