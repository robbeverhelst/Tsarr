import { SonarrClient } from '../../clients/sonarr.js';
import { promptConfirm, promptSelect } from '../prompt.js';
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
        columns: ['id', 'title', 'year', 'monitored', 'seasonCount'],
        run: (c: SonarrClient) => c.getSeries(),
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
        args: [{ name: 'term', description: 'Search term', required: true }],
        run: async (c: SonarrClient, a) => {
          const searchResult = await c.searchSeries(a.term);
          const results = searchResult?.data ?? searchResult;
          if (!Array.isArray(results) || results.length === 0) {
            throw new Error('No series found.');
          }
          const seriesId = await promptSelect(
            'Select a series:',
            results.map((s: any) => ({ label: `${s.title} (${s.year})`, value: String(s.tvdbId) }))
          );
          const series = results.find((s: any) => String(s.tvdbId) === seriesId);

          const profilesResult = await c.getQualityProfiles();
          const profiles = profilesResult?.data ?? profilesResult;
          if (!Array.isArray(profiles) || profiles.length === 0) {
            throw new Error('No quality profiles found. Configure one in Sonarr first.');
          }
          const profileId = await promptSelect(
            'Select quality profile:',
            profiles.map((p: any) => ({ label: p.name, value: String(p.id) }))
          );

          const foldersResult = await c.getRootFolders();
          const folders = foldersResult?.data ?? foldersResult;
          if (!Array.isArray(folders) || folders.length === 0) {
            throw new Error('No root folders found. Configure one in Sonarr first.');
          }
          const rootFolderPath = await promptSelect(
            'Select root folder:',
            folders.map((f: any) => ({ label: f.path, value: f.path }))
          );

          const confirmed = await promptConfirm(`Add "${series.title} (${series.year})"?`, !!a.yes);
          if (!confirmed) throw new Error('Cancelled.');

          return c.addSeries({
            ...series,
            qualityProfileId: Number(profileId),
            rootFolderPath,
            monitored: true,
            addOptions: { searchForMissingEpisodes: true },
          });
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
        args: [{ name: 'id', description: 'Series ID', required: true, type: 'number' }],
        confirmMessage: 'Are you sure you want to delete this series?',
        run: (c: SonarrClient, a) => c.deleteSeries(a.id),
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
        columns: ['id', 'title', 'seasonNumber', 'episodeNumber', 'hasFile'],
        run: (c: SonarrClient) => c.getEpisodes(),
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
        name: 'list',
        description: 'List all tags',
        columns: ['id', 'label'],
        run: (c: SonarrClient) => c.getTags(),
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
