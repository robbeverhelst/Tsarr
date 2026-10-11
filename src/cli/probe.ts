import { BazarrClient } from '../clients/bazarr';
import { JellyfinClient } from '../clients/jellyfin';
import { LidarrClient } from '../clients/lidarr';
import { ProwlarrClient } from '../clients/prowlarr';
import { QBittorrentClient } from '../clients/qbittorrent';
import { RadarrClient } from '../clients/radarr';
import { ReadarrClient } from '../clients/readarr';
import { SeerrClient } from '../clients/seerr';
import { SonarrClient } from '../clients/sonarr';
import type { SERVICES, ServiceConfig } from './config';
import { classifyNetworkError } from './network-errors';

export type ServiceName = (typeof SERVICES)[number];

export type ProbeResult = { ok: true; version: string } | { ok: false; error: string };

const clientFactories: Record<
  ServiceName,
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
  jellyfin: c => new JellyfinClient(c),
};

/**
 * Connects to one configured service and reads its version from the system
 * status endpoint. Never throws: an API error, a transport failure, a client
 * that rejects its config, or a payload without a version all come back as
 * `{ ok: false, error }` with a human-readable reason.
 */
export async function probeService(
  service: ServiceName,
  config: ServiceConfig
): Promise<ProbeResult> {
  try {
    const client = clientFactories[service](config);
    const status = await client.getSystemStatus();
    if (status?.error !== undefined) {
      const err = status.error;
      const code = err?.cause?.code ?? err?.code;
      const cause = code ? { code } : undefined;
      const message = err?.cause?.message ?? err?.message ?? err?.code ?? 'Unknown API error';
      throw Object.assign(new Error(message), cause ? { cause } : {});
    }
    const version = extractVersion(service, status);
    if (version == null) {
      throw new Error('Unexpected response payload');
    }
    return { ok: true, version: String(version) };
  } catch (error) {
    return { ok: false, error: describeProbeError(error) };
  }
}

function describeProbeError(error: unknown): string {
  if (!(error instanceof Error)) return 'Unknown error';

  const network = classifyNetworkError(error);
  switch (network?.kind) {
    case 'refused':
      return 'Connection refused - is the service running?';
    case 'not-found':
      return 'Host not found - check the URL';
    case 'reset':
      return 'Connection reset - service may have crashed';
    case 'timeout':
      return 'Connection timed out - service may be unreachable';
    case 'unreachable':
      return `Service unreachable - ${network.causeMessage ?? 'check URL and network'}`;
  }

  const msg = error.message;
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

function extractVersion(service: ServiceName, status: unknown): string | null {
  const statusObj = status as Record<string, any> | undefined;
  const data = statusObj?.data ?? status;

  if (typeof data === 'string') {
    return null;
  }

  if (service === 'bazarr') {
    return data?.data?.bazarr_version ?? data?.bazarr_version ?? null;
  }

  if (service === 'qbittorrent' || service === 'seerr') {
    return data?.version ?? null;
  }

  // Jellyfin serves PascalCase JSON
  if (service === 'jellyfin') {
    return data?.Version ?? null;
  }

  return data?.version ?? statusObj?.version ?? null;
}
