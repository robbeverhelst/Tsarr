#!/usr/bin/env bun

import { createClient } from '@hey-api/openapi-ts';

async function generateReadarrClient() {
  const input = process.env.READARR_OPENAPI_URL || './specs/readarr-openapi.json';
  console.log('📚 Generating Readarr API client...');
  console.log(`📡 Using OpenAPI spec from: ${input}`);

  await createClient({
    input,
    output: 'src/generated/readarr',
  });

  console.log('✅ Readarr client generated successfully!');
}

if (import.meta.main) {
  generateReadarrClient().catch(console.error);
}
