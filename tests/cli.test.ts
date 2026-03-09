import { describe, expect, it } from 'bun:test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PACKAGE_VERSION = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8')) as {
  version: string;
};

function buildCliEnv(homeDir: string): NodeJS.ProcessEnv {
  return {
    ...process.env,
    HOME: homeDir,
    TSARR_RADARR_URL: '',
    TSARR_RADARR_API_KEY: '',
    TSARR_SONARR_URL: '',
    TSARR_SONARR_API_KEY: '',
    TSARR_LIDARR_URL: '',
    TSARR_LIDARR_API_KEY: '',
    TSARR_READARR_URL: '',
    TSARR_READARR_API_KEY: '',
    TSARR_PROWLARR_URL: '',
    TSARR_PROWLARR_API_KEY: '',
    TSARR_BAZARR_URL: '',
    TSARR_BAZARR_API_KEY: '',
  };
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

      expect(data).toHaveLength(6);
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
