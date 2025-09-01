#!/usr/bin/env bun

import { SonarrClient } from '../src/index.js';

async function testSonarrClient() {
  const baseUrl = process.env.SONARR_BASE_URL || 'http://localhost:8989';
  const apiKey = process.env.SONARR_API_KEY;

  if (!apiKey) {
    console.log('⚠️  Set SONARR_API_KEY environment variable to test against live instance');
    console.log('📚 Example: SONARR_API_KEY=your_api_key bun run examples/sonarr-example.ts');
    return;
  }

  console.log('📺 Testing Sonarr client...');
  console.log(`📡 Connecting to: ${baseUrl}`);

  try {
    // Initialize the client
    const sonarr = new SonarrClient({
      baseUrl,
      apiKey,
    });

    // Test basic API
    console.log('\n📊 Testing basic API...');
    const apiInfo = await sonarr.getApi();
    console.log('✅ API response received');

    // Test fetching series
    console.log('\n📺 Fetching TV series...');
    const series = await sonarr.getSeries();
    if (series.data && Array.isArray(series.data)) {
      console.log(`✅ Found ${series.data.length} series`);

      // Show first 3 series
      series.data.slice(0, 3).forEach((show: any) => {
        console.log(`   - ${show.title} (${show.year}) - ${show.seasonCount} seasons`);
      });
    }

    // Test searching for a series
    console.log('\n🔍 Searching for "Breaking Bad"...');
    const searchResults = await sonarr.searchSeries('Breaking Bad');
    if (searchResults.data && Array.isArray(searchResults.data)) {
      console.log(`✅ Found ${searchResults.data.length} results`);
      searchResults.data.slice(0, 3).forEach((show: any) => {
        console.log(`   - ${show.title} (${show.year}) - TVDB: ${show.tvdbId}`);
      });
    }

    // Note: Episode APIs not available in Sonarr v5

    console.log('\n✅ All Sonarr client tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Sonarr client test failed:', error);
    if (error instanceof Error) {
      console.error('   Error details:', error.message);
    }
  }
}

if (import.meta.main) {
  testSonarrClient();
}
