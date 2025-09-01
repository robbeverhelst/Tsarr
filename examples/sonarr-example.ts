#!/usr/bin/env bun

import { Sonarr } from '../src/index.js';

async function testSonarrClient() {
  const baseUrl = process.env.SONARR_BASE_URL;
  const apiKey = process.env.SONARR_API_KEY;

  if (!baseUrl || !apiKey) {
    console.log('⚠️  Set SONARR_BASE_URL and SONARR_API_KEY to test against live instance');
    console.log('📚 This example shows TypeScript types are working');
    return;
  }

  console.log('📺 Testing Sonarr client...');

  try {
    // Configure client
    Sonarr.client.setConfig({
      baseUrl,
      headers: {
        'X-Api-Key': apiKey,
      },
    });

    console.log('✅ Sonarr client test completed!');
  } catch (error) {
    console.error('❌ Sonarr client test failed:', error);
  }
}

if (import.meta.main) {
  testSonarrClient();
}
