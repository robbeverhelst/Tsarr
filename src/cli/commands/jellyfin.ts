import { JellyfinClient } from '../../clients/jellyfin';
import type { ResourceDef } from './service';
import { buildServiceCommand, limitResults } from './service';

/**
 * Jellyfin returns PascalCase JSON and wraps collections in `{ Items, TotalRecordCount }`,
 * which the shared framework does not unwrap (it looks for `records`/`results`).
 */
function unwrapItems(result: any): any {
  if (result?.error !== undefined) return result;
  const data = result?.data ?? result;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.Items)) return data.Items;
  if (Array.isArray(data?.SearchHints)) return data.SearchHints;
  return data;
}

function splitList(value: unknown): string[] | undefined {
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  return value
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);
}

const REFRESH_MODES = ['None', 'ValidationOnly', 'Default', 'FullRefresh'];

export const resources: ResourceDef[] = [
  {
    name: 'library',
    description: 'Manage libraries and trigger scans',
    actions: [
      {
        name: 'refresh',
        description: 'Trigger a full library scan',
        run: (c: JellyfinClient) => c.refreshLibrary(),
      },
      {
        name: 'folders',
        description: 'List libraries (virtual folders)',
        columns: ['ItemId', 'Name', 'CollectionType', 'Locations', 'RefreshStatus'],
        idField: 'ItemId',
        run: async (c: JellyfinClient) => {
          const result: any = await c.getVirtualFolders();
          const data = unwrapItems(result);
          if (!Array.isArray(data)) return result;
          return data.map((f: any) => ({
            ...f,
            Locations: Array.isArray(f.Locations) ? f.Locations.join(', ') : f.Locations,
          }));
        },
      },
      {
        name: 'add',
        description: 'Add a library',
        args: [
          { name: 'name', description: 'Library name', required: true },
          {
            name: 'collection-type',
            description: 'Collection type',
            values: [
              'movies',
              'tvshows',
              'music',
              'musicvideos',
              'homevideos',
              'boxsets',
              'books',
              'mixed',
            ],
          },
          { name: 'paths', description: 'Media paths (comma-separated)' },
          { name: 'refresh', description: 'Refresh the library after adding', type: 'boolean' },
        ],
        run: (c: JellyfinClient, a) =>
          c.addVirtualFolder(a.name, {
            ...(a['collection-type'] ? { collectionType: a['collection-type'] } : {}),
            ...(splitList(a.paths) ? { paths: splitList(a.paths) } : {}),
            ...(a.refresh !== undefined ? { refreshLibrary: a.refresh } : {}),
          }),
      },
      {
        name: 'remove',
        description: 'Remove a library',
        args: [{ name: 'name', description: 'Library name', required: true }],
        confirmMessage: 'Are you sure you want to remove this library?',
        run: (c: JellyfinClient, a) => c.removeVirtualFolder(a.name),
      },
    ],
  },
  {
    name: 'item',
    description: 'Browse and manage media items',
    actions: [
      {
        name: 'list',
        description: 'List media items',
        args: [
          { name: 'search', description: 'Search term' },
          {
            name: 'type',
            description: 'Item types (comma-separated, e.g. Movie,Series,Episode)',
          },
          { name: 'parent', description: 'Parent (library) item ID' },
          { name: 'user', description: 'User ID (for watched-state fields)' },
          { name: 'played', description: 'Filter by played state', type: 'boolean' },
          { name: 'limit', description: 'Maximum number of results', type: 'number' },
        ],
        columns: ['Id', 'Name', 'Type', 'ProductionYear'],
        idField: 'Id',
        run: async (c: JellyfinClient, a) => {
          const result: any = await c.getItems({
            recursive: true,
            ...(a.search ? { searchTerm: a.search } : {}),
            ...(splitList(a.type) ? { includeItemTypes: splitList(a.type) as any } : {}),
            ...(a.parent ? { parentId: a.parent } : {}),
            ...(a.user ? { userId: a.user } : {}),
            ...(a.played !== undefined ? { isPlayed: a.played } : {}),
            ...(a.limit ? { limit: a.limit } : {}),
          });
          const items = unwrapItems(result);
          return Array.isArray(items) ? limitResults(items, a.limit) : result;
        },
      },
      {
        name: 'get',
        description: 'Get a media item by ID',
        args: [
          { name: 'id', description: 'Item ID', required: true },
          { name: 'user', description: 'User ID', required: true },
        ],
        fullJson: true,
        run: (c: JellyfinClient, a) => c.getItem(a.id, a.user),
      },
      {
        name: 'refresh',
        description: 'Refresh metadata for an item',
        args: [
          { name: 'id', description: 'Item ID', required: true },
          {
            name: 'mode',
            description: `Metadata refresh mode (${REFRESH_MODES.join('|')})`,
            values: REFRESH_MODES,
          },
          { name: 'replace-metadata', description: 'Replace all metadata', type: 'boolean' },
          { name: 'replace-images', description: 'Replace all images', type: 'boolean' },
        ],
        run: (c: JellyfinClient, a) =>
          c.refreshItem(a.id, {
            ...(a.mode ? { metadataRefreshMode: a.mode } : {}),
            ...(a['replace-metadata'] !== undefined
              ? { replaceAllMetadata: a['replace-metadata'] }
              : {}),
            ...(a['replace-images'] !== undefined ? { replaceAllImages: a['replace-images'] } : {}),
          }),
      },
      {
        name: 'delete',
        description: 'Delete a media item',
        args: [{ name: 'id', description: 'Item ID', required: true }],
        confirmMessage: 'Are you sure you want to delete this item? This removes it from disk.',
        run: (c: JellyfinClient, a) => c.deleteItem(a.id),
      },
      {
        name: 'counts',
        description: 'Show library item counts',
        args: [{ name: 'user', description: 'User ID' }],
        columns: ['MovieCount', 'SeriesCount', 'EpisodeCount', 'AlbumCount', 'SongCount'],
        run: (c: JellyfinClient, a) => c.getItemCounts(a.user),
      },
      {
        name: 'latest',
        description: 'List recently added items',
        args: [
          { name: 'user', description: 'User ID', required: true },
          { name: 'limit', description: 'Maximum number of results', type: 'number' },
        ],
        columns: ['Id', 'Name', 'Type', 'ProductionYear', 'DateCreated'],
        idField: 'Id',
        run: async (c: JellyfinClient, a) => {
          const result: any = await c.getLatestMedia({
            userId: a.user,
            ...(a.limit ? { limit: a.limit } : {}),
          });
          const items = unwrapItems(result);
          return Array.isArray(items) ? limitResults(items, a.limit) : result;
        },
      },
      {
        name: 'nextup',
        description: 'List next-up episodes',
        args: [
          { name: 'user', description: 'User ID', required: true },
          { name: 'limit', description: 'Maximum number of results', type: 'number' },
        ],
        columns: ['Id', 'SeriesName', 'Name', 'IndexNumber', 'ParentIndexNumber'],
        idField: 'Id',
        run: async (c: JellyfinClient, a) => {
          const result: any = await c.getNextUp({
            userId: a.user,
            ...(a.limit ? { limit: a.limit } : {}),
          });
          const items = unwrapItems(result);
          return Array.isArray(items) ? limitResults(items, a.limit) : result;
        },
      },
      {
        name: 'resume',
        description: 'List in-progress (resumable) items',
        args: [
          { name: 'user', description: 'User ID', required: true },
          { name: 'limit', description: 'Maximum number of results', type: 'number' },
        ],
        columns: ['Id', 'Name', 'Type', 'ProductionYear'],
        idField: 'Id',
        run: async (c: JellyfinClient, a) => {
          const result: any = await c.getResumeItems({
            userId: a.user,
            ...(a.limit ? { limit: a.limit } : {}),
          });
          const items = unwrapItems(result);
          return Array.isArray(items) ? limitResults(items, a.limit) : result;
        },
      },
    ],
  },
  {
    name: 'watched',
    description: 'Read and update watched state',
    actions: [
      {
        name: 'status',
        description: 'Show watched state for an item',
        args: [
          { name: 'id', description: 'Item ID', required: true },
          { name: 'user', description: 'User ID', required: true },
        ],
        columns: ['ItemId', 'Played', 'PlayCount', 'PlayedPercentage', 'IsFavorite'],
        idField: 'ItemId',
        run: (c: JellyfinClient, a) => c.getItemUserData(a.id, a.user),
      },
      {
        name: 'mark',
        description: 'Mark an item as played',
        args: [
          { name: 'id', description: 'Item ID', required: true },
          { name: 'user', description: 'User ID', required: true },
        ],
        run: (c: JellyfinClient, a) => c.markPlayed(a.id, a.user),
      },
      {
        name: 'unmark',
        description: 'Mark an item as unplayed',
        args: [
          { name: 'id', description: 'Item ID', required: true },
          { name: 'user', description: 'User ID', required: true },
        ],
        run: (c: JellyfinClient, a) => c.markUnplayed(a.id, a.user),
      },
      {
        name: 'favorite',
        description: 'Mark an item as a favorite',
        args: [
          { name: 'id', description: 'Item ID', required: true },
          { name: 'user', description: 'User ID', required: true },
        ],
        run: (c: JellyfinClient, a) => c.markFavorite(a.id, a.user),
      },
      {
        name: 'unfavorite',
        description: 'Remove an item from favorites',
        args: [
          { name: 'id', description: 'Item ID', required: true },
          { name: 'user', description: 'User ID', required: true },
        ],
        run: (c: JellyfinClient, a) => c.unmarkFavorite(a.id, a.user),
      },
    ],
  },
  {
    name: 'session',
    description: 'Inspect active playback sessions',
    actions: [
      {
        name: 'list',
        description: 'List active sessions',
        args: [
          {
            name: 'active-within',
            description: 'Only sessions active within N seconds',
            type: 'number',
          },
        ],
        columns: ['Id', 'UserName', 'Client', 'DeviceName', 'NowPlaying', 'LastActivityDate'],
        idField: 'Id',
        run: async (c: JellyfinClient, a) => {
          const result: any = await c.getSessions(
            a['active-within'] ? { activeWithinSeconds: a['active-within'] } : undefined
          );
          const data = unwrapItems(result);
          if (!Array.isArray(data)) return result;
          return data.map((s: any) => ({
            ...s,
            NowPlaying: s.NowPlayingItem?.Name ?? '',
          }));
        },
      },
    ],
  },
  {
    name: 'user',
    description: 'Manage users',
    actions: [
      {
        name: 'list',
        description: 'List users',
        columns: ['Id', 'Name', 'LastActivityDate', 'LastLoginDate'],
        idField: 'Id',
        run: (c: JellyfinClient) => c.getUsers(),
      },
      {
        name: 'get',
        description: 'Get a user by ID',
        args: [{ name: 'id', description: 'User ID', required: true }],
        fullJson: true,
        run: (c: JellyfinClient, a) => c.getUserById(a.id),
      },
    ],
  },
  {
    name: 'task',
    description: 'Manage scheduled tasks',
    actions: [
      {
        name: 'list',
        description: 'List scheduled tasks',
        columns: ['Id', 'Name', 'State', 'CurrentProgressPercentage', 'Category'],
        idField: 'Id',
        run: (c: JellyfinClient) => c.getTasks(),
      },
      {
        name: 'start',
        description: 'Start a scheduled task',
        args: [{ name: 'id', description: 'Task ID', required: true }],
        run: (c: JellyfinClient, a) => c.startTask(a.id),
      },
      {
        name: 'stop',
        description: 'Stop a running scheduled task',
        args: [{ name: 'id', description: 'Task ID', required: true }],
        run: (c: JellyfinClient, a) => c.stopTask(a.id),
      },
    ],
  },
  {
    name: 'search',
    description: 'Search the library',
    actions: [
      {
        name: 'query',
        description: 'Search for items',
        args: [
          { name: 'query', description: 'Search query', required: true },
          { name: 'type', description: 'Item types (comma-separated)' },
          { name: 'limit', description: 'Maximum number of results', type: 'number' },
        ],
        columns: ['ItemId', 'Name', 'Type', 'ProductionYear'],
        idField: 'ItemId',
        run: async (c: JellyfinClient, a) => {
          const result: any = await c.search(a.query, {
            ...(splitList(a.type) ? { includeItemTypes: splitList(a.type) as any } : {}),
            ...(a.limit ? { limit: a.limit } : {}),
          });
          const items = unwrapItems(result);
          return Array.isArray(items) ? limitResults(items, a.limit) : result;
        },
      },
    ],
  },
  {
    name: 'system',
    description: 'Server status and activity',
    actions: [
      {
        name: 'status',
        description: 'Show server status',
        columns: ['Id', 'ServerName', 'Version', 'OperatingSystem'],
        idField: 'Id',
        run: (c: JellyfinClient) => c.getSystemStatus(),
      },
      {
        name: 'activity',
        description: 'Show the activity log',
        args: [{ name: 'limit', description: 'Maximum number of entries', type: 'number' }],
        columns: ['Id', 'Name', 'Type', 'Severity', 'Date'],
        idField: 'Id',
        run: async (c: JellyfinClient, a) => {
          const result: any = await c.getActivityLog(a.limit ? { limit: a.limit } : undefined);
          const items = unwrapItems(result);
          return Array.isArray(items) ? limitResults(items, a.limit) : result;
        },
      },
    ],
  },
];

export const jellyfin = buildServiceCommand(
  'jellyfin',
  'Manage Jellyfin (Media Server)',
  config => new JellyfinClient(config),
  resources
);
