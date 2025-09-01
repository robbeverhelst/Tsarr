# TsArr Examples

Real-world examples for common Servarr automation tasks.

## Movie Management

### Bulk Movie Import

Import all movies from a directory with proper metadata matching:

```typescript
import { RadarrClient } from 'tsarr';

const radarr = new RadarrClient({
  baseUrl: process.env.RADARR_BASE_URL!,
  apiKey: process.env.RADARR_API_KEY!
});

async function importMoviesFromDirectory(directory: string) {
  // Get all media files
  const mediaFiles = await radarr.getMediaFiles(directory);
  console.log(`Found ${mediaFiles.data?.length} media files`);
  
  const successfulImports = [];
  
  for (const file of mediaFiles.data || []) {
    const movieName = file.name.split('.')[0];
    
    try {
      // Search for metadata
      const searchResults = await radarr.searchMovies(movieName);
      
      if (searchResults.data?.[0]) {
        const metadata = searchResults.data[0];
        
        // Add to library
        const movie = await radarr.addMovie({
          title: metadata.title,
          year: metadata.year,
          tmdbId: metadata.tmdbId,
          titleSlug: metadata.titleSlug,
          qualityProfileId: 1,
          monitored: true,
          searchForMovie: false,
          rootFolderPath: directory,
          images: metadata.images
        });
        
        // Import physical file
        await radarr.importMovies([{
          path: file.path,
          movieId: movie.data.id,
          quality: { quality: { id: 1, name: 'Unknown' } },
          languages: [{ id: 1, name: 'English' }]
        }]);
        
        successfulImports.push(metadata.title);
        console.log(`✅ Imported: ${metadata.title}`);
      }
    } catch (error) {
      console.error(`❌ Failed to import ${movieName}:`, error);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`🎉 Successfully imported ${successfulImports.length} movies`);
}
```

### Movie Quality Management

```typescript
// Upgrade movies to better quality
async function upgradeMovies(minQualityId: number, targetQualityId: number) {
  const movies = await radarr.getMovies();
  
  for (const movie of movies.data || []) {
    if (movie.movieFile?.quality?.quality?.id === minQualityId) {
      await radarr.updateMovie(movie.id, {
        ...movie,
        qualityProfileId: targetQualityId,
        monitored: true
      });
      
      // Trigger search for better quality
      await radarr.runCommand({
        name: 'MoviesSearch',
        movieIds: [movie.id]
      });
    }
  }
}
```

## TV Show Management

### Season Monitoring

```typescript
import { SonarrClient } from 'tsarr';

const sonarr = new SonarrClient({
  baseUrl: process.env.SONARR_BASE_URL!,
  apiKey: process.env.SONARR_API_KEY!
});

// Monitor only latest seasons
async function monitorLatestSeasons() {
  const series = await sonarr.getSeries();
  
  for (const show of series.data || []) {
    const seasons = show.seasons || [];
    const latestSeason = Math.max(...seasons.map(s => s.seasonNumber));
    
    // Update monitoring
    const updatedSeasons = seasons.map(season => ({
      ...season,
      monitored: season.seasonNumber === latestSeason
    }));
    
    await sonarr.updateSeries(show.id, {
      ...show,
      seasons: updatedSeasons
    });
  }
}
```

## Music Management

### Artist Library Sync

```typescript
import { LidarrClient } from 'tsarr';

const lidarr = new LidarrClient({
  baseUrl: process.env.LIDARR_BASE_URL!,
  apiKey: process.env.LIDARR_API_KEY!
});

// Sync artists from a list
async function syncArtistLibrary(artistNames: string[]) {
  for (const artistName of artistNames) {
    try {
      const searchResults = await lidarr.searchArtists(artistName);
      
      if (searchResults.data?.[0]) {
        const artist = searchResults.data[0];
        
        await lidarr.addArtist({
          artistName: artist.artistName,
          musicBrainzId: artist.musicBrainzId,
          qualityProfileId: 1,
          metadataProfileId: 1,
          monitored: true,
          rootFolderPath: '/media/music'
        });
        
        console.log(`✅ Added: ${artist.artistName}`);
      }
    } catch (error) {
      console.error(`❌ Failed to add ${artistName}:`, error);
    }
  }
}
```

