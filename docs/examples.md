# Examples

Real-world automation scripts and use cases for TsArr. All examples are available as runnable scripts in the [`examples/` directory](../examples/).

## Quick Start Examples

### Basic Radarr Connection Test

```typescript
import { RadarrClient } from 'tsarr';

const radarr = new RadarrClient({
  baseUrl: 'http://localhost:7878',
  apiKey: process.env.RADARR_API_KEY!
});

// Test connection and get system info
const status = await radarr.getSystemStatus();
console.log(`Connected to ${status.data?.appName} v${status.data?.version}`);

// Get movie count
const movies = await radarr.getMovies();
console.log(`Library contains ${movies.data?.length} movies`);
```

**Run:** `RADARR_API_KEY=your_key bun run examples/radarr-example.ts`

### Basic Sonarr Operations

```typescript
import { SonarrClient } from 'tsarr';

const sonarr = new SonarrClient({
  baseUrl: 'http://localhost:8989',
  apiKey: process.env.SONARR_API_KEY!
});

// Get all series
const series = await sonarr.getSeries();
console.log(`Found ${series.data?.length} TV series`);

// Search for a new show
const searchResults = await sonarr.searchSeries('Breaking Bad');
console.log(`Found ${searchResults.data?.length} search results`);
```

**Run:** `SONARR_API_KEY=your_key bun run examples/sonarr-example.ts`

### Basic qBittorrent Operations

```typescript
import { QBittorrentClient } from 'tsarr';

const qbit = new QBittorrentClient({
  baseUrl: 'http://localhost:8080',
  username: 'admin',
  password: process.env.QBITTORRENT_PASSWORD!
});

// Get app version
const version = await qbit.getAppVersion();
console.log(`Connected to qBittorrent v${version}`);

// List torrents
const torrents = await qbit.getTorrents();
console.log(`Found ${torrents.length} torrents`);

// Filter by state
const downloading = await qbit.getTorrents('downloading');
console.log(`${downloading.length} currently downloading`);
```

**Run:** `QBITTORRENT_PASSWORD=your_password bun run examples/qbittorrent-example.ts`

### Basic Seerr Operations

```typescript
import { SeerrClient } from 'tsarr';

const seerr = new SeerrClient({
  baseUrl: 'http://localhost:5055',
  apiKey: process.env.SEERR_API_KEY!
});

// Get server status
const status = await seerr.getSystemStatus();
console.log(`Connected to Seerr v${(status as any).data?.version}`);

// List pending requests
const requests = await seerr.getRequests({ filter: 'pending' });
console.log(`${((requests as any).data?.results ?? []).length} pending requests`);

// Search for media
const results = await seerr.search('The Matrix');
console.log(`Found ${((results as any).data?.results ?? []).length} results`);

// Approve a request
await seerr.approveRequest('123');
```

**Run:** `SEERR_API_KEY=your_key bun run examples/seerr-example.ts`

### Basic Jellyfin Operations

```typescript
import { JellyfinClient } from 'tsarr';

const jellyfin = new JellyfinClient({
  baseUrl: 'http://localhost:8096',
  apiKey: process.env.JELLYFIN_API_KEY!
});

// Server status (Jellyfin uses PascalCase JSON)
const status = await jellyfin.getSystemStatus();
console.log(`Connected to Jellyfin v${(status as any).data?.Version}`);

// Trigger a library scan after an import
await jellyfin.refreshLibrary();

// Who is streaming right now?
const sessions = await jellyfin.getSessions();
const playing = ((sessions as any).data ?? []).filter((s: any) => s.NowPlayingItem);
console.log(`${playing.length} active stream(s)`);

// Read watched state back out
const movies = await jellyfin.getItems({ includeItemTypes: ['Movie'], recursive: true });
console.log(`${((movies as any).data?.Items ?? []).length} movies in the library`);
```

**Run:** `JELLYFIN_API_KEY=your_key bun run examples/jellyfin-example.ts`

