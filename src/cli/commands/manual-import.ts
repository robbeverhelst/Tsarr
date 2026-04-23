const SAMPLE_SIZE_THRESHOLD = 50 * 1024 * 1024;
const SAMPLE_NAME_PATTERN = /(^|[._\- /\\])sample([._\- /\\]|$)/i;

export function isSampleCandidate(item: {
  name?: string | null;
  relativePath?: string | null;
  path?: string | null;
  size?: number;
}): boolean {
  const names = [item.name, item.relativePath, item.path].filter(
    (s): s is string => typeof s === 'string' && s.length > 0
  );
  if (names.some(name => SAMPLE_NAME_PATTERN.test(name))) return true;
  if (typeof item.size === 'number' && item.size > 0 && item.size < SAMPLE_SIZE_THRESHOLD)
    return true;
  return false;
}

export function filterSamples<
  T extends {
    name?: string | null;
    relativePath?: string | null;
    path?: string | null;
    size?: number;
  },
>(items: T[], includeSamples: boolean): T[] {
  if (includeSamples) return items;
  return items.filter(item => !isSampleCandidate(item));
}

export type ImportPartition<T> = {
  ready: T[];
  ambiguous: T[];
};

export function partitionCandidates<
  T extends {
    rejections?: Array<unknown> | null;
    movie?: { id?: number } | null;
    series?: { id?: number } | null;
    episodes?: Array<{ id?: number }> | null;
  },
>(items: T[]): ImportPartition<T> {
  const ready: T[] = [];
  const ambiguous: T[] = [];

  for (const item of items) {
    const hasRejections = Array.isArray(item.rejections) && item.rejections.length > 0;
    const hasMovieMatch = typeof item.movie?.id === 'number';
    const hasSeriesMatch =
      typeof item.series?.id === 'number' &&
      Array.isArray(item.episodes) &&
      item.episodes.some(e => typeof e?.id === 'number');

    if (!hasRejections && (hasMovieMatch || hasSeriesMatch)) {
      ready.push(item);
    } else {
      ambiguous.push(item);
    }
  }

  return { ready, ambiguous };
}

export function formatRejections(rejections: Array<unknown> | null | undefined): string {
  if (!Array.isArray(rejections) || rejections.length === 0) return '';
  return rejections
    .map(r => {
      if (r && typeof r === 'object' && 'reason' in r) {
        return String((r as { reason: unknown }).reason ?? '');
      }
      return '';
    })
    .filter(Boolean)
    .join('; ');
}
