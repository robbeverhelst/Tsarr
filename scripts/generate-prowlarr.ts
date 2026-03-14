#!/usr/bin/env bun

import { createClient } from '@hey-api/openapi-ts';

async function generateProwlarrClient() {
  const input = process.env.PROWLARR_OPENAPI_URL || './specs/prowlarr-openapi.json';
  console.log('🔍 Generating Prowlarr API client...');
  console.log(`📡 Using OpenAPI spec from: ${input}`);

  await createClient({
    input,
    output: 'src/generated/prowlarr',
  });

  console.log('✅ Prowlarr client generated successfully!');
}

if (import.meta.main) {
  generateProwlarrClient().catch(console.error);
}