### Closing the loop: scan after import, clean up what's watched

The pipeline is only a loop once the media server can be read back. Jellyfin
supplies the two edges the Servarr apps cannot:

```typescript
import { RadarrClient, JellyfinClient } from 'tsarr';

const radarr = new RadarrClient({
  baseUrl: process.env.RADARR_BASE_URL!,
  apiKey: process.env.RADARR_API_KEY!
});
const jellyfin = new JellyfinClient({
  baseUrl: process.env.JELLYFIN_BASE_URL!,
  apiKey: process.env.JELLYFIN_API_KEY!
});

// Don't run maintenance while somebody is watching
const sessions = await jellyfin.getSessions({ activeWithinSeconds: 300 });
if (((sessions as any).data ?? []).some((s: any) => s.NowPlayingItem)) {
  console.log('Someone is streaming — skipping this run.');
  process.exit(0);
}

// 1. Tell Jellyfin about whatever Radarr just imported
await jellyfin.refreshLibrary();

// 2. Find movies watched over 30 days ago and unmonitor them in Radarr
const userId = process.env.JELLYFIN_USER_ID;
if (!userId) throw new Error('Set JELLYFIN_USER_ID (see `tsarr jellyfin user list`).');

const watched = await jellyfin.getItems({
  userId,
  includeItemTypes: ['Movie'],
  recursive: true,
  isPlayed: true,
  fields: ['ProviderIds'],
});

// Fetch the Radarr library once, then index it by TMDB ID.
const movies = await radarr.getMovies();
const byTmdbId = new Map((movies.data ?? []).map((m: any) => [m.tmdbId, m]));

const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
for (const item of (watched as any).data?.Items ?? []) {
  const lastPlayed = item.UserData?.LastPlayedDate;
  if (!lastPlayed || new Date(lastPlayed).getTime() > cutoff) continue;

  const match = byTmdbId.get(Number(item.ProviderIds?.Tmdb));
  if (match) {
    console.log(`Watched over 30 days ago: ${item.Name}`);
    // await radarr.updateMovie({ ...match, monitored: false });
  }
}
```

## Automation Scripts

### 1. Bulk Movie Import

Scan a directory through Radarr, match each file to TMDB metadata, add the movie to the library, then import the file. Condensed from the script, which also logs progress and prints a final library summary.

```typescript
// examples/import-movies.ts (condensed)
import { RadarrClient } from 'tsarr';

/** The media files endpoint has no response schema in Radarr's OpenAPI spec. */
type MediaFile = { name: string; path: string; size: number };

const radarr = new RadarrClient({
  baseUrl: process.env.RADARR_BASE_URL!,
  apiKey: process.env.RADARR_API_KEY!,
});
const movieDirectory = process.env.MOVIE_DIRECTORY || '/media/movies';

// Make sure the directory is a root folder
const rootFolders = (await radarr.getRootFolders()).data || [];
if (!rootFolders.some((folder: any) => folder.path === movieDirectory)) {
  await radarr.addRootFolder(movieDirectory);
}

// Scan the filesystem for media files
const mediaFiles = ((await radarr.getMediaFiles(movieDirectory)).data ?? []) as MediaFile[];

for (const file of mediaFiles) {
  const movieName = file.name.split('.')[0];

  // Search for metadata
  const searchResults = await radarr.searchMovies(movieName);
  if (!searchResults.data?.length) continue;
  const movieMetadata = searchResults.data[0];

  // Add to library without searching for downloads
  const added = await radarr.addMovie({
    title: movieMetadata.title,
    year: movieMetadata.year,
    tmdbId: movieMetadata.tmdbId,
    titleSlug: movieMetadata.titleSlug,
    qualityProfileId: 1,
    monitored: true,
    rootFolderPath: movieDirectory,
    images: movieMetadata.images,
    addOptions: { searchForMovie: false },
  });

  // Import the physical file
  if (added.data) {
    await radarr.importMovies([
      {
        path: file.path,
        movieId: added.data.id,
        quality: { quality: { id: 1, name: 'Unknown' } },
        languages: [{ id: 1, name: 'English' }],
      },
    ]);
    console.log(`✅ Added: ${movieMetadata.title}`);
  }
}
```

