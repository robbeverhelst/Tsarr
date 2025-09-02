# Usage Guide

This guide provides comprehensive documentation for using the TsArr TypeScript SDK to interact with Servarr APIs.

## Installation

```bash
bun add tsarr
```

## Basic Setup

All Servarr clients follow the same initialization pattern:

```typescript
import { RadarrClient, SonarrClient, LidarrClient, ReadarrClient, ProwlarrClient } from 'tsarr';

// Initialize a client
const radarr = new RadarrClient({
  baseUrl: 'http://localhost:7878',
  apiKey: 'your-radarr-api-key'
});

const sonarr = new SonarrClient({
  baseUrl: 'http://localhost:8989', 
  apiKey: 'your-sonarr-api-key'
});
```

## Environment Variables

For security, use environment variables for API keys:

```typescript
const radarr = new RadarrClient({
  baseUrl: process.env.RADARR_BASE_URL || 'http://localhost:7878',
  apiKey: process.env.RADARR_API_KEY!
});
```

## Common Operations

### System Information

```typescript
// Get system status
const status = await radarr.getSystemStatus();
console.log(`Version: ${status.data?.version}`);

// Health check
const health = await radarr.getHealth();
console.log(`Health issues: ${health.data?.length || 0}`);
```

### Managing Movies (Radarr)

```typescript
// Get all movies
const movies = await radarr.getMovies();

// Get specific movie
const movie = await radarr.getMovieById(123);

// Search for movies
const searchResults = await radarr.searchMovies('Inception');

// Add a movie
const newMovie = await radarr.addMovie({
  title: 'The Matrix',
  year: 1999,
  tmdbId: 603,
  qualityProfileId: 1,
  monitored: true,
  rootFolderPath: '/media/movies'
});

// Update movie
const updatedMovie = await radarr.updateMovie(movieId, {
  monitored: false
});

// Delete movie
await radarr.deleteMovie(movieId, { deleteFiles: true });
```

### Managing TV Shows (Sonarr)

```typescript
// Get all series
const series = await sonarr.getSeries();

// Get specific series
const show = await sonarr.getSeriesById(123);

// Search for series
const searchResults = await sonarr.searchSeries('Breaking Bad');

// Add series
const newSeries = await sonarr.addSeries({
  title: 'Breaking Bad',
  tvdbId: 81189,
  qualityProfileId: 1,
  monitored: true,
  rootFolderPath: '/media/tv'
});
```

### Queue Management

```typescript
// Get download queue
const queue = await radarr.getQueue();

// Remove item from queue
await radarr.deleteQueueItem(queueId);

// Grab release
await radarr.grabRelease(releaseGuid);
```

### Quality Management

```typescript
// Get quality profiles
const profiles = await radarr.getQualityProfiles();

// Get quality definitions
const definitions = await radarr.getQualityDefinitions();

// Update quality definition
await radarr.updateQualityDefinition(defId, {
  minSize: 1000,
  maxSize: 5000
});
```

### File Management

```typescript
// Get movie files
const movieFiles = await radarr.getMovieFiles();

// Delete movie file
await radarr.deleteMovieFile(fileId);

// Rename files
await radarr.renameFiles([fileId1, fileId2]);
```

## Error Handling

TsArr provides specific error types for different scenarios:

```typescript
import { ApiKeyError, ConnectionError, NotFoundError, ValidationError } from 'tsarr';

try {
  const movies = await radarr.getMovies();
} catch (error) {
  if (error instanceof ApiKeyError) {
    console.error('Invalid API key');
  } else if (error instanceof ConnectionError) {
    console.error('Could not connect to Radarr');
  } else if (error instanceof NotFoundError) {
    console.error('Resource not found');
  } else if (error instanceof ValidationError) {
    console.error('Invalid request data');
  }
}
```

## Advanced Usage

### Bulk Operations

```typescript
// Import multiple movies
const importResults = await radarr.importMovies([
  { path: '/path/to/movie1.mkv', movieId: 1 },
  { path: '/path/to/movie2.mkv', movieId: 2 }
]);

// Delete multiple movies
await radarr.deleteMovies([1, 2, 3], { deleteFiles: true });

// Update multiple series
await sonarr.updateSeries([
  { id: 1, monitored: false },
  { id: 2, monitored: true }
]);
```

### Custom Filters and Search

```typescript
// Search with filters
const recentMovies = await radarr.getMovies({
  sortKey: 'dateAdded',
  sortDirection: 'descending',
  page: 1,
  pageSize: 50
});

// Filter by status
const monitoredMovies = await radarr.getMovies({
  monitored: true
});
```

### Configuration Management

```typescript
// Get download client settings
const downloadClients = await radarr.getDownloadClients();

// Get indexer settings  
const indexers = await radarr.getIndexers();

// Update naming configuration
await radarr.updateNamingConfig({
  renameMovies: true,
  movieFolderFormat: '{Movie Title} ({Release Year})'
});
```

## TypeScript Tips

### Type Safety

All API responses are fully typed. Use TypeScript's intellisense for available properties:

```typescript
const movie = await radarr.getMovieById(123);
// movie.data is typed with all available properties
console.log(movie.data?.title); // ✅ Type-safe
console.log(movie.data?.invalidProp); // ❌ TypeScript error
```

### Async/Await vs Promises

All client methods return promises and work with both async/await and `.then()`:

```typescript
// Async/await (recommended)
const movies = await radarr.getMovies();

// Promise chains
radarr.getMovies()
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

## Performance Considerations

### Connection Pooling

TsArr uses Bun's native fetch API which handles connection pooling automatically.

### Rate Limiting

Be mindful of API rate limits. For bulk operations, add delays:

```typescript
for (const movie of movies) {
  await processMovie(movie);
  await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
}
```

### Memory Usage

For large libraries, use pagination:

```typescript
let page = 1;
let allMovies = [];

while (true) {
  const response = await radarr.getMovies({ page, pageSize: 100 });
  if (!response.data?.length) break;
  
  allMovies.push(...response.data);
  page++;
}
```

## Configuration Examples

### Multi-Instance Setup

```typescript
// Production instances
const prodRadarr = new RadarrClient({
  baseUrl: 'https://radarr.example.com',
  apiKey: process.env.PROD_RADARR_API_KEY!
});

const prodSonarr = new SonarrClient({
  baseUrl: 'https://sonarr.example.com', 
  apiKey: process.env.PROD_SONARR_API_KEY!
});

// Development instances
const devRadarr = new RadarrClient({
  baseUrl: 'http://localhost:7878',
  apiKey: process.env.DEV_RADARR_API_KEY!
});
```

### Custom Headers and Options

```typescript
const radarr = new RadarrClient({
  baseUrl: 'http://localhost:7878',
  apiKey: 'your-api-key',
  // Custom fetch options are passed through
  timeout: 30000,
  headers: {
    'User-Agent': 'MyApp/1.0'
  }
});
```

## Next Steps

- See [Examples](./examples.md) for real-world automation scripts
- Check the [Examples Directory](../examples/) for runnable code
- Explore the [API Documentation](https://robbeverhelst.github.io/tsarr/) for complete method reference