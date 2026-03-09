import { LidarrClient } from '../../clients/lidarr.js';
import { promptConfirm, promptSelect } from '../prompt.js';
import type { ResourceDef } from './service.js';
import { buildServiceCommand } from './service.js';

const resources: ResourceDef[] = [
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
        run: (c: LidarrClient, a) => c.searchArtists(a.term),
      },
      {
        name: 'add',
        description: 'Search and add an artist',
        args: [{ name: 'term', description: 'Search term', required: true }],
        run: async (c: LidarrClient, a) => {
          const searchResult = await c.searchArtists(a.term);
          const results = searchResult?.data ?? searchResult;
          if (!Array.isArray(results) || results.length === 0) {
            throw new Error('No artists found.');
          }
          const artistId = await promptSelect(
            'Select an artist:',
            results.map((ar: any) => ({
              label: ar.artistName,
              value: String(ar.foreignArtistId),
            }))
          );
          const artist = results.find((ar: any) => String(ar.foreignArtistId) === artistId);

          const profilesResult = await c.getQualityProfiles();
          const profiles = profilesResult?.data ?? profilesResult;
          if (!Array.isArray(profiles) || profiles.length === 0) {
            throw new Error('No quality profiles found. Configure one in Lidarr first.');
          }
          const profileId = await promptSelect(
            'Select quality profile:',
            profiles.map((p: any) => ({ label: p.name, value: String(p.id) }))
          );

          const foldersResult = await c.getRootFolders();
          const folders = foldersResult?.data ?? foldersResult;
          if (!Array.isArray(folders) || folders.length === 0) {
            throw new Error('No root folders found. Configure one in Lidarr first.');
          }
          const rootFolderPath = await promptSelect(
            'Select root folder:',
            folders.map((f: any) => ({ label: f.path, value: f.path }))
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
          const result = await c.getArtist(a.id);
          const artist = result?.data ?? result;
          const updates: any = { ...artist };
          if (a.monitored !== undefined) updates.monitored = a.monitored === 'true';
          if (a['quality-profile-id'] !== undefined)
            updates.qualityProfileId = Number(a['quality-profile-id']);
          if (a.tags !== undefined)
            updates.tags = a.tags.split(',').map((t: string) => Number(t.trim()));
          return c.updateArtist(a.id, updates);
        },
      },
      {
        name: 'refresh',
        description: 'Refresh artist metadata',
        args: [{ name: 'id', description: 'Artist ID', required: true, type: 'number' }],
        run: (c: LidarrClient, a) => c.runCommand({ name: 'RefreshArtist', artistId: a.id } as any),
      },
      {
        name: 'manual-search',
        description: 'Trigger a manual search for releases',
        args: [{ name: 'id', description: 'Artist ID', required: true, type: 'number' }],
        run: (c: LidarrClient, a) => c.runCommand({ name: 'ArtistSearch', artistId: a.id } as any),
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
        columns: ['id', 'title', 'artistId', 'monitored'],
        run: (c: LidarrClient) => c.getAlbums(),
      },
      {
        name: 'get',
        description: 'Get an album by ID',
        args: [{ name: 'id', description: 'Album ID', required: true, type: 'number' }],
        run: (c: LidarrClient, a) => c.getAlbum(a.id),
      },
      {
        name: 'search',
        description: 'Search for albums',
        args: [{ name: 'term', description: 'Search term', required: true }],
        columns: ['foreignAlbumId', 'title', 'artistId'],
        run: (c: LidarrClient, a) => c.searchAlbums(a.term),
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
        run: (c: LidarrClient) => c.getTags(),
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
