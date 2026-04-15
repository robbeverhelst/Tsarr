import { defineCommand } from 'citty';
import consola from 'consola';
import { BazarrClient } from '../../clients/bazarr';
import { LidarrClient } from '../../clients/lidarr';
import { ProwlarrClient } from '../../clients/prowlarr';
import { QBittorrentClient } from '../../clients/qbittorrent';
import { RadarrClient } from '../../clients/radarr';
import { ReadarrClient } from '../../clients/readarr';
import { SeerrClient } from '../../clients/seerr';
import { SonarrClient } from '../../clients/sonarr';
import { getServiceConfig, getServiceInstances, SERVICES } from '../config';
import { detectFormat, formatOutput } from '../output';

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
  qbittorrent: c => new QBittorrentClient(c),
  seerr: c => new SeerrClient(c),
};

interface DoctorResult {
  service: string;
  instance?: string;
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
    plain: { type: 'boolean', description: 'Output as TSV (no colors, for piping)' },
    quiet: { type: 'boolean', alias: 'q', description: 'Output service names only' },
    select: { type: 'string', description: 'Cherry-pick fields (comma-separated, JSON mode)' },
  },
  async run({ args }) {
    const format = detectFormat(args);
    let hasAny = false;
    const results: DoctorResult[] = [];

    if (format === 'table') {
      consola.info('Checking connections...\n');
    }

    let hasMultiInstance = false;
    for (const service of SERVICES) {
      const instances = getServiceInstances(service);
      if (instances.length === 0) {
        results.push({
          service,
          configured: false,
          status: 'not configured',
        });
        continue;
      }

      if (instances.length > 1) hasMultiInstance = true;

      for (const inst of instances) {
        const svcConfig = getServiceConfig(service, inst.name);
        if (!svcConfig) {
          results.push({
            service,
            ...(inst.name ? { instance: inst.name } : {}),
            configured: false,
            status: 'not configured',
          });
          continue;
        }

        hasAny = true;
        try {
          const client = clientFactories[service](svcConfig);
          const status = await client.getSystemStatus();
          if (status?.error !== undefined) {
            const err = status.error;
            const code = err?.cause?.code ?? err?.code;
            const cause = code ? { code } : undefined;
            const message = err?.cause?.message ?? err?.message ?? err?.code ?? 'Unknown API error';
            throw Object.assign(new Error(message), cause ? { cause } : {});
          }
          const version = extractVersion(service, status) ?? '?';
          if (version === '?') {
            throw new Error('Unexpected response payload');
          }
          results.push({
            service,
            ...(inst.name ? { instance: inst.name } : {}),
            configured: true,
            status: 'ok',
            version: String(version),
            baseUrl: svcConfig.baseUrl,
          });
        } catch (error) {
          results.push({
            service,
            ...(inst.name ? { instance: inst.name } : {}),
            configured: true,
            status: 'fail',
            baseUrl: svcConfig.baseUrl,
            error: classifyError(error),
          });
        }
      }
    }

    const hadFailure = !hasAny || results.some(r => r.status === 'fail');

    if (!hasAny && format === 'table') {
      consola.warn('\nNo services configured. Run `tsarr config init` to set up.');
    }

    const columns = hasMultiInstance
      ? ['service', 'instance', 'status', 'configured', 'version', 'baseUrl', 'error']
      : ['service', 'status', 'configured', 'version', 'baseUrl', 'error'];

    formatOutput(results, {
      format,
      columns,
      idField: 'service',
      select: args.select,
    });

    if (hadFailure) {
      process.exitCode = 1;
    }
  },
});

function classifyError(error: unknown): string {
  if (!(error instanceof Error)) return 'Unknown error';

  const msg = error.message;
  const cause = (error as any).cause;

  if (
    cause?.code === 'ECONNREFUSED' ||
    cause?.code === 'ConnectionRefused' ||
    msg.includes('ECONNREFUSED')
  ) {
    return 'Connection refused - is the service running?';
  }
  if (cause?.code === 'ENOTFOUND' || msg.includes('ENOTFOUND')) {
    return 'Host not found - check the URL';
  }
  if (
    cause?.code === 'ECONNRESET' ||
    cause?.code === 'ConnectionReset' ||
    msg.includes('ECONNRESET')
  ) {
    return 'Connection reset - service may have crashed';
  }
  if (cause?.code === 'ETIMEDOUT' || msg.includes('ETIMEDOUT') || msg.includes('timed out')) {
    return 'Connection timed out - service may be unreachable';
  }
  if (msg.includes('fetch failed') || msg.includes('Failed to fetch')) {
    return `Service unreachable - ${cause?.message ?? 'check URL and network'}`;
  }

  if (msg.includes('401') || msg.includes('Unauthorized')) {
    return 'Authentication failed (401) - check your API key';
  }
  if (msg.includes('403') || msg.includes('Forbidden')) {
    return 'Access denied (403) - check your API key permissions';
  }
  if (msg.includes('502') || msg.includes('Bad Gateway')) {
    return 'Bad gateway (502) - reverse proxy or service issue';
  }
  if (msg.includes('503') || msg.includes('Service Unavailable')) {
    return 'Service unavailable (503) - service may be starting up';
  }

  if (msg.includes('CERT') || msg.includes('certificate') || msg.includes('SSL')) {
    return 'SSL/TLS certificate error - check HTTPS configuration';
  }

  return msg;
}

function extractVersion(service: string, status: unknown): string | null {
  const data = (status as any)?.data ?? status;

  if (typeof data === 'string') {
    return null;
  }

  if (service === 'bazarr') {
    return data?.data?.bazarr_version ?? data?.bazarr_version ?? null;
  }

  if (service === 'qbittorrent' || service === 'seerr') {
    return data?.version ?? null;
  }

  return data?.version ?? (status as any)?.version ?? null;
}