## Book Management

### Author Collection Management

```typescript
import { ReadarrClient } from 'tsarr';

const readarr = new ReadarrClient({
  baseUrl: process.env.READARR_BASE_URL!,
  apiKey: process.env.READARR_API_KEY!
});

// Add complete author collections
async function addAuthorCollection(authorName: string) {
  const searchResults = await readarr.searchAuthors(authorName);
  
  if (searchResults.data?.[0]) {
    const author = searchResults.data[0];
    
    await readarr.addAuthor({
      authorName: author.authorName,
      goodreadsId: author.goodreadsId,
      qualityProfileId: 1,
      metadataProfileId: 1,
      monitored: true,
      searchForMissingBooks: true,
      rootFolderPath: '/media/books'
    });
    
    console.log(`✅ Added author: ${author.authorName}`);
  }
}
```

## Indexer Management

### Prowlarr Integration

```typescript
import { ProwlarrClient, RadarrClient } from 'tsarr';

const prowlarr = new ProwlarrClient({
  baseUrl: process.env.PROWLARR_BASE_URL!,
  apiKey: process.env.PROWLARR_API_KEY!
});

// Search across all indexers
async function searchContent(query: string) {
  const searchResults = await prowlarr.search(query);
  
  console.log(`Found ${searchResults.data?.length} results for: ${query}`);
  
  return searchResults.data?.map(result => ({
    title: result.title,
    size: result.size,
    seeders: result.seeders,
    indexer: result.indexer
  }));
}

// Health check all indexers
async function checkIndexerHealth() {
  const indexers = await prowlarr.getIndexers();
  const health = await prowlarr.getHealth();
  
  for (const issue of health.data || []) {
    if (issue.source === 'IndexerCheck') {
      console.warn(`⚠️ Indexer issue: ${issue.message}`);
    }
  }
}
```

## System Administration

### Health Monitoring

```typescript
// Monitor all services
async function checkAllServicesHealth() {
  const services = [
    { name: 'Radarr', client: radarr },
    { name: 'Sonarr', client: sonarr },
    { name: 'Lidarr', client: lidarr },
    { name: 'Readarr', client: readarr },
    { name: 'Prowlarr', client: prowlarr }
  ];
  
  for (const service of services) {
    try {
      const status = await service.client.getSystemStatus();
      const health = await service.client.getHealth();
      
      console.log(`${service.name}: ${status.data?.version} - ${health.data?.length || 0} issues`);
    } catch (error) {
      console.error(`❌ ${service.name} unreachable:`, error);
    }
  }
}
```

### Command Queue Management

```typescript
// Monitor and manage command queues
async function monitorCommandQueue(client: RadarrClient) {
  const commands = await client.getCommands();
  
  for (const command of commands.data || []) {
    console.log(`${command.name}: ${command.status} (${command.queued})`);
    
    if (command.status === 'failed') {
      console.error(`❌ Command failed: ${command.exception}`);
    }
  }
}
```

## Automation Workflows

### Complete Media Setup

```typescript
// Set up a new media server from scratch
async function setupMediaServer() {
  // 1. Configure root folders
  await radarr.addRootFolder('/media/movies');
  await sonarr.addRootFolder('/media/tv');
  await lidarr.addRootFolder('/media/music');
  
  // 2. Import existing media
  await importMoviesFromDirectory('/media/movies');
  
  // 3. Set up monitoring
  setInterval(async () => {
    await checkAllServicesHealth();
  }, 5 * 60 * 1000); // Every 5 minutes
  
  console.log('🎉 Media server setup complete!');
}
```

### Library Maintenance

```typescript
// Weekly library maintenance
async function weeklyMaintenance() {
  console.log('🧹 Starting weekly maintenance...');
  
  // Refresh all metadata
  await radarr.runCommand({ name: 'RefreshMovie' });
  await sonarr.runCommand({ name: 'RefreshSeries' });
  await lidarr.runCommand({ name: 'RefreshArtist' });
  
  // Clean up missing files
  await radarr.runCommand({ name: 'MissingMoviesSearch' });
  
  // Update quality definitions
  await radarr.runCommand({ name: 'UpdateQualityDefinitions' });
  
  console.log('✅ Weekly maintenance complete!');
}
```