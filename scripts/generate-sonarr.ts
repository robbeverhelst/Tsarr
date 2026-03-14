#!/usr/bin/env bun

import { createClient } from '@hey-api/openapi-ts';

const SONARR_OPENAPI_URL =
  process.env.SONARR_OPENAPI_URL || './specs/sonarr-openapi.json';

async function generateSonarrClient() {
  console.log('📺 Generating Sonarr TypeScript client...');
  console.log(`📡 Using OpenAPI spec from: ${SONARR_OPENAPI_URL}`);

  try {
    await createClient({
      input: SONARR_OPENAPI_URL,
      output: './src/generated/sonarr',
    });

    console.log('✅ Sonarr client generated successfully!');
  } catch (error) {
    console.error('❌ Failed to generate Sonarr client:', error);
    process.exit(1);
  }
}

generateSonarrClient();
