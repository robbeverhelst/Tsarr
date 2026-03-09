import { RadarrClient } from '../../clients/radarr.js';
import type { ResourceDef } from './service.js';
import { buildServiceCommand } from './service.js';

const resources: ResourceDef[] = [
  {
    name: 'movie',
    description: 'Manage movies',
    actions: [
      {
        name: 'list',
        description: 'List all movies',
        columns: ['id', 'title', 'year', 'monitored', 'hasFile'],
        run: (c: RadarrClient) => c.getMovies(),
      },
      {
        name: 'get',
        description: 'Get a movie by ID',
        args: [{ name: 'id', description: 'Movie ID', required: true, type: 'number' }],
        run: (c: RadarrClient, a) => c.getMovie(a.id),
      },
      {
        name: 'search',
        description: 'Search for movies on TMDB',
        args: [{ name: 'term', description: 'Search term', required: true }],
        columns: ['tmdbId', 'title', 'year', 'overview'],
        idField: 'tmdbId',
        run: (c: RadarrClient, a) => c.searchMovies(a.term),
      },
      {
        name: 'delete',
        description: 'Delete a movie',
        args: [{ name: 'id', description: 'Movie ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this movie?',
        run: (c: RadarrClient, a) => c.deleteMovie(a.id),
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
        run: (c: RadarrClient) => c.getQualityProfiles(),
      },
      {
        name: 'get',
        description: 'Get a quality profile by ID',
        args: [{ name: 'id', description: 'Profile ID', required: true, type: 'number' }],
        run: (c: RadarrClient, a) => c.getQualityProfile(a.id),
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
        run: (c: RadarrClient) => c.getTags(),
      },
    ],
  },
  {
    name: 'queue',
    description: 'Manage download queue',
    actions: [
      {
        name: 'list',
        description: 'List queue items',
        columns: ['id', 'title', 'status', 'sizeleft', 'timeleft'],
        run: (c: RadarrClient) => c.getQueue(),
      },
      {
        name: 'status',
        description: 'Get queue status',
        run: (c: RadarrClient) => c.getQueueStatus(),
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
        run: (c: RadarrClient) => c.getRootFolders(),
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
        run: (c: RadarrClient) => c.getSystemStatus(),
      },
      {
        name: 'health',
        description: 'Get health check results',
        columns: ['type', 'message', 'source'],
        run: (c: RadarrClient) => c.getHealth(),
      },
    ],
  },
  {
    name: 'history',
    description: 'View history',
    actions: [
      {
        name: 'list',
        description: 'List recent history',
        columns: ['id', 'eventType', 'sourceTitle', 'date'],
        run: (c: RadarrClient) => c.getHistory(),
      },
    ],
  },
  {
    name: 'customformat',
    description: 'Manage custom formats',
    actions: [
      {
        name: 'list',
        description: 'List custom formats',
        columns: ['id', 'name'],
        run: (c: RadarrClient) => c.getCustomFormats(),
      },
    ],
  },
];

export const radarr = buildServiceCommand(
  'radarr',
  'Manage Radarr (Movies)',
  config => new RadarrClient(config),
  resources
);
