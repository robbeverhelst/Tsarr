import { defineCommand } from 'citty';
import consola from 'consola';
import type { TsarrCliConfig } from '../config.js';
import {
  GLOBAL_CONFIG_PATH,
  getConfigValue,
  loadConfig,
  loadScopedConfig,
  SERVICES,
  saveGlobalConfig,
  saveLocalConfig,
  setConfigValue,
} from '../config.js';
import { promptIfMissing, promptMultiSelect, promptSelect } from '../prompt.js';

const DEFAULT_PORTS: Record<string, number> = {
  radarr: 7878,
  sonarr: 8989,
  lidarr: 8686,
  readarr: 8787,
  prowlarr: 9696,
  bazarr: 6767,
  qbittorrent: 8080,
  seerr: 5055,
};

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
      const baseUrl = await promptIfMissing(
        undefined,
        `${service} base URL (e.g. http://localhost:${DEFAULT_PORTS[service]})`
      );

      if (service === 'qbittorrent') {
        const username = await promptIfMissing(undefined, `${service} username`);
        const password = await promptIfMissing(undefined, `${service} password`);
        config.services[service] = { baseUrl, username, password };

        try {
          const { QBittorrentClient } = await import('../../clients/qbittorrent.js');
          const client = new QBittorrentClient({ baseUrl, username, password });
          const status = await client.getSystemStatus();
          consola.success(`Connected to ${service} v${status.version}`);
        } catch {
          consola.warn(`Could not connect to ${service} — config saved anyway.`);
        }
      } else {
        const apiKey = await promptIfMissing(undefined, `${service} API key`);
        config.services[service] = { baseUrl, apiKey };

        try {
          const { RadarrClient } = await import('../../clients/radarr.js');
          const { SonarrClient } = await import('../../clients/sonarr.js');
          const { LidarrClient } = await import('../../clients/lidarr.js');
          const { ReadarrClient } = await import('../../clients/readarr.js');
          const { ProwlarrClient } = await import('../../clients/prowlarr.js');
          const { BazarrClient } = await import('../../clients/bazarr.js');

          const { SeerrClient } = await import('../../clients/seerr.js');

          const factories: Record<string, (c: any) => any> = {
            radarr: c => new RadarrClient(c),
            sonarr: c => new SonarrClient(c),
            lidarr: c => new LidarrClient(c),
            readarr: c => new ReadarrClient(c),
            prowlarr: c => new ProwlarrClient(c),
            bazarr: c => new BazarrClient(c),
            seerr: c => new SeerrClient(c),
          };

          const client = factories[service]?.(config.services[service]);
          if (client) {
            const status = await client.getSystemStatus();
            const version = (status as any)?.data?.version ?? (status as any)?.version ?? '?';
            consola.success(`Connected to ${service} v${version}`);
          }
        } catch {
          consola.warn(`Could not connect to ${service} — config saved anyway.`);
        }
      }
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
      for (const svc of Object.values(redacted.services) as any[]) {
        if (svc?.apiKey) svc.apiKey = '*****';
        if (svc?.password) svc.password = '*****';
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
