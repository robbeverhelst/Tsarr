#!/usr/bin/env bun

import { createClient } from '@hey-api/openapi-ts';

async function generateProwlarrClient() {
  console.log('🔍 Generating Prowlarr API client...');

  await createClient({
    input:
      'https://raw.githubusercontent.com/Prowlarr/Prowlarr/develop/src/Prowlarr.Api.V1/openapi.json',
    output: 'src/generated/prowlarr',
    client: '@hey-api/client-fetch',
  });

  console.log('✅ Prowlarr client generated successfully!');
}

if (import.meta.main) {
  generateProwlarrClient().catch(console.error);
}
