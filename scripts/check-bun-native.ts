#!/usr/bin/env bun
/**
 * Fails when a dependency that Bun already replaces is added, or when a
 * non-Bun lockfile shows up. Run in CI with `bun run check:bun-native`.
 *
 * To keep one of these on purpose, add it to ALLOWED with the reason.
 */
import { $ } from 'bun';

const REPLACEABLE: Record<string, string> = {
  jest: 'bun test',
  'ts-jest': 'bun test',
  '@jest/globals': 'bun test',
  vitest: 'bun test',
  argon2: 'Bun.password',
  dotenv: "Bun's built-in .env loading",
  tsx: 'bun run',
  'ts-node': 'bun run',
  rimraf: 'Bun.$ / rm -rf',
  esbuild: 'bun build',
  tsup: 'bun build',
  'js-yaml': 'Bun.YAML',
  prettier: 'bun fmt',
  eslint: 'bun lint',
  oxlint: 'bun lint',
  oxfmt: 'bun fmt',
  husky: 'bun lint/fmt in CI',
  'lint-staged': 'bun lint/fmt in CI',
};

const FOREIGN_LOCKFILES = [
  'package-lock.json',
  'npm-shrinkwrap.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lockb',
];

const ALLOWED: Record<string, string> = {};

const DEP_FIELDS = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
] as const;

const problems: string[] = [];

const manifests = (await $`git ls-files -- '*package.json'`.text())
  .split('\n')
  .filter(file => file === 'package.json' || file.endsWith('/package.json'));

for (const manifest of manifests) {
  const pkg = await Bun.file(manifest).json();
  for (const field of DEP_FIELDS) {
    for (const name of Object.keys(pkg[field] ?? {})) {
      const replacement = REPLACEABLE[name] ?? (name.startsWith('@jest/') ? 'bun test' : undefined);
      if (replacement && !(name in ALLOWED)) {
        problems.push(`${manifest}: ${field} has "${name}", use ${replacement} instead`);
      }
    }
  }
}

const tracked = (await $`git ls-files`.text()).split('\n');
for (const file of tracked) {
  const base = file.split('/').pop() ?? '';
  if (FOREIGN_LOCKFILES.includes(base)) {
    problems.push(`${file}: only the text bun.lock is allowed`);
  }
}

if (problems.length > 0) {
  console.error('Bun-native check failed:');
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error(
    'If one is really needed, add it to ALLOWED in scripts/check-bun-native.ts with the reason.'
  );
  process.exit(1);
}

console.log(`Bun-native check passed (${manifests.length} package.json checked).`);
