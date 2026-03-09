import { readFileSync } from 'node:fs';
import { RadarrClient } from '../../clients/radarr.js';
import { promptConfirm, promptIfMissing, promptSelect } from '../prompt.js';
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
        columns: ['id', 'title', 'year', 'monitored', 'hasFile', 'status', 'qualityProfileId'],
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
        args: [
          { name: 'term', description: 'Search term' },
          { name: 'tmdb-id', description: 'TMDB ID', type: 'number' },
          { name: 'quality-profile-id', description: 'Quality profile ID', type: 'number' },
          { name: 'root-folder', description: 'Root folder path' },
          { name: 'monitored', description: 'Set monitored (true/false)' },
        ],
        run: async (c: RadarrClient, a) => {
          let movie: any;

          if (a['tmdb-id'] !== undefined) {
            const lookupResult = await c.lookupMovieByTmdbId(a['tmdb-id']);
            const lookup = unwrapData<any[] | any>(lookupResult);
            const matches = Array.isArray(lookup) ? lookup : [lookup];
            movie = matches.find((m: any) => m?.tmdbId === a['tmdb-id']) ?? matches[0];

            if (!movie) {
              throw new Error(`No movie found for TMDB ID ${a['tmdb-id']}.`);
            }
          } else {
            const term = await promptIfMissing(a.term, 'Search term:');
            const searchResult = await c.searchMovies(term);
            const results = unwrapData<any[]>(searchResult);
            if (!Array.isArray(results) || results.length === 0) {
              throw new Error('No movies found.');
            }

            const movieId = await promptSelect(
              'Select a movie:',
              results.map((m: any) => ({
                label: `${m.title} (${m.year})`,
                value: String(m.tmdbId),
              }))
            );
            movie = results.find((m: any) => String(m.tmdbId) === movieId);
            if (!movie) {
              throw new Error('Selected movie was not found in the search results.');
            }
          }

          const profilesResult = await c.getQualityProfiles();
          const profiles = unwrapData<any[]>(profilesResult);
          if (!Array.isArray(profiles) || profiles.length === 0) {
            throw new Error('No quality profiles found. Configure one in Radarr first.');
          }
          const profileId =
            a['quality-profile-id'] !== undefined
              ? resolveQualityProfileId(profiles, a['quality-profile-id'])
              : Number(
                  await promptSelect(
                    'Select quality profile:',
                    profiles.map((p: any) => ({ label: p.name, value: String(p.id) }))
                  )
                );

          const foldersResult = await c.getRootFolders();
          const folders = unwrapData<any[]>(foldersResult);
          if (!Array.isArray(folders) || folders.length === 0) {
            throw new Error('No root folders found. Configure one in Radarr first.');
          }
          const rootFolderPath =
            a['root-folder'] !== undefined
              ? resolveRootFolderPath(folders, a['root-folder'])
              : await promptSelect(
                  'Select root folder:',
                  folders.map((f: any) => ({ label: f.path, value: f.path }))
                );

          const confirmed = await promptConfirm(`Add "${movie.title} (${movie.year})"?`, !!a.yes);
          if (!confirmed) throw new Error('Cancelled.');

          const addResult = await c.addMovie({
            ...movie,
            qualityProfileId: profileId,
            rootFolderPath,
            monitored: parseBooleanArg(a.monitored, true),
            addOptions: { searchForMovie: true },
          });

          if (addResult?.error && getApiStatus(addResult) === 400) {
            const existingMovie = await findMovieByTmdbId(c, movie.tmdbId);
            if (existingMovie) {
              throw new Error(
                `${existingMovie.title} is already in your library (ID: ${existingMovie.id})`
              );
            }
          }

          return addResult;
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
        args: [
          { name: 'id', description: 'Movie ID', required: true, type: 'number' },
          { name: 'delete-files', description: 'Delete movie files', type: 'boolean' },
          {
            name: 'add-import-exclusion',
            description: 'Add import exclusion after delete',
            type: 'boolean',
          },
        ],
        confirmMessage: 'Are you sure you want to delete this movie?',
        run: async (c: RadarrClient, a) => {
          const movieResult = await c.getMovie(a.id);
          if (movieResult?.error) return movieResult;

          const movie = unwrapData<any>(movieResult);
          const deleteResult = await c.deleteMovie(a.id, {
            deleteFiles: a['delete-files'],
            addImportExclusion: a['add-import-exclusion'],
          });

          if (deleteResult?.error) return deleteResult;

          return { message: `Deleted: ${movie.title} (ID: ${movie.id})` };
        },
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
        name: 'create',
        description: 'Create a tag',
        args: [{ name: 'label', description: 'Tag label', required: true }],
        run: (c: RadarrClient, a) => c.addTag({ label: a.label } as any),
      },
      {
        name: 'delete',
        description: 'Delete a tag',
        args: [{ name: 'id', description: 'Tag ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this tag?',
        run: async (c: RadarrClient, a) => {
          const tagResult = await c.getTag(a.id);
          if (tagResult?.error) return tagResult;

          const tag = unwrapData<any>(tagResult);
          const deleteResult = await c.deleteTag(a.id);
          if (deleteResult?.error) return deleteResult;

          return { message: `Deleted tag: ${tag.label} (ID: ${tag.id})` };
        },
      },
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
      {
        name: 'delete',
        description: 'Remove an item from the queue',
        args: [
          { name: 'id', description: 'Queue item ID', required: true, type: 'number' },
          { name: 'blocklist', description: 'Add to blocklist', type: 'boolean' },
          {
            name: 'remove-from-client',
            description: 'Remove from download client',
            type: 'boolean',
          },
        ],
        confirmMessage: 'Are you sure you want to remove this queue item?',
        run: (c: RadarrClient, a) => c.removeQueueItem(a.id, a['remove-from-client'], a.blocklist),
      },
      {
        name: 'grab',
        description: 'Force download a queue item',
        args: [{ name: 'id', description: 'Queue item ID', required: true, type: 'number' }],
        run: (c: RadarrClient, a) => c.grabQueueItem(a.id),
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
      {
        name: 'add',
        description: 'Add a root folder',
        args: [{ name: 'path', description: 'Folder path', required: true }],
        run: (c: RadarrClient, a) => c.addRootFolder(a.path),
      },
      {
        name: 'delete',
        description: 'Delete a root folder',
        args: [{ name: 'id', description: 'Root folder ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this root folder?',
        run: (c: RadarrClient, a) => c.deleteRootFolder(a.id),
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
        args: [
          { name: 'since', description: 'Start date (ISO 8601, e.g. 2024-01-01)' },
          { name: 'until', description: 'End date (ISO 8601, e.g. 2024-12-31)' },
        ],
        columns: ['id', 'eventType', 'sourceTitle', 'date'],
        run: async (c: RadarrClient, a) => {
          if (a.since) {
            const result = await c.getHistorySince(a.since);
            const items = unwrapData<any[]>(result);
            if (a.until) {
              const untilDate = new Date(a.until);
              return items.filter((item: any) => new Date(item.date) <= untilDate);
            }
            return items;
          }
          const result = await c.getHistory();
          const items = unwrapData<any[]>(result);
          if (a.until) {
            const untilDate = new Date(a.until);
            return items.filter((item: any) => new Date(item.date) <= untilDate);
          }
          return items;
        },
      },
    ],
  },
  {
    name: 'calendar',
    description: 'View upcoming releases',
    actions: [
      {
        name: 'list',
        description: 'List upcoming movie releases',
        args: [
          { name: 'start', description: 'Start date (ISO 8601)' },
          { name: 'end', description: 'End date (ISO 8601)' },
          { name: 'unmonitored', description: 'Include unmonitored', type: 'boolean' },
        ],
        columns: ['id', 'title', 'year', 'inCinemas', 'digitalRelease', 'physicalRelease'],
        run: (c: RadarrClient, a) => c.getCalendar(a.start, a.end, a.unmonitored),
      },
    ],
  },
  {
    name: 'notification',
    description: 'Manage notifications',
    actions: [
      {
        name: 'list',
        description: 'List notification providers',
        columns: ['id', 'name', 'implementation'],
        run: (c: RadarrClient) => c.getNotifications(),
      },
      {
        name: 'get',
        description: 'Get a notification by ID',
        args: [{ name: 'id', description: 'Notification ID', required: true, type: 'number' }],
        run: (c: RadarrClient, a) => c.getNotification(a.id),
      },
      {
        name: 'add',
        description: 'Add a notification from JSON file or stdin',
        args: [{ name: 'file', description: 'JSON file path (use - for stdin)', required: true }],
        run: async (c: RadarrClient, a) => c.addNotification(readJsonInput(a.file)),
      },
      {
        name: 'edit',
        description: 'Edit a notification (merges JSON with existing)',
        args: [
          { name: 'id', description: 'Notification ID', required: true, type: 'number' },
          { name: 'file', description: 'JSON file with fields to update', required: true },
        ],
        run: async (c: RadarrClient, a) => {
          const existing = unwrapData<any>(await c.getNotification(a.id));
          return c.updateNotification(a.id, { ...existing, ...readJsonInput(a.file) });
        },
      },
      {
        name: 'delete',
        description: 'Delete a notification',
        args: [{ name: 'id', description: 'Notification ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this notification?',
        run: (c: RadarrClient, a) => c.deleteNotification(a.id),
      },
      {
        name: 'test',
        description: 'Test all notifications',
        run: (c: RadarrClient) => c.testAllNotifications(),
      },
    ],
  },
  {
    name: 'downloadclient',
    description: 'Manage download clients',
    actions: [
      {
        name: 'list',
        description: 'List download clients',
        columns: ['id', 'name', 'implementation', 'enable'],
        run: (c: RadarrClient) => c.getDownloadClients(),
      },
      {
        name: 'get',
        description: 'Get a download client by ID',
        args: [{ name: 'id', description: 'Download client ID', required: true, type: 'number' }],
        run: (c: RadarrClient, a) => c.getDownloadClient(a.id),
      },
      {
        name: 'add',
        description: 'Add a download client from JSON file or stdin',
        args: [{ name: 'file', description: 'JSON file path (use - for stdin)', required: true }],
        run: async (c: RadarrClient, a) => c.addDownloadClient(readJsonInput(a.file)),
      },
      {
        name: 'edit',
        description: 'Edit a download client (merges JSON with existing)',
        args: [
          { name: 'id', description: 'Download client ID', required: true, type: 'number' },
          { name: 'file', description: 'JSON file with fields to update', required: true },
        ],
        run: async (c: RadarrClient, a) => {
          const existing = unwrapData<any>(await c.getDownloadClient(a.id));
          return c.updateDownloadClient(a.id, { ...existing, ...readJsonInput(a.file) });
        },
      },
      {
        name: 'delete',
        description: 'Delete a download client',
        args: [{ name: 'id', description: 'Download client ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this download client?',
        run: (c: RadarrClient, a) => c.deleteDownloadClient(a.id),
      },
      {
        name: 'test',
        description: 'Test all download clients',
        run: (c: RadarrClient) => c.testAllDownloadClients(),
      },
    ],
  },
  {
    name: 'blocklist',
    description: 'Manage blocked releases',
    actions: [
      {
        name: 'list',
        description: 'List blocked releases',
        columns: ['id', 'sourceTitle', 'date'],
        run: (c: RadarrClient) => c.getBlocklist(),
      },
      {
        name: 'delete',
        description: 'Remove a release from the blocklist',
        args: [{ name: 'id', description: 'Blocklist item ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to remove this blocklist entry?',
        run: (c: RadarrClient, a) => c.removeBlocklistItem(a.id),
      },
    ],
  },
  {
    name: 'wanted',
    description: 'View missing and cutoff unmet movies',
    actions: [
      {
        name: 'missing',
        description: 'List movies with missing files',
        columns: ['id', 'title', 'year', 'monitored'],
        run: (c: RadarrClient) => c.getWantedMissing(),
      },
      {
        name: 'cutoff',
        description: 'List movies below quality cutoff',
        columns: ['id', 'title', 'year', 'monitored'],
        run: (c: RadarrClient) => c.getWantedCutoff(),
      },
    ],
  },
  {
    name: 'importlist',
    description: 'Manage import lists',
    actions: [
      {
        name: 'list',
        description: 'List import lists',
        columns: ['id', 'name', 'implementation', 'enable'],
        run: (c: RadarrClient) => c.getImportLists(),
      },
      {
        name: 'get',
        description: 'Get an import list by ID',
        args: [{ name: 'id', description: 'Import list ID', required: true, type: 'number' }],
        run: (c: RadarrClient, a) => c.getImportList(a.id),
      },
      {
        name: 'add',
        description: 'Add an import list from JSON file or stdin',
        args: [{ name: 'file', description: 'JSON file path (use - for stdin)', required: true }],
        run: async (c: RadarrClient, a) => c.addImportList(readJsonInput(a.file)),
      },
      {
        name: 'edit',
        description: 'Edit an import list (merges JSON with existing)',
        args: [
          { name: 'id', description: 'Import list ID', required: true, type: 'number' },
          { name: 'file', description: 'JSON file with fields to update', required: true },
        ],
        run: async (c: RadarrClient, a) => {
          const existing = unwrapData<any>(await c.getImportList(a.id));
          return c.updateImportList(a.id, { ...existing, ...readJsonInput(a.file) });
        },
      },
      {
        name: 'delete',
        description: 'Delete an import list',
        args: [{ name: 'id', description: 'Import list ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this import list?',
        run: (c: RadarrClient, a) => c.deleteImportList(a.id),
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

function unwrapData<T>(result: any): T {
  return (result?.data ?? result) as T;
}

function parseBooleanArg(value: unknown, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return Boolean(value);
}

function resolveQualityProfileId(profiles: any[], profileId: number): number {
  const profile = profiles.find((item: any) => item?.id === profileId);
  if (!profile) {
    throw new Error(`Quality profile ${profileId} was not found.`);
  }
  return profileId;
}

function resolveRootFolderPath(folders: any[], rootFolderPath: string): string {
  const folder = folders.find((item: any) => item?.path === rootFolderPath);
  if (!folder) {
    throw new Error(`Root folder "${rootFolderPath}" was not found.`);
  }
  return rootFolderPath;
}

async function findMovieByTmdbId(client: RadarrClient, tmdbId: number | undefined) {
  if (tmdbId === undefined) return undefined;

  const movies = unwrapData<any[]>(await client.getMovies());
  return movies.find((movie: any) => movie?.tmdbId === tmdbId);
}

function getApiStatus(result: any): number | undefined {
  return result?.error?.status ?? result?.response?.status;
}

function readJsonInput(filePath: string): any {
  const raw = filePath === '-' ? readFileSync(0, 'utf-8') : readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}
