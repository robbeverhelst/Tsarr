import { ReadarrClient } from '../../clients/readarr.js';
import type { ResourceDef } from './service.js';
import { buildServiceCommand } from './service.js';

const resources: ResourceDef[] = [
  {
    name: 'author',
    description: 'Manage authors',
    actions: [
      {
        name: 'list',
        description: 'List all authors',
        columns: ['id', 'authorName', 'monitored', 'qualityProfileId'],
        run: (c: ReadarrClient) => c.getAuthors(),
      },
      {
        name: 'get',
        description: 'Get an author by ID',
        args: [{ name: 'id', description: 'Author ID', required: true, type: 'number' }],
        run: (c: ReadarrClient, a) => c.getAuthor(a.id),
      },
      {
        name: 'search',
        description: 'Search for authors',
        args: [{ name: 'term', description: 'Search term', required: true }],
        columns: ['foreignAuthorId', 'authorName', 'overview'],
        run: (c: ReadarrClient, a) => c.searchAuthors(a.term),
      },
      {
        name: 'delete',
        description: 'Delete an author',
        args: [{ name: 'id', description: 'Author ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this author?',
        run: (c: ReadarrClient, a) => c.deleteAuthor(a.id),
      },
    ],
  },
  {
    name: 'book',
    description: 'Manage books',
    actions: [
      {
        name: 'list',
        description: 'List all books',
        columns: ['id', 'title', 'authorId', 'monitored'],
        run: (c: ReadarrClient) => c.getBooks(),
      },
      {
        name: 'get',
        description: 'Get a book by ID',
        args: [{ name: 'id', description: 'Book ID', required: true, type: 'number' }],
        run: (c: ReadarrClient, a) => c.getBook(a.id),
      },
      {
        name: 'search',
        description: 'Search for books',
        args: [{ name: 'term', description: 'Search term', required: true }],
        columns: ['foreignBookId', 'title', 'authorId'],
        run: (c: ReadarrClient, a) => c.searchBooks(a.term),
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
        run: (c: ReadarrClient) => c.getQualityProfiles(),
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
        run: (c: ReadarrClient) => c.getTags(),
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
        run: (c: ReadarrClient) => c.getRootFolders(),
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
        run: (c: ReadarrClient) => c.getSystemStatus(),
      },
      {
        name: 'health',
        description: 'Get health check results',
        columns: ['type', 'message', 'source'],
        run: (c: ReadarrClient) => c.getHealth(),
      },
    ],
  },
];

export const readarr = buildServiceCommand(
  'readarr',
  'Manage Readarr (Books)',
  config => new ReadarrClient(config),
  resources
);
