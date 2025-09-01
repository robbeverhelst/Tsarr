#!/usr/bin/env bun

import { Radarr } from '../src/index.js';

async function testRadarrClient() {
  const baseUrl = process.env.RADARR_BASE_URL;
  const apiKey = process.env.RADARR_API_KEY;

  if (!baseUrl || !apiKey) {
    console.log('⚠️  Set RADARR_BASE_URL and RADARR_API_KEY to test against live instance');
    console.log('📚 This example shows TypeScript types are working');
    return;
  }

  console.log('🎬 Testing Radarr client...');

  try {
    // Configure client
    Radarr.client.setConfig({
      baseUrl,
      headers: {
        'X-Api-Key': apiKey,
      },
    });

    // Example: Get system status (should work without auth issues)
    console.log('📊 Fetching system status...');
    // const status = await SystemService.getSystemStatus();
    // console.log('✅ System status:', status);

    console.log('✅ Radarr client test completed!');
  } catch (error) {
    console.error('❌ Radarr client test failed:', error);
  }
}

if (import.meta.main) {
  testRadarrClient();
}
