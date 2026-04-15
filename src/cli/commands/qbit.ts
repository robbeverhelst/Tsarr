import { QBittorrentClient } from '../../clients/qbittorrent';
import type { QBittorrentClientConfig } from '../../core/types';
import type { ResourceDef } from './service';
import { buildServiceCommand } from './service';

export const resources: ResourceDef[] = [
  {
    name: 'torrents',
    description: 'Manage torrents',
    actions: [
      {
        name: 'list',
        description: 'List torrents',
        args: [
          {
            name: 'filter',
            description:
              'Filter (all|downloading|seeding|completed|paused|active|inactive|stalled|errored)',
            values: [
              'all',
              'downloading',
              'seeding',
              'completed',
              'paused',
              'active',
              'inactive',
              'resumed',
              'stalled',
              'stalled_uploading',
              'stalled_downloading',
              'errored',
            ],
          },
        ],
        columns: ['hash', 'name', 'state', 'progress', 'size', 'dlspeed', 'upspeed'],
        idField: 'hash',
        run: (c: QBittorrentClient, a) => c.getTorrents(a.filter),
      },
      {
        name: 'pause',
        description: 'Pause torrents',
        args: [
          {
            name: 'hashes',
            description: 'Torrent hashes (comma-separated, or "all")',
            required: true,
          },
        ],
        run: (c: QBittorrentClient, a) => c.pauseTorrents(a.hashes),
      },
      {
        name: 'resume',
        description: 'Resume torrents',
        args: [
          {
            name: 'hashes',
            description: 'Torrent hashes (comma-separated, or "all")',
            required: true,
          },
        ],
        run: (c: QBittorrentClient, a) => c.resumeTorrents(a.hashes),
      },
      {
        name: 'delete',
        description: 'Delete torrents',
        args: [
          {
            name: 'hashes',
            description: 'Torrent hashes (comma-separated, or "all")',
            required: true,
          },
          {
            name: 'delete-files',
            description: 'Also delete downloaded files',
            type: 'boolean',
          },
        ],
        confirmMessage: 'Are you sure you want to delete these torrents?',
        run: (c: QBittorrentClient, a) => c.deleteTorrents(a.hashes, a['delete-files']),
      },
    ],
  },
  {
    name: 'status',
    description: 'Transfer status',
    actions: [
      {
        name: 'show',
        description: 'Show transfer info (speed, connections)',
        columns: [
          'connection_status',
          'dl_info_speed',
          'dl_info_data',
          'up_info_speed',
          'up_info_data',
          'dht_nodes',
        ],
        run: (c: QBittorrentClient) => c.getTransferInfo(),
      },
    ],
  },
];

export const qbit = buildServiceCommand(
  'qbittorrent',
  'Manage qBittorrent',
  config => new QBittorrentClient(config as QBittorrentClientConfig),
  resources
);
