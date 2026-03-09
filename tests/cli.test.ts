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

      expect(result.status).toBe(0);

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
});