**Run:** `RADARR_BASE_URL=http://localhost:7878 RADARR_API_KEY=your_key MOVIE_DIRECTORY=/media/movies bun run examples/import-movies.ts`

### 2. Health Monitoring

Check that each Servarr instance is online, measure its response time, and report health errors.

```typescript
// examples/health-monitor.ts (condensed)
import { RadarrClient, SonarrClient } from 'tsarr';

const services = [
  {
    name: 'Radarr',
    client: new RadarrClient({
      baseUrl: process.env.RADARR_BASE_URL!,
      apiKey: process.env.RADARR_API_KEY!,
    }),
  },
  {
    name: 'Sonarr',
    client: new SonarrClient({
      baseUrl: process.env.SONARR_BASE_URL!,
      apiKey: process.env.SONARR_API_KEY!,
    }),
  },
];

for (const service of services) {
  try {
    const start = Date.now();
    const status = await service.client.getSystemStatus();
    console.log(`✅ ${service.name}: Online (v${status.data?.version}, ${Date.now() - start}ms)`);

    try {
      const health = await service.client.getHealth();
      const issues = health.data?.filter((h: any) => h.type === 'error') || [];
      for (const issue of issues) console.log(`   ⚠️  ${issue.message}`);
    } catch {
      console.log(`   ⚠️  Could not check health status`);
    }
  } catch (error) {
    console.log(`❌ ${service.name}: Offline`);
  }
}
```

**Run:** `RADARR_BASE_URL=http://localhost:7878 RADARR_API_KEY=key1 SONARR_BASE_URL=http://localhost:8989 SONARR_API_KEY=key2 bun run examples/health-monitor.ts`

### 3. Missing Episodes Checker

Find monitored Sonarr series with missing episodes, using each series' episode statistics, and rank them by how many episodes are missing.

```typescript
// examples/missing-episodes.ts (condensed)
import { SonarrClient } from 'tsarr';

const sonarr = new SonarrClient({
  baseUrl: process.env.SONARR_BASE_URL!,
  apiKey: process.env.SONARR_API_KEY!,
});

const series = (await sonarr.getSeries()).data || [];
const missingEpisodes = [];

for (const show of series) {
  const episodeCount = show.statistics?.episodeCount ?? 0;
  const episodeFileCount = show.statistics?.episodeFileCount ?? 0;
  const missing = episodeCount - episodeFileCount;

  if (missing > 0 && show.monitored) {
    missingEpisodes.push({ title: show.title, missing, total: episodeCount, status: show.status });
  }
}

// Sort by most missing episodes
missingEpisodes.sort((a, b) => b.missing - a.missing);

for (const show of missingEpisodes) {
  console.log(`${show.title}: ${show.missing}/${show.total} missing (${show.status})`);
}
```

**Run:** `SONARR_BASE_URL=http://localhost:8989 SONARR_API_KEY=your_key bun run examples/missing-episodes.ts`

### 4. Library Cleanup

Analyze a Radarr library for cleanup candidates: movies without files, unmonitored movies, disk usage, the largest movies, and the quality distribution. The script only reports; it does not delete anything.

