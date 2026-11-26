#!/usr/bin/env bun
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Packs the built package, installs the tarball into throwaway ESM consumers
 * and type-checks them the way users do: once with `nodenext` resolution and
 * once with `bundler` resolution. Run after `bun run build` with
 * `bun run check:packed-types`.
 *
 * Under `nodenext`, extensionless relative imports in `dist/**\/*.d.ts` do not
 * resolve, so exports go missing and types fall back to `any` (issue #311).
 * The `@ts-expect-error` lines below fail when a type has become `any`, and
 * every relative specifier in the packed declarations must end in `.js`.
 */
import { $ } from 'bun';

const repoRoot = join(import.meta.dir, '..');

const COMPILERS = [
  { name: 'TypeScript 7', bin: join(repoRoot, 'node_modules/@typescript/native/bin/tsc') },
  { name: 'TypeScript 6', bin: join(repoRoot, 'node_modules/typescript/bin/tsc') },
];

const CONSUMERS = [
  { name: 'nodenext', module: 'nodenext', moduleResolution: 'nodenext' },
  { name: 'bundler', module: 'esnext', moduleResolution: 'bundler' },
];

const REPRO = `import { RadarrClient, createServarrClient, type Radarr } from 'tsarr';
import { RadarrClient as SubpathRadarrClient } from 'tsarr/radarr';
import type { MovieResource } from 'tsarr/radarr/types';

// @ts-expect-error RadarrClient must keep its class type, not \`any\`.
export const rootClient: symbol = RadarrClient;
export const sameClient: typeof SubpathRadarrClient = RadarrClient;
export const config = createServarrClient({ baseUrl: 'http://localhost:7878', apiKey: 'test' });

const radarr = new SubpathRadarrClient({ baseUrl: 'http://localhost:7878', apiKey: 'test' });

// Inherited from ServarrBaseClient.
await radarr.getSystemStatus();

const movies = await radarr.getMovies();
const firstMovie = movies.data![0];
// @ts-expect-error MovieResource must not resolve to \`any\`.
export const notAny: symbol = firstMovie;
export const movie: MovieResource | undefined = firstMovie;
export const namespaced: Radarr.MovieResource | undefined = firstMovie;
`;

const tempDir = mkdtempSync(join(tmpdir(), 'tsarr-packed-types-'));
let failed = false;

try {
  await $`bun pm pack --destination ${tempDir}`.cwd(repoRoot).quiet();
  const tarball = (await $`ls ${tempDir}`.text())
    .trim()
    .split('\n')
    .find(f => f.endsWith('.tgz'));
  if (!tarball) throw new Error('bun pm pack produced no tarball');

  for (const consumer of CONSUMERS) {
    const dir = join(tempDir, consumer.name);
    await Bun.write(
      join(dir, 'package.json'),
      JSON.stringify({
        name: `consumer-${consumer.name}`,
        private: true,
        type: 'module',
        dependencies: { tsarr: `file:${join(tempDir, tarball)}` },
      })
    );
    await Bun.write(
      join(dir, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          module: consumer.module,
          moduleResolution: consumer.moduleResolution,
          target: 'esnext',
          strict: true,
          noEmit: true,
          skipLibCheck: true,
        },
        files: ['repro.ts'],
      })
    );
    await Bun.write(join(dir, 'repro.ts'), REPRO);
    await $`bun install --silent`.cwd(dir);

    if (consumer.name === 'nodenext') {
      const packedDist = join(dir, 'node_modules/tsarr/dist');
      for await (const file of new Bun.Glob('**/*.d.ts').scan(packedDist)) {
        const source = await Bun.file(join(packedDist, file)).text();
        for (const [, specifier] of source.matchAll(/(?:from |import\()["'](\.\.?\/[^"']*)["']/g)) {
          if (!specifier.endsWith('.js')) {
            failed = true;
            console.error(
              `❌ dist/${file}: relative specifier '${specifier}' has no .js extension`
            );
          }
        }
      }
    }

    for (const compiler of COMPILERS) {
      const label = `${compiler.name}, moduleResolution ${consumer.moduleResolution}`;
      const result = await $`bun ${compiler.bin} -p . --pretty false`.cwd(dir).nothrow().quiet();
      if (result.exitCode === 0) {
        console.log(`✅ ${label}`);
      } else {
        failed = true;
        console.error(`❌ ${label}\n${result.stdout.toString()}${result.stderr.toString()}`);
      }
    }
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

if (failed) {
  console.error('Packed declarations do not type-check for every consumer setup.');
  process.exit(1);
}
