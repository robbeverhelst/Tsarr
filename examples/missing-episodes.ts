#!/usr/bin/env bun

import { SonarrClient } from '../src/index.js';

async function findMissingEpisodes() {
  const baseUrl = process.env.SONARR_BASE_URL;
  const apiKey = process.env.SONARR_API_KEY;

  if (!baseUrl || !apiKey) {
    console.error('⚠️  Missing required environment variables');
    console.log('📚 Set SONARR_BASE_URL and SONARR_API_KEY environment variables');
    console.log('📚 Example: SONARR_BASE_URL=http://localhost:8989 SONARR_API_KEY=your-api-key bun run examples/missing-episodes.ts');
    process.exit(1);
  }

  const sonarr = new SonarrClient({ baseUrl, apiKey });

  console.log('📺 Sonarr Missing Episodes Finder');
  console.log('==================================');

  try {
    const seriesResponse = await sonarr.getSeries();
    const series = seriesResponse.data || [];
    
    console.log(`📊 Total series in library: ${series.length}`);

    const missingEpisodes = [];
    let totalMissing = 0;

    for (const show of series) {
      const episodeCount = show.episodeCount || 0;
      const episodeFileCount = show.episodeFileCount || 0;
      const missingCount = episodeCount - episodeFileCount;

      if (missingCount > 0 && show.monitored) {
        const percentage = Math.round((episodeFileCount / episodeCount) * 100);
        
        missingEpisodes.push({
          title: show.title,
          missing: missingCount,
          total: episodeCount,
          percentage,
          status: show.status
        });
        
        totalMissing += missingCount;
      }
    }

    // Sort by most missing episodes
    missingEpisodes.sort((a, b) => b.missing - a.missing);

    console.log(`\n📉 Shows with missing episodes: ${missingEpisodes.length}`);
    console.log(`📺 Total missing episodes: ${totalMissing}`);

    if (missingEpisodes.length === 0) {
      console.log('✅ All monitored shows are complete!');
      return;
    }

    console.log('\n📋 Missing Episodes by Show:');
    console.log('============================');

    missingEpisodes.forEach((show, index) => {
      const status = show.status === 'continuing' ? '📺' : '🏁';
      console.log(`${index + 1}. ${status} ${show.title}`);
      console.log(`   Missing: ${show.missing}/${show.total} episodes (${show.percentage}% complete)`);
      console.log(`   Status: ${show.status}`);
    });

    // Summary by status
    const continuing = missingEpisodes.filter(s => s.status === 'continuing');
    const ended = missingEpisodes.filter(s => s.status === 'ended');

    console.log('\n📊 Summary:');
    console.log(`📺 Continuing shows: ${continuing.length} (${continuing.reduce((sum, s) => sum + s.missing, 0)} missing episodes)`);
    console.log(`🏁 Ended shows: ${ended.length} (${ended.reduce((sum, s) => sum + s.missing, 0)} missing episodes)`);

    // Top priority shows (ended with most missing)
    const priority = ended.slice(0, 5);
    if (priority.length > 0) {
      console.log('\n🎯 Priority Downloads (Ended Shows):');
      priority.forEach((show, index) => {
        console.log(`   ${index + 1}. ${show.title} - ${show.missing} episodes missing`);
      });
    }

    console.log('\n💡 Next steps:');
    console.log('   - Check download queue for these shows');
    console.log('   - Search for missing episodes manually');
    console.log('   - Consider adjusting quality profiles for hard-to-find content');

  } catch (error) {
    console.error('❌ Missing episodes check failed:', error);
  }
}

if (import.meta.main) {
  findMissingEpisodes();
}