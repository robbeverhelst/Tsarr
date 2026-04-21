import consola from 'consola';
import { SonarrClient, type SonarrManualImportFilePayload } from '../../clients/sonarr';
import { promptConfirm, promptIfMissing, promptSelect } from '../prompt';
import { filterSamples, formatRejections, partitionCandidates } from './manual-import';
import type { ResourceDef } from './service';
import {
  buildServiceCommand,
  COMMAND_OUTPUT_COLUMNS,
  getApiStatus,
  limitResults,
  parseBooleanArg,
  readJsonInput,
  resolveQualityProfileId,
  resolveRootFolderPath,
  unwrapData,
} from './service';

const IMPORT_MODES = ['auto', 'copy', 'move'] as const;
type ImportMode = (typeof IMPORT_MODES)[number];

export const resources: ResourceDef[] = [
  {
    name: 'series',
    description: 'Manage TV series',
    actions: [
      {
        name: 'list',
        description: 'List all series',
        columns: [
          'id',
          'title',
          'year',
          'monitored',
          'seasonCount',
          'episodeCount',
          'network',
          'status',
        ],
        run: async (c: SonarrClient) => {
          const series = unwrapData<any[]>(await c.getSeries());
          return series.map(formatSeriesListItem);
        },
      },
      {
        name: 'get',
        description: 'Get a series by ID',
        args: [{ name: 'id', description: 'Series ID', required: true, type: 'number' }],
        columns: [
          'id',
          'title',
          'year',
          'monitored',
          'seasonCount',
          'episodeCount',
          'network',
          'status',
        ],
        run: async (c: SonarrClient, a) => {
          const result = await c.getSeriesById(a.id);
          const series = unwrapData<any>(result);
          return formatSeriesListItem(series);
        },
      },
      {
        name: 'search',
        description: 'Search for TV series',
        args: [
          { name: 'term', description: 'Search term', required: true },
          { name: 'limit', description: 'Max results to show', type: 'number' },
        ],
        columns: ['tvdbId', 'title', 'year', 'overview'],
        run: async (c: SonarrClient, a) => {
          const results = unwrapData<any[]>(await c.searchSeries(a.term));
          return limitResults(results, a.limit);
        },
      },
      {
        name: 'add',
        description: 'Search and add a series',
        args: [
          { name: 'term', description: 'Search term' },
          { name: 'tvdb-id', description: 'TVDB ID', type: 'number' },
          { name: 'quality-profile-id', description: 'Quality profile ID', type: 'number' },
          { name: 'root-folder', description: 'Root folder path' },
          { name: 'monitored', description: 'Set monitored (true/false)' },
        ],
        run: async (c: SonarrClient, a) => {
          let series: any;

          if (a['tvdb-id'] !== undefined) {
            series = await lookupSeriesByTvdbId(c, a['tvdb-id']);
            if (!series) {
              throw new Error(`No series found for TVDB ID ${a['tvdb-id']}.`);
            }
          } else {
            const term = await promptIfMissing(a.term, 'Search term:');
            const searchResult = await c.searchSeries(term);
            const results = unwrapData<any[]>(searchResult);
            if (!Array.isArray(results) || results.length === 0) {
              throw new Error('No series found.');
            }

            const seriesId = await promptSelect(
              'Select a series:',
              results.map((s: any) => ({
                label: `${s.title} (${s.year})`,
                value: String(s.tvdbId),
              }))
            );
            series = results.find((s: any) => String(s.tvdbId) === seriesId);
            if (!series) {
              throw new Error('Selected series was not found in the search results.');
            }
          }

          const profilesResult = await c.getQualityProfiles();
          const profiles = unwrapData<any[]>(profilesResult);
          if (!Array.isArray(profiles) || profiles.length === 0) {
            throw new Error('No quality profiles found. Configure one in Sonarr first.');
          }
          const profileId =
            a['quality-profile-id'] !== undefined
              ? resolveQualityProfileId(profiles, a['quality-profile-id'])
              : Number(
                  await promptSelect(
                    'Select quality profile:',
                    profiles.map((p: any) => ({ label: p.name, value: String(p.id) }))
                  )
                );

          const foldersResult = await c.getRootFolders();
          const folders = unwrapData<any[]>(foldersResult);
          if (!Array.isArray(folders) || folders.length === 0) {
            throw new Error('No root folders found. Configure one in Sonarr first.');
          }
          const rootFolderPath =
            a['root-folder'] !== undefined
              ? resolveRootFolderPath(folders, a['root-folder'])
              : await promptSelect(
                  'Select root folder:',
                  folders.map((f: any) => ({ label: f.path, value: f.path }))
                );

          const confirmed = await promptConfirm(`Add "${series.title} (${series.year})"?`, !!a.yes);
          if (!confirmed) throw new Error('Cancelled.');

          const addResult = await c.addSeries({
            ...series,
            qualityProfileId: profileId,
            rootFolderPath,
            monitored: parseBooleanArg(a.monitored, true),
            addOptions: { searchForMissingEpisodes: true },
          });

          if (addResult?.error && getApiStatus(addResult) === 400) {
            const existingSeries = await findSeriesByTvdbId(c, series.tvdbId);
            if (existingSeries) {
              throw new Error(
                `${existingSeries.title} is already in your library (ID: ${existingSeries.id})`
              );
            }
          }

          return addResult;
        },
      },
      {
        name: 'edit',
        description: 'Edit a series',
        args: [
          { name: 'id', description: 'Series ID', required: true, type: 'number' },
          { name: 'monitored', description: 'Set monitored (true/false)' },
          { name: 'quality-profile-id', description: 'Quality profile ID', type: 'number' },
          { name: 'tags', description: 'Comma-separated tag IDs' },
        ],
        run: async (c: SonarrClient, a) => {
          const result = await c.getSeriesById(a.id);
          const series = result?.data ?? result;
          const updates: any = { ...series };
          if (a.monitored !== undefined) updates.monitored = a.monitored === 'true';
          if (a['quality-profile-id'] !== undefined)
            updates.qualityProfileId = Number(a['quality-profile-id']);
          if (a.tags !== undefined)
            updates.tags = a.tags.split(',').map((t: string) => Number(t.trim()));
          return c.updateSeries(String(a.id), updates);
        },
      },
      {
        name: 'refresh',
        description: 'Refresh series metadata',
        args: [{ name: 'id', description: 'Series ID', required: true, type: 'number' }],
        columns: COMMAND_OUTPUT_COLUMNS,
        run: (c: SonarrClient, a) => c.runCommand({ name: 'RefreshSeries', seriesId: a.id }),
      },
      {
        name: 'manual-search',
        description: 'Trigger a manual search for releases',
        args: [{ name: 'id', description: 'Series ID', required: true, type: 'number' }],
        columns: COMMAND_OUTPUT_COLUMNS,
        run: (c: SonarrClient, a) => c.runCommand({ name: 'SeriesSearch', seriesId: a.id }),
      },
      {
        name: 'delete',
        description: 'Delete a series',
        args: [
          { name: 'id', description: 'Series ID', required: true, type: 'number' },
          { name: 'delete-files', description: 'Delete series files', type: 'boolean' },
          {
            name: 'add-import-list-exclusion',
            description: 'Add import list exclusion after delete',
            type: 'boolean',
          },
        ],
        confirmMessage: 'Are you sure you want to delete this series?',
        run: async (c: SonarrClient, a) => {
          const seriesResult = await c.getSeriesById(a.id);
          if (seriesResult?.error) return seriesResult;

          const series = unwrapData<any>(seriesResult);
          const deleteResult = await c.deleteSeries(a.id, {
            deleteFiles: a['delete-files'],
            addImportListExclusion: a['add-import-list-exclusion'],
          });

          if (deleteResult?.error) return deleteResult;

          return { message: `Deleted: ${series.title} (ID: ${series.id})` };
        },
      },
    ],
  },
  {
    name: 'episode',
    description: 'Manage episodes',
    actions: [
      {
        name: 'list',
        description: 'List all episodes',
        args: [{ name: 'series-id', description: 'Series ID', required: true, type: 'number' }],
        columns: ['id', 'title', 'seasonNumber', 'episodeNumber', 'hasFile'],
        run: (c: SonarrClient, a) => c.getEpisodes(a['series-id']),
      },
      {
        name: 'get',
        description: 'Get an episode by ID',
        args: [{ name: 'id', description: 'Episode ID', required: true, type: 'number' }],
        run: (c: SonarrClient, a) => c.getEpisode(a.id),
      },
      {
        name: 'search',
        description: 'Trigger a search for an episode',
        args: [{ name: 'id', description: 'Episode ID', required: true, type: 'number' }],
        columns: COMMAND_OUTPUT_COLUMNS,
        run: (c: SonarrClient, a) => c.runCommand({ name: 'EpisodeSearch', episodeIds: [a.id] }),
      },
    ],
  },
  {
    name: 'episodefile',
    description: 'Manage episode files',
    actions: [
      {
        name: 'list',
        description: 'List episode files for a series',
        args: [{ name: 'series-id', description: 'Series ID', required: true, type: 'number' }],
        columns: ['id', 'relativePath', 'size', 'quality', 'dateAdded'],
        run: (c: SonarrClient, a) => c.getEpisodeFiles(a['series-id']),
      },
      {
        name: 'get',
        description: 'Get an episode file by ID',
        args: [{ name: 'id', description: 'Episode file ID', required: true, type: 'number' }],
        run: (c: SonarrClient, a) => c.getEpisodeFile(a.id),
      },
      {
        name: 'delete',
        description: 'Delete an episode file from disk',
        args: [{ name: 'id', description: 'Episode file ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this episode file from disk?',
        run: (c: SonarrClient, a) => c.deleteEpisodeFile(a.id),
      },
    ],
  },
  {
    name: 'import',
    description: 'Manual import for episode files',
    actions: [
      {
        name: 'scan',
        description: 'Scan a folder for manual import candidates',
        args: [
          { name: 'path', description: 'Folder to scan', required: true },
          {
            name: 'series-id',
            description: 'Restrict matches to a specific series',
            type: 'number',
          },
          { name: 'download-id', description: 'Match against a download client ID' },
          {
            name: 'filter-existing',
            description: 'Filter out files already imported',
            type: 'boolean',
          },
          {
            name: 'include-samples',
            description: 'Include sample files in the results',
            type: 'boolean',
          },
        ],
        columns: ['relativePath', 'size', 'series', 'episodes', 'quality', 'rejections'],
        run: async (c: SonarrClient, a) => {
          const result = await c.getManualImport({
            folder: a.path,
            downloadId: a['download-id'],
            seriesId: a['series-id'],
            filterExistingFiles: a['filter-existing'],
          });
          if (result?.error) return result;
          const items = (unwrapData<any[]>(result) ?? []) as any[];
          return filterSamples(items, !!a['include-samples']);
        },
      },
      {
        name: 'apply',
        description: 'Perform manual import of files in a folder',
        args: [
          { name: 'path', description: 'Folder to import', required: true },
          {
            name: 'series-id',
            description: 'Assign all files to a specific series',
            type: 'number',
          },
          { name: 'download-id', description: 'Match against a download client ID' },
          { name: 'auto', description: 'Import unambiguous matches only', type: 'boolean' },
          {
            name: 'interactive',
            description: 'Prompt to confirm ambiguous matches',
            type: 'boolean',
          },
          {
            name: 'include-samples',
            description: 'Include sample files',
            type: 'boolean',
          },
          {
            name: 'import-mode',
            description: 'File transfer mode',
            values: [...IMPORT_MODES],
          },
        ],
        run: async (c: SonarrClient, a) => {
          const autoMode = !!a.auto;
          const interactive = !!a.interactive;
          const forcedSeriesId: number | undefined = a['series-id'];

          if (!autoMode && !interactive && forcedSeriesId === undefined) {
            throw new Error('Provide one of --auto, --interactive, or --series-id.');
          }

          const importMode: ImportMode = (a['import-mode'] as ImportMode) ?? 'auto';

          const scanResult = await c.getManualImport({
            folder: a.path,
            downloadId: a['download-id'],
            filterExistingFiles: true,
          });
          if (scanResult?.error) return scanResult;

          const allItems = (unwrapData<any[]>(scanResult) ?? []) as any[];
          const scanned = filterSamples(allItems, !!a['include-samples']);
          if (scanned.length === 0) {
            return { message: 'No importable files found.' };
          }

          let { ready, ambiguous } = partitionCandidates(scanned);

          if (forcedSeriesId !== undefined) {
            // Still need episode matches; force-assign only sets series
            ready = scanned.filter(
              (item: any) => Array.isArray(item.episodes) && item.episodes.some((e: any) => e?.id)
            );
            ambiguous = scanned.filter(
              (item: any) => !Array.isArray(item.episodes) || !item.episodes.some((e: any) => e?.id)
            );
          }

          const selected: any[] = [...ready];
          const skipped: Array<{ path: string; reason: string }> = [];

          if (interactive) {
            for (const item of ambiguous) {
              const label = item.relativePath ?? item.name ?? item.path ?? 'unknown file';
              const rejection = formatRejections(item.rejections) || 'no episode match';
              const canImport =
                item.series?.id && Array.isArray(item.episodes) && item.episodes.length > 0;
              const choices = canImport
                ? [
                    { label: 'Import anyway', value: 'import' },
                    { label: 'Skip', value: 'skip' },
                  ]
                : [{ label: 'Skip', value: 'skip' }];
              const choice = await promptSelect(`${label} — ${rejection}`, choices);
              if (choice === 'import' && canImport) {
                selected.push(item);
              } else {
                skipped.push({
                  path: item.path ?? label,
                  reason: choice === 'skip' ? 'user skipped' : 'no episode match',
                });
              }
            }
          } else {
            for (const item of ambiguous) {
              skipped.push({
                path: item.path ?? item.relativePath ?? 'unknown',
                reason: formatRejections(item.rejections) || 'no episode match',
              });
            }
          }

          if (selected.length === 0) {
            return { message: 'Nothing to import.', skipped };
          }

          const files: SonarrManualImportFilePayload[] = selected.map((item: any) => ({
            path: item.path,
            seriesId: forcedSeriesId ?? item.series?.id,
            episodeIds: (item.episodes ?? [])
              .map((e: any) => e?.id)
              .filter((id: unknown): id is number => typeof id === 'number'),
            quality: item.quality,
            languages: item.languages,
            releaseGroup: item.releaseGroup ?? undefined,
            downloadId: item.downloadId ?? a['download-id'] ?? undefined,
            episodeFileId: item.episodeFileId ?? undefined,
          }));

          const commandResult = await c.applyManualImport(files, importMode);
          if (commandResult?.error) return commandResult;

          const command = unwrapData<any>(commandResult);
          if (!process.stdout.isTTY && skipped.length > 0) {
            consola.warn(`Skipped ${skipped.length} file(s).`);
          }

          return {
            imported: files.length,
            skipped: skipped.length,
            commandId: command?.id,
            status: command?.status,
            skippedFiles: skipped,
          };
        },
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
        run: (c: SonarrClient) => c.getQualityProfiles(),
      },
      {
        name: 'get',
        description: 'Get a quality profile by ID',
        args: [{ name: 'id', description: 'Profile ID', required: true, type: 'number' }],
        run: (c: SonarrClient, a) => c.getQualityProfile(a.id),
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
        run: (c: SonarrClient, a) => c.addTag({ label: a.label }),
      },
      {
        name: 'delete',
        description: 'Delete a tag',
        args: [{ name: 'id', description: 'Tag ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this tag?',
        run: async (c: SonarrClient, a) => {
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
        run: (c: SonarrClient) => c.getTags(),
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
        args: [{ name: 'series-id', description: 'Series ID', type: 'number' }],
        columns: ['id', 'title', 'status', 'sizeleft', 'timeleft'],
        run: (c: SonarrClient, a) =>
          c.getQueue(undefined, undefined, undefined, undefined, undefined, a['series-id']),
      },
      {
        name: 'status',
        description: 'Get queue status',
        run: (c: SonarrClient) => c.getQueueStatus(),
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
        run: (c: SonarrClient, a) => c.removeQueueItem(a.id, a['remove-from-client'], a.blocklist),
      },
      {
        name: 'grab',
        description: 'Force download a queue item',
        args: [{ name: 'id', description: 'Queue item ID', required: true, type: 'number' }],
        run: (c: SonarrClient, a) => c.grabQueueItem(a.id),
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
          { name: 'series-id', description: 'Series ID', type: 'number' },
          { name: 'since', description: 'Start date (ISO 8601, e.g. 2024-01-01)' },
          { name: 'until', description: 'End date (ISO 8601, e.g. 2024-12-31)' },
        ],
        columns: ['id', 'eventType', 'sourceTitle', 'date'],
        run: async (c: SonarrClient, a) => {
          if (a.since) {
            const result = await c.getHistorySince(a.since, a['series-id']);
            const items = unwrapData<any[]>(result);
            if (a.until) {
              const untilDate = new Date(a.until);
              return items.filter((item: any) => new Date(item.date) <= untilDate);
            }
            return items;
          }
          const result = await c.getHistory(
            undefined,
            undefined,
            undefined,
            undefined,
            a['series-id']
          );
          const items = unwrapData<any[]>(result);
          if (a.until) {
            const untilDate = new Date(a.until);
            return items.filter((item: any) => new Date(item.date) <= untilDate);
          }
          return items;
        },
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
        run: (c: SonarrClient) => c.getRootFolders(),
      },
      {
        name: 'add',
        description: 'Add a root folder',
        args: [{ name: 'path', description: 'Folder path', required: true }],
        run: (c: SonarrClient, a) => c.addRootFolder(a.path),
      },
      {
        name: 'delete',
        description: 'Delete a root folder',
        args: [{ name: 'id', description: 'Root folder ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this root folder?',
        run: (c: SonarrClient, a) => c.deleteRootFolder(a.id),
      },
    ],
  },
  {
    name: 'calendar',
    description: 'View upcoming releases',
    actions: [
      {
        name: 'list',
        description: 'List upcoming episode releases',
        args: [
          { name: 'start', description: 'Start date (ISO 8601)' },
          { name: 'end', description: 'End date (ISO 8601)' },
          { name: 'unmonitored', description: 'Include unmonitored', type: 'boolean' },
        ],
        columns: ['id', 'seriesTitle', 'title', 'seasonNumber', 'episodeNumber', 'airDateUtc'],
        run: async (c: SonarrClient, a) => {
          const result = await c.getCalendar(a.start, a.end, a.unmonitored);
          const episodes = unwrapData<any[]>(result);
          return episodes.map((ep: any) => ({
            ...ep,
            seriesTitle: ep.seriesTitle || ep.series?.title || '\u2014',
          }));
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
        run: (c: SonarrClient) => c.getNotifications(),
      },
      {
        name: 'get',
        description: 'Get a notification by ID',
        args: [{ name: 'id', description: 'Notification ID', required: true, type: 'number' }],
        run: (c: SonarrClient, a) => c.getNotification(a.id),
      },
      {
        name: 'add',
        description: 'Add a notification from JSON file or stdin',
        args: [{ name: 'file', description: 'JSON file path (use - for stdin)', required: true }],
        run: async (c: SonarrClient, a) => c.addNotification(readJsonInput(a.file)),
      },
      {
        name: 'edit',
        description: 'Edit a notification (merges JSON with existing)',
        args: [
          { name: 'id', description: 'Notification ID', required: true, type: 'number' },
          { name: 'file', description: 'JSON file with fields to update', required: true },
        ],
        run: async (c: SonarrClient, a) => {
          const existing = unwrapData<any>(await c.getNotification(a.id));
          return c.updateNotification(a.id, { ...existing, ...readJsonInput(a.file) });
        },
      },
      {
        name: 'delete',
        description: 'Delete a notification',
        args: [{ name: 'id', description: 'Notification ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this notification?',
        run: (c: SonarrClient, a) => c.deleteNotification(a.id),
      },
      {
        name: 'test',
        description: 'Test all notifications',
        run: (c: SonarrClient) => c.testAllNotifications(),
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
        run: (c: SonarrClient) => c.getDownloadClients(),
      },
      {
        name: 'get',
        description: 'Get a download client by ID',
        args: [{ name: 'id', description: 'Download client ID', required: true, type: 'number' }],
        run: (c: SonarrClient, a) => c.getDownloadClient(a.id),
      },
      {
        name: 'add',
        description: 'Add a download client from JSON file or stdin',
        args: [{ name: 'file', description: 'JSON file path (use - for stdin)', required: true }],
        run: async (c: SonarrClient, a) => c.addDownloadClient(readJsonInput(a.file)),
      },
      {
        name: 'edit',
        description: 'Edit a download client (merges JSON with existing)',
        args: [
          { name: 'id', description: 'Download client ID', required: true, type: 'number' },
          { name: 'file', description: 'JSON file with fields to update', required: true },
        ],
        run: async (c: SonarrClient, a) => {
          const existing = unwrapData<any>(await c.getDownloadClient(a.id));
          return c.updateDownloadClient(a.id, { ...existing, ...readJsonInput(a.file) });
        },
      },
      {
        name: 'delete',
        description: 'Delete a download client',
        args: [{ name: 'id', description: 'Download client ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this download client?',
        run: (c: SonarrClient, a) => c.deleteDownloadClient(a.id),
      },
      {
        name: 'test',
        description: 'Test all download clients',
        run: (c: SonarrClient) => c.testAllDownloadClients(),
      },
    ],
  },
  {
    name: 'blocklist',
    description: 'Manage blocked releases',
    actions: [
      {
        name: 'list',
        description: 'List blocked releases',
        columns: ['id', 'sourceTitle', 'date'],
        run: (c: SonarrClient) => c.getBlocklist(),
      },
      {
        name: 'delete',
        description: 'Remove a release from the blocklist',
        args: [{ name: 'id', description: 'Blocklist item ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to remove this blocklist entry?',
        run: (c: SonarrClient, a) => c.removeBlocklistItem(a.id),
      },
    ],
  },
  {
    name: 'wanted',
    description: 'View missing and cutoff unmet episodes',
    actions: [
      {
        name: 'missing',
        description: 'List episodes with missing files',
        columns: ['id', 'title', 'seasonNumber', 'episodeNumber', 'airDateUtc'],
        run: (c: SonarrClient) => c.getWantedMissing(),
      },
      {
        name: 'cutoff',
        description: 'List episodes below quality cutoff',
        columns: ['id', 'title', 'seasonNumber', 'episodeNumber', 'airDateUtc'],
        run: (c: SonarrClient) => c.getWantedCutoff(),
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
        run: (c: SonarrClient) => c.getImportLists(),
      },
      {
        name: 'get',
        description: 'Get an import list by ID',
        args: [{ name: 'id', description: 'Import list ID', required: true, type: 'number' }],
        run: (c: SonarrClient, a) => c.getImportList(a.id),
      },
      {
        name: 'add',
        description: 'Add an import list from JSON file or stdin',
        args: [{ name: 'file', description: 'JSON file path (use - for stdin)', required: true }],
        run: async (c: SonarrClient, a) => c.addImportList(readJsonInput(a.file)),
      },
      {
        name: 'edit',
        description: 'Edit an import list (merges JSON with existing)',
        args: [
          { name: 'id', description: 'Import list ID', required: true, type: 'number' },
          { name: 'file', description: 'JSON file with fields to update', required: true },
        ],
        run: async (c: SonarrClient, a) => {
          const existing = unwrapData<any>(await c.getImportList(a.id));
          return c.updateImportList(a.id, { ...existing, ...readJsonInput(a.file) });
        },
      },
      {
        name: 'delete',
        description: 'Delete an import list',
        args: [{ name: 'id', description: 'Import list ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this import list?',
        run: (c: SonarrClient, a) => c.deleteImportList(a.id),
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
        run: (c: SonarrClient) => c.getSystemStatus(),
      },
      {
        name: 'health',
        description: 'Get health check results',
        columns: ['type', 'message', 'source'],
        run: (c: SonarrClient) => c.getHealth(),
      },
    ],
  },
];

export const sonarr = buildServiceCommand(
  'sonarr',
  'Manage Sonarr (TV Shows)',
  config => new SonarrClient(config),
  resources
);

function formatSeriesListItem(series: any) {
  const seasons = Array.isArray(series?.seasons)
    ? series.seasons.filter((season: any) => season?.seasonNumber !== 0)
    : [];
  const statistics = series?.statistics ?? {};

  return {
    ...series,
    seasonCount: seasons.length,
    episodeCount:
      statistics.episodeCount !== undefined
        ? `${statistics.episodeFileCount ?? 0}/${statistics.episodeCount}`
        : '\u2014',
    network: series?.network,
    status: series?.status,
  };
}

async function lookupSeriesByTvdbId(client: SonarrClient, tvdbId: number) {
  const tvdbSearch = unwrapData<any[]>(await client.searchSeries(`tvdb:${tvdbId}`));
  const exactTvdbMatch = tvdbSearch.find((series: any) => series?.tvdbId === tvdbId);
  if (exactTvdbMatch) return exactTvdbMatch;

  const fallbackSearch = unwrapData<any[]>(await client.searchSeries(String(tvdbId)));
  return fallbackSearch.find((series: any) => series?.tvdbId === tvdbId);
}

async function findSeriesByTvdbId(client: SonarrClient, tvdbId: number | undefined) {
  if (tvdbId === undefined) return undefined;

  const series = unwrapData<any[]>(await client.getSeries());
  return series.find((item: any) => item?.tvdbId === tvdbId);
}
