import { SeerrClient } from '../../clients/seerr.js';
import type { ResourceDef } from './service.js';
import { buildServiceCommand } from './service.js';

export const resources: ResourceDef[] = [
  {
    name: 'requests',
    description: 'Manage media requests',
    actions: [
      {
        name: 'list',
        description: 'List media requests',
        args: [
          {
            name: 'filter',
            description:
              'Filter (all|approved|available|pending|processing|unavailable|failed|deleted|completed)',
          },
        ],
        columns: ['id', 'status', 'requestedBy', 'createdAt', 'updatedAt'],
        idField: 'id',
        run: async (c: SeerrClient, a) => {
          const result: any = await c.getRequests(a.filter ? { filter: a.filter } : undefined);
          const data = result?.data ?? result;
          const items = data?.results ?? data;
          if (!Array.isArray(items)) return result;
          return {
            ...data,
            results: items.map((r: any) => ({
              ...r,
              requestedBy: r.requestedBy?.displayName ?? r.requestedBy?.email ?? r.requestedBy,
            })),
          };
        },
      },
      {
        name: 'count',
        description: 'Get request counts',
        run: (c: SeerrClient) => c.getRequestCount(),
      },
      {
        name: 'approve',
        description: 'Approve a request',
        args: [
          {
            name: 'id',
            description: 'Request ID',
            required: true,
          },
        ],
        run: (c: SeerrClient, a) => c.approveRequest(a.id),
      },
      {
        name: 'decline',
        description: 'Decline a request',
        args: [
          {
            name: 'id',
            description: 'Request ID',
            required: true,
          },
        ],
        confirmMessage: 'Are you sure you want to decline this request?',
        run: (c: SeerrClient, a) => c.declineRequest(a.id),
      },
    ],
  },
  {
    name: 'search',
    description: 'Search media',
    actions: [
      {
        name: 'query',
        description: 'Search for movies and TV shows',
        args: [
          {
            name: 'query',
            description: 'Search query',
            required: true,
          },
        ],
        columns: ['id', 'mediaType', 'title', 'releaseDate', 'voteAverage'],
        idField: 'id',
        run: (c: SeerrClient, a) => c.search(a.query),
      },
    ],
  },
  {
    name: 'users',
    description: 'Manage users',
    actions: [
      {
        name: 'list',
        description: 'List users',
        columns: ['id', 'email', 'username', 'requestCount', 'createdAt'],
        idField: 'id',
        run: (c: SeerrClient) => c.getUsers(),
      },
    ],
  },
  {
    name: 'status',
    description: 'Server status',
    actions: [
      {
        name: 'show',
        description: 'Show server status',
        columns: ['version', 'commitTag', 'updateAvailable', 'commitsBehind'],
        run: (c: SeerrClient) => c.getSystemStatus(),
      },
    ],
  },
];

export const seerr = buildServiceCommand(
  'seerr',
  'Manage Seerr (Media Requests)',
  config => new SeerrClient(config),
  resources
);
