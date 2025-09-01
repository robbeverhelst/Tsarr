#!/usr/bin/env bun

import { RadarrClient } from '../src/index.js';

async function analyzeQuality() {
  const baseUrl = process.env.RADARR_BASE_URL;
  const apiKey = process.env.RADARR_API_KEY;

  if (!baseUrl || !apiKey) {
    console.error('⚠️  Missing required environment variables');
    console.log('📚 Set RADARR_BASE_URL and RADARR_API_KEY environment variables');
    process.exit(1);
  }

  const radarr = new RadarrClient({ baseUrl, apiKey });

  console.log('🎯 Movie Quality Analyzer');
  console.log('=========================');

  try {
    const moviesResponse = await radarr.getMovies();
    const movies = moviesResponse.data || [];
    
    console.log(`📊 Analyzing ${movies.length} movies...`);

    // Quality distribution
    const qualityStats: Record<string, {
      count: number;
      totalSize: number;
      movies: any[];
    }> = {};

    // Size categories
    const sizeCategories = {
      small: { limit: 2 * 1024 * 1024 * 1024, movies: [] as any[] }, // < 2GB
      medium: { limit: 8 * 1024 * 1024 * 1024, movies: [] as any[] }, // 2-8GB
      large: { limit: 20 * 1024 * 1024 * 1024, movies: [] as any[] }, // 8-20GB
      huge: { limit: Infinity, movies: [] as any[] } // > 20GB
    };

    let totalSize = 0;
    let moviesWithFiles = 0;

    for (const movie of movies) {
      if (!movie.hasFile) continue;
      
      moviesWithFiles++;
      const size = movie.sizeOnDisk || 0;
      totalSize += size;
      
      // Quality analysis
      const quality = movie.movieFile?.quality?.quality?.name || 'Unknown';
      
      if (!qualityStats[quality]) {
        qualityStats[quality] = { count: 0, totalSize: 0, movies: [] };
      }
      
      qualityStats[quality].count++;
      qualityStats[quality].totalSize += size;
      qualityStats[quality].movies.push(movie);

      // Size categorization
      if (size < sizeCategories.small.limit) {
        sizeCategories.small.movies.push(movie);
      } else if (size < sizeCategories.medium.limit) {
        sizeCategories.medium.movies.push(movie);
      } else if (size < sizeCategories.large.limit) {
        sizeCategories.large.movies.push(movie);
      } else {
        sizeCategories.huge.movies.push(movie);
      }
    }

    // Display quality distribution
    console.log('\n🎯 Quality Distribution:');
    console.log('========================');
    
    Object.entries(qualityStats)
      .sort(([,a], [,b]) => b.count - a.count)
      .forEach(([quality, stats]) => {
        const avgSize = (stats.totalSize / stats.count / 1024 / 1024 / 1024).toFixed(2);
        const percentage = ((stats.count / moviesWithFiles) * 100).toFixed(1);
        console.log(`${quality}:`);
        console.log(`   Count: ${stats.count} movies (${percentage}%)`);
        console.log(`   Avg Size: ${avgSize} GB`);
        console.log(`   Total: ${(stats.totalSize / 1024 / 1024 / 1024).toFixed(2)} GB`);
      });

    // Display size categories
    console.log('\n📏 Size Categories:');
    console.log('==================');
    console.log(`Small (< 2GB): ${sizeCategories.small.movies.length} movies`);
    console.log(`Medium (2-8GB): ${sizeCategories.medium.movies.length} movies`);
    console.log(`Large (8-20GB): ${sizeCategories.large.movies.length} movies`);
    console.log(`Huge (> 20GB): ${sizeCategories.huge.movies.length} movies`);

    // Show huge files
    if (sizeCategories.huge.movies.length > 0) {
      console.log('\n🐘 Huge Files (> 20GB):');
      sizeCategories.huge.movies
        .sort((a, b) => (b.sizeOnDisk || 0) - (a.sizeOnDisk || 0))
        .slice(0, 10)
        .forEach((movie, index) => {
          const size = (movie.sizeOnDisk / 1024 / 1024 / 1024).toFixed(2);
          const quality = movie.movieFile?.quality?.quality?.name || 'Unknown';
          console.log(`   ${index + 1}. ${movie.title} (${movie.year}) - ${size} GB [${quality}]`);
        });
    }

    // Identify upgrade candidates
    const lowQualityTerms = ['480p', '720p', 'HDTV', 'WEBDL-480p', 'DVD', 'SDTV'];
    const upgradeCandidates = [];

    for (const [quality, stats] of Object.entries(qualityStats)) {
      if (lowQualityTerms.some(term => quality.includes(term))) {
        upgradeCandidates.push(...stats.movies);
      }
    }

    if (upgradeCandidates.length > 0) {
      console.log(`\n⬆️  Upgrade Candidates: ${upgradeCandidates.length} movies`);
      
      // Show top candidates by popularity/rating
      const topCandidates = upgradeCandidates
        .filter(m => m.ratings?.value > 7) // High rated movies
        .sort((a, b) => (b.ratings?.value || 0) - (a.ratings?.value || 0))
        .slice(0, 10);

      if (topCandidates.length > 0) {
        console.log('\n🌟 Top Rated Movies for Quality Upgrade:');
        topCandidates.forEach((movie, index) => {
          const quality = movie.movieFile?.quality?.quality?.name || 'Unknown';
          const rating = movie.ratings?.value?.toFixed(1) || 'N/A';
          console.log(`   ${index + 1}. ${movie.title} (${movie.year}) - ${rating}/10 [${quality}]`);
        });
      }
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`Total Movies: ${movies.length}`);
    console.log(`With Files: ${moviesWithFiles}`);
    console.log(`Total Size: ${(totalSize / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`Average Size: ${(totalSize / moviesWithFiles / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`Upgrade Candidates: ${upgradeCandidates.length}`);

    console.log('\n💡 Recommendations:');
    if (upgradeCandidates.length > 0) {
      console.log('   - Consider upgrading high-rated low-quality movies');
    }
    if (sizeCategories.huge.movies.length > 10) {
      console.log('   - Review huge files for potential compression');
    }
    console.log('   - Monitor disk space regularly');

  } catch (error) {
    console.error('❌ Quality analysis failed:', error);
  }
}

if (import.meta.main) {
  analyzeQuality();
}