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

## Automation Scripts

### 1. Bulk Movie Import

Automatically import movies from a directory and add them to Radarr with proper metadata matching.

```typescript
// examples/import-movies.ts
import { RadarrClient } from 'tsarr';

async function importMoviesFromDirectory() {
  const radarr = new RadarrClient({
    baseUrl: process.env.RADARR_BASE_URL!,
    apiKey: process.env.RADARR_API_KEY!
  });

  // Scan for media files
  const mediaFiles = await radarr.getMediaFiles('/media/movies');
  
  for (const file of mediaFiles.data || []) {
    const movieName = file.name.split('.')[0];
    
    // Search for metadata
    const searchResults = await radarr.searchMovies(movieName);
    if (searchResults.data?.length > 0) {
      const movieMetadata = searchResults.data[0];
      
      // Add to library
      await radarr.addMovie({
        title: movieMetadata.title,
        year: movieMetadata.year,
        tmdbId: movieMetadata.tmdbId,
        qualityProfileId: 1,
        monitored: true,
        rootFolderPath: '/media/movies'
      });
      
      console.log(`✅ Added: ${movieMetadata.title}`);
    }
  }
}
```

**Run:** `RADARR_BASE_URL=http://localhost:7878 RADARR_API_KEY=your_key bun run examples/import-movies.ts`

### 2. Health Monitoring

Monitor system health across all Servarr instances and alert on issues.

```typescript
// examples/health-monitor.ts
import { RadarrClient, SonarrClient } from 'tsarr';

async function monitorHealth() {
  const clients = [
    { name: 'Radarr', client: new RadarrClient({ baseUrl: 'http://localhost:7878', apiKey: process.env.RADARR_API_KEY! }) },
    { name: 'Sonarr', client: new SonarrClient({ baseUrl: 'http://localhost:8989', apiKey: process.env.SONARR_API_KEY! }) }
  ];

  for (const { name, client } of clients) {
    try {
      const health = await client.getHealth();
      const issues = health.data?.filter(h => h.type === 'error') || [];
      
      if (issues.length > 0) {
        console.log(`🚨 ${name} has ${issues.length} health issues:`);
        issues.forEach(issue => console.log(`   - ${issue.message}`));
      } else {
        console.log(`✅ ${name} is healthy`);
      }
    } catch (error) {
      console.log(`❌ ${name} is unreachable: ${error}`);
    }
  }
}
```

**Run:** `RADARR_API_KEY=key1 SONARR_API_KEY=key2 bun run examples/health-monitor.ts`

### 3. Missing Episodes Checker

Find and optionally search for missing episodes in your Sonarr library.

```typescript
// examples/missing-episodes.ts
import { SonarrClient } from 'tsarr';

async function findMissingEpisodes() {
  const sonarr = new SonarrClient({
    baseUrl: process.env.SONARR_BASE_URL!,
    apiKey: process.env.SONARR_API_KEY!
  });

  // Get missing episodes
  const missing = await sonarr.getWantedMissing();
  
  console.log(`📺 Found ${missing.data?.totalRecords} missing episodes`);
  
  for (const episode of missing.data?.records || []) {
    console.log(`   - ${episode.series?.title} S${episode.seasonNumber}E${episode.episodeNumber}: ${episode.title}`);
    
    // Optionally trigger search for episode
    if (process.env.AUTO_SEARCH === 'true') {
      await sonarr.searchEpisode(episode.id);
      console.log(`     🔍 Search triggered`);
    }
  }
}
```

**Run:** `SONARR_BASE_URL=http://localhost:8989 SONARR_API_KEY=your_key bun run examples/missing-episodes.ts`

### 4. Library Cleanup

Clean up your library by removing movies/shows that don't have files.

```typescript
// examples/library-cleanup.ts
import { RadarrClient } from 'tsarr';

async function cleanupLibrary() {
  const radarr = new RadarrClient({
    baseUrl: process.env.RADARR_BASE_URL!,
    apiKey: process.env.RADARR_API_KEY!
  });

  const movies = await radarr.getMovies();
  const moviesToDelete = [];

  for (const movie of movies.data || []) {
    if (!movie.hasFile) {
      moviesToDelete.push(movie);
    }
  }

  console.log(`🗑️  Found ${moviesToDelete.length} movies without files`);
  
  if (process.env.DRY_RUN !== 'false') {
    console.log('🔍 DRY RUN - Would delete:');
    moviesToDelete.forEach(movie => {
      console.log(`   - ${movie.title} (${movie.year})`);
    });
  } else {
    for (const movie of moviesToDelete) {
      await radarr.deleteMovie(movie.id, { deleteFiles: false });
      console.log(`✅ Removed: ${movie.title}`);
    }
  }
}
```

**Run:** `RADARR_BASE_URL=http://localhost:7878 RADARR_API_KEY=your_key DRY_RUN=true bun run examples/library-cleanup.ts`

### 5. Quality Profile Analyzer

Analyze and report on quality settings across your library.

```typescript
// examples/quality-analyzer.ts
import { RadarrClient } from 'tsarr';

async function analyzeQuality() {
  const radarr = new RadarrClient({
    baseUrl: process.env.RADARR_BASE_URL!,
    apiKey: process.env.RADARR_API_KEY!
  });

  // Get quality profiles and movies
  const [profiles, movies] = await Promise.all([
    radarr.getQualityProfiles(),
    radarr.getMovies()
  ]);

  // Analyze usage
  const profileUsage = new Map();
  
  for (const movie of movies.data || []) {
    const profileName = profiles.data?.find(p => p.id === movie.qualityProfileId)?.name || 'Unknown';
    profileUsage.set(profileName, (profileUsage.get(profileName) || 0) + 1);
  }

  console.log('📊 Quality Profile Usage:');
  for (const [profile, count] of profileUsage.entries()) {
    console.log(`   ${profile}: ${count} movies`);
  }
}
```

**Run:** `RADARR_BASE_URL=http://localhost:7878 RADARR_API_KEY=your_key bun run examples/quality-analyzer.ts`

### 6. Backup Configuration

Export configuration and settings for backup purposes.

```typescript
// examples/backup-library.ts
import { RadarrClient } from 'tsarr';
import { writeFileSync } from 'fs';

async function backupConfiguration() {
  const radarr = new RadarrClient({
    baseUrl: process.env.RADARR_BASE_URL!,
    apiKey: process.env.RADARR_API_KEY!
  });

  // Export all configuration
  const config = {
    movies: await radarr.getMovies(),
    qualityProfiles: await radarr.getQualityProfiles(),
    rootFolders: await radarr.getRootFolders(),
    downloadClients: await radarr.getDownloadClients(),
    indexers: await radarr.getIndexers(),
    notifications: await radarr.getNotifications()
  };

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `radarr-backup-${timestamp}.json`;
  
  writeFileSync(filename, JSON.stringify(config, null, 2));
  console.log(`✅ Configuration backed up to ${filename}`);
}
```

**Run:** `RADARR_BASE_URL=http://localhost:7878 RADARR_API_KEY=your_key bun run examples/backup-library.ts`

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
bun run examples/import-movies.ts
bun run examples/health-monitor.ts
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