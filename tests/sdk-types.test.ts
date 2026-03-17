import { describe, expect, it } from 'bun:test';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const repoRoot = process.cwd();
const tscPath = join(
  repoRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'tsc.cmd' : 'tsc'
);

function run(command: string, args: string[], cwd: string) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    throw new Error(
      [`Command failed: ${command} ${args.join(' ')}`, result.stdout, result.stderr]
        .filter(Boolean)
        .join('\n')
    );
  }
}

describe('SDK type packaging', () => {
  it('emits declarations at the published entrypoints and preserves array-shaped SDK types', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'tsarr-sdk-types-'));

    try {
      const distDir = join(tempDir, 'dist');
      run(tscPath, ['--project', 'tsconfig.build.json', '--outDir', distDir], repoRoot);

      const consumerPath = join(tempDir, 'consumer.ts');
      const normalizedDistDir = distDir.replaceAll('\\', '/');

      expect(existsSync(join(distDir, 'index.d.ts'))).toBe(true);
      expect(existsSync(join(distDir, 'clients', 'sonarr.d.ts'))).toBe(true);
      expect(existsSync(join(distDir, 'clients', 'prowlarr.d.ts'))).toBe(true);

      writeFileSync(
        consumerPath,
        [
          `import { type Prowlarr, type Sonarr } from '${normalizedDistDir}/index.js';`,
          '',
          'type IndexerClient = {',
          '  getIndexers(): Promise<{',
          '    data?: Prowlarr.IndexerResource[];',
          '    error?: unknown;',
          '    response: Response;',
          '  }>;',
          '};',
          '',
          'type DownloadClientApi = {',
          '  getDownloadClients(): Promise<{',
          '    data?: Sonarr.DownloadClientResource[];',
          '    error?: unknown;',
          '    response: Response;',
          '  }>;',
          '};',
          '',
          'declare const indexerClient: IndexerClient;',
          'declare const downloadClientApi: DownloadClientApi;',
          'declare const indexer: Prowlarr.IndexerResource;',
          'declare const downloadClient: Sonarr.DownloadClientResource;',
          '',
          'async function verifyArrayShapes() {',
          '  const indexers = (await indexerClient.getIndexers()).data ?? [];',
          "  indexers.find((item) => item.name === 'Indexer');",
          '',
          '  const downloadClients = (await downloadClientApi.getDownloadClients()).data ?? [];',
          "  downloadClients.find((item) => item.name === 'Downloader');",
          '',
          "  (indexer.fields ?? []).map((field) => field.name ?? '');",
          "  (downloadClient.fields ?? []).map((field) => field.name ?? '');",
          '}',
          '',
          'void verifyArrayShapes;',
        ].join('\n')
      );

      run(
        tscPath,
        [
          '--pretty',
          'false',
          '--noEmit',
          '--module',
          'esnext',
          '--moduleResolution',
          'bundler',
          '--target',
          'esnext',
          '--lib',
          'esnext,dom',
          consumerPath,
        ],
        repoRoot
      );
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  }, 20000);
});
