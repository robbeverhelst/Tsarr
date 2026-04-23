import { describe, expect, it } from 'bun:test';
import {
  filterSamples,
  formatRejections,
  isSampleCandidate,
  partitionCandidates,
} from '../src/cli/commands/manual-import.js';
import { resources as radarrResources } from '../src/cli/commands/radarr.js';
import { resources as sonarrResources } from '../src/cli/commands/sonarr.js';

describe('isSampleCandidate', () => {
  it('flags files named sample', () => {
    expect(isSampleCandidate({ name: 'Movie.2024.sample.mkv', size: 300 * 1024 * 1024 })).toBe(
      true
    );
    expect(isSampleCandidate({ relativePath: 'Movie/sample/clip.mkv' })).toBe(true);
  });

  it('flags small files below the size threshold', () => {
    expect(isSampleCandidate({ name: 'Movie.mkv', size: 10 * 1024 * 1024 })).toBe(true);
  });

  it('does not flag normal files', () => {
    expect(isSampleCandidate({ name: 'Movie.2024.2160p.mkv', size: 20 * 1024 * 1024 * 1024 })).toBe(
      false
    );
  });

  it('does not flag the word sample inside another word', () => {
    expect(isSampleCandidate({ name: 'Resampled.2024.mkv', size: 2 * 1024 * 1024 * 1024 })).toBe(
      false
    );
  });
});

describe('filterSamples', () => {
  const items = [
    { name: 'Movie.mkv', size: 2 * 1024 * 1024 * 1024 },
    { name: 'Movie.sample.mkv', size: 2 * 1024 * 1024 * 1024 },
    { name: 'tiny.mkv', size: 5 * 1024 * 1024 },
  ];

  it('removes samples by default', () => {
    expect(filterSamples(items, false)).toHaveLength(1);
  });

  it('keeps samples when includeSamples is true', () => {
    expect(filterSamples(items, true)).toHaveLength(3);
  });
});

describe('partitionCandidates', () => {
  it('treats a movie match with no rejections as ready', () => {
    const { ready, ambiguous } = partitionCandidates([
      { movie: { id: 1 }, rejections: [] },
      { movie: { id: 2 }, rejections: null },
    ]);
    expect(ready).toHaveLength(2);
    expect(ambiguous).toHaveLength(0);
  });

  it('treats rejections or missing match as ambiguous', () => {
    const { ready, ambiguous } = partitionCandidates([
      { movie: { id: 1 }, rejections: [{ reason: 'bad quality' }] },
      { movie: null, rejections: [] },
      { rejections: [] },
    ]);
    expect(ready).toHaveLength(0);
    expect(ambiguous).toHaveLength(3);
  });

  it('handles series/episode shape for Sonarr', () => {
    const { ready, ambiguous } = partitionCandidates([
      { series: { id: 1 }, episodes: [{ id: 10 }], rejections: [] },
      { series: { id: 2 }, episodes: [], rejections: [] },
    ]);
    expect(ready).toHaveLength(1);
    expect(ambiguous).toHaveLength(1);
  });
});

describe('formatRejections', () => {
  it('returns empty string for no rejections', () => {
    expect(formatRejections(null)).toBe('');
    expect(formatRejections([])).toBe('');
  });

  it('joins reasons with a semicolon', () => {
    expect(formatRejections([{ reason: 'unknown movie' }, { reason: 'already imported' }])).toBe(
      'unknown movie; already imported'
    );
  });
});

describe('CLI import resource definitions', () => {
  it('registers scan and apply actions for Radarr', () => {
    const resource = radarrResources.find(r => r.name === 'import');
    expect(resource).toBeDefined();
    expect(resource!.actions.map(a => a.name)).toEqual(['scan', 'apply']);
  });

  it('registers scan and apply actions for Sonarr', () => {
    const resource = sonarrResources.find(r => r.name === 'import');
    expect(resource).toBeDefined();
    expect(resource!.actions.map(a => a.name)).toEqual(['scan', 'apply']);
  });

  it('Radarr apply accepts auto, interactive, and movie-id flags', () => {
    const resource = radarrResources.find(r => r.name === 'import')!;
    const apply = resource.actions.find(a => a.name === 'apply')!;
    const argNames = apply.args!.map(a => a.name);
    expect(argNames).toContain('auto');
    expect(argNames).toContain('interactive');
    expect(argNames).toContain('movie-id');
    expect(argNames).toContain('import-mode');
  });

  it('Sonarr apply accepts series-id instead of movie-id', () => {
    const resource = sonarrResources.find(r => r.name === 'import')!;
    const apply = resource.actions.find(a => a.name === 'apply')!;
    const argNames = apply.args!.map(a => a.name);
    expect(argNames).toContain('series-id');
    expect(argNames).not.toContain('movie-id');
  });
});
