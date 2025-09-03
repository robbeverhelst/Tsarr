#!/usr/bin/env bun

import { RadarrClient, SonarrClient } from '../src/index.js';

async function healthCheck() {
  const services = [
    {
      name: 'Radarr',
      client: new RadarrClient({
        baseUrl: process.env.RADARR_BASE_URL!,
        apiKey: process.env.RADARR_API_KEY!,
      }),
    },
    {
      name: 'Sonarr',
      client: new SonarrClient({
        baseUrl: process.env.SONARR_BASE_URL!,
        apiKey: process.env.SONARR_API_KEY!,
      }),
    },
  ];

  console.log('🏥 Servarr Health Check');
  console.log('=======================');

  for (const service of services) {
    try {
      const start = Date.now();
      const status = await service.client.getSystemStatus();
      const responseTime = Date.now() - start;

      console.log(`✅ ${service.name}: Online`);
      console.log(`   Version: ${status.data?.version || 'Unknown'}`);
      console.log(`   Response: ${responseTime}ms`);

      // Check for any health issues
      try {
        const health = await service.client.getHealth();
        const issues = health.data?.filter((h: any) => h.type === 'error') || [];

        if (issues.length > 0) {
          console.log(`   ⚠️  ${issues.length} health issues detected`);
          issues.forEach((issue: any) => {
            console.log(`      - ${issue.message}`);
          });
        } else {
          console.log(`   ✅ No health issues`);
        }
      } catch {
        console.log(`   ⚠️  Could not check health status`);
      }
    } catch (error) {
      console.log(`❌ ${service.name}: Offline`);
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

if (import.meta.main) {
  healthCheck();
}
