import { ReadarrClient } from '../../clients/readarr.js';
import { promptConfirm, promptSelect } from '../prompt.js';
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
        name: 'add',
        description: 'Search and add an author',
        args: [{ name: 'term', description: 'Search term', required: true }],
        run: async (c: ReadarrClient, a) => {
          const searchResult = await c.searchAuthors(a.term);
          const results = searchResult?.data ?? searchResult;
          if (!Array.isArray(results) || results.length === 0) {
            throw new Error('No authors found.');
          }
          const authorId = await promptSelect(
            'Select an author:',
            results.map((au: any) => ({
              label: au.authorName,
              value: String(au.foreignAuthorId),
            }))
          );
          const author = results.find((au: any) => String(au.foreignAuthorId) === authorId);

          const profilesResult = await c.getQualityProfiles();
          const profiles = profilesResult?.data ?? profilesResult;
          if (!Array.isArray(profiles) || profiles.length === 0) {
            throw new Error('No quality profiles found. Configure one in Readarr first.');
          }
          const profileId = await promptSelect(
            'Select quality profile:',
            profiles.map((p: any) => ({ label: p.name, value: String(p.id) }))
          );

          const foldersResult = await c.getRootFolders();
          const folders = foldersResult?.data ?? foldersResult;
          if (!Array.isArray(folders) || folders.length === 0) {
            throw new Error('No root folders found. Configure one in Readarr first.');
          }
          const rootFolderPath = await promptSelect(
            'Select root folder:',
            folders.map((f: any) => ({ label: f.path, value: f.path }))
          );

          const confirmed = await promptConfirm(`Add "${author.authorName}"?`, !!a.yes);
          if (!confirmed) throw new Error('Cancelled.');

          return c.addAuthor({
            ...author,
            qualityProfileId: Number(profileId),
            rootFolderPath,
            monitored: true,
            addOptions: { searchForMissingBooks: true },
          });
        },
      },
      {
        name: 'edit',
        description: 'Edit an author',
        args: [
          { name: 'id', description: 'Author ID', required: true, type: 'number' },
          { name: 'monitored', description: 'Set monitored (true/false)' },
          { name: 'quality-profile-id', description: 'Quality profile ID', type: 'number' },
        ],
        run: async (c: ReadarrClient, a) => {
          const result = await c.getAuthor(a.id);
          const author = result?.data ?? result;
          const updates: any = { ...author };
          if (a.monitored !== undefined) updates.monitored = a.monitored === 'true';
          if (a['quality-profile-id'] !== undefined)
            updates.qualityProfileId = Number(a['quality-profile-id']);
          return c.updateAuthor(a.id, updates);
        },
      },
      {
        name: 'refresh',
        description: 'Refresh author metadata',
        args: [{ name: 'id', description: 'Author ID', required: true, type: 'number' }],
        run: (c: ReadarrClient, a) =>
          c.runCommand({ name: 'RefreshAuthor', authorId: a.id } as any),
      },
      {
        name: 'manual-search',
        description: 'Trigger a manual search for releases',
        args: [{ name: 'id', description: 'Author ID', required: true, type: 'number' }],
        run: (c: ReadarrClient, a) => c.runCommand({ name: 'AuthorSearch', authorId: a.id } as any),
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
