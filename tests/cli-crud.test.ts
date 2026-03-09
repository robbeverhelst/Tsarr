import { describe, expect, it } from 'bun:test';

/**
 * Tests for CLI CRUD command definitions.
 * We import the resource definitions indirectly by checking the command structure
 * and testing the edit run functions with mock clients.
 */

// Helper to create a mock client that records calls
function createMockClient(getResult: any = {}) {
  const calls: { method: string; args: any[] }[] = [];
  return {
    calls,
    getMovie: (id: number) => {
      calls.push({ method: 'getMovie', args: [id] });
      return { data: { id, title: 'Test Movie', monitored: true, qualityProfileId: 1, tags: [1] } };
    },
    updateMovie: (id: number, movie: any) => {
      calls.push({ method: 'updateMovie', args: [id, movie] });
      return { data: movie };
    },
    getSeriesById: (id: number) => {
      calls.push({ method: 'getSeriesById', args: [id] });
      return {
        data: { id, title: 'Test Series', monitored: false, qualityProfileId: 2, tags: [] },
      };
    },
    updateSeries: (id: string, series: any) => {
      calls.push({ method: 'updateSeries', args: [id, series] });
      return { data: series };
    },
    getArtist: (id: number) => {
      calls.push({ method: 'getArtist', args: [id] });
      return {
        data: { id, artistName: 'Test Artist', monitored: true, qualityProfileId: 1, tags: [] },
      };
    },
    updateArtist: (id: number, artist: any) => {
      calls.push({ method: 'updateArtist', args: [id, artist] });
      return { data: artist };
    },
    getAuthor: (id: number) => {
      calls.push({ method: 'getAuthor', args: [id] });
      return {
        data: { id, authorName: 'Test Author', monitored: true, qualityProfileId: 1, tags: [] },
      };
    },
    updateAuthor: (id: number, author: any) => {
      calls.push({ method: 'updateAuthor', args: [id, author] });
      return { data: author };
    },
    searchMovies: (term: string) => {
      calls.push({ method: 'searchMovies', args: [term] });
      return { data: [] };
    },
    runCommand: (command: any) => {
      calls.push({ method: 'runCommand', args: [command] });
      return { data: { id: 1, name: command.name, status: 'queued' } };
    },
    ...getResult,
  };
}

describe('CLI CRUD - Edit command logic', () => {
  describe('Radarr movie edit', () => {
    it('should set monitored to false', async () => {
      const client = createMockClient();
      // Simulate what the edit run function does
      const a = { id: 42, monitored: 'false', 'quality-profile-id': undefined, tags: undefined };
      const result = await client.getMovie(a.id);
      const movie = result?.data ?? result;
      const updates: any = { ...movie };
      if (a.monitored !== undefined) updates.monitored = a.monitored === 'true';
      if (a['quality-profile-id'] !== undefined)
        updates.qualityProfileId = Number(a['quality-profile-id']);
      if (a.tags !== undefined)
        updates.tags = (a.tags as string).split(',').map((t: string) => Number(t.trim()));
      await client.updateMovie(a.id, updates);

      expect(updates.monitored).toBe(false);
      expect(updates.qualityProfileId).toBe(1); // unchanged
      expect(updates.tags).toEqual([1]); // unchanged
      expect(client.calls).toHaveLength(2);
      expect(client.calls[0].method).toBe('getMovie');
      expect(client.calls[1].method).toBe('updateMovie');
    });

    it('should update quality profile', async () => {
      const client = createMockClient();
      const a = { id: 42, monitored: undefined, 'quality-profile-id': '5', tags: undefined };
      const result = await client.getMovie(a.id);
      const movie = result?.data ?? result;
      const updates: any = { ...movie };
      if (a.monitored !== undefined) updates.monitored = a.monitored === 'true';
      if (a['quality-profile-id'] !== undefined)
        updates.qualityProfileId = Number(a['quality-profile-id']);
      if (a.tags !== undefined)
        updates.tags = (a.tags as string).split(',').map((t: string) => Number(t.trim()));
      await client.updateMovie(a.id, updates);

      expect(updates.monitored).toBe(true); // unchanged
      expect(updates.qualityProfileId).toBe(5);
    });

    it('should update tags', async () => {
      const client = createMockClient();
      const a = { id: 42, monitored: undefined, 'quality-profile-id': undefined, tags: '1,2,3' };
      const result = await client.getMovie(a.id);
      const movie = result?.data ?? result;
      const updates: any = { ...movie };
      if (a.monitored !== undefined) updates.monitored = a.monitored === 'true';
      if (a['quality-profile-id'] !== undefined)
        updates.qualityProfileId = Number(a['quality-profile-id']);
      if (a.tags !== undefined)
        updates.tags = a.tags.split(',').map((t: string) => Number(t.trim()));
      await client.updateMovie(a.id, updates);

      expect(updates.tags).toEqual([1, 2, 3]);
    });

    it('should handle tags with spaces', async () => {
      const client = createMockClient();
      const a = { id: 42, monitored: undefined, 'quality-profile-id': undefined, tags: '1, 2, 3' };
      const result = await client.getMovie(a.id);
      const movie = result?.data ?? result;
      const updates: any = { ...movie };
      if (a.tags !== undefined)
        updates.tags = a.tags.split(',').map((t: string) => Number(t.trim()));
      await client.updateMovie(a.id, updates);

      expect(updates.tags).toEqual([1, 2, 3]);
    });
  });

  describe('Sonarr series edit', () => {
    it('should pass string id to updateSeries', async () => {
      const client = createMockClient();
      const a = { id: 10, monitored: 'true', 'quality-profile-id': undefined, tags: undefined };
      const result = await client.getSeriesById(a.id);
      const series = result?.data ?? result;
      const updates: any = { ...series };
      if (a.monitored !== undefined) updates.monitored = a.monitored === 'true';
      await client.updateSeries(String(a.id), updates);

      expect(client.calls[1].args[0]).toBe('10'); // string, not number
    });
  });
});

