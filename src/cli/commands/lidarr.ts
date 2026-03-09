import { LidarrClient } from '../../clients/lidarr.js';
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
