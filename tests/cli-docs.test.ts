import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { resources as bazarr } from '../src/cli/commands/bazarr.js';
import { resources as jellyfin } from '../src/cli/commands/jellyfin.js';
import { resources as lidarr } from '../src/cli/commands/lidarr.js';
import { resources as prowlarr } from '../src/cli/commands/prowlarr.js';
import { resources as qbit } from '../src/cli/commands/qbit.js';
import { resources as radarr } from '../src/cli/commands/radarr.js';
import { resources as readarr } from '../src/cli/commands/readarr.js';
import { resources as seerr } from '../src/cli/commands/seerr.js';
import type { ResourceDef } from '../src/cli/commands/service.js';
import { resources as sonarr } from '../src/cli/commands/sonarr.js';

/** CLI service → its `## <heading>` in docs/cli-commands.md. */
const SERVICES: Array<[string, string, ResourceDef[]]> = [
  ['radarr', 'Radarr', radarr],
  ['sonarr', 'Sonarr', sonarr],
  ['lidarr', 'Lidarr', lidarr],
  ['readarr', 'Readarr', readarr],
  ['prowlarr', 'Prowlarr', prowlarr],
  ['bazarr', 'Bazarr', bazarr],
  ['qbit', 'qBittorrent', qbit],
  ['seerr', 'Seerr', seerr],
  ['jellyfin', 'Jellyfin', jellyfin],
];

const reference = readFileSync(join(import.meta.dir, '..', 'docs', 'cli-commands.md'), 'utf-8');
const sections = reference.split(/\n## /);

function documentedCommands(heading: string): string[] {
  const section = sections.find(s => s.startsWith(heading));
  if (!section) throw new Error(`docs/cli-commands.md has no "## ${heading}" section`);
  return [...section.matchAll(/^\| `([^`]+)` \| `([^`]+)` \|/gm)].map(m => `${m[1]} ${m[2]}`);
}

describe('docs/cli-commands.md', () => {
  for (const [service, heading, resources] of SERVICES) {
    it(`documents exactly the ${service} commands the CLI ships`, () => {
      const shipped = resources.flatMap(r => r.actions.map(a => `${r.name} ${a.name}`));
      expect(documentedCommands(heading).sort()).toEqual(shipped.sort());
    });
  }
});
