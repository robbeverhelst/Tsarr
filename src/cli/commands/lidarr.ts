import { LidarrClient } from '../../clients/lidarr';
import { promptConfirm, promptSelect } from '../prompt';
import type { ResourceDef } from './service';
import { buildServiceCommand, COMMAND_OUTPUT_COLUMNS, readJsonInput, unwrapData } from './service';

export const resources: ResourceDef[] = [
  {
    name: 'artist',
    description: 'Manage artists',
    actions: [
      {
        name: 'list',
        description: 'List all artists',
        columns: ['id', 'artistName', 'monitored', 'qualityProfileId'],
        run: (c: LidarrClient) => c.getArtists(),
      },
      {
        name: 'get',
        description: 'Get an artist by ID',
        args: [{ name: 'id', description: 'Artist ID', required: true, type: 'number' }],
        run: (c: LidarrClient, a) => c.getArtist(a.id),
      },
      {
        name: 'search',
        description: 'Search for artists',
        args: [{ name: 'term', description: 'Search term', required: true }],
        columns: ['foreignArtistId', 'artistName', 'overview'],
        idField: 'foreignArtistId',
        run: (c: LidarrClient, a) => c.searchArtists(a.term),
      },
      {
        name: 'add',
        description: 'Search and add an artist',
        args: [{ name: 'term', description: 'Search term', required: true }],
        run: async (c: LidarrClient, a) => {
          const results = unwrapData<any[]>(await c.searchArtists(a.term));
          if (!Array.isArray(results) || results.length === 0) {
            throw new Error('No artists found.');
          }

          const artistId = await promptSelect(
            'Select an artist:',
            results.map((artist: any) => ({
              label: artist.artistName,
              value: String(artist.foreignArtistId),
            }))
          );
          const artist = results.find((item: any) => String(item.foreignArtistId) === artistId);
          if (!artist) {
            throw new Error('Selected artist was not found in the search results.');
          }

          const profiles = unwrapData<any[]>(await c.getQualityProfiles());
          if (!Array.isArray(profiles) || profiles.length === 0) {
            throw new Error('No quality profiles found. Configure one in Lidarr first.');
          }
          const profileId = await promptSelect(
            'Select quality profile:',
            profiles.map((profile: any) => ({ label: profile.name, value: String(profile.id) }))
          );

          const folders = unwrapData<any[]>(await c.getRootFolders());
          if (!Array.isArray(folders) || folders.length === 0) {
            throw new Error('No root folders found. Configure one in Lidarr first.');
          }
          const rootFolderPath = await promptSelect(
            'Select root folder:',
            folders.map((folder: any) => ({ label: folder.path, value: folder.path }))
          );

          const confirmed = await promptConfirm(`Add "${artist.artistName}"?`, !!a.yes);
          if (!confirmed) throw new Error('Cancelled.');

          return c.addArtist({
            ...artist,
            qualityProfileId: Number(profileId),
            rootFolderPath,
            monitored: true,
            addOptions: { searchForMissingAlbums: true },
          });
        },
      },
      {
        name: 'edit',
        description: 'Edit an artist',
        args: [
          { name: 'id', description: 'Artist ID', required: true, type: 'number' },
          { name: 'monitored', description: 'Set monitored (true/false)' },
          { name: 'quality-profile-id', description: 'Quality profile ID', type: 'number' },
          { name: 'tags', description: 'Comma-separated tag IDs' },
        ],
        run: async (c: LidarrClient, a) => {
          const artist = unwrapData<any>(await c.getArtist(a.id));
          const updates: any = { ...artist };
          if (a.monitored !== undefined) updates.monitored = a.monitored === 'true';
          if (a['quality-profile-id'] !== undefined) {
            updates.qualityProfileId = Number(a['quality-profile-id']);
          }
          if (a.tags !== undefined) {
            updates.tags = a.tags.split(',').map((tag: string) => Number(tag.trim()));
          }
          return c.updateArtist(a.id, updates);
        },
      },
      {
        name: 'refresh',
        description: 'Refresh artist metadata',
        args: [{ name: 'id', description: 'Artist ID', required: true, type: 'number' }],
        columns: COMMAND_OUTPUT_COLUMNS,
        run: (c: LidarrClient, a) => c.runCommand({ name: 'RefreshArtist', artistId: a.id }),
      },
      {
        name: 'manual-search',
        description: 'Trigger a manual search for releases',
        args: [{ name: 'id', description: 'Artist ID', required: true, type: 'number' }],
        columns: COMMAND_OUTPUT_COLUMNS,
        run: (c: LidarrClient, a) => c.runCommand({ name: 'ArtistSearch', artistId: a.id }),
      },
      {
        name: 'delete',
        description: 'Delete an artist',
        args: [{ name: 'id', description: 'Artist ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this artist?',
        run: (c: LidarrClient, a) => c.deleteArtist(a.id),
      },
    ],
  },
  {
    name: 'album',
    description: 'Manage albums',
    actions: [
      {
        name: 'list',
        description: 'List all albums',
        columns: ['id', 'artistName', 'title', 'monitored'],
        run: async (c: LidarrClient) => {
          const albums = unwrapData<any[]>(await c.getAlbums());
          return albums.map(withArtistName);
        },
      },
      {
        name: 'get',
        description: 'Get an album by ID',
        args: [{ name: 'id', description: 'Album ID', required: true, type: 'number' }],
        run: async (c: LidarrClient, a) => {
          const album = unwrapData<any>(await c.getAlbum(a.id));
          return withArtistName(album);
        },
      },
      {
        name: 'search',
        description: 'Search for albums',
        args: [{ name: 'term', description: 'Search term', required: true }],
        columns: ['foreignAlbumId', 'artistName', 'title', 'monitored'],
        idField: 'foreignAlbumId',
        run: async (c: LidarrClient, a) => {
          const albums = unwrapData<any[]>(await c.searchAlbums(a.term));
          return albums.map(withArtistName);
        },
      },
      {
        name: 'add',
        description: 'Add an album from JSON file or stdin',
        args: [{ name: 'file', description: 'JSON file path (use - for stdin)', required: true }],
        run: async (c: LidarrClient, a) => c.addAlbum(readJsonInput(a.file)),
      },
      {
        name: 'edit',
        description: 'Edit an album (merges JSON with existing)',
        args: [
          { name: 'id', description: 'Album ID', required: true, type: 'number' },
          { name: 'file', description: 'JSON file with fields to update', required: true },
        ],
        run: async (c: LidarrClient, a) => {
          const existing = unwrapData<any>(await c.getAlbum(a.id));
          return c.updateAlbum(a.id, { ...existing, ...readJsonInput(a.file) });
        },
      },
      {
        name: 'delete',
        description: 'Delete an album',
        args: [{ name: 'id', description: 'Album ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this album?',
        run: (c: LidarrClient, a) => c.deleteAlbum(a.id),
      },
    ],
  },
  {
    name: 'trackfile',
    description: 'Manage track files',
    actions: [
      {
        name: 'list',
        description: 'List track files for an artist',
        args: [{ name: 'artist-id', description: 'Artist ID', required: true, type: 'number' }],
        columns: ['id', 'relativePath', 'size', 'quality', 'dateAdded'],
        run: (c: LidarrClient, a) => c.getTrackFiles(a['artist-id']),
      },
      {
        name: 'get',
        description: 'Get a track file by ID',
        args: [{ name: 'id', description: 'Track file ID', required: true, type: 'number' }],
        run: (c: LidarrClient, a) => c.getTrackFile(a.id),
      },
      {
        name: 'delete',
        description: 'Delete a track file from disk',
        args: [{ name: 'id', description: 'Track file ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this track file from disk?',
        run: (c: LidarrClient, a) => c.deleteTrackFile(a.id),
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
        run: (c: LidarrClient) => c.getQualityProfiles(),
      },
      {
        name: 'get',
        description: 'Get a quality profile by ID',
        args: [{ name: 'id', description: 'Profile ID', required: true, type: 'number' }],
        run: (c: LidarrClient, a) => c.getQualityProfile(a.id),
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
        run: (c: LidarrClient, a) => c.addTag({ label: a.label }),
      },
      {
        name: 'delete',
        description: 'Delete a tag',
        args: [{ name: 'id', description: 'Tag ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this tag?',
        run: async (c: LidarrClient, a) => {
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
        run: (c: LidarrClient) => c.getTags(),
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
        columns: ['id', 'artistName', 'title', 'status', 'sizeleft', 'timeleft'],
        run: async (c: LidarrClient) => {
          const items = unwrapData<any[]>(await c.getQueue());
          return items.map(withArtistName);
        },
      },
      {
        name: 'status',
        description: 'Get queue status',
        run: (c: LidarrClient) => c.getQueueStatus(),
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
        run: (c: LidarrClient, a) => c.removeQueueItem(a.id, a['remove-from-client'], a.blocklist),
      },
      {
        name: 'grab',
        description: 'Force download a queue item',
        args: [{ name: 'id', description: 'Queue item ID', required: true, type: 'number' }],
        run: (c: LidarrClient, a) => c.grabQueueItem(a.id),
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
        columns: ['id', 'artistName', 'sourceTitle', 'eventType', 'date'],
        run: async (c: LidarrClient, a) => {
          const items = a.since
            ? unwrapData<any[]>(await c.getHistorySince(a.since))
            : unwrapData<any[]>(await c.getHistory());

          const filtered = a.until
            ? items.filter((item: any) => new Date(item.date) <= new Date(a.until))
            : items;

          return filtered.map(withArtistName);
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
        description: 'List upcoming album releases',
        args: [
          { name: 'start', description: 'Start date (ISO 8601)' },
          { name: 'end', description: 'End date (ISO 8601)' },
          { name: 'unmonitored', description: 'Include unmonitored', type: 'boolean' },
        ],
        columns: ['id', 'artistName', 'title', 'releaseDate'],
        run: async (c: LidarrClient, a) => {
          const albums = unwrapData<any[]>(await c.getCalendar(a.start, a.end, a.unmonitored));
          return albums.map(withArtistName);
        },
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
        run: (c: LidarrClient) => c.getNotifications(),
      },
      {
        name: 'get',
        description: 'Get a notification by ID',
        args: [{ name: 'id', description: 'Notification ID', required: true, type: 'number' }],
        run: (c: LidarrClient, a) => c.getNotification(a.id),
      },
      {
        name: 'add',
        description: 'Add a notification from JSON file or stdin',
        args: [{ name: 'file', description: 'JSON file path (use - for stdin)', required: true }],
        run: async (c: LidarrClient, a) => c.addNotification(readJsonInput(a.file)),
      },
      {
        name: 'edit',
        description: 'Edit a notification (merges JSON with existing)',
        args: [
          { name: 'id', description: 'Notification ID', required: true, type: 'number' },
          { name: 'file', description: 'JSON file with fields to update', required: true },
        ],
        run: async (c: LidarrClient, a) => {
          const existing = unwrapData<any>(await c.getNotification(a.id));
          return c.updateNotification(a.id, { ...existing, ...readJsonInput(a.file) });
        },
      },
      {
        name: 'delete',
        description: 'Delete a notification',
        args: [{ name: 'id', description: 'Notification ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this notification?',
        run: (c: LidarrClient, a) => c.deleteNotification(a.id),
      },
      {
        name: 'test',
        description: 'Test all notifications',
        run: (c: LidarrClient) => c.testAllNotifications(),
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
        run: (c: LidarrClient) => c.getDownloadClients(),
      },
      {
        name: 'get',
        description: 'Get a download client by ID',
        args: [{ name: 'id', description: 'Download client ID', required: true, type: 'number' }],
        run: (c: LidarrClient, a) => c.getDownloadClient(a.id),
      },
      {
        name: 'add',
        description: 'Add a download client from JSON file or stdin',
        args: [{ name: 'file', description: 'JSON file path (use - for stdin)', required: true }],
        run: async (c: LidarrClient, a) => c.addDownloadClient(readJsonInput(a.file)),
      },
      {
        name: 'edit',
        description: 'Edit a download client (merges JSON with existing)',
        args: [
          { name: 'id', description: 'Download client ID', required: true, type: 'number' },
          { name: 'file', description: 'JSON file with fields to update', required: true },
        ],
        run: async (c: LidarrClient, a) => {
          const existing = unwrapData<any>(await c.getDownloadClient(a.id));
          return c.updateDownloadClient(a.id, { ...existing, ...readJsonInput(a.file) });
        },
      },
      {
        name: 'delete',
        description: 'Delete a download client',
        args: [{ name: 'id', description: 'Download client ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this download client?',
        run: (c: LidarrClient, a) => c.deleteDownloadClient(a.id),
      },
      {
        name: 'test',
        description: 'Test all download clients',
        run: (c: LidarrClient) => c.testAllDownloadClients(),
      },
    ],
  },
  {
    name: 'blocklist',
    description: 'View blocked releases',
    actions: [
      {
        name: 'list',
        description: 'List blocked releases',
        columns: ['id', 'artistName', 'sourceTitle', 'date'],
        run: async (c: LidarrClient) => {
          const items = unwrapData<any[]>(await c.getBlocklist());
          return items.map(withArtistName);
        },
      },
      {
        name: 'delete',
        description: 'Remove a release from the blocklist',
        args: [{ name: 'id', description: 'Blocklist item ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to remove this blocklist entry?',
        run: (c: LidarrClient, a) => c.removeBlocklistItem(a.id),
      },
    ],
  },
  {
    name: 'wanted',
    description: 'View missing and cutoff unmet albums',
    actions: [
      {
        name: 'missing',
        description: 'List albums with missing tracks',
        columns: ['id', 'artistName', 'title', 'releaseDate'],
        run: async (c: LidarrClient) => {
          const albums = unwrapData<any[]>(await c.getWantedMissing());
          return albums.map(withArtistName);
        },
      },
      {
        name: 'cutoff',
        description: 'List albums below quality cutoff',
        columns: ['id', 'artistName', 'title', 'releaseDate'],
        run: async (c: LidarrClient) => {
          const albums = unwrapData<any[]>(await c.getWantedCutoff());
          return albums.map(withArtistName);
        },
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
        run: (c: LidarrClient) => c.getImportLists(),
      },
      {
        name: 'get',
        description: 'Get an import list by ID',
        args: [{ name: 'id', description: 'Import list ID', required: true, type: 'number' }],
        run: (c: LidarrClient, a) => c.getImportList(a.id),
      },
      {
        name: 'add',
        description: 'Add an import list from JSON file or stdin',
        args: [{ name: 'file', description: 'JSON file path (use - for stdin)', required: true }],
        run: async (c: LidarrClient, a) => c.addImportList(readJsonInput(a.file)),
      },
      {
        name: 'edit',
        description: 'Edit an import list (merges JSON with existing)',
        args: [
          { name: 'id', description: 'Import list ID', required: true, type: 'number' },
          { name: 'file', description: 'JSON file with fields to update', required: true },
        ],
        run: async (c: LidarrClient, a) => {
          const existing = unwrapData<any>(await c.getImportList(a.id));
          return c.updateImportList(a.id, { ...existing, ...readJsonInput(a.file) });
        },
      },
      {
        name: 'delete',
        description: 'Delete an import list',
        args: [{ name: 'id', description: 'Import list ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this import list?',
        run: (c: LidarrClient, a) => c.deleteImportList(a.id),
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
        run: (c: LidarrClient) => c.getRootFolders(),
      },
      {
        name: 'add',
        description: 'Add a root folder',
        args: [{ name: 'path', description: 'Folder path', required: true }],
        run: (c: LidarrClient, a) => c.addRootFolder(a.path),
      },
      {
        name: 'delete',
        description: 'Delete a root folder',
        args: [{ name: 'id', description: 'Root folder ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this root folder?',
        run: (c: LidarrClient, a) => c.deleteRootFolder(a.id),
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
        run: (c: LidarrClient) => c.getSystemStatus(),
      },
      {
        name: 'health',
        description: 'Get health check results',
        columns: ['type', 'message', 'source'],
        run: (c: LidarrClient) => c.getHealth(),
      },
    ],
  },
];

export const lidarr = buildServiceCommand(
  'lidarr',
  'Manage Lidarr (Music)',
  config => new LidarrClient(config),
  resources
);

function withArtistName(item: any) {
  return {
    ...item,
    artistName: item?.artistName ?? item?.artist?.artistName ?? '—',
  };
}
