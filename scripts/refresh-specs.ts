#!/usr/bin/env bun

import { existsSync, readFileSync } from 'node:fs';
import YAML from 'yaml';

interface ServiceSpec {
  name: string;
  envVar: string;
  defaultUrl?: string;
  outputPath: string;
  apiKeyEnvVar?: string;
}

const SERVICE_SPECS: ServiceSpec[] = [
  {
    name: 'Radarr',
    envVar: 'RADARR_OPENAPI_URL',
    defaultUrl:
      'https://raw.githubusercontent.com/Radarr/Radarr/develop/src/Radarr.Api.V3/openapi.json',
    outputPath: './specs/radarr-openapi.json',
  },
  {
    name: 'Sonarr',
    envVar: 'SONARR_OPENAPI_URL',
    defaultUrl:
      'https://raw.githubusercontent.com/Sonarr/Sonarr/develop/src/Sonarr.Api.V3/openapi.json',
    outputPath: './specs/sonarr-openapi.json',
  },
  {
    name: 'Lidarr',
    envVar: 'LIDARR_OPENAPI_URL',
    defaultUrl:
      'https://raw.githubusercontent.com/lidarr/Lidarr/develop/src/Lidarr.Api.V1/openapi.json',
    outputPath: './specs/lidarr-openapi.json',
  },
  {
    name: 'Readarr',
    envVar: 'READARR_OPENAPI_URL',
    defaultUrl:
      'https://raw.githubusercontent.com/Readarr/Readarr/develop/src/Readarr.Api.V1/openapi.json',
    outputPath: './specs/readarr-openapi.json',
  },
  {
    name: 'Prowlarr',
    envVar: 'PROWLARR_OPENAPI_URL',
    defaultUrl:
      'https://raw.githubusercontent.com/Prowlarr/Prowlarr/develop/src/Prowlarr.Api.V1/openapi.json',
    outputPath: './specs/prowlarr-openapi.json',
  },
  {
    name: 'Bazarr',
    envVar: 'BAZARR_OPENAPI_URL',
    outputPath: './specs/bazarr-openapi.json',
    apiKeyEnvVar: 'BAZARR_OPENAPI_API_KEY',
  },
  {
    name: 'qBittorrent',
    envVar: 'QBITTORRENT_OPENAPI_URL',
    defaultUrl:
      'https://raw.githubusercontent.com/qbittorrent-ecosystem/webui-api-openapi/master/specs/v2.8.3/build/openapi.yaml',
    outputPath: './specs/qbittorrent-openapi.json',
  },
];

async function fetchSpec(service: ServiceSpec) {
  const source = process.env[service.envVar] || service.defaultUrl;
  if (!source) {
    console.log(`⏭️  Skipping ${service.name}: ${service.envVar} is not set`);
    return { changed: false, skipped: true };
  }

  const headers = new Headers({
    Accept: 'application/json',
  });

  if (service.apiKeyEnvVar) {
    const apiKey = process.env[service.apiKeyEnvVar];
    if (apiKey) {
      headers.set('X-API-KEY', apiKey);
    }
  }

  console.log(`📥 Refreshing ${service.name} spec from: ${source}`);

  const response = await fetch(source, { headers });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${service.name} spec (${response.status} ${response.statusText})`
    );
  }

  const raw = await response.text();
  const parsed =
    source.endsWith('.yaml') || source.endsWith('.yml') ? YAML.parse(raw) : JSON.parse(raw);
  const next = `${JSON.stringify(parsed, null, 2)}\n`;
  const current = existsSync(service.outputPath) ? readFileSync(service.outputPath, 'utf-8') : null;
  const changed = current !== next;

  if (changed) {
    await Bun.write(service.outputPath, next);
    console.log(`✅ Updated ${service.outputPath}`);
  } else {
    console.log(`✅ No change for ${service.outputPath}`);
  }

  return { changed, skipped: false };
}

async function refreshAllSpecs() {
  console.log('🔄 Refreshing checked-in OpenAPI specs...');

  let changedCount = 0;
  let skippedCount = 0;

  for (const service of SERVICE_SPECS) {
    const result = await fetchSpec(service);
    if (result.changed) changedCount += 1;
    if (result.skipped) skippedCount += 1;
  }

  console.log(`\nDone. ${changedCount} spec file(s) updated, ${skippedCount} skipped.`);
}

refreshAllSpecs().catch(error => {
  console.error('💥 Spec refresh failed:', error);
  process.exit(1);
});
