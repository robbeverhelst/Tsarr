import { RadarrClient } from '../../clients/radarr.js';
import { promptConfirm, promptSelect } from '../prompt.js';
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
        name: 'add',
        description: 'Search and add a movie',
        args: [{ name: 'term', description: 'Search term', required: true }],
        run: async (c: RadarrClient, a) => {
          const searchResult = await c.searchMovies(a.term);
          const results = searchResult?.data ?? searchResult;
          if (!Array.isArray(results) || results.length === 0) {
            throw new Error('No movies found.');
          }
          const movieId = await promptSelect(
            'Select a movie:',
            results.map((m: any) => ({ label: `${m.title} (${m.year})`, value: String(m.tmdbId) }))
          );
          const movie = results.find((m: any) => String(m.tmdbId) === movieId);

          const profilesResult = await c.getQualityProfiles();
          const profiles = profilesResult?.data ?? profilesResult;
          if (!Array.isArray(profiles) || profiles.length === 0) {
            throw new Error('No quality profiles found. Configure one in Radarr first.');
          }
          const profileId = await promptSelect(
            'Select quality profile:',
            profiles.map((p: any) => ({ label: p.name, value: String(p.id) }))
          );

          const foldersResult = await c.getRootFolders();
          const folders = foldersResult?.data ?? foldersResult;
          if (!Array.isArray(folders) || folders.length === 0) {
            throw new Error('No root folders found. Configure one in Radarr first.');
          }
          const rootFolderPath = await promptSelect(
            'Select root folder:',
            folders.map((f: any) => ({ label: f.path, value: f.path }))
          );

          const confirmed = await promptConfirm(`Add "${movie.title} (${movie.year})"?`, !!a.yes);
          if (!confirmed) throw new Error('Cancelled.');

          return c.addMovie({
            ...movie,
            qualityProfileId: Number(profileId),
            rootFolderPath,
            monitored: true,
            addOptions: { searchForMovie: true },
          });
        },
      },
      {
        name: 'edit',
        description: 'Edit a movie',
        args: [
          { name: 'id', description: 'Movie ID', required: true, type: 'number' },
          { name: 'monitored', description: 'Set monitored (true/false)' },
          { name: 'quality-profile-id', description: 'Quality profile ID', type: 'number' },
          { name: 'tags', description: 'Comma-separated tag IDs' },
        ],
        run: async (c: RadarrClient, a) => {
          const result = await c.getMovie(a.id);
          const movie = result?.data ?? result;
          const updates: any = { ...movie };
          if (a.monitored !== undefined) updates.monitored = a.monitored === 'true';
          if (a['quality-profile-id'] !== undefined)
            updates.qualityProfileId = Number(a['quality-profile-id']);
          if (a.tags !== undefined)
            updates.tags = a.tags.split(',').map((t: string) => Number(t.trim()));
          return c.updateMovie(a.id, updates);
        },
      },
      {
        name: 'refresh',
        description: 'Refresh movie metadata',
        args: [{ name: 'id', description: 'Movie ID', required: true, type: 'number' }],
        run: (c: RadarrClient, a) =>
          c.runCommand({ name: 'RefreshMovie', movieIds: [a.id] } as any),
      },
      {
        name: 'manual-search',
        description: 'Trigger a manual search for releases',
        args: [{ name: 'id', description: 'Movie ID', required: true, type: 'number' }],
        run: (c: RadarrClient, a) =>
          c.runCommand({ name: 'MoviesSearch', movieIds: [a.id] } as any),
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
