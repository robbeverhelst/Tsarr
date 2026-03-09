import { SonarrClient } from '../../clients/sonarr.js';
import type { ResourceDef } from './service.js';
import { buildServiceCommand } from './service.js';

const resources: ResourceDef[] = [
  {
    name: 'series',
    description: 'Manage TV series',
    actions: [
      {
        name: 'list',
        description: 'List all series',
        columns: ['id', 'title', 'year', 'monitored', 'seasonCount'],
        run: (c: SonarrClient) => c.getSeries(),
      },
      {
        name: 'get',
        description: 'Get a series by ID',
        args: [{ name: 'id', description: 'Series ID', required: true, type: 'number' }],
        run: (c: SonarrClient, a) => c.getSeriesById(a.id),
      },
      {
        name: 'search',
        description: 'Search for TV series',
        args: [{ name: 'term', description: 'Search term', required: true }],
        columns: ['tvdbId', 'title', 'year', 'overview'],
        run: (c: SonarrClient, a) => c.searchSeries(a.term),
      },
      {
        name: 'delete',
        description: 'Delete a series',
        args: [{ name: 'id', description: 'Series ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this series?',
        run: (c: SonarrClient, a) => c.deleteSeries(a.id),
      },
    ],
  },
  {
    name: 'episode',
    description: 'Manage episodes',
    actions: [
      {
        name: 'list',
        description: 'List all episodes',
        columns: ['id', 'title', 'seasonNumber', 'episodeNumber', 'hasFile'],
        run: (c: SonarrClient) => c.getEpisodes(),
      },
      {
        name: 'get',
        description: 'Get an episode by ID',
        args: [{ name: 'id', description: 'Episode ID', required: true, type: 'number' }],
        run: (c: SonarrClient, a) => c.getEpisode(a.id),
      },
    ],
  },
  {
    name: 'profile',
    description: 'Manage quality profiles',
    actions: [
      {
        name: 'list',
        description: 'List quality profiles',
        columns: ['id', 'name'],
        run: (c: SonarrClient) => c.getQualityProfiles(),
      },
    ],
  },
  {
    name: 'tag',
    description: 'Manage tags',
    actions: [
      {
        name: 'list',
        description: 'List all tags',
        columns: ['id', 'label'],
        run: (c: SonarrClient) => c.getTags(),
      },
    ],
  },
  {
    name: 'rootfolder',
    description: 'Manage root folders',
    actions: [
      {
        name: 'list',
        description: 'List root folders',
        columns: ['id', 'path', 'freeSpace'],
        run: (c: SonarrClient) => c.getRootFolders(),
      },
    ],
  },
  {
    name: 'system',
    description: 'System information',
    actions: [
      {
        name: 'status',
        description: 'Get system status',
        run: (c: SonarrClient) => c.getSystemStatus(),
      },
      {
        name: 'health',
        description: 'Get health check results',
        columns: ['type', 'message', 'source'],
        run: (c: SonarrClient) => c.getHealth(),
      },
    ],
  },
];

export const sonarr = buildServiceCommand(
  'sonarr',
  'Manage Sonarr (TV Shows)',
  config => new SonarrClient(config),
  resources
);