```typescript
// examples/library-cleanup.ts (condensed)
import { RadarrClient } from 'tsarr';

const radarr = new RadarrClient({
  baseUrl: process.env.RADARR_BASE_URL!,
  apiKey: process.env.RADARR_API_KEY!,
});

const movies = (await radarr.getMovies()).data || [];

const missingFiles = movies.filter((movie: any) => !movie.hasFile);
const unmonitored = movies.filter((movie: any) => !movie.monitored);
console.log(`📁 Movies without files: ${missingFiles.length}`);
console.log(`👁️  Unmonitored movies: ${unmonitored.length}`);

const totalSize = movies.reduce((sum: number, movie: any) => sum + (movie.sizeOnDisk || 0), 0);
console.log(`💾 Total disk usage: ${(totalSize / 1024 / 1024 / 1024).toFixed(2)} GB`);

const largestMovies = movies
  .filter((movie: any) => movie.sizeOnDisk > 0)
  .sort((a: any, b: any) => (b.sizeOnDisk || 0) - (a.sizeOnDisk || 0))
  .slice(0, 5);
largestMovies.forEach((movie: any) => console.log(`   ${movie.title} (${movie.year})`));

const qualityCount: Record<string, number> = {};
for (const movie of movies) {
  const quality = movie.movieFile?.quality?.quality?.name || 'No File';
  qualityCount[quality] = (qualityCount[quality] || 0) + 1;
}
console.log(qualityCount);
```

**Run:** `RADARR_BASE_URL=http://localhost:7878 RADARR_API_KEY=your_key bun run examples/library-cleanup.ts`

### 5. Quality Analyzer

Report the quality and file-size distribution of a Radarr library and list highly rated movies that are upgrade candidates.

```typescript
// examples/quality-analyzer.ts (condensed)
import { RadarrClient } from 'tsarr';

const radarr = new RadarrClient({
  baseUrl: process.env.RADARR_BASE_URL!,
  apiKey: process.env.RADARR_API_KEY!,
});

const movies = (await radarr.getMovies()).data || [];
const qualityStats: Record<string, { count: number; totalSize: number; movies: any[] }> = {};

for (const movie of movies) {
  if (!movie.hasFile) continue;

  const quality = movie.movieFile?.quality?.quality?.name || 'Unknown';
  qualityStats[quality] ??= { count: 0, totalSize: 0, movies: [] };
  qualityStats[quality].count++;
  qualityStats[quality].totalSize += movie.sizeOnDisk || 0;
  qualityStats[quality].movies.push(movie);
}

for (const [quality, stats] of Object.entries(qualityStats)) {
  const avgSize = (stats.totalSize / stats.count / 1024 / 1024 / 1024).toFixed(2);
  console.log(`${quality}: ${stats.count} movies, avg ${avgSize} GB`);
}

// Highly rated movies in low qualities are upgrade candidates
const lowQualityTerms = ['480p', '720p', 'HDTV', 'WEBDL-480p', 'DVD', 'SDTV'];
const upgradeCandidates = Object.entries(qualityStats)
  .filter(([quality]) => lowQualityTerms.some(term => quality.includes(term)))
  .flatMap(([, stats]) => stats.movies)
  .filter(movie => movie.ratings?.value > 7);
console.log(`⬆️  Upgrade candidates: ${upgradeCandidates.length}`);
```

**Run:** `RADARR_BASE_URL=http://localhost:7878 RADARR_API_KEY=your_key bun run examples/quality-analyzer.ts`

### 6. Library Backup

Export the Radarr and Sonarr libraries to a dated JSON file. Each service is skipped when its credentials are not set.

```typescript
// examples/backup-library.ts (condensed)
import { writeFileSync } from 'node:fs';
import { RadarrClient, SonarrClient } from 'tsarr';

const backup = { timestamp: new Date().toISOString(), radarr: null as any, sonarr: null as any };

if (process.env.RADARR_BASE_URL && process.env.RADARR_API_KEY) {
  const radarr = new RadarrClient({
    baseUrl: process.env.RADARR_BASE_URL,
    apiKey: process.env.RADARR_API_KEY,
  });
  const [movies, rootFolders, status] = await Promise.all([
    radarr.getMovies(),
    radarr.getRootFolders(),
    radarr.getSystemStatus(),
  ]);
  backup.radarr = {
    version: status.data?.version,
    movies: movies.data || [],
    rootFolders: rootFolders.data || [],
  };
}

if (process.env.SONARR_BASE_URL && process.env.SONARR_API_KEY) {
  const sonarr = new SonarrClient({
    baseUrl: process.env.SONARR_BASE_URL,
    apiKey: process.env.SONARR_API_KEY,
  });
  const [series, status] = await Promise.all([sonarr.getSeries(), sonarr.getSystemStatus()]);
  backup.sonarr = { version: status.data?.version, series: series.data || [] };
}

const filename = `servarr-backup-${new Date().toISOString().split('T')[0]}.json`;
writeFileSync(filename, JSON.stringify(backup, null, 2));
console.log(`✅ Backup saved to: ${filename}`);
```

