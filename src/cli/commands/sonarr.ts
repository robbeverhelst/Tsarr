import { SonarrClient } from '../../clients/sonarr.js';
import { promptConfirm, promptIfMissing, promptSelect } from '../prompt.js';
import type { ResourceDef } from './service.js';
import { buildServiceCommand } from './service.js';

const resources: ResourceDef[] = [
  {
    name: 'series',
    description: 'Manage TV series',
    actions: [
      {
        name: 'list',
        description: 'List all series',
        columns: ['id', 'title', 'year', 'monitored', 'seasonCount', 'episodeCount', 'network', 'status'],
        run: async (c: SonarrClient) => {
          const series = unwrapData<any[]>(await c.getSeries());
          return series.map(formatSeriesListItem);
        },
      },
      {
        name: 'get',
        description: 'Get a series by ID',
        args: [{ name: 'id', description: 'Series ID', required: true, type: 'number' }],
        run: (c: SonarrClient, a) => c.getSeriesById(a.id),
      },
      {
        name: 'search',
        description: 'Search for TV series',
        args: [{ name: 'term', description: 'Search term', required: true }],
        columns: ['tvdbId', 'title', 'year', 'overview'],
        run: (c: SonarrClient, a) => c.searchSeries(a.term),
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
              results.map((s: any) => ({ label: `${s.title} (${s.year})`, value: String(s.tvdbId) }))
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
              throw new Error(`${existingSeries.title} is already in your library (ID: ${existingSeries.id})`);
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
        run: (c: SonarrClient, a) => c.runCommand({ name: 'RefreshSeries', seriesId: a.id } as any),
      },
      {
        name: 'manual-search',
        description: 'Trigger a manual search for releases',
        args: [{ name: 'id', description: 'Series ID', required: true, type: 'number' }],
        run: (c: SonarrClient, a) => c.runCommand({ name: 'SeriesSearch', seriesId: a.id } as any),
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
        args: [{ name: 'series-id', description: 'Series ID', type: 'number' }],
        columns: ['id', 'title', 'seasonNumber', 'episodeNumber', 'hasFile'],
        run: (c: SonarrClient, a) => c.getEpisodes(a['series-id']),
      },
      {
        name: 'get',
        description: 'Get an episode by ID',
        args: [{ name: 'id', description: 'Episode ID', required: true, type: 'number' }],
        run: (c: SonarrClient, a) => c.getEpisode(a.id),
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
        run: (c: SonarrClient, a) => c.addTag({ label: a.label } as any),
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
        run: (c: SonarrClient, a) => c.getQueue(undefined, undefined, undefined, undefined, undefined, a['series-id']),
      },
      {
        name: 'status',
        description: 'Get queue status',
        run: (c: SonarrClient) => c.getQueueStatus(),
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
        args: [{ name: 'series-id', description: 'Series ID', type: 'number' }],
        columns: ['id', 'eventType', 'sourceTitle', 'date'],
        run: (c: SonarrClient, a) => c.getHistory(undefined, undefined, undefined, undefined, a['series-id']),
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

function unwrapData<T>(result: any): T {
  return (result?.data ?? result) as T;
}

function parseBooleanArg(value: unknown, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return Boolean(value);
}

function resolveQualityProfileId(profiles: any[], profileId: number): number {
  const profile = profiles.find((item: any) => item?.id === profileId);
  if (!profile) {
    throw new Error(`Quality profile ${profileId} was not found.`);
  }
  return profileId;
}

function resolveRootFolderPath(folders: any[], rootFolderPath: string): string {
  const folder = folders.find((item: any) => item?.path === rootFolderPath);
  if (!folder) {
    throw new Error(`Root folder "${rootFolderPath}" was not found.`);
  }
  return rootFolderPath;
}

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

function getApiStatus(result: any): number | undefined {
  return result?.error?.status ?? result?.response?.status;
}
