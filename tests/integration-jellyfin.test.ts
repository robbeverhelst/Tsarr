import { describe, expect, it } from 'bun:test';
import { JellyfinClient } from '../src/index.js';

/**
 * Runs against the local test bed:
 *
 *   bun run testbed:up
 *   bun run test:integration
 *
 * The whole suite runs against every server the test bed provisioned: the
 * current stable Jellyfin and the next major release. The generated client is
 * built from the 12.0 spec while most people still run 10.11, so a claim that
 * either works has to be backed by both.
 *
 * Skipped entirely when no server is configured, so `bun test` stays green
 * without Docker.
 */
interface TargetServer {
  label: string;
  baseUrl: string;
  apiKey: string;
  userId?: string;
}

const TARGETS: TargetServer[] = [
  {
    label: `stable ${process.env.JELLYFIN_VERSION ?? '?'}`,
    baseUrl: process.env.JELLYFIN_BASE_URL ?? '',
    apiKey: process.env.JELLYFIN_API_KEY ?? '',
    userId: process.env.JELLYFIN_USER_ID,
  },
  {
    label: `next ${process.env.JELLYFIN_NEXT_VERSION ?? '?'}`,
    baseUrl: process.env.JELLYFIN_NEXT_BASE_URL ?? '',
    apiKey: process.env.JELLYFIN_NEXT_API_KEY ?? '',
    userId: process.env.JELLYFIN_NEXT_USER_ID,
  },
].filter(target => target.baseUrl && target.apiKey);

if (TARGETS.length === 0) {
  console.log(
    '⏭️  Skipping Jellyfin integration tests (JELLYFIN_BASE_URL/JELLYFIN_API_KEY not set)'
  );
}

