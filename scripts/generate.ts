#!/usr/bin/env bun

import { createClient } from '@hey-api/openapi-ts';

interface ServarrApp {
  name: string;
  envVar: string;
  defaultUrl: string;
  outputPath: string;
  clientName: string;
}

const SERVARR_APPS: ServarrApp[] = [
  {
    name: 'Radarr',
    envVar: 'RADARR_OPENAPI_URL',
    defaultUrl:
      'https://raw.githubusercontent.com/Radarr/Radarr/develop/src/Radarr.Api.V3/openapi.json',
    outputPath: './src/generated/radarr',
    clientName: 'RadarrClient',
  },
  {
    name: 'Sonarr',
    envVar: 'SONARR_OPENAPI_URL',
    defaultUrl:
      'https://raw.githubusercontent.com/Sonarr/Sonarr/v5-develop/src/Sonarr.Api.V5/openapi.json',
    outputPath: './src/generated/sonarr',
    clientName: 'SonarrClient',
  },
];

async function generateClient(app: ServarrApp) {
  const url = process.env[app.envVar] || app.defaultUrl;

  console.log(`📡 Generating ${app.name} client from: ${url}`);

  try {
    await createClient({
      input: url,
      output: app.outputPath,
      client: '@hey-api/client-fetch',
    });

    console.log(`✅ ${app.name} client generated successfully!`);
  } catch (error) {
    console.error(`❌ Failed to generate ${app.name} client:`, error);
    throw error;
  }
}

async function generateAllClients() {
  console.log('🚀 Generating all Servarr API clients...');

  for (const app of SERVARR_APPS) {
    if (app.name === 'Radarr' || app.name === 'Sonarr' || process.env[app.envVar]) {
      await generateClient(app);
    } else {
      console.log(`⏭️  Skipping ${app.name} (${app.envVar} not set)`);
    }
  }

  console.log('🎉 All clients generated successfully!');
}

generateAllClients().catch(error => {
  console.error('💥 Generation failed:', error);
  process.exit(1);
});
