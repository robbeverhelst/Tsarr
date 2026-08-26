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

const PLAY_COMMANDS = ['PlayNow', 'PlayNext', 'PlayLast', 'PlayInstantMix', 'PlayShuffle'];

const GENERAL_COMMANDS = [
  'MoveUp',
  'MoveDown',
  'MoveLeft',
  'MoveRight',
  'PageUp',
  'PageDown',
  'PreviousLetter',
  'NextLetter',
  'ToggleOsd',
  'ToggleContextMenu',
  'Select',
  'Back',
  'TakeScreenshot',
  'SendKey',
  'SendString',
  'GoHome',
  'GoToSettings',
  'VolumeUp',
  'VolumeDown',
  'Mute',
  'Unmute',
  'ToggleMute',
  'SetVolume',
  'SetAudioStreamIndex',
  'SetSubtitleStreamIndex',
  'ToggleFullscreen',
  'DisplayContent',
  'GoToSearch',
  'DisplayMessage',
  'SetRepeatMode',
  'ChannelUp',
  'ChannelDown',
  'Guide',
  'ToggleStats',
  'PlayMediaSource',
  'PlayTrailers',
  'SetShuffleQueue',
  'PlayState',
  'PlayNext',
  'ToggleOsdMenu',
  'Play',
  'SetMaxStreamingBitrate',
  'SetPlaybackOrder',
];

const IMAGE_TYPES = [
  'Primary',
  'Art',
  'Backdrop',
  'Banner',
  'Logo',
  'Thumb',
  'Disc',
  'Box',
  'Screenshot',
  'Menu',
  'Chapter',
  'BoxRear',
  'Profile',
];

