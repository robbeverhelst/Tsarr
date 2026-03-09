import { readFileSync } from 'node:fs';
import { ProwlarrClient } from '../../clients/prowlarr.js';
import { promptIfMissing } from '../prompt.js';
import type { ResourceDef } from './service.js';
import { buildServiceCommand } from './service.js';

const resources: ResourceDef[] = [
  {
    name: 'indexer',
    description: 'Manage indexers',
    actions: [
      {
        name: 'list',
        description: 'List all indexers',
        columns: ['id', 'name', 'protocol', 'enable'],
        run: (c: ProwlarrClient) => c.getIndexers(),
      },
      {
        name: 'get',
        description: 'Get an indexer by ID',
        args: [{ name: 'id', description: 'Indexer ID', required: true, type: 'number' }],
        run: (c: ProwlarrClient, a) => c.getIndexer(a.id),
      },
      {
        name: 'add',
        description: 'Add an indexer from JSON file or stdin',
        args: [{ name: 'file', description: 'JSON file path (use - for stdin)', required: true }],
        run: async (c: ProwlarrClient, a) => {
          const body = readJsonInput(a.file);
          return c.addIndexer(body);
        },
      },
      {
        name: 'edit',
        description: 'Edit an indexer (merges JSON with existing)',
        args: [
          { name: 'id', description: 'Indexer ID', required: true, type: 'number' },
          { name: 'file', description: 'JSON file with fields to update', required: true },
        ],
        run: async (c: ProwlarrClient, a) => {
          const existing = unwrapData<any>(await c.getIndexer(a.id));
          const updates = readJsonInput(a.file);
          return c.updateIndexer(a.id, { ...existing, ...updates });
        },
      },
      {
        name: 'delete',
        description: 'Delete an indexer',
        args: [{ name: 'id', description: 'Indexer ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this indexer?',
        run: (c: ProwlarrClient, a) => c.deleteIndexer(a.id),
      },
      {
        name: 'test',
        description: 'Test all indexers',
        run: (c: ProwlarrClient) => c.testAllIndexers(),
      },
    ],
  },
  {
    name: 'search',
    description: 'Search indexers',
    actions: [
      {
        name: 'run',
        description: 'Search across indexers',
        args: [
          { name: 'term', description: 'Search term' },
          { name: 'query', description: 'Search query' },
        ],
        columns: ['indexer', 'title', 'size', 'seeders'],
        run: async (c: ProwlarrClient, a) =>
          c.search(await promptIfMissing(a.term ?? a.query, 'Search term:')),
      },
    ],
  },
  {
    name: 'app',
    description: 'Manage applications',
    actions: [
      {
        name: 'list',
        description: 'List configured applications',
        columns: ['id', 'name', 'syncLevel'],
        run: (c: ProwlarrClient) => c.getApplications(),
      },
      {
        name: 'get',
        description: 'Get an application by ID',
        args: [{ name: 'id', description: 'Application ID', required: true, type: 'number' }],
        run: (c: ProwlarrClient, a) => c.getApplication(a.id),
      },
      {
        name: 'add',
        description: 'Add an application from JSON file or stdin',
        args: [{ name: 'file', description: 'JSON file path (use - for stdin)', required: true }],
        run: async (c: ProwlarrClient, a) => {
          const body = readJsonInput(a.file);
          return c.addApplication(body);
        },
      },
      {
        name: 'edit',
        description: 'Edit an application (merges JSON with existing)',
        args: [
          { name: 'id', description: 'Application ID', required: true, type: 'number' },
          { name: 'file', description: 'JSON file with fields to update', required: true },
        ],
        run: async (c: ProwlarrClient, a) => {
          const existing = unwrapData<any>(await c.getApplication(a.id));
          const updates = readJsonInput(a.file);
          return c.updateApplication(a.id, { ...existing, ...updates });
        },
      },
      {
        name: 'delete',
        description: 'Delete an application',
        args: [{ name: 'id', description: 'Application ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this application?',
        run: (c: ProwlarrClient, a) => c.deleteApplication(a.id),
      },
      {
        name: 'sync',
        description: 'Trigger app indexer sync',
        run: (c: ProwlarrClient) => c.runCommand({ name: 'AppIndexerMapSync' } as any),
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
        run: (c: ProwlarrClient, a) => c.addTag({ label: a.label } as any),
      },
      {
        name: 'delete',
        description: 'Delete a tag',
        args: [{ name: 'id', description: 'Tag ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this tag?',
        run: async (c: ProwlarrClient, a) => {
          const tagResult = await c.getTag(a.id);
          if (tagResult?.error) return tagResult;

          const tag = (tagResult?.data ?? tagResult) as any;
          const deleteResult = await c.deleteTag(a.id);
          if (deleteResult?.error) return deleteResult;

          return { message: `Deleted tag: ${tag.label} (ID: ${tag.id})` };
        },
      },
      {
        name: 'list',
        description: 'List all tags',
        columns: ['id', 'label'],
        run: (c: ProwlarrClient) => c.getTags(),
      },
    ],
  },
  {
    name: 'indexerstats',
    description: 'View indexer statistics',
    actions: [
      {
        name: 'list',
        description: 'Get indexer performance statistics',
        columns: [
          'indexerName',
          'numberOfQueries',
          'numberOfGrabs',
          'numberOfFailures',
          'averageResponseTime',
        ],
        run: async (c: ProwlarrClient) => {
          const result = unwrapData<any>(await c.getIndexerStats());
          return result?.indexers ?? result;
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
        run: (c: ProwlarrClient) => c.getNotifications(),
      },
      {
        name: 'get',
        description: 'Get a notification by ID',
        args: [{ name: 'id', description: 'Notification ID', required: true, type: 'number' }],
        run: (c: ProwlarrClient, a) => c.getNotification(a.id),
      },
      {
        name: 'add',
        description: 'Add a notification from JSON file or stdin',
        args: [{ name: 'file', description: 'JSON file path (use - for stdin)', required: true }],
        run: async (c: ProwlarrClient, a) => c.addNotification(readJsonInput(a.file)),
      },
      {
        name: 'edit',
        description: 'Edit a notification (merges JSON with existing)',
        args: [
          { name: 'id', description: 'Notification ID', required: true, type: 'number' },
          { name: 'file', description: 'JSON file with fields to update', required: true },
        ],
        run: async (c: ProwlarrClient, a) => {
          const existing = unwrapData<any>(await c.getNotification(a.id));
          return c.updateNotification(a.id, { ...existing, ...readJsonInput(a.file) });
        },
      },
      {
        name: 'delete',
        description: 'Delete a notification',
        args: [{ name: 'id', description: 'Notification ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this notification?',
        run: (c: ProwlarrClient, a) => c.deleteNotification(a.id),
      },
      {
        name: 'test',
        description: 'Test all notifications',
        run: (c: ProwlarrClient) => c.testAllNotifications(),
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
        run: (c: ProwlarrClient) => c.getDownloadClients(),
      },
      {
        name: 'get',
        description: 'Get a download client by ID',
        args: [{ name: 'id', description: 'Download client ID', required: true, type: 'number' }],
        run: (c: ProwlarrClient, a) => c.getDownloadClient(a.id),
      },
      {
        name: 'add',
        description: 'Add a download client from JSON file or stdin',
        args: [{ name: 'file', description: 'JSON file path (use - for stdin)', required: true }],
        run: async (c: ProwlarrClient, a) => c.addDownloadClient(readJsonInput(a.file)),
      },
      {
        name: 'edit',
        description: 'Edit a download client (merges JSON with existing)',
        args: [
          { name: 'id', description: 'Download client ID', required: true, type: 'number' },
          { name: 'file', description: 'JSON file with fields to update', required: true },
        ],
        run: async (c: ProwlarrClient, a) => {
          const existing = unwrapData<any>(await c.getDownloadClient(a.id));
          return c.updateDownloadClient(a.id, { ...existing, ...readJsonInput(a.file) });
        },
      },
      {
        name: 'delete',
        description: 'Delete a download client',
        args: [{ name: 'id', description: 'Download client ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this download client?',
        run: (c: ProwlarrClient, a) => c.deleteDownloadClient(a.id),
      },
      {
        name: 'test',
        description: 'Test all download clients',
        run: (c: ProwlarrClient) => c.testAllDownloadClients(),
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
        run: (c: ProwlarrClient) => c.getSystemStatus(),
      },
      {
        name: 'health',
        description: 'Get health check results',
        columns: ['type', 'message', 'source'],
        run: (c: ProwlarrClient) => c.getHealth(),
      },
    ],
  },
];

export const prowlarr = buildServiceCommand(
  'prowlarr',
  'Manage Prowlarr (Indexers)',
  config => new ProwlarrClient(config),
  resources
);

function unwrapData<T>(result: any): T {
  return (result?.data ?? result) as T;
}

function readJsonInput(filePath: string): any {
  const raw = filePath === '-' ? readFileSync(0, 'utf-8') : readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}
