#!/usr/bin/env bun

import { LidarrClient, RadarrClient, SonarrClient } from '../src/index.js';

async function benchmarkPerformance() {
  console.log('🚀 TsArr Performance Benchmark');

  const radarr = new RadarrClient({
    baseUrl: process.env.RADARR_BASE_URL || 'http://localhost:7878',
    apiKey: process.env.RADARR_API_KEY || 'test-key',
  });

  // Test client initialization speed
  console.log('\n⏱️  Client Initialization:');
  const initStart = performance.now();

  const clients = [
    new RadarrClient({ baseUrl: 'http://localhost:7878', apiKey: 'test' }),
    new SonarrClient({ baseUrl: 'http://localhost:8989', apiKey: 'test' }),
    new LidarrClient({ baseUrl: 'http://localhost:8686', apiKey: 'test' }),
  ];

  const initTime = performance.now() - initStart;
  console.log(`✅ ${clients.length} clients initialized in ${initTime.toFixed(2)}ms`);

  // Test API call performance (if server available)
  if (process.env.RADARR_API_KEY) {
    console.log('\n⏱️  API Call Performance:');

    const apiTests = [
      { name: 'System Status', fn: () => radarr.getSystemStatus() },
      { name: 'Health Check', fn: () => radarr.getHealth() },
      { name: 'Get Movies', fn: () => radarr.getMovies() },
      { name: 'Get Root Folders', fn: () => radarr.getRootFolders() },
    ];

    for (const test of apiTests) {
      try {
        const start = performance.now();
        await test.fn();
        const duration = performance.now() - start;
        console.log(`✅ ${test.name}: ${duration.toFixed(2)}ms`);
      } catch (error) {
        console.log(`❌ ${test.name}: Failed (${error})`);
      }
    }
  }

  // Memory usage
  console.log('\n💾 Memory Usage:');
  const memUsage = process.memoryUsage();
  console.log(`📊 RSS: ${Math.round(memUsage.rss / 1024 / 1024)}MB`);
  console.log(`📊 Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
  console.log(`📊 Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);

  console.log('\n🎉 Benchmark complete!');
}

if (import.meta.main) {
  benchmarkPerformance().catch(console.error);
}
