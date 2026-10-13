#!/usr/bin/env bun

import { RadarrClient } from '../src/index.js';

/** The media files endpoint has no response schema in Radarr's OpenAPI spec. */
type MediaFile = { name: string; path: string; size: number };

async function testSingleMovieImport() {
  const baseUrl = process.env.RADARR_BASE_URL;
  const apiKey = process.env.RADARR_API_KEY;

  if (!baseUrl || !apiKey) {
    console.error('⚠️  Missing required environment variables');
    console.log('📚 Set RADARR_BASE_URL and RADARR_API_KEY environment variables');
    console.log(
      '📚 Example: RADARR_BASE_URL=http://localhost:7878 RADARR_API_KEY=your-api-key bun run examples/test-single-movie.ts'
    );
    process.exit(1);
  }

  console.log('🎬 Testing Single Movie Import');
  console.log(`📡 Connecting to: ${baseUrl}`);

  try {
    const radarr = new RadarrClient({ baseUrl, apiKey });

    // Step 1: Get one specific movie file
    console.log('\n🔍 Getting one movie file from /media/movies...');
    const mediaFilesResponse = await radarr.getMediaFiles('/media/movies');
    const mediaFiles = (mediaFilesResponse.data ?? []) as MediaFile[];

    if (mediaFiles.length === 0) {
      console.log('❌ No media files found!');
      return;
    }

    const testMovie = mediaFiles[0];
    console.log(`🎯 Testing with: ${testMovie.name}`);
    console.log(`📄 File path: ${testMovie.path}`);
    console.log(`📊 File size: ${Math.round(testMovie.size / 1024 / 1024)}MB`);

    // Step 2: Search for this movie in TMDB to get proper metadata
    console.log('\n🔍 Searching for movie metadata...');
    const movieName = testMovie.name.split('.')[0]; // Get name before first dot
    const searchResults = await radarr.searchMovies(movieName);

    console.log(`📝 Found ${searchResults.data?.length || 0} potential matches`);
    if (searchResults.data && searchResults.data.length > 0) {
      const firstMatch = searchResults.data[0];
      console.log(`🎬 Best match: ${firstMatch.title} (${firstMatch.year})`);
      console.log(`📋 TMDB ID: ${firstMatch.tmdbId}`);

      // Step 3: Try to add this movie to the library
      console.log('\n➕ Adding movie to library...');
      try {
        const addMovieResponse = await radarr.addMovie({
          title: firstMatch.title,
          year: firstMatch.year,
          tmdbId: firstMatch.tmdbId,
          titleSlug: firstMatch.titleSlug,
          qualityProfileId: 1, // Default quality profile
          monitored: true,
          rootFolderPath: '/media/movies',
          images: firstMatch.images,
          addOptions: {
            searchForMovie: false, // Don't search for downloads
            ignoreEpisodesWithFiles: false,
            ignoreEpisodesWithoutFiles: false,
          },
        });

        console.log('✅ Movie added to library successfully!');
        console.log(`🆔 Movie ID: ${addMovieResponse.data?.id}`);

        // Step 4: Try to manually import the file
        console.log('\n📥 Manually importing the file...');
        const importResponse = await radarr.importMovies([
          {
            path: testMovie.path,
            movieId: addMovieResponse.data?.id,
            quality: { quality: { id: 1, name: 'Unknown' } },
            languages: [{ id: 1, name: 'English' }],
          },
        ]);

        console.log('✅ Manual import submitted!');
        console.log('📋 Import result:', importResponse.data);
      } catch (addError) {
        console.log('⚠️  Could not add movie:', addError);
      }
    } else {
      console.log('❌ No metadata found for this movie');
    }

    // Step 5: Check final state
    console.log('\n📊 Final check...');
    const finalMovies = await radarr.getMovies();
    console.log(`🎬 Total movies in library: ${finalMovies.data?.length || 0}`);
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

if (import.meta.main) {
  testSingleMovieImport();
}
