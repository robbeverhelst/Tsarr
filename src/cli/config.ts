import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import type { ServarrClientConfig } from '../core/types.js';

export interface ServiceConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
}

export interface TsarrCliConfig {
  services: Record<string, ServiceConfig>;
  defaults?: {
    output?: 'json' | 'table' | 'quiet';
  };
}

const SERVICES = ['radarr', 'sonarr', 'lidarr', 'readarr', 'prowlarr', 'bazarr'] as const;
const GLOBAL_CONFIG_DIR = join(homedir(), '.config', 'tsarr');
const GLOBAL_CONFIG_PATH = join(GLOBAL_CONFIG_DIR, 'config.json');
const LOCAL_CONFIG_NAME = '.tsarr.json';

function readJsonFile(path: string): Partial<TsarrCliConfig> {
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return {};
  }
}

function getEnvConfig(): Partial<TsarrCliConfig> {
  const services: Record<string, ServiceConfig> = {};
  for (const service of SERVICES) {
    const upper = service.toUpperCase();
    const baseUrl = process.env[`TSARR_${upper}_URL`];
    const apiKey = process.env[`TSARR_${upper}_API_KEY`];
    const timeout = process.env[`TSARR_${upper}_TIMEOUT`];
    if (baseUrl || apiKey) {
      services[service] = {
        baseUrl: baseUrl ?? '',
        apiKey: apiKey ?? '',
        ...(timeout ? { timeout: Number(timeout) } : {}),
      };
    }
  }
  return Object.keys(services).length ? { services } : {};
}

function findLocalConfigPath(): string | null {
  let dir = process.cwd();
  while (true) {
    const candidate = join(dir, LOCAL_CONFIG_NAME);
    if (existsSync(candidate)) return candidate;
    const parent = resolve(dir, '..');
    if (parent === dir) return null;
    dir = parent;
  }
}

export function loadConfig(): TsarrCliConfig {
  const base: TsarrCliConfig = { services: {} };
  const global = readJsonFile(GLOBAL_CONFIG_PATH);
  const localPath = findLocalConfigPath();
  const local = localPath ? readJsonFile(localPath) : {};
  const env = getEnvConfig();

  // Merge: global -> local -> env (env wins)
  const merged: TsarrCliConfig = {
    services: {
      ...base.services,
      ...global.services,
      ...local.services,
      ...env.services,
    },
    defaults: {
      ...global.defaults,
      ...local.defaults,
    },
  };

  return merged;
}

export function getServiceConfig(serviceName: string): ServarrClientConfig | null {
  const config = loadConfig();
  const service = config.services[serviceName];
  if (!service?.baseUrl || !service?.apiKey) return null;
  return {
    baseUrl: service.baseUrl,
    apiKey: service.apiKey,
    ...(service.timeout ? { timeout: service.timeout } : {}),
  };
}

export function saveGlobalConfig(config: TsarrCliConfig): void {
  mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true });
  writeFileSync(GLOBAL_CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`);
}

export function saveLocalConfig(config: TsarrCliConfig): void {
  const existingPath = findLocalConfigPath();
  const targetPath = existingPath ?? join(process.cwd(), LOCAL_CONFIG_NAME);
  writeFileSync(targetPath, `${JSON.stringify(config, null, 2)}\n`);
}

export function getConfigValue(key: string): string | undefined {
  const config = loadConfig();
  const parts = key.split('.');
  let current: any = config;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[part];
  }
  return current != null ? String(current) : undefined;
}

export function setConfigValue(key: string, value: string, global = true): void {
  const configPath = global
    ? GLOBAL_CONFIG_PATH
    : (findLocalConfigPath() ?? join(process.cwd(), LOCAL_CONFIG_NAME));
  const config = readJsonFile(configPath) as any;
  const parts = key.split('.');
  let current = config;
  for (let i = 0; i < parts.length - 1; i++) {
    if (current[parts[i]] == null || typeof current[parts[i]] !== 'object') {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;

  if (global) {
    saveGlobalConfig(config as TsarrCliConfig);
  } else {
    saveLocalConfig(config as TsarrCliConfig);
  }
}

export function getConfiguredServices(): string[] {
  const config = loadConfig();
  return Object.entries(config.services)
    .filter(([_, s]) => s.baseUrl && s.apiKey)
    .map(([name]) => name);
}

export function loadScopedConfig(scope: 'global' | 'local'): Partial<TsarrCliConfig> {
  if (scope === 'global') {
    return readJsonFile(GLOBAL_CONFIG_PATH);
  }
  const localPath = findLocalConfigPath() ?? join(process.cwd(), LOCAL_CONFIG_NAME);
  return readJsonFile(localPath);
}

export { SERVICES, GLOBAL_CONFIG_PATH, LOCAL_CONFIG_NAME };
