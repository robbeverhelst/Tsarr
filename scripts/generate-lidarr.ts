#!/usr/bin/env bun

import { createClient } from '@hey-api/openapi-ts';

async function generateLidarrClient() {
  const input = process.env.LIDARR_OPENAPI_URL || './specs/lidarr-openapi.json';
  console.log('🎵 Generating Lidarr API client...');
  console.log(`📡 Using OpenAPI spec from: ${input}`);

  await createClient({
    input,
    output: 'src/generated/lidarr',
  });

  console.log('✅ Lidarr client generated successfully!');
}

if (import.meta.main) {
  generateLidarrClient().catch(console.error);
}
