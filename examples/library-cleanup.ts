#!/usr/bin/env bun

import { RadarrClient } from '../src/index.js';

async function libraryCleanup() {
  const baseUrl = process.env.RADARR_BASE_URL;
  const apiKey = process.env.RADARR_API_KEY;

  if (!baseUrl || !apiKey) {
    console.error('⚠️  Missing required environment variables');
    console.log('📚 Set RADARR_BASE_URL and RADARR_API_KEY environment variables');
    process.exit(1);
  }

  const radarr = new RadarrClient({ baseUrl, apiKey });

  console.log('🧹 Radarr Library Cleanup');
  console.log('=========================');

  try {
    // Get all movies
    const moviesResponse = await radarr.getMovies();
    const movies = moviesResponse.data || [];
    
    console.log(`📊 Total movies in library: ${movies.length}`);

    // Find movies without files
    const missingFiles = movies.filter((movie: any) => !movie.hasFile);
    console.log(`📁 Movies without files: ${missingFiles.length}`);

    if (missingFiles.length > 0) {
      console.log('\n📋 Movies missing files:');
      missingFiles.slice(0, 10).forEach((movie: any, index: number) => {
        console.log(`   ${index + 1}. ${movie.title} (${movie.year})`);
      });
      
      if (missingFiles.length > 10) {
        console.log(`   ... and ${missingFiles.length - 10} more`);
      }
    }

    // Find unmonitored movies
    const unmonitored = movies.filter((movie: any) => !movie.monitored);
    console.log(`\n👁️  Unmonitored movies: ${unmonitored.length}`);

    if (unmonitored.length > 0) {
      console.log('\n📋 Unmonitored movies:');
      unmonitored.slice(0, 10).forEach((movie: any, index: number) => {
        console.log(`   ${index + 1}. ${movie.title} (${movie.year})`);
      });
      
      if (unmonitored.length > 10) {
        console.log(`   ... and ${unmonitored.length - 10} more`);
      }
    }

    // Calculate disk usage
    const totalSize = movies.reduce((sum: number, movie: any) => 
      sum + (movie.sizeOnDisk || 0), 0
    );
    
    console.log(`\n💾 Total disk usage: ${(totalSize / 1024 / 1024 / 1024).toFixed(2)} GB`);
    
    const averageSize = totalSize / movies.length;
    console.log(`📊 Average movie size: ${(averageSize / 1024 / 1024 / 1024).toFixed(2)} GB`);

    // Find largest movies
    const largestMovies = movies
      .filter((movie: any) => movie.sizeOnDisk > 0)
      .sort((a: any, b: any) => (b.sizeOnDisk || 0) - (a.sizeOnDisk || 0))
      .slice(0, 5);

    console.log('\n🗃️  Largest movies:');
    largestMovies.forEach((movie: any, index: number) => {
      const size = (movie.sizeOnDisk / 1024 / 1024 / 1024).toFixed(2);
      console.log(`   ${index + 1}. ${movie.title} (${movie.year}) - ${size} GB`);
    });

    // Quality distribution
    const qualityCount: Record<string, number> = {};
    movies.forEach((movie: any) => {
      const quality = movie.movieFile?.quality?.quality?.name || 'No File';
      qualityCount[quality] = (qualityCount[quality] || 0) + 1;
    });

    console.log('\n🎯 Quality distribution:');
    Object.entries(qualityCount)
      .sort(([,a], [,b]) => b - a)
      .forEach(([quality, count]) => {
        console.log(`   ${quality}: ${count} movies`);
      });

    console.log('\n✅ Library cleanup analysis complete!');
    console.log('\n💡 Next steps:');
    console.log('   - Remove unmonitored movies you no longer want');
    console.log('   - Search for missing files');
    console.log('   - Consider upgrading low-quality files');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

if (import.meta.main) {
  libraryCleanup();
}