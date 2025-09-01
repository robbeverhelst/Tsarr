#!/usr/bin/env bun

import { createClient } from '@hey-api/openapi-ts';

async function generateLidarrClient() {
  console.log('🎵 Generating Lidarr API client...');

  await createClient({
    input: 'https://raw.githubusercontent.com/lidarr/Lidarr/develop/src/Lidarr.Api.V1/openapi.json',
    output: 'src/generated/lidarr',
    client: '@hey-api/client-fetch',
  });

  console.log('✅ Lidarr client generated successfully!');
}

if (import.meta.main) {
  generateLidarrClient().catch(console.error);
}
