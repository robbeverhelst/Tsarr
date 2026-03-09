#!/usr/bin/env bun

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
      'https://raw.githubusercontent.com/Sonarr/Sonarr/develop/src/Sonarr.Api.V3/openapi.json',
    outputPath: './src/generated/sonarr',
    clientName: 'SonarrClient',
  },
  {
    name: 'Lidarr',
    envVar: 'LIDARR_OPENAPI_URL',
    defaultUrl:
      'https://raw.githubusercontent.com/lidarr/Lidarr/develop/src/Lidarr.Api.V1/openapi.json',
    outputPath: './src/generated/lidarr',
    clientName: 'LidarrClient',
  },
  {
    name: 'Readarr',
    envVar: 'READARR_OPENAPI_URL',
    defaultUrl:
      'https://raw.githubusercontent.com/Readarr/Readarr/develop/src/Readarr.Api.V1/openapi.json',
    outputPath: './src/generated/readarr',
    clientName: 'ReadarrClient',
  },
  {
    name: 'Prowlarr',
    envVar: 'PROWLARR_OPENAPI_URL',
    defaultUrl:
      'https://raw.githubusercontent.com/Prowlarr/Prowlarr/develop/src/Prowlarr.Api.V1/openapi.json',
    outputPath: './src/generated/prowlarr',
    clientName: 'ProwlarrClient',
  },
  {
    name: 'Bazarr',
    envVar: 'BAZARR_OPENAPI_URL',
    defaultUrl: './specs/bazarr-openapi.json',
    outputPath: './src/generated/bazarr',
    clientName: 'BazarrClient',
  },
];

async function generateClient(app: ServarrApp) {
  const url = process.env[app.envVar] || app.defaultUrl;
  const input = prepareSpecInput(app, url);

  console.log(`📡 Generating ${app.name} client from: ${input.display}`);

  try {
    await createClient({
      input: input.path,
      output: app.outputPath,
    });

    console.log(`✅ ${app.name} client generated successfully!`);
  } catch (error) {
    console.error(`❌ Failed to generate ${app.name} client:`, error);
    throw error;
  } finally {
    input.cleanup?.();
  }
}

function prepareSpecInput(
  app: ServarrApp,
  inputPath: string
): {
  path: string;
  display: string;
  cleanup?: () => void;
} {
  if (app.name !== 'Bazarr') {
    return { path: inputPath, display: inputPath };
  }

  const spec = JSON.parse(readFileSync(inputPath, 'utf-8')) as {
    basePath?: string;
    paths?: Record<string, unknown>;
  };

  if (!spec.basePath || !spec.paths) {
    return { path: inputPath, display: inputPath };
  }

  const basePath = spec.basePath.endsWith('/') ? spec.basePath.slice(0, -1) : spec.basePath;
  const rewrittenPaths = Object.fromEntries(
    Object.entries(spec.paths).map(([path, value]) => [`${basePath}${path}`, value])
  );

  const normalizedSpec = {
    ...spec,
    paths: rewrittenPaths,
  };
  delete normalizedSpec.basePath;

  const tempDir = mkdtempSync(join(tmpdir(), 'tsarr-bazarr-spec-'));
  const tempPath = join(tempDir, 'bazarr-openapi.normalized.json');
  writeFileSync(tempPath, `${JSON.stringify(normalizedSpec, null, 2)}\n`);

  return {
    path: tempPath,
    display: `${inputPath} (normalized with ${basePath})`,
    cleanup: () => rmSync(tempDir, { force: true, recursive: true }),
  };
}

async function generateAllClients() {
  console.log('🚀 Generating all Servarr API clients...');

  for (const app of SERVARR_APPS) {
    await generateClient(app);
  }

  console.log('🎉 All clients generated successfully!');
}

generateAllClients().catch(error => {
  console.error('💥 Generation failed:', error);
  process.exit(1);
});