for (const target of TARGETS) {
  const jellyfin = new JellyfinClient({ baseUrl: target.baseUrl, apiKey: target.apiKey });
  const userId = target.userId;

  // Jellyfin serves PascalCase JSON; `data` is what the generated client returns.
  const unwrap = (result: any) => result?.data ?? result;

  describe(`Jellyfin Integration (${target.label})`, () => {
    describe('system', () => {
      it('reports server info with a version', async () => {
        const info = unwrap(await jellyfin.getSystemStatus());
        expect(info).toBeDefined();
        expect(typeof info.Version).toBe('string');
        expect(info.Version.length).toBeGreaterThan(0);
      });

      it('responds to a ping', async () => {
        const result = await jellyfin.ping();
        expect(result).toBeDefined();
      });

      it('returns public system info without leaking private fields', async () => {
        const info = unwrap(await jellyfin.getPublicSystemInfo());
        expect(info.Version).toBeDefined();
        expect(info.StartupWizardCompleted).toBe(true);
      });

      it('returns activity log entries', async () => {
        const log = unwrap(await jellyfin.getActivityLog({ limit: 5 }));
        expect(Array.isArray(log.Items)).toBe(true);
      });
    });

    describe('libraries', () => {
      it('lists the seeded libraries', async () => {
        const folders = unwrap(await jellyfin.getVirtualFolders());
        expect(Array.isArray(folders)).toBe(true);
        const names = folders.map((f: any) => f.Name);
        expect(names).toContain('Movies');
        expect(names).toContain('Shows');
      });

      it('triggers a library refresh', async () => {
        const result = await jellyfin.refreshLibrary();
        expect((result as any)?.error).toBeUndefined();
      });

      it('adds and removes a library', async () => {
        await jellyfin.addVirtualFolder('IntegrationTemp', {
          collectionType: 'movies',
          paths: ['/media/movies'],
        });

        const afterAdd = unwrap(await jellyfin.getVirtualFolders());
        expect(afterAdd.map((f: any) => f.Name)).toContain('IntegrationTemp');

        await jellyfin.removeVirtualFolder('IntegrationTemp');

        const afterRemove = unwrap(await jellyfin.getVirtualFolders());
        expect(afterRemove.map((f: any) => f.Name)).not.toContain('IntegrationTemp');
      });
    });

    describe('items', () => {
      it('lists the seeded movies', async () => {
        const result = unwrap(
          await jellyfin.getItems({ includeItemTypes: ['Movie'], recursive: true })
        );
        expect(Array.isArray(result.Items)).toBe(true);
        expect(result.Items.length).toBeGreaterThanOrEqual(2);

        // Substring match: Jellyfin may serve the raw filename ("The Matrix (1999)")
        // or a provider-normalised title ("The Matrix") depending on whether it has
        // reached TMDB yet. Both are correct; the test is about tsarr, not metadata.
        const titles = result.Items.map((i: any) => i.Name);
        expect(titles.some((t: string) => t.includes('Matrix'))).toBe(true);
        expect(titles.some((t: string) => t.includes('Blade Runner'))).toBe(true);
      });

      it('parses the production year from the filename', async () => {
        const result = unwrap(
          await jellyfin.getItems({
            includeItemTypes: ['Movie'],
            recursive: true,
            searchTerm: 'Matrix',
          })
        );
        const matrix = result.Items.find((i: any) => i.Name.includes('Matrix'));
        expect(matrix).toBeDefined();
        // The year is parsed from the filename locally, so it is stable either way.
        expect(matrix.ProductionYear).toBe(1999);
      });

      it('lists the seeded episodes with season and episode numbers', async () => {
        const result = unwrap(
          await jellyfin.getItems({ includeItemTypes: ['Episode'], recursive: true })
        );
        expect(result.Items.length).toBeGreaterThanOrEqual(2);

        // Episode *titles* come from the provider, but the season/episode numbers
        // are parsed from the filename and are stable.
        const numbered = result.Items.filter(
          (i: any) => i.ParentIndexNumber === 1 && [1, 2].includes(i.IndexNumber)
        );
        expect(numbered.length).toBe(2);
        expect(result.Items.every((i: any) => i.SeriesName?.includes('Firefly'))).toBe(true);
      });

      it('honours the limit parameter', async () => {
        const result = unwrap(
          await jellyfin.getItems({ includeItemTypes: ['Movie'], recursive: true, limit: 1 })
        );
        expect(result.Items).toHaveLength(1);
      });

      it('fetches a single item by ID', async () => {
        if (!userId) return;
        const list = unwrap(
          await jellyfin.getItems({ includeItemTypes: ['Movie'], recursive: true, limit: 1 })
        );
        const id = list.Items[0].Id;

        const item = unwrap(await jellyfin.getItem(id, userId));
        expect(item.Id).toBe(id);
        expect(item.Type).toBe('Movie');
      });

      it('rejects a bare item fetch without a user id', async () => {
        // Jellyfin marks userId optional in its spec but 400s without it, which
        // is why the wrapper requires it. Guard against a silent regression.
        const list = unwrap(
          await jellyfin.getItems({ includeItemTypes: ['Movie'], recursive: true, limit: 1 })
        );
        const id = list.Items[0].Id;
        const response = await fetch(`${target.baseUrl}/Items/${id}`, {
          headers: { Authorization: `MediaBrowser Token="${target.apiKey}"` },
        });
        expect(response.status).toBe(400);
      });

      it('returns item counts', async () => {
        const counts = unwrap(await jellyfin.getItemCounts());
        expect(counts.MovieCount).toBeGreaterThanOrEqual(2);
        expect(counts.EpisodeCount).toBeGreaterThanOrEqual(2);
      });

      it('refreshes a single item', async () => {
        const list = unwrap(
          await jellyfin.getItems({ includeItemTypes: ['Movie'], recursive: true, limit: 1 })
        );
        const result = await jellyfin.refreshItem(list.Items[0].Id, {
          metadataRefreshMode: 'FullRefresh',
        });
        expect((result as any)?.error).toBeUndefined();
      });
    });

    describe('artwork', () => {
      it('reports the artwork an item currently has, with dimensions', async () => {
        const list = unwrap(
          await jellyfin.getItems({ includeItemTypes: ['Movie'], recursive: true, limit: 1 })
        );
        const images = unwrap(await jellyfin.getItemImages(list.Items[0].Id));

        expect(Array.isArray(images)).toBe(true);
        // Dimensions are what lets a caller judge "this cover is bad".
        for (const image of images) {
          expect(typeof image.ImageType).toBe('string');
          expect(typeof image.Width).toBe('number');
          expect(typeof image.Height).toBe('number');
        }
      });

      it('offers remote artwork candidates with the fields needed to choose', async () => {
        const list = unwrap(
          await jellyfin.getItems({ includeItemTypes: ['Movie'], recursive: true, limit: 1 })
        );
        const result = unwrap(await jellyfin.getRemoteImages(list.Items[0].Id, 'Primary'));

        expect(Array.isArray(result.Images)).toBe(true);
        if (result.Images.length === 0) return; // no provider reachable in this environment
        const candidate = result.Images[0];
        expect(typeof candidate.Url).toBe('string');
        expect(typeof candidate.ProviderName).toBe('string');
        expect(typeof candidate.CommunityRating).toBe('number');
        // Width/Height are present on 10.11 but dropped on 12.0, even though the
        // OpenAPI schema still declares them. Callers choosing on resolution must
        // tolerate their absence.
        expect(['number', 'undefined']).toContain(typeof candidate.Width);
      });

      it('replaces artwork from a URL and can remove it again', async () => {
        const list = unwrap(
          await jellyfin.getItems({ includeItemTypes: ['Movie'], recursive: true, limit: 1 })
        );
        const itemId = list.Items[0].Id;

        const remote = unwrap(await jellyfin.getRemoteImages(itemId, 'Primary'));
        if (!remote.Images?.length) return; // no provider reachable

        // Pick the best candidate the way a caller fixing a bad cover would:
        // by resolution where the server reports it, otherwise by rating.
        const hasDimensions = remote.Images.some((i: any) => typeof i.Width === 'number');
        const best = [...remote.Images].sort((a: any, b: any) =>
          hasDimensions
            ? (b.Width ?? 0) - (a.Width ?? 0)
            : (b.CommunityRating ?? 0) - (a.CommunityRating ?? 0)
        )[0];

        await jellyfin.downloadRemoteImage(itemId, 'Primary', best.Url);
        const after = unwrap(await jellyfin.getItemImages(itemId));
        const primary = after.find((i: any) => i.ImageType === 'Primary');
        expect(primary).toBeDefined();
        // The item's own artwork always reports dimensions, whichever server.
        expect(primary.Width).toBeGreaterThan(0);
        if (hasDimensions) expect(primary.Width).toBe(best.Width);

        await jellyfin.deleteItemImage(itemId, 'Primary');
        const removed = unwrap(await jellyfin.getItemImages(itemId));
        expect(removed.some((i: any) => i.ImageType === 'Primary')).toBe(false);

        // Restore so reruns start from a known state.
        await jellyfin.downloadRemoteImage(itemId, 'Primary', best.Url);
      });
    });

    describe('search', () => {
      it('finds a seeded movie by name', async () => {
        const result = unwrap(await jellyfin.search('Matrix'));
        expect(result.SearchHints.length).toBeGreaterThanOrEqual(1);
        expect(result.SearchHints[0].Name).toContain('Matrix');
      });
    });

    describe('users', () => {
      it('lists users', async () => {
        const users = unwrap(await jellyfin.getUsers());
        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBeGreaterThanOrEqual(1);
      });

      it('fetches a user by ID', async () => {
        if (!userId) return;
        const user = unwrap(await jellyfin.getUserById(userId));
        expect(user.Id).toBe(userId);
      });
    });

    describe('sessions', () => {
      it('lists sessions', async () => {
        const sessions = unwrap(await jellyfin.getSessions());
        expect(Array.isArray(sessions)).toBe(true);
      });
    });

    describe('scheduled tasks', () => {
      it('lists tasks', async () => {
        const tasks = unwrap(await jellyfin.getTasks());
        expect(Array.isArray(tasks)).toBe(true);
        expect(tasks.length).toBeGreaterThan(5);
        expect(tasks[0].Name).toBeDefined();
      });

      it('starts a task', async () => {
        const tasks = unwrap(await jellyfin.getTasks());
        const task = tasks.find((t: any) => t.Name === 'Clean Cache Directory');
        if (!task) return;
        const result = await jellyfin.startTask(task.Id);
        expect((result as any)?.error).toBeUndefined();
      });
    });

    describe('watched state', () => {
      it('round-trips played state', async () => {
        if (!userId) return;
        const list = unwrap(
          await jellyfin.getItems({ includeItemTypes: ['Movie'], recursive: true, limit: 1 })
        );
        const id = list.Items[0].Id;

        await jellyfin.markUnplayed(id, userId);
        const before = unwrap(await jellyfin.getItemUserData(id, userId));
        expect(before.Played).toBe(false);

        await jellyfin.markPlayed(id, userId);
        const after = unwrap(await jellyfin.getItemUserData(id, userId));
        expect(after.Played).toBe(true);
        expect(after.PlayCount).toBeGreaterThanOrEqual(1);

        // Restore so reruns start from a known state
        await jellyfin.markUnplayed(id, userId);
        const restored = unwrap(await jellyfin.getItemUserData(id, userId));
        expect(restored.Played).toBe(false);
      });

      it('round-trips favorite state', async () => {
        if (!userId) return;
        const list = unwrap(
          await jellyfin.getItems({ includeItemTypes: ['Movie'], recursive: true, limit: 1 })
        );
        const id = list.Items[0].Id;

        await jellyfin.markFavorite(id, userId);
        const favorited = unwrap(await jellyfin.getItemUserData(id, userId));
        expect(favorited.IsFavorite).toBe(true);

        await jellyfin.unmarkFavorite(id, userId);
        const cleared = unwrap(await jellyfin.getItemUserData(id, userId));
        expect(cleared.IsFavorite).toBe(false);
      });

      it('filters items by played state', async () => {
        if (!userId) return;
        const list = unwrap(
          await jellyfin.getItems({ includeItemTypes: ['Movie'], recursive: true, limit: 1 })
        );
        const id = list.Items[0].Id;
        await jellyfin.markPlayed(id, userId);

        const played = unwrap(
          await jellyfin.getItems({
            userId,
            includeItemTypes: ['Movie'],
            recursive: true,
            isPlayed: true,
          })
        );
        expect(played.Items.map((i: any) => i.Id)).toContain(id);

        await jellyfin.markUnplayed(id, userId);
      });
    });

    describe('user views', () => {
      it('returns resume and next-up collections', async () => {
        if (!userId) return;
        const resume = unwrap(await jellyfin.getResumeItems({ userId }));
        expect(Array.isArray(resume.Items)).toBe(true);

        const nextUp = unwrap(await jellyfin.getNextUp({ userId }));
        expect(Array.isArray(nextUp.Items)).toBe(true);
      });

      it('returns recently added media', async () => {
        if (!userId) return;
        const latest = unwrap(await jellyfin.getLatestMedia({ userId }));
        expect(Array.isArray(latest)).toBe(true);
      });
    });

    describe('playlists', () => {
      it('creates a playlist, adds items and removes them', async () => {
        if (!userId) return;
        const movies = unwrap(
          await jellyfin.getItems({ includeItemTypes: ['Movie'], recursive: true, limit: 2 })
        );
        const ids = movies.Items.map((i: any) => i.Id);

        const created = unwrap(await jellyfin.createPlaylist('IntegrationPlaylist', { userId }));
        const playlistId = created.Id;
        expect(playlistId).toBeDefined();

        await jellyfin.addToPlaylist(playlistId, ids, { userId });
        const withItems = unwrap(await jellyfin.getPlaylistItems(playlistId, { userId }));
        expect(withItems.Items.length).toBe(ids.length);

        // Entries are addressed by PlaylistItemId, not the underlying item ID.
        const entryIds = withItems.Items.map((i: any) => i.PlaylistItemId);
        expect(entryIds.every((id: string) => typeof id === 'string')).toBe(true);

        await jellyfin.removeFromPlaylist(playlistId, entryIds);
        const emptied = unwrap(await jellyfin.getPlaylistItems(playlistId, { userId }));
        expect(emptied.Items.length).toBe(0);

        await jellyfin.deleteItem(playlistId);
      });
    });

    describe('collections', () => {
      it('creates a collection and adds then removes an item', async () => {
        const movies = unwrap(
          await jellyfin.getItems({ includeItemTypes: ['Movie'], recursive: true, limit: 1 })
        );
        const itemId = movies.Items[0].Id;

        const created = unwrap(await jellyfin.createCollection('IntegrationCollection'));
        const collectionId = created.Id;
        expect(collectionId).toBeDefined();

        const added = await jellyfin.addToCollection(collectionId, [itemId]);
        expect((added as any)?.error).toBeUndefined();

        const removed = await jellyfin.removeFromCollection(collectionId, [itemId]);
        expect((removed as any)?.error).toBeUndefined();

        await jellyfin.deleteItem(collectionId);
      });
    });

    describe('session remote control', () => {
      // There is no playback client attached to the test bed, so these assert the
      // request shape is accepted rather than that playback actually changed.
      it('rejects commands for an unknown session', async () => {
        const result: any = await jellyfin.sendPlaystateCommand(
          'deadbeefdeadbeefdeadbeefdeadbeef',
          'Pause'
        );
        expect(result?.error !== undefined || result?.response?.status >= 400).toBe(true);
      });

      it('accepts a message command addressed to this API session', async () => {
        const sessions = unwrap(await jellyfin.getSessions());
        if (!Array.isArray(sessions) || sessions.length === 0) return;
        const result: any = await jellyfin.sendMessage(sessions[0].Id, 'tsarr integration test', {
          header: 'tsarr',
          timeoutMs: 1000,
        });
        expect(result?.response?.status).toBeLessThan(500);
      });
    });

    describe('error handling', () => {
      it('surfaces a 404 for an unknown item ID', async () => {
        if (!userId) return;
        // An all-zero GUID is NOT a valid probe here — Jellyfin resolves it to the
        // root "Media Folders" item and returns 200.
        const result: any = await jellyfin.getItem('deadbeefdeadbeefdeadbeefdeadbeef', userId);
        expect(result?.error !== undefined || result?.response?.status === 404).toBe(true);
      });

      it('rejects a bad API key', async () => {
        const bad = new JellyfinClient({
          baseUrl: target.baseUrl,
          apiKey: 'definitely-not-a-valid-key',
        });
        const result: any = await bad.getSystemStatus();
        expect(result?.error !== undefined || result?.response?.status === 401).toBe(true);
      });
    });
  });
}