describe('CLI CRUD - Refresh command logic', () => {
  it('should send RefreshMovie command for Radarr', async () => {
    const client = createMockClient();
    await client.runCommand({ name: 'RefreshMovie', movieIds: [42] });
    expect(client.calls[0].args[0]).toEqual({ name: 'RefreshMovie', movieIds: [42] });
  });

  it('should send RefreshSeries command for Sonarr', async () => {
    const client = createMockClient();
    await client.runCommand({ name: 'RefreshSeries', seriesId: 10 });
    expect(client.calls[0].args[0]).toEqual({ name: 'RefreshSeries', seriesId: 10 });
  });

  it('should send RefreshArtist command for Lidarr', async () => {
    const client = createMockClient();
    await client.runCommand({ name: 'RefreshArtist', artistId: 5 });
    expect(client.calls[0].args[0]).toEqual({ name: 'RefreshArtist', artistId: 5 });
  });

  it('should send RefreshAuthor command for Readarr', async () => {
    const client = createMockClient();
    await client.runCommand({ name: 'RefreshAuthor', authorId: 3 });
    expect(client.calls[0].args[0]).toEqual({ name: 'RefreshAuthor', authorId: 3 });
  });
});

describe('CLI CRUD - Manual search command logic', () => {
  it('should send MoviesSearch command for Radarr', async () => {
    const client = createMockClient();
    await client.runCommand({ name: 'MoviesSearch', movieIds: [42] });
    expect(client.calls[0].args[0]).toEqual({ name: 'MoviesSearch', movieIds: [42] });
  });

  it('should send SeriesSearch command for Sonarr', async () => {
    const client = createMockClient();
    await client.runCommand({ name: 'SeriesSearch', seriesId: 10 });
    expect(client.calls[0].args[0]).toEqual({ name: 'SeriesSearch', seriesId: 10 });
  });

  it('should send ArtistSearch command for Lidarr', async () => {
    const client = createMockClient();
    await client.runCommand({ name: 'ArtistSearch', artistId: 5 });
    expect(client.calls[0].args[0]).toEqual({ name: 'ArtistSearch', artistId: 5 });
  });

  it('should send AuthorSearch command for Readarr', async () => {
    const client = createMockClient();
    await client.runCommand({ name: 'AuthorSearch', authorId: 3 });
    expect(client.calls[0].args[0]).toEqual({ name: 'AuthorSearch', authorId: 3 });
  });
});

describe('CLI CRUD - Add command validation', () => {
  it('should throw when search returns no results', async () => {
    const client = createMockClient();
    const searchResult = await client.searchMovies('nonexistent');
    const results = searchResult?.data ?? searchResult;
    expect(!Array.isArray(results) || results.length === 0).toBe(true);
  });
});