/** Jellyfin measures playback positions in .NET ticks: 10,000,000 per second. */
const TICKS_PER_SECOND = 10_000_000;

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
    name: 'image',
    description: 'Inspect and replace artwork',
    actions: [
      {
        name: 'list',
        description: "Show an item's current artwork and its dimensions",
        args: [{ name: 'id', description: 'Item ID', required: true }],
        columns: ['ImageType', 'ImageIndex', 'Width', 'Height', 'Size'],
        idField: 'ImageType',
        run: (c: JellyfinClient, a) => c.getItemImages(a.id),
      },
      {
        name: 'remote',
        description: 'List artwork candidates from metadata providers',
        args: [
          { name: 'id', description: 'Item ID', required: true },
          {
            name: 'type',
            description: `Image type (${IMAGE_TYPES.slice(0, 6).join('|')}...)`,
            values: IMAGE_TYPES,
          },
          { name: 'provider', description: 'Only this provider (e.g. TheMovieDb)' },
          { name: 'all-languages', description: 'Include all languages', type: 'boolean' },
          { name: 'limit', description: 'Maximum number of candidates', type: 'number' },
        ],
        columns: ['ProviderName', 'Width', 'Height', 'Language', 'CommunityRating', 'Url'],
        idField: 'Url',
        run: async (c: JellyfinClient, a) => {
          const result: any = await c.getRemoteImages(a.id, a.type, {
            ...(a.provider ? { providerName: a.provider } : {}),
            ...(a['all-languages'] !== undefined
              ? { includeAllLanguages: a['all-languages'] }
              : {}),
            ...(a.limit ? { limit: a.limit } : {}),
          });
          const data = result?.data ?? result;
          const images = data?.Images;
          if (!Array.isArray(images)) return result;
          return limitResults(images, a.limit);
        },
      },
      {
        name: 'providers',
        description: 'List artwork providers available for an item',
        args: [{ name: 'id', description: 'Item ID', required: true }],
        columns: ['Name'],
        idField: 'Name',
        run: (c: JellyfinClient, a) => c.getRemoteImageProviders(a.id),
      },
      {
        name: 'set',
        description: 'Attach artwork to an item from a URL (replaces the existing image)',
        args: [
          { name: 'id', description: 'Item ID', required: true },
          {
            name: 'type',
            description: 'Image type',
            required: true,
            values: IMAGE_TYPES,
          },
          {
            name: 'url',
            description: 'Image URL. Any reachable URL works, not just provider candidates',
            required: true,
          },
        ],
        run: (c: JellyfinClient, a) => c.downloadRemoteImage(a.id, a.type, a.url),
      },
      {
        name: 'delete',
        description: 'Remove artwork from an item',
        args: [
          { name: 'id', description: 'Item ID', required: true },
          { name: 'type', description: 'Image type', required: true, values: IMAGE_TYPES },
          { name: 'index', description: 'Image index', type: 'number' },
        ],
        confirmMessage: 'Remove this artwork?',
        run: (c: JellyfinClient, a) => c.deleteItemImage(a.id, a.type, a.index),
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
      {
        name: 'play',
        description: 'Start playback of items on a session',
        args: [
          { name: 'id', description: 'Session ID', required: true },
          { name: 'items', description: 'Item IDs (comma-separated)', required: true },
          {
            name: 'mode',
            description: `Play command (${PLAY_COMMANDS.join('|')})`,
            values: PLAY_COMMANDS,
          },
          { name: 'position', description: 'Start position in seconds', type: 'number' },
        ],
        run: (c: JellyfinClient, a) =>
          c.playOnSession(a.id, a.mode ?? 'PlayNow', splitList(a.items) ?? [], {
            ...(a.position ? { startPositionTicks: a.position * TICKS_PER_SECOND } : {}),
          }),
      },
      {
        name: 'pause',
        description: 'Pause playback on a session',
        args: [{ name: 'id', description: 'Session ID', required: true }],
        run: (c: JellyfinClient, a) => c.sendPlaystateCommand(a.id, 'Pause'),
      },
      {
        name: 'unpause',
        description: 'Resume playback on a session',
        args: [{ name: 'id', description: 'Session ID', required: true }],
        run: (c: JellyfinClient, a) => c.sendPlaystateCommand(a.id, 'Unpause'),
      },
      {
        name: 'stop',
        description: 'Stop playback on a session',
        args: [{ name: 'id', description: 'Session ID', required: true }],
        confirmMessage: 'Stop playback on this session?',
        run: (c: JellyfinClient, a) => c.sendPlaystateCommand(a.id, 'Stop'),
      },
      {
        name: 'seek',
        description: 'Seek to a position on a session',
        args: [
          { name: 'id', description: 'Session ID', required: true },
          { name: 'position', description: 'Position in seconds', type: 'number', required: true },
        ],
        run: (c: JellyfinClient, a) =>
          c.sendPlaystateCommand(a.id, 'Seek', {
            seekPositionTicks: a.position * TICKS_PER_SECOND,
          }),
      },
      {
        name: 'message',
        description: 'Display a message on a session',
        args: [
          { name: 'id', description: 'Session ID', required: true },
          { name: 'text', description: 'Message text', required: true },
          { name: 'header', description: 'Message header' },
          { name: 'timeout', description: 'Dismiss after N milliseconds', type: 'number' },
        ],
        run: (c: JellyfinClient, a) =>
          c.sendMessage(a.id, a.text, {
            ...(a.header ? { header: a.header } : {}),
            ...(a.timeout ? { timeoutMs: a.timeout } : {}),
          }),
      },
      {
        name: 'command',
        description: 'Send a general command (volume, navigation, subtitles)',
        args: [
          { name: 'id', description: 'Session ID', required: true },
          {
            name: 'command',
            description: 'Command name (e.g. VolumeUp, Mute, GoHome, ToggleFullscreen)',
            required: true,
            values: GENERAL_COMMANDS,
          },
        ],
        run: (c: JellyfinClient, a) => c.sendGeneralCommand(a.id, a.command),
      },
      {
        name: 'system',
        description: 'Send a system command to a session',
        args: [
          { name: 'id', description: 'Session ID', required: true },
          {
            name: 'command',
            description: 'Command name (e.g. GoHome, GoToSettings, TakeScreenshot)',
            required: true,
            values: GENERAL_COMMANDS,
          },
        ],
        run: (c: JellyfinClient, a) => c.sendSystemCommand(a.id, a.command),
      },
      {
        name: 'display',
        description: "Show an item's detail page on a session",
        args: [
          { name: 'id', description: 'Session ID', required: true },
          { name: 'item', description: 'Item ID', required: true },
          { name: 'name', description: 'Item name', required: true },
          { name: 'type', description: 'Item type (e.g. Movie, Series)', required: true },
        ],
        run: (c: JellyfinClient, a) => c.displayContent(a.id, a.item, a.name, a.type),
      },
      {
        name: 'add-user',
        description: 'Add a user to a session',
        args: [
          { name: 'id', description: 'Session ID', required: true },
          { name: 'user', description: 'User ID', required: true },
        ],
        run: (c: JellyfinClient, a) => c.addUserToSession(a.id, a.user),
      },
      {
        name: 'remove-user',
        description: 'Remove a user from a session',
        args: [
          { name: 'id', description: 'Session ID', required: true },
          { name: 'user', description: 'User ID', required: true },
        ],
        run: (c: JellyfinClient, a) => c.removeUserFromSession(a.id, a.user),
      },
    ],
  },
  {
    name: 'playlist',
    description: 'Manage playlists',
    actions: [
      {
        name: 'create',
        description: 'Create a playlist',
        args: [
          { name: 'name', description: 'Playlist name', required: true },
          { name: 'user', description: 'Owning user ID', required: true },
          { name: 'items', description: 'Item IDs to seed it with (comma-separated)' },
          {
            name: 'type',
            description: 'Media type (Audio|Video|Photo|Book|Unknown)',
            values: ['Unknown', 'Video', 'Audio', 'Photo', 'Book'],
          },
        ],
        run: (c: JellyfinClient, a) =>
          c.createPlaylist(a.name, {
            userId: a.user,
            ...(splitList(a.items) ? { ids: splitList(a.items) } : {}),
            ...(a.type ? { mediaType: a.type } : {}),
          }),
      },
      {
        name: 'items',
        description: 'List the items in a playlist',
        args: [
          { name: 'id', description: 'Playlist ID', required: true },
          { name: 'user', description: 'User ID', required: true },
          { name: 'limit', description: 'Maximum number of results', type: 'number' },
        ],
        columns: ['Id', 'PlaylistItemId', 'Name', 'Type'],
        idField: 'Id',
        run: async (c: JellyfinClient, a) => {
          const result: any = await c.getPlaylistItems(a.id, {
            userId: a.user,
            ...(a.limit ? { limit: a.limit } : {}),
          });
          const items = unwrapItems(result);
          return Array.isArray(items) ? limitResults(items, a.limit) : result;
        },
      },
      {
        name: 'add',
        description: 'Add items to a playlist',
        args: [
          { name: 'id', description: 'Playlist ID', required: true },
          { name: 'items', description: 'Item IDs (comma-separated)', required: true },
          { name: 'user', description: 'User ID', required: true },
        ],
        run: (c: JellyfinClient, a) =>
          c.addToPlaylist(a.id, splitList(a.items) ?? [], { userId: a.user }),
      },
      {
        name: 'remove',
        description: 'Remove entries from a playlist',
        args: [
          { name: 'id', description: 'Playlist ID', required: true },
          {
            name: 'entries',
            description:
              'Playlist entry IDs from `playlist items` (PlaylistItemId), comma-separated',
            required: true,
          },
        ],
        confirmMessage: 'Remove these entries from the playlist?',
        run: (c: JellyfinClient, a) => c.removeFromPlaylist(a.id, splitList(a.entries) ?? []),
      },
    ],
  },
  {
    name: 'collection',
    description: 'Manage collections (box sets)',
    actions: [
      {
        name: 'create',
        description: 'Create a collection',
        args: [
          { name: 'name', description: 'Collection name', required: true },
          { name: 'items', description: 'Item IDs to seed it with (comma-separated)' },
          { name: 'parent', description: 'Parent folder ID' },
        ],
        run: (c: JellyfinClient, a) =>
          c.createCollection(a.name, {
            ...(splitList(a.items) ? { ids: splitList(a.items) } : {}),
            ...(a.parent ? { parentId: a.parent } : {}),
          }),
      },
      {
        name: 'add',
        description: 'Add items to a collection',
        args: [
          { name: 'id', description: 'Collection ID', required: true },
          { name: 'items', description: 'Item IDs (comma-separated)', required: true },
        ],
        run: (c: JellyfinClient, a) => c.addToCollection(a.id, splitList(a.items) ?? []),
      },
      {
        name: 'remove',
        description: 'Remove items from a collection',
        args: [
          { name: 'id', description: 'Collection ID', required: true },
          { name: 'items', description: 'Item IDs (comma-separated)', required: true },
        ],
        confirmMessage: 'Remove these items from the collection?',
        run: (c: JellyfinClient, a) => c.removeFromCollection(a.id, splitList(a.items) ?? []),
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
