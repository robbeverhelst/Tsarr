import { defineCommand } from 'citty';
import consola from 'consola';

import { getServiceConfig, getServiceInstances, SERVICES } from '../config';
import { detectFormat, formatOutput } from '../output';
import { probeService } from '../probe';

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
        const probe = await probeService(service, svcConfig);
        results.push({
          service,
          ...(inst.name ? { instance: inst.name } : {}),
          configured: true,
          ...(probe.ok
            ? { status: 'ok' as const, version: probe.version, baseUrl: svcConfig.baseUrl }
            : { status: 'fail' as const, baseUrl: svcConfig.baseUrl, error: probe.error }),
        });
      }
    }

    const hadFailure = !hasAny || results.some(r => r.status === 'fail');

    if (!hasAny && format === 'table') {
      consola.warn('\nNo services configured. Run `tsarr config init` to set up.');
    }

    const tableColumns = hasMultiInstance
      ? ['service', 'instance', 'status', 'version', 'error']
      : ['service', 'status', 'version', 'error'];
    const fullColumns = hasMultiInstance
      ? ['service', 'instance', 'status', 'configured', 'version', 'baseUrl', 'error']
      : ['service', 'status', 'configured', 'version', 'baseUrl', 'error'];
    const columns = format === 'table' ? tableColumns : fullColumns;

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
