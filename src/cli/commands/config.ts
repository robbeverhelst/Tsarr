import { defineCommand } from 'citty';
import consola from 'consola';

import type { ServiceConfig, TsarrCliConfig } from '../config';
import {
  getConfigValue,
  GLOBAL_CONFIG_PATH,
  loadConfig,
  loadScopedConfig,
  saveGlobalConfig,
  saveLocalConfig,
  SERVICES,
  setConfigValue,
} from '../config';
import type { ServiceName } from '../probe';
import { promptConfirm, promptIfMissing, promptMultiSelect, promptSelect } from '../prompt';

const DEFAULT_PORTS: Record<string, number> = {
  radarr: 7878,
  sonarr: 8989,
  lidarr: 8686,
  readarr: 8787,
  prowlarr: 9696,
  bazarr: 6767,
  qbittorrent: 8080,
  seerr: 5055,
  jellyfin: 8096,
};

async function configureInstance(service: string, instanceName?: string): Promise<ServiceConfig> {
  const baseUrl = await promptIfMissing(
    undefined,
    `${service}${instanceName ? ` (${instanceName})` : ''} base URL (e.g. http://localhost:${DEFAULT_PORTS[service]})`
  );

  if (service === 'qbittorrent') {
    const username = await promptIfMissing(undefined, `${service} username`);
    const password = await promptIfMissing(undefined, `${service} password`);
    const cfg: ServiceConfig = { baseUrl, username, password };
    if (instanceName) cfg.name = instanceName;
    return cfg;
  }

  const apiKey = await promptIfMissing(undefined, `${service} API key`);
  const cfg: ServiceConfig = { baseUrl, apiKey };
  if (instanceName) cfg.name = instanceName;
  return cfg;
}

export async function testConnection(service: string, serviceConfig: ServiceConfig): Promise<void> {
  const label = `${service}${serviceConfig.name ? ` (${serviceConfig.name})` : ''}`;
  const { probeService } = await import('../probe.js');
  // Only reached for services picked from SERVICES.
  const probe = await probeService(service as ServiceName, serviceConfig);
  if (probe.ok) {
    consola.success(`Connected to ${label} v${probe.version}`);
  } else {
    consola.warn(`Could not connect to ${label} — config saved anyway.`);
    consola.debug('Connection test error:', probe.error);
  }
}

const configInit = defineCommand({
  meta: {
    name: 'init',
    description: 'Interactive setup wizard',
  },
  async run() {
    if (!process.stdin.isTTY) {
      consola.error(
        'Config init requires an interactive terminal.\nUse `tsarr config set` or environment variables for non-interactive setup.'
      );
      process.exit(1);
    }

    consola.info('Welcome to TsArr CLI setup!\n');

    const selected = await promptMultiSelect(
      'Which services do you want to configure?',
      SERVICES.map(s => ({
        label: `${s} (default port: ${DEFAULT_PORTS[s]})`,
        value: s,
      }))
    );

    if (!selected.length) {
      consola.warn('No services selected.');
      return;
    }

    const config: TsarrCliConfig = { services: {} };

    for (const service of selected) {
      console.log();
      const instances: ServiceConfig[] = [];

      // Configure first instance (no name needed initially)
      const first = await configureInstance(service);
      await testConnection(service, first);
      instances.push(first);

      // Offer to add more instances
      while (true) {
        const addMore = await promptConfirm(`Add another ${service} instance?`);
        if (!addMore) break;

        // If the first instance doesn't have a name yet, prompt for one
        if (instances.length === 1 && !instances[0].name) {
          const firstName = await promptIfMissing(
            undefined,
            `Name for the existing ${service} instance (e.g. "main", "1080p")`
          );
          instances[0].name = firstName;
        }

        const newName = await promptIfMissing(
          undefined,
          `Name for the new ${service} instance (e.g. "4K")`
        );
        console.log();
        const newInstance = await configureInstance(service, newName);
        await testConnection(service, newInstance);
        instances.push(newInstance);
      }

      config.services[service] = instances;
    }

    const location = await promptSelect('Save config to:', [
      { label: `Global (${GLOBAL_CONFIG_PATH})`, value: 'global' },
      { label: 'Local (.tsarr.json)', value: 'local' },
    ]);

    // Merge with existing config from the selected scope only (not the full merged config)
    const scope = location === 'global' ? 'global' : 'local';
    const existing = loadScopedConfig(scope);
    const merged: TsarrCliConfig = {
      services: { ...existing.services, ...config.services },
      defaults: existing.defaults,
    };

    if (location === 'global') {
      saveGlobalConfig(merged);
    } else {
      saveLocalConfig(merged);
    }

    consola.success('Config saved!');
  },
});

const configSet = defineCommand({
  meta: {
    name: 'set',
    description: 'Set a config value (e.g. services.radarr.baseUrl)',
  },
  args: {
    key: { type: 'positional', description: 'Config key (dot-notation)', required: true },
    value: { type: 'positional', description: 'Value to set', required: true },
    local: { type: 'boolean', description: 'Save to local .tsarr.json instead of global' },
  },
  async run({ args }) {
    setConfigValue(args.key, args.value, !args.local);
    const displayValue = /\b(apiKey|apikey|token|secret|password)\b/i.test(args.key)
      ? '*****'
      : args.value;
    consola.success(`Set ${args.key} = ${displayValue}`);
  },
});

const configGet = defineCommand({
  meta: {
    name: 'get',
    description: 'Get a config value',
  },
  args: {
    key: { type: 'positional', description: 'Config key (dot-notation)', required: true },
  },
  async run({ args }) {
    const value = getConfigValue(args.key);
    if (value != null) {
      console.log(value);
    } else {
      consola.warn(`Key "${args.key}" not found.`);
      process.exit(1);
    }
  },
});

const configShow = defineCommand({
  meta: {
    name: 'show',
    description: 'Show current configuration',
  },
  async run() {
    const config = loadConfig();
    const redacted = JSON.parse(JSON.stringify(config));
    if (redacted.services) {
      for (const instances of Object.values(redacted.services)) {
        if (Array.isArray(instances)) {
          for (const svc of instances) {
            if (svc?.apiKey) svc.apiKey = '*****';
            if (svc?.password) svc.password = '*****';
          }
        }
      }
    }
    console.log(JSON.stringify(redacted, null, 2));
  },
});

export const config = defineCommand({
  meta: {
    name: 'config',
    description: 'Manage CLI configuration',
  },
  subCommands: {
    init: configInit,
    set: configSet,
    get: configGet,
    show: configShow,
  },
});
