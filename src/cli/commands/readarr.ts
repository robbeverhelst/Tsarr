import { ReadarrClient } from '../../clients/readarr';
import { promptConfirm, promptSelect } from '../prompt';
import type { ResourceDef } from './service';
import { buildServiceCommand, COMMAND_OUTPUT_COLUMNS, readJsonInput, unwrapData } from './service';

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
        idField: 'foreignAuthorId',
        run: (c: ReadarrClient, a) => c.searchAuthors(a.term),
      },
      {
        name: 'add',
        description: 'Search and add an author',
        args: [{ name: 'term', description: 'Search term', required: true }],
        run: async (c: ReadarrClient, a) => {
          const results = unwrapData<any[]>(await c.searchAuthors(a.term));
          if (!Array.isArray(results) || results.length === 0) {
            throw new Error('No authors found.');
          }

          const authorId = await promptSelect(
            'Select an author:',
            results.map((author: any) => ({
              label: author.authorName,
              value: String(author.foreignAuthorId),
            }))
          );
          const author = results.find((item: any) => String(item.foreignAuthorId) === authorId);
          if (!author) {
            throw new Error('Selected author was not found in the search results.');
          }

          const profiles = unwrapData<any[]>(await c.getQualityProfiles());
          if (!Array.isArray(profiles) || profiles.length === 0) {
            throw new Error('No quality profiles found. Configure one in Readarr first.');
          }
          const profileId = await promptSelect(
            'Select quality profile:',
            profiles.map((profile: any) => ({ label: profile.name, value: String(profile.id) }))
          );

          const folders = unwrapData<any[]>(await c.getRootFolders());
          if (!Array.isArray(folders) || folders.length === 0) {
            throw new Error('No root folders found. Configure one in Readarr first.');
          }
          const rootFolderPath = await promptSelect(
            'Select root folder:',
            folders.map((folder: any) => ({ label: folder.path, value: folder.path }))
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
          { name: 'tags', description: 'Comma-separated tag IDs' },
        ],
        run: async (c: ReadarrClient, a) => {
          const author = unwrapData<any>(await c.getAuthor(a.id));
          const updates: any = { ...author };
          if (a.monitored !== undefined) updates.monitored = a.monitored === 'true';
          if (a['quality-profile-id'] !== undefined) {
            updates.qualityProfileId = Number(a['quality-profile-id']);
          }
          if (a.tags !== undefined) {
            updates.tags = a.tags.split(',').map((tag: string) => Number(tag.trim()));
          }
          return c.updateAuthor(a.id, updates);
        },
      },
      {
        name: 'refresh',
        description: 'Refresh author metadata',
        args: [{ name: 'id', description: 'Author ID', required: true, type: 'number' }],
        columns: COMMAND_OUTPUT_COLUMNS,
        run: (c: ReadarrClient, a) => c.runCommand({ name: 'RefreshAuthor', authorId: a.id }),
      },
      {
        name: 'manual-search',
        description: 'Trigger a manual search for releases',
        args: [{ name: 'id', description: 'Author ID', required: true, type: 'number' }],
        columns: COMMAND_OUTPUT_COLUMNS,
        run: (c: ReadarrClient, a) => c.runCommand({ name: 'AuthorSearch', authorId: a.id }),
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
        columns: ['id', 'authorName', 'title', 'monitored'],
        run: async (c: ReadarrClient) => {
          const books = unwrapData<any[]>(await c.getBooks());
          return books.map(withAuthorName);
        },
      },
      {
        name: 'get',
        description: 'Get a book by ID',
        args: [{ name: 'id', description: 'Book ID', required: true, type: 'number' }],
        run: async (c: ReadarrClient, a) => {
          const book = unwrapData<any>(await c.getBook(a.id));
          return withAuthorName(book);
        },
      },
      {
        name: 'search',
        description: 'Search for books',
        args: [{ name: 'term', description: 'Search term', required: true }],
        columns: ['foreignBookId', 'authorName', 'title', 'monitored'],
        idField: 'foreignBookId',
        run: async (c: ReadarrClient, a) => {
          const books = unwrapData<any[]>(await c.searchBooks(a.term));
          return books.map(withAuthorName);
        },
      },
      {
        name: 'add',
        description: 'Add a book from JSON file or stdin',
        args: [{ name: 'file', description: 'JSON file path (use - for stdin)', required: true }],
        run: async (c: ReadarrClient, a) => c.addBook(readJsonInput(a.file)),
      },
      {
        name: 'edit',
        description: 'Edit a book (merges JSON with existing)',
        args: [
          { name: 'id', description: 'Book ID', required: true, type: 'number' },
          { name: 'file', description: 'JSON file with fields to update', required: true },
        ],
        run: async (c: ReadarrClient, a) => {
          const existing = unwrapData<any>(await c.getBook(a.id));
          return c.updateBook(a.id, { ...existing, ...readJsonInput(a.file) });
        },
      },
      {
        name: 'delete',
        description: 'Delete a book',
        args: [{ name: 'id', description: 'Book ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this book?',
        run: (c: ReadarrClient, a) => c.deleteBook(a.id),
      },
    ],
  },
  {
    name: 'bookfile',
    description: 'Manage book files',
    actions: [
      {
        name: 'list',
        description: 'List book files for an author',
        args: [{ name: 'author-id', description: 'Author ID', required: true, type: 'number' }],
        columns: ['id', 'relativePath', 'size', 'quality', 'dateAdded'],
        run: (c: ReadarrClient, a) => c.getBookFiles(a['author-id']),
      },
      {
        name: 'get',
        description: 'Get a book file by ID',
        args: [{ name: 'id', description: 'Book file ID', required: true, type: 'number' }],
        run: (c: ReadarrClient, a) => c.getBookFile(a.id),
      },
      {
        name: 'delete',
        description: 'Delete a book file from disk',
        args: [{ name: 'id', description: 'Book file ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this book file from disk?',
        run: (c: ReadarrClient, a) => c.deleteBookFile(a.id),
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
      {
        name: 'get',
        description: 'Get a quality profile by ID',
        args: [{ name: 'id', description: 'Profile ID', required: true, type: 'number' }],
        run: (c: ReadarrClient, a) => c.getQualityProfile(a.id),
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
        run: (c: ReadarrClient, a) => c.addTag({ label: a.label }),
      },
      {
        name: 'delete',
        description: 'Delete a tag',
        args: [{ name: 'id', description: 'Tag ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this tag?',
        run: async (c: ReadarrClient, a) => {
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
        run: (c: ReadarrClient) => c.getTags(),
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
        columns: ['id', 'authorName', 'title', 'status', 'sizeleft', 'timeleft'],
        run: async (c: ReadarrClient) => {
          const items = unwrapData<any[]>(await c.getQueue());
          return items.map(withAuthorName);
        },
      },
      {
        name: 'status',
        description: 'Get queue status',
        run: (c: ReadarrClient) => c.getQueueStatus(),
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
        run: (c: ReadarrClient, a) => c.removeQueueItem(a.id, a['remove-from-client'], a.blocklist),
      },
      {
        name: 'grab',
        description: 'Force download a queue item',
        args: [{ name: 'id', description: 'Queue item ID', required: true, type: 'number' }],
        run: (c: ReadarrClient, a) => c.grabQueueItem(a.id),
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
        columns: ['id', 'authorName', 'sourceTitle', 'eventType', 'date'],
        run: async (c: ReadarrClient, a) => {
          const items = a.since
            ? unwrapData<any[]>(await c.getHistorySince(a.since))
            : unwrapData<any[]>(await c.getHistory());

          const filtered = a.until
            ? items.filter((item: any) => new Date(item.date) <= new Date(a.until))
            : items;

          return filtered.map(withAuthorName);
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
        description: 'List upcoming book releases',
        args: [
          { name: 'start', description: 'Start date (ISO 8601)' },
          { name: 'end', description: 'End date (ISO 8601)' },
          { name: 'unmonitored', description: 'Include unmonitored', type: 'boolean' },
        ],
        columns: ['id', 'authorName', 'title', 'releaseDate'],
        run: async (c: ReadarrClient, a) => {
          const books = unwrapData<any[]>(await c.getCalendar(a.start, a.end, a.unmonitored));
          return books.map(withAuthorName);
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
        run: (c: ReadarrClient) => c.getNotifications(),
      },
      {
        name: 'get',
        description: 'Get a notification by ID',
        args: [{ name: 'id', description: 'Notification ID', required: true, type: 'number' }],
        run: (c: ReadarrClient, a) => c.getNotification(a.id),
      },
      {
        name: 'add',
        description: 'Add a notification from JSON file or stdin',
        args: [{ name: 'file', description: 'JSON file path (use - for stdin)', required: true }],
        run: async (c: ReadarrClient, a) => c.addNotification(readJsonInput(a.file)),
      },
      {
        name: 'edit',
        description: 'Edit a notification (merges JSON with existing)',
        args: [
          { name: 'id', description: 'Notification ID', required: true, type: 'number' },
          { name: 'file', description: 'JSON file with fields to update', required: true },
        ],
        run: async (c: ReadarrClient, a) => {
          const existing = unwrapData<any>(await c.getNotification(a.id));
          return c.updateNotification(a.id, { ...existing, ...readJsonInput(a.file) });
        },
      },
      {
        name: 'delete',
        description: 'Delete a notification',
        args: [{ name: 'id', description: 'Notification ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this notification?',
        run: (c: ReadarrClient, a) => c.deleteNotification(a.id),
      },
      {
        name: 'test',
        description: 'Test all notifications',
        run: (c: ReadarrClient) => c.testAllNotifications(),
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
        run: (c: ReadarrClient) => c.getDownloadClients(),
      },
      {
        name: 'get',
        description: 'Get a download client by ID',
        args: [{ name: 'id', description: 'Download client ID', required: true, type: 'number' }],
        run: (c: ReadarrClient, a) => c.getDownloadClient(a.id),
      },
      {
        name: 'add',
        description: 'Add a download client from JSON file or stdin',
        args: [{ name: 'file', description: 'JSON file path (use - for stdin)', required: true }],
        run: async (c: ReadarrClient, a) => c.addDownloadClient(readJsonInput(a.file)),
      },
      {
        name: 'edit',
        description: 'Edit a download client (merges JSON with existing)',
        args: [
          { name: 'id', description: 'Download client ID', required: true, type: 'number' },
          { name: 'file', description: 'JSON file with fields to update', required: true },
        ],
        run: async (c: ReadarrClient, a) => {
          const existing = unwrapData<any>(await c.getDownloadClient(a.id));
          return c.updateDownloadClient(a.id, { ...existing, ...readJsonInput(a.file) });
        },
      },
      {
        name: 'delete',
        description: 'Delete a download client',
        args: [{ name: 'id', description: 'Download client ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this download client?',
        run: (c: ReadarrClient, a) => c.deleteDownloadClient(a.id),
      },
      {
        name: 'test',
        description: 'Test all download clients',
        run: (c: ReadarrClient) => c.testAllDownloadClients(),
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
        columns: ['id', 'authorName', 'sourceTitle', 'date'],
        run: async (c: ReadarrClient) => {
          const items = unwrapData<any[]>(await c.getBlocklist());
          return items.map(withAuthorName);
        },
      },
      {
        name: 'delete',
        description: 'Remove a release from the blocklist',
        args: [{ name: 'id', description: 'Blocklist item ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to remove this blocklist entry?',
        run: (c: ReadarrClient, a) => c.removeBlocklistItem(a.id),
      },
    ],
  },
  {
    name: 'wanted',
    description: 'View missing and cutoff unmet books',
    actions: [
      {
        name: 'missing',
        description: 'List books with missing files',
        columns: ['id', 'authorName', 'title', 'releaseDate'],
        run: async (c: ReadarrClient) => {
          const books = unwrapData<any[]>(await c.getWantedMissing());
          return books.map(withAuthorName);
        },
      },
      {
        name: 'cutoff',
        description: 'List books below quality cutoff',
        columns: ['id', 'authorName', 'title', 'releaseDate'],
        run: async (c: ReadarrClient) => {
          const books = unwrapData<any[]>(await c.getWantedCutoff());
          return books.map(withAuthorName);
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
        run: (c: ReadarrClient) => c.getImportLists(),
      },
      {
        name: 'get',
        description: 'Get an import list by ID',
        args: [{ name: 'id', description: 'Import list ID', required: true, type: 'number' }],
        run: (c: ReadarrClient, a) => c.getImportList(a.id),
      },
      {
        name: 'delete',
        description: 'Delete an import list',
        args: [{ name: 'id', description: 'Import list ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this import list?',
        run: (c: ReadarrClient, a) => c.deleteImportList(a.id),
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
      {
        name: 'add',
        description: 'Add a root folder',
        args: [{ name: 'path', description: 'Folder path', required: true }],
        run: (c: ReadarrClient, a) => c.addRootFolder(a.path),
      },
      {
        name: 'delete',
        description: 'Delete a root folder',
        args: [{ name: 'id', description: 'Root folder ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this root folder?',
        run: (c: ReadarrClient, a) => c.deleteRootFolder(a.id),
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

function withAuthorName(item: any) {
  return {
    ...item,
    authorName: item?.authorName ?? item?.authorTitle ?? item?.author?.authorName ?? '—',
  };
}