**Run:** `RADARR_BASE_URL=http://localhost:7878 RADARR_API_KEY=key1 SONARR_BASE_URL=http://localhost:8989 SONARR_API_KEY=key2 bun run examples/backup-library.ts`

## Multi-Service Examples

### Cross-Platform Library Sync

```typescript
import { RadarrClient, SonarrClient, LidarrClient } from 'tsarr';

async function syncLibraries() {
  const radarr = new RadarrClient({ baseUrl: 'http://localhost:7878', apiKey: process.env.RADARR_API_KEY! });
  const sonarr = new SonarrClient({ baseUrl: 'http://localhost:8989', apiKey: process.env.SONARR_API_KEY! });
  const lidarr = new LidarrClient({ baseUrl: 'http://localhost:8686', apiKey: process.env.LIDARR_API_KEY! });

  // Get library statistics
  const [movies, series, artists] = await Promise.all([
    radarr.getMovies(),
    sonarr.getSeries(), 
    lidarr.getArtists()
  ]);

  console.log('📊 Library Overview:');
  console.log(`   🎬 Movies: ${movies.data?.length || 0}`);
  console.log(`   📺 TV Series: ${series.data?.length || 0}`);
  console.log(`   🎵 Artists: ${artists.data?.length || 0}`);
}
```

### Unified Health Dashboard

```typescript
async function healthDashboard() {
  const services = [
    { name: 'Radarr', client: new RadarrClient({ baseUrl: 'http://localhost:7878', apiKey: process.env.RADARR_API_KEY! }) },
    { name: 'Sonarr', client: new SonarrClient({ baseUrl: 'http://localhost:8989', apiKey: process.env.SONARR_API_KEY! }) },
    { name: 'Lidarr', client: new LidarrClient({ baseUrl: 'http://localhost:8686', apiKey: process.env.LIDARR_API_KEY! }) }
  ];

  for (const { name, client } of services) {
    const [status, health] = await Promise.all([
      client.getSystemStatus(),
      client.getHealth()
    ]);

    const healthIssues = health.data?.filter(h => h.type === 'error').length || 0;
    const statusIcon = healthIssues > 0 ? '🚨' : '✅';
    
    console.log(`${statusIcon} ${name}: v${status.data?.version} (${healthIssues} issues)`);
  }
}
```

## Infrastructure as Code Examples

### Terraform Integration

```typescript
// Configure Radarr programmatically
async function configureRadarr() {
  const radarr = new RadarrClient({
    baseUrl: process.env.RADARR_BASE_URL!,
    apiKey: process.env.RADARR_API_KEY!
  });

  // Add download client
  await radarr.addDownloadClient({
    name: 'SABnzbd',
    implementation: 'Sabnzbd',
    configContract: 'SabnzbdSettings',
    settings: {
      host: 'localhost',
      port: 8080,
      apiKey: process.env.SABNZBD_API_KEY,
      category: 'movies'
    }
  });

  // Add indexer
  await radarr.addIndexer({
    name: 'NZBgeek',
    implementation: 'Newznab',
    configContract: 'NewznabSettings',
    settings: {
      baseUrl: 'https://api.nzbgeek.info',
      apiKey: process.env.NZBGEEK_API_KEY,
      categories: [2000, 2010, 2020]
    }
  });
}
```

### Docker Compose Health Checks

```typescript
// Health check for Docker containers
async function dockerHealthCheck() {
  const services = process.env.SERVARR_SERVICES?.split(',') || ['radarr', 'sonarr'];
  
  for (const service of services) {
    try {
      const client = createClient(service);
      const status = await client.getSystemStatus();
      
      if (status.data?.version) {
        console.log(`✅ ${service}: healthy`);
        process.exit(0);
      }
    } catch (error) {
      console.log(`❌ ${service}: unhealthy - ${error}`);
      process.exit(1);
    }
  }
}
```

## Advanced Automation

### Smart Import Workflow

```typescript
async function smartImport() {
  const radarr = new RadarrClient({
    baseUrl: process.env.RADARR_BASE_URL!,
    apiKey: process.env.RADARR_API_KEY!
  });

  // 1. Get pending downloads
  const queue = await radarr.getQueue();
  console.log(`📥 ${queue.data?.length} items in download queue`);

  // 2. Process completed downloads
  for (const item of queue.data || []) {
    if (item.status === 'completed') {
      // Trigger import
      await radarr.importDownload(item.id);
      console.log(`✅ Imported: ${item.title}`);
    }
  }

  // 3. Clean up old downloads
  const oldItems = queue.data?.filter(item => 
    item.status === 'failed' && 
    new Date(item.added) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ) || [];

  for (const item of oldItems) {
    await radarr.deleteQueueItem(item.id);
    console.log(`🗑️  Removed old failed download: ${item.title}`);
  }
}
```

### Library Maintenance

```typescript
async function maintainLibrary() {
  const radarr = new RadarrClient({
    baseUrl: process.env.RADARR_BASE_URL!,
    apiKey: process.env.RADARR_API_KEY!
  });

  // 1. Find movies without files
  const movies = await radarr.getMovies();
  const orphanedMovies = movies.data?.filter(m => !m.hasFile) || [];
  
  console.log(`🔍 Found ${orphanedMovies.length} movies without files`);

  // 2. Check if files exist on disk but aren't tracked
  for (const movie of orphanedMovies) {
    const movieFiles = await radarr.getMovieFiles(movie.id);
    if (movieFiles.data?.length > 0) {
      // Files exist but not tracked - trigger rescan
      await radarr.refreshMovie(movie.id);
      console.log(`🔄 Refreshed: ${movie.title}`);
    }
  }

  // 3. Update quality for old movies
  const oldMovies = movies.data?.filter(m => 
    m.year < 2010 && m.qualityProfileId === 1
  ) || [];

  for (const movie of oldMovies) {
    await radarr.updateMovie(movie.id, {
      qualityProfileId: 2 // SD profile for old movies
    });
    console.log(`📉 Updated quality for: ${movie.title}`);
  }
}
```

## Monitoring and Reporting

### Usage Statistics

```typescript
async function generateReport() {
  const radarr = new RadarrClient({
    baseUrl: process.env.RADARR_BASE_URL!,
    apiKey: process.env.RADARR_API_KEY!
  });

  const [movies, queue, history] = await Promise.all([
    radarr.getMovies(),
    radarr.getQueue(),
    radarr.getHistory()
  ]);

  // Generate statistics
  const stats = {
    totalMovies: movies.data?.length || 0,
    moviesWithFiles: movies.data?.filter(m => m.hasFile).length || 0,
    activeDownloads: queue.data?.length || 0,
    recentActivity: history.data?.filter(h => 
      new Date(h.date) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length || 0
  };

  console.log('📊 Library Statistics:');
  console.log(`   Total Movies: ${stats.totalMovies}`);
  console.log(`   With Files: ${stats.moviesWithFiles} (${Math.round(stats.moviesWithFiles / stats.totalMovies * 100)}%)`);
  console.log(`   Active Downloads: ${stats.activeDownloads}`);
  console.log(`   Recent Activity: ${stats.recentActivity} items (24h)`);
}
```

## Integration Examples

### Discord Bot Integration

```typescript
import { RadarrClient } from 'tsarr';

class ServarrBot {
  private radarr: RadarrClient;

  constructor() {
    this.radarr = new RadarrClient({
      baseUrl: process.env.RADARR_BASE_URL!,
      apiKey: process.env.RADARR_API_KEY!
    });
  }

  async handleMovieRequest(movieName: string, userId: string) {
    // Search for movie
    const results = await this.radarr.searchMovies(movieName);
    
    if (results.data?.length > 0) {
      const movie = results.data[0];
      
      // Add to library
      await this.radarr.addMovie({
        title: movie.title,
        year: movie.year,
        tmdbId: movie.tmdbId,
        qualityProfileId: 1,
        monitored: true,
        rootFolderPath: '/media/movies'
      });

      return `✅ Added "${movie.title} (${movie.year})" to download queue`;
    }
    
    return `❌ Could not find "${movieName}"`;
  }
}
```

### Home Assistant Integration

```typescript
// Home Assistant sensor for Radarr stats
async function homeAssistantSensor() {
  const radarr = new RadarrClient({
    baseUrl: process.env.RADARR_BASE_URL!,
    apiKey: process.env.RADARR_API_KEY!
  });

  const [movies, queue, diskSpace] = await Promise.all([
    radarr.getMovies(),
    radarr.getQueue(),
    radarr.getDiskSpace()
  ]);

  const sensor = {
    state: movies.data?.length || 0,
    attributes: {
      movies_with_files: movies.data?.filter(m => m.hasFile).length || 0,
      active_downloads: queue.data?.length || 0,
      free_space_gb: Math.round((diskSpace.data?.[0]?.freeSpace || 0) / 1024 / 1024 / 1024),
      last_updated: new Date().toISOString()
    }
  };

  // Send to Home Assistant via webhook
  await fetch(`${process.env.HA_WEBHOOK_URL}/radarr_stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sensor)
  });
}
```

## Running the Examples

All examples are in the [`examples/`](../examples/) directory and can be run directly with Bun:

```bash
# Set environment variables
export RADARR_BASE_URL="http://localhost:7878"
export RADARR_API_KEY="your-api-key"

# Run an example
bun run examples/radarr-example.ts
bun run examples/sonarr-example.ts
bun run examples/qbittorrent-example.ts
```

### Environment Variable Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `RADARR_BASE_URL` | Radarr instance URL | `http://localhost:7878` |
| `RADARR_API_KEY` | Radarr API key | `abc123...` |
| `SONARR_BASE_URL` | Sonarr instance URL | `http://localhost:8989` |
| `SONARR_API_KEY` | Sonarr API key | `def456...` |
| `LIDARR_BASE_URL` | Lidarr instance URL | `http://localhost:8686` |
| `LIDARR_API_KEY` | Lidarr API key | `ghi789...` |
| `MOVIE_DIRECTORY` | Movies root path | `/media/movies` |
| `QBITTORRENT_BASE_URL` | qBittorrent instance URL | `http://localhost:8080` |
| `QBITTORRENT_USERNAME` | qBittorrent username | `admin` |
| `QBITTORRENT_PASSWORD` | qBittorrent password | `adminadmin` |
| `JELLYFIN_BASE_URL` | Jellyfin instance URL | `http://localhost:8096` |
| `JELLYFIN_API_KEY` | Jellyfin API key | `jkl012...` |
| `JELLYFIN_USER_ID` | Jellyfin user ID (for watched state) | `e924f49f...` |
| `DRY_RUN` | Prevent destructive actions | `true` |
| `AUTO_SEARCH` | Enable automatic searching | `true` |

## Tips and Best Practices

1. **Always use environment variables** for API keys and URLs
2. **Enable dry run mode** when testing destructive operations
3. **Add delays** between bulk operations to avoid rate limiting
4. **Handle errors gracefully** with proper try/catch blocks
5. **Use TypeScript features** for better development experience
6. **Monitor system health** before performing bulk operations

For more detailed API documentation, see the [Usage Guide](./usage.md) and [API Documentation](https://robbeverhelst.github.io/tsarr/).