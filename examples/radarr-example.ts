#!/usr/bin/env bun

import { RadarrClient } from '../src/index.js';

async function testRadarrClient() {
  const baseUrl = process.env.RADARR_BASE_URL || 'http://localhost:7878';
  const apiKey = process.env.RADARR_API_KEY;

  if (!apiKey) {
    console.log('⚠️  Set RADARR_API_KEY environment variable to test against live instance');
    console.log('📚 Example: RADARR_API_KEY=your_api_key bun run examples/radarr-example.ts');
    return;
  }

  console.log('🎬 Testing Radarr client...');
  console.log(`📡 Connecting to: ${baseUrl}`);

  try {
    // Initialize the client
    const radarr = new RadarrClient({
      baseUrl,
      apiKey,
    });

    // Test system status
    console.log('\n📊 Fetching system status...');
    const status = await radarr.getSystemStatus();
    console.log('✅ System version:', status.data?.version);
    console.log('   App name:', status.data?.appName);
    console.log('   Branch:', status.data?.branch);

    // Test health check
    console.log('\n🏥 Checking system health...');
    const health = await radarr.getHealth();
    if (health.data && Array.isArray(health.data)) {
      console.log(`✅ Health issues: ${health.data.length || 'None'}`);
      health.data.forEach((issue: any) => {
        console.log(`   ⚠️  ${issue.type}: ${issue.message}`);
      });
    }

    // Test fetching movies
    console.log('\n🎬 Fetching movies...');
    const movies = await radarr.getMovies();
    if (movies.data && Array.isArray(movies.data)) {
      console.log(`✅ Found ${movies.data.length} movies`);

      // Show first 3 movies
      movies.data.slice(0, 3).forEach((movie: any) => {
        console.log(`   - ${movie.title} (${movie.year})`);
      });
    }

    // Test searching for a movie
    console.log('\n🔍 Searching for "Inception"...');
    const searchResults = await radarr.searchMovies('Inception');
    if (searchResults.data && Array.isArray(searchResults.data)) {
      console.log(`✅ Found ${searchResults.data.length} results`);
      searchResults.data.slice(0, 3).forEach((movie: any) => {
        console.log(`   - ${movie.title} (${movie.year}) - TMDB: ${movie.tmdbId}`);
      });
    }

    console.log('\n✅ All Radarr client tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Radarr client test failed:', error);
    if (error instanceof Error) {
      console.error('   Error details:', error.message);
    }
  }
}

if (import.meta.main) {
  testRadarrClient();
}
