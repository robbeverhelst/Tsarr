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
        args: [
          { name: 'term', description: 'Search term' },
          { name: 'query', description: 'Search query' },
        ],
        columns: ['indexer', 'title', 'size', 'seeders'],
        run: async (c: ProwlarrClient, a) => c.search(await promptIfMissing(a.term ?? a.query, 'Search term:')),
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

          const tag = tagResult?.data ?? tagResult;
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
