import { defineCommand } from 'citty';
import consola from 'consola';
import { BazarrClient } from '../../clients/bazarr.js';
import { LidarrClient } from '../../clients/lidarr.js';
import { ProwlarrClient } from '../../clients/prowlarr.js';
import { RadarrClient } from '../../clients/radarr.js';
import { ReadarrClient } from '../../clients/readarr.js';
import { SonarrClient } from '../../clients/sonarr.js';
import { getServiceConfig, SERVICES } from '../config.js';
import { detectFormat, formatOutput } from '../output.js';

const clientFactories: Record<
  (typeof SERVICES)[number],
  (config: any) => { getSystemStatus: () => Promise<any> }
> = {
  radarr: c => new RadarrClient(c),
  sonarr: c => new SonarrClient(c),
  lidarr: c => new LidarrClient(c),
  readarr: c => new ReadarrClient(c),
  prowlarr: c => new ProwlarrClient(c),
  bazarr: c => new BazarrClient(c),
};

interface DoctorResult {
  service: string;
  configured: boolean;
  status: 'ok' | 'fail' | 'not configured';
  version?: string;
  baseUrl?: string;
  error?: string;
}

export const doctor = defineCommand({
  meta: {
    name: 'doctor',
    description: 'Test all configured service connections',
  },
  args: {
    json: { type: 'boolean', description: 'Output as JSON' },
    table: { type: 'boolean', description: 'Output as table' },
    quiet: { type: 'boolean', alias: 'q', description: 'Output service names only' },
  },
  async run({ args }) {
    const format = detectFormat(args);
    let hasAny = false;
    const results: DoctorResult[] = [];

    if (format === 'table') {
      consola.info('Checking connections...\n');
    }

    for (const service of SERVICES) {
      const svcConfig = getServiceConfig(service);
      if (!svcConfig) {
        results.push({
          service,
          configured: false,
          status: 'not configured',
        });
        continue;
      }

      hasAny = true;
      try {
        const factory = clientFactories[service];
        if (!factory) {
          results.push({
            service,
            configured: true,
            status: 'fail',
            baseUrl: svcConfig.baseUrl,
            error: 'No client factory available',
          });
          continue;
        }
        const client = factory(svcConfig);
        const status = await client.getSystemStatus();
        const version = extractVersion(service, status) ?? '?';
        if (version === '?') {
          throw new Error('Unexpected response payload');
        }
        results.push({
          service,
          configured: true,
          status: 'ok',
          version: String(version),
          baseUrl: svcConfig.baseUrl,
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          service,
          configured: true,
          status: 'fail',
          baseUrl: svcConfig.baseUrl,
          error: msg,
        });
      }
    }

    const hadFailure = !hasAny || results.some(r => r.status === 'fail');

    if (!hasAny && format === 'table') {
      consola.warn('\nNo services configured. Run `tsarr config init` to set up.');
    }

    formatOutput(results, {
      format,
      columns: ['service', 'status', 'version', 'baseUrl', 'error'],
      idField: 'service',
    });

    if (hadFailure) {
      process.exitCode = 1;
    }
  },
});

function extractVersion(service: string, status: unknown): string | null {
  const data = (status as any)?.data ?? status;

  if (typeof data === 'string') {
    return null;
  }

  if (service === 'bazarr') {
    return data?.data?.bazarr_version ?? data?.bazarr_version ?? null;
  }

  return data?.version ?? (status as any)?.version ?? null;
}
