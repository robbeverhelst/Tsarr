#!/usr/bin/env bun

/**
 * Guards the published tarball against bloat.
 *
 * Runs `npm pack --dry-run --json` on the built package and fails when the
 * tarball would include a nested `.tgz` or a source map, or when its packed
 * size exceeds the budget. Run after a build: `bun run check:pack-contents`.
 *
 * Budget: 2.16.4 packed to 732,749 bytes without its stray self-copy; the
 * limit is that plus ~15% headroom, rounded up.
 */

import { $ } from 'bun';

const PACKED_SIZE_BUDGET = 850_000;

interface PackFile {
  path: string;
}

interface PackResult {
  size: number;
  unpackedSize: number;
  entryCount: number;
  files: PackFile[];
}

const [result] = (await $`npm pack --dry-run --json`.quiet().json()) as PackResult[];
if (!result) throw new Error('npm pack --dry-run returned no result');

const failures: string[] = [];

const forbidden = result.files
  .map(f => f.path)
  .filter(path => path.endsWith('.tgz') || path.endsWith('.map'));
for (const path of forbidden) failures.push(`forbidden file in tarball: ${path}`);

if (result.size > PACKED_SIZE_BUDGET) {
  failures.push(`packed size ${result.size} bytes exceeds budget of ${PACKED_SIZE_BUDGET} bytes`);
}

console.log(
  `Packed size: ${result.size} bytes (budget ${PACKED_SIZE_BUDGET}), unpacked ${result.unpackedSize} bytes, ${result.entryCount} files.`
);

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

console.log('Pack contents check passed.');
