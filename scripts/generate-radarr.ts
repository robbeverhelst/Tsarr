#!/usr/bin/env bun

import { createClient } from '@hey-api/openapi-ts';

const RADARR_OPENAPI_URL =
  process.env.RADARR_OPENAPI_URL ||
  'https://raw.githubusercontent.com/Radarr/Radarr/develop/src/Radarr.Api.V3/openapi.json';

async function generateRadarrClient() {
  console.log('🎬 Generating Radarr TypeScript client...');
  console.log(`📡 Fetching OpenAPI spec from: ${RADARR_OPENAPI_URL}`);

  try {
    await createClient({
      input: RADARR_OPENAPI_URL,
      output: './src/generated/radarr',
      client: '@hey-api/client-fetch',
    });

    console.log('✅ Radarr client generated successfully!');
  } catch (error) {
    console.error('❌ Failed to generate Radarr client:', error);
    process.exit(1);
  }
}

generateRadarrClient();
