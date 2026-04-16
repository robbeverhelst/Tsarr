import { BazarrClient } from '../../clients/bazarr';
import type { ResourceDef } from './service';
import { buildServiceCommand } from './service';

export const resources: ResourceDef[] = [
  {
    name: 'series',
    description: 'Manage series subtitles',
    actions: [
      {
        name: 'list',
        description: 'List series with subtitle info',
        columns: ['sonarrSeriesId', 'title', 'profileId'],
        run: (c: BazarrClient) => c.getSeries(),
      },
    ],
  },
  {
    name: 'movie',
    description: 'Manage movie subtitles',
    actions: [
      {
        name: 'list',
        description: 'List movies with subtitle info',
        columns: ['radarrId', 'title', 'profileId'],
        run: (c: BazarrClient) => c.getMovies(),
      },
    ],
  },
  {
    name: 'episode',
    description: 'Manage episode subtitles',
    actions: [
      {
        name: 'wanted',
        description: 'List episodes with wanted subtitles',
        columns: ['sonarrEpisodeId', 'title', 'seriesTitle'],
        run: (c: BazarrClient) => c.getEpisodesWanted(),
      },
    ],
  },
  {
    name: 'provider',
    description: 'Manage subtitle providers',
    actions: [
      {
        name: 'list',
        description: 'List subtitle providers',
        run: (c: BazarrClient) => c.getProviders(),
      },
    ],
  },
  {
    name: 'language',
    description: 'Manage languages',
    actions: [
      {
        name: 'list',
        description: 'List available languages',
        columns: ['code2', 'name', 'enabled'],
        run: (c: BazarrClient) => c.getLanguages(),
      },
      {
        name: 'profiles',
        description: 'List language profiles',
        columns: ['profileId', 'name'],
        run: (c: BazarrClient) => c.getLanguageProfiles(),
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
        run: (c: BazarrClient) => c.getSystemStatus(),
      },
      {
        name: 'health',
        description: 'Get system health',
        run: (c: BazarrClient) => c.getSystemHealth(),
      },
      {
        name: 'badges',
        description: 'Get badge counts',
        run: (c: BazarrClient) => c.getBadges(),
      },
    ],
  },
];

export const bazarr = buildServiceCommand(
  'bazarr',
  'Manage Bazarr (Subtitles)',
  config => new BazarrClient(config),
  resources
);
