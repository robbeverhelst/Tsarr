import { defineCommand } from 'citty';
import consola from 'consola';
import { BazarrClient } from '../../clients/bazarr.js';
import { LidarrClient } from '../../clients/lidarr.js';
import { ProwlarrClient } from '../../clients/prowlarr.js';
import { RadarrClient } from '../../clients/radarr.js';
import { ReadarrClient } from '../../clients/readarr.js';
import { SonarrClient } from '../../clients/sonarr.js';
import { getServiceConfig, loadConfig, SERVICES } from '../config.js';

const clientFactories: Record<string, (config: any) => { getSystemStatus: () => Promise<any> }> = {
  radarr: c => new RadarrClient(c),
  sonarr: c => new SonarrClient(c),
  lidarr: c => new LidarrClient(c),
  readarr: c => new ReadarrClient(c),
  prowlarr: c => new ProwlarrClient(c),
  bazarr: c => new BazarrClient(c),
};

export const doctor = defineCommand({
  meta: {
    name: 'doctor',
    description: 'Test all configured service connections',
  },
  async run() {
    consola.info('Checking connections...\n');
    const _config = loadConfig();
    let hasAny = false;

    for (const service of SERVICES) {
      const svcConfig = getServiceConfig(service);
      if (!svcConfig) {
        console.log(`  ${service.padEnd(10)} (not configured)`);
        continue;
      }

      hasAny = true;
      try {
        const factory = clientFactories[service];
        if (!factory) {
          console.log(`  ${service.padEnd(10)} ${svcConfig.baseUrl.padEnd(30)} —         SKIP`);
          continue;
        }
        const client = factory(svcConfig);
        const status = await client.getSystemStatus();
        const version = (status as any)?.data?.version ?? (status as any)?.version ?? '?';
        console.log(`  ${service.padEnd(10)} ${svcConfig.baseUrl.padEnd(30)} v${version}    OK`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.log(
          `  ${service.padEnd(10)} ${svcConfig.baseUrl.padEnd(30)} —         FAIL  ${msg}`
        );
      }
    }

    if (!hasAny) {
      consola.warn('\nNo services configured. Run `tsarr config init` to set up.');
    }
    console.log();
  },
});
