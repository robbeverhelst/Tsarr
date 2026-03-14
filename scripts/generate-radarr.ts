#!/usr/bin/env bun

import { createClient } from '@hey-api/openapi-ts';

const RADARR_OPENAPI_URL =
  process.env.RADARR_OPENAPI_URL || './specs/radarr-openapi.json';

async function generateRadarrClient() {
  console.log('🎬 Generating Radarr TypeScript client...');
  console.log(`📡 Using OpenAPI spec from: ${RADARR_OPENAPI_URL}`);

  try {
    await createClient({
      input: RADARR_OPENAPI_URL,
      output: './src/generated/radarr',
    });

    console.log('✅ Radarr client generated successfully!');
  } catch (error) {
    console.error('❌ Failed to generate Radarr client:', error);
    process.exit(1);
  }
}

generateRadarrClient();
