# TsArr Usage Guide

TsArr is a TypeScript SDK for the Servarr ecosystem, providing type-safe clients for all major applications.

## Quick Start

```typescript
import { RadarrClient, SonarrClient, LidarrClient } from 'tsarr';

// Initialize clients
const radarr = new RadarrClient({
  baseUrl: 'http://localhost:7878',
  apiKey: 'your-api-key'
});

const sonarr = new SonarrClient({
  baseUrl: 'http://localhost:8989',
  apiKey: 'your-api-key'
});
```

## Supported Applications

| Application | Client Class | Purpose |
|-------------|--------------|---------|
| Radarr | `RadarrClient` | Movie management |
| Sonarr | `SonarrClient` | TV show management |
| Lidarr | `LidarrClient` | Music management |
| Readarr | `ReadarrClient` | Book management |
| Prowlarr | `ProwlarrClient` | Indexer management |

## Common Operations

### Movies (Radarr)

```typescript
// Get all movies
const movies = await radarr.getMovies();

// Search for a movie
const searchResults = await radarr.searchMovies('Inception');

// Add a movie to library
await radarr.addMovie({
  title: 'Inception',
  year: 2010,
  tmdbId: 27205,
  qualityProfileId: 1,
  monitored: true,
  rootFolderPath: '/media/movies'
});

// Import physical files
await radarr.importMovies([{
  path: '/media/movies/Inception (2010)/Inception.mkv',
  movieId: 1,
  quality: { quality: { id: 1, name: 'HD-1080p' } }
}]);
```

### TV Shows (Sonarr)

```typescript
// Get all series
const series = await sonarr.getSeries();

// Search for a series
const searchResults = await sonarr.searchSeries('Breaking Bad');

// Add a series
await sonarr.addSeries({
  title: 'Breaking Bad',
  tvdbId: 81189,
  qualityProfileId: 1,
  monitored: true,
  rootFolderPath: '/media/tv'
});
```

### Music (Lidarr)

```typescript
// Get all artists
const artists = await lidarr.getArtists();

// Search for an artist
const searchResults = await lidarr.searchArtists('Pink Floyd');

// Add an artist
await lidarr.addArtist({
  artistName: 'Pink Floyd',
  musicBrainzId: '83d91898-7763-47d7-b03b-b92132375c47',
  qualityProfileId: 1,
  monitored: true,
  rootFolderPath: '/media/music'
});
```

### Books (Readarr)

```typescript
// Get all authors
const authors = await readarr.getAuthors();

// Search for an author
const searchResults = await readarr.searchAuthors('Stephen King');

// Add an author
await readarr.addAuthor({
  authorName: 'Stephen King',
  goodreadsId: '3389',
  qualityProfileId: 1,
  monitored: true,
  rootFolderPath: '/media/books'
});
```

### Indexers (Prowlarr)

```typescript
// Get all indexers
const indexers = await prowlarr.getIndexers();

// Search across indexers
const searchResults = await prowlarr.search('Ubuntu ISO');

// Get applications
const applications = await prowlarr.getApplications();
```

## System Operations

All clients support common system operations:

```typescript
// Check system status
const status = await radarr.getSystemStatus();

// Check health
const health = await radarr.getHealth();

// Run commands
await radarr.runCommand({
  name: 'DownloadedMoviesScan',
  path: '/media/movies'
});

// Get command queue
const commands = await radarr.getCommands();

// Manage root folders
const rootFolders = await radarr.getRootFolders();
await radarr.addRootFolder('/media/new-movies');
```

## Error Handling

```typescript
import { TsArrError, ApiKeyError, NetworkError } from 'tsarr';

try {
  const movies = await radarr.getMovies();
} catch (error) {
  if (error instanceof ApiKeyError) {
    console.error('Invalid API key');
  } else if (error instanceof NetworkError) {
    console.error('Network connection failed');
  } else if (error instanceof TsArrError) {
    console.error('TsArr error:', error.message);
  }
}
```

## Configuration

### Environment Variables

```bash
# Radarr
RADARR_BASE_URL=http://localhost:7878
RADARR_API_KEY=your-api-key

# Sonarr
SONARR_BASE_URL=http://localhost:8989
SONARR_API_KEY=your-api-key

# Lidarr
LIDARR_BASE_URL=http://localhost:8686
LIDARR_API_KEY=your-api-key

# Readarr
READARR_BASE_URL=http://localhost:8787
READARR_API_KEY=your-api-key

# Prowlarr
PROWLARR_BASE_URL=http://localhost:9696
PROWLARR_API_KEY=your-api-key
```

### Runtime Configuration

```typescript
// Update client configuration
radarr.updateConfig({
  baseUrl: 'http://new-host:7878',
  apiKey: 'new-api-key'
});
```

## Advanced Usage

### Direct API Access

For operations not covered by wrapper methods, use the generated APIs directly:

```typescript
import { Radarr } from 'tsarr';

// Configure the client
Radarr.client.setConfig({
  baseUrl: 'http://localhost:7878',
  headers: { 'X-Api-Key': 'your-api-key' }
});

// Use any generated API method
const response = await Radarr.getApiV3MovieById({ path: { id: 1 } });
```

### Batch Operations

```typescript
// Process multiple movies
const movieFiles = await radarr.getMediaFiles('/media/movies');
const results = [];

for (const file of movieFiles.slice(0, 10)) {
  try {
    // Search metadata
    const search = await radarr.searchMovies(file.name.split('.')[0]);
    if (search.data?.[0]) {
      // Add to library
      const movie = await radarr.addMovie({
        title: search.data[0].title,
        tmdbId: search.data[0].tmdbId,
        qualityProfileId: 1,
        monitored: true,
        rootFolderPath: '/media/movies'
      });
      
      // Import file
      await radarr.importMovies([{
        path: file.path,
        movieId: movie.data.id,
        quality: { quality: { id: 1, name: 'HD-1080p' } }
      }]);
      
      results.push(movie.data.title);
    }
  } catch (error) {
    console.error(`Failed to import ${file.name}:`, error);
  }
}

console.log(`Successfully imported ${results.length} movies`);
```