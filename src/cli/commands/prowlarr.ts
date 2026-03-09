import { ProwlarrClient } from '../../clients/prowlarr.js';
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
        name: 'delete',
        description: 'Delete an indexer',
        args: [{ name: 'id', description: 'Indexer ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this indexer?',
        run: (c: ProwlarrClient, a) => c.deleteIndexer(a.id),
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
        args: [{ name: 'query', description: 'Search query', required: true }],
        columns: ['indexer', 'title', 'size', 'seeders'],
        run: (c: ProwlarrClient, a) => c.search(a.query),
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
        run: (c: ProwlarrClient) => c.getTags(),
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
