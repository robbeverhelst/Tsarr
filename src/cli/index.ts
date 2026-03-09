#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { defineCommand, runMain } from 'citty';

const { version } = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf-8')
) as { version: string };

const main = defineCommand({
  meta: {
    name: 'tsarr',
    version,
    description:
      'Type-safe CLI for Servarr APIs (Radarr, Sonarr, Lidarr, Readarr, Prowlarr, Bazarr)',
  },
  subCommands: {
    radarr: () => import('./commands/radarr.js').then(m => m.radarr),
    sonarr: () => import('./commands/sonarr.js').then(m => m.sonarr),
    lidarr: () => import('./commands/lidarr.js').then(m => m.lidarr),
    readarr: () => import('./commands/readarr.js').then(m => m.readarr),
    prowlarr: () => import('./commands/prowlarr.js').then(m => m.prowlarr),
    bazarr: () => import('./commands/bazarr.js').then(m => m.bazarr),
    doctor: () => import('./commands/doctor.js').then(m => m.doctor),
    config: () => import('./commands/config.js').then(m => m.config),
    completions: () => import('./completions.js').then(m => m.completions),
  },
});

runMain(main);
