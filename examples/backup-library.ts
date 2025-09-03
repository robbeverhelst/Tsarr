#!/usr/bin/env bun

import { writeFileSync } from 'node:fs';
import { RadarrClient, SonarrClient } from '../src/index.js';

async function backupLibrary() {
  const timestamp = new Date().toISOString().split('T')[0];

  console.log('💾 Servarr Library Backup');
  console.log('=========================');

  const backup = {
    timestamp: new Date().toISOString(),
    radarr: null as any,
    sonarr: null as any,
  };

  // Backup Radarr
  if (process.env.RADARR_BASE_URL && process.env.RADARR_API_KEY) {
    console.log('\n📽️  Backing up Radarr...');

    try {
      const radarr = new RadarrClient({
        baseUrl: process.env.RADARR_BASE_URL,
        apiKey: process.env.RADARR_API_KEY,
      });

      const [movies, rootFolders, status] = await Promise.all([
        radarr.getMovies(),
        radarr.getRootFolders(),
        radarr.getSystemStatus(),
      ]);

      backup.radarr = {
        version: status.data?.version,
        movies: movies.data || [],
        rootFolders: rootFolders.data || [],
        movieCount: movies.data?.length || 0,
        totalSize:
          movies.data?.reduce((sum: number, movie: any) => sum + (movie.sizeOnDisk || 0), 0) || 0,
      };

      console.log(`   ✅ ${backup.radarr.movieCount} movies backed up`);
      console.log(
        `   💾 Total size: ${(backup.radarr.totalSize / 1024 / 1024 / 1024).toFixed(2)} GB`
      );
    } catch (error) {
      console.log(`   ❌ Radarr backup failed: ${error}`);
    }
  } else {
    console.log('⏭️  Skipping Radarr (credentials not provided)');
  }

  // Backup Sonarr
  if (process.env.SONARR_BASE_URL && process.env.SONARR_API_KEY) {
    console.log('\n📺 Backing up Sonarr...');

    try {
      const sonarr = new SonarrClient({
        baseUrl: process.env.SONARR_BASE_URL,
        apiKey: process.env.SONARR_API_KEY,
      });

      const [series, status] = await Promise.all([sonarr.getSeries(), sonarr.getSystemStatus()]);

      backup.sonarr = {
        version: status.data?.version,
        series: series.data || [],
        seriesCount: series.data?.length || 0,
        episodeCount:
          series.data?.reduce((sum: number, show: any) => sum + (show.episodeCount || 0), 0) || 0,
      };

      console.log(`   ✅ ${backup.sonarr.seriesCount} series backed up`);
      console.log(`   📺 Total episodes: ${backup.sonarr.episodeCount}`);
    } catch (error) {
      console.log(`   ❌ Sonarr backup failed: ${error}`);
    }
  } else {
    console.log('⏭️  Skipping Sonarr (credentials not provided)');
  }

  // Save backup
  const filename = `servarr-backup-${timestamp}.json`;
  writeFileSync(filename, JSON.stringify(backup, null, 2));

  console.log(`\n✅ Backup saved to: ${filename}`);
  console.log('\n📋 Backup Summary:');

  if (backup.radarr) {
    console.log(`   Radarr: ${backup.radarr.movieCount} movies`);
  }

  if (backup.sonarr) {
    console.log(`   Sonarr: ${backup.sonarr.seriesCount} series`);
  }

  console.log('\n💡 Store this backup file safely for disaster recovery!');

  return filename;
}

if (import.meta.main) {
  backupLibrary();
}
