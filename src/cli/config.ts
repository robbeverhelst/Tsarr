import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import type { QBittorrentClientConfig, ServarrClientConfig } from '../core/types';

export interface ServiceConfig {
  baseUrl: string;
  apiKey?: string;
  apiKeyFile?: string;
  username?: string;
  password?: string;
  timeout?: number;
}

export interface TsarrCliConfig {
  services: Record<string, ServiceConfig>;
  defaults?: {
    output?: 'json' | 'table' | 'quiet';
  };
}

const SERVICES = [
  'radarr',
  'sonarr',
  'lidarr',
  'readarr',
  'prowlarr',
  'bazarr',
  'qbittorrent',
  'seerr',
] as const;
const GLOBAL_CONFIG_DIR = join(homedir(), '.config', 'tsarr');
const GLOBAL_CONFIG_PATH = join(GLOBAL_CONFIG_DIR, 'config.json');
const LOCAL_CONFIG_NAME = '.tsarr.json';

function normalizeServiceConfig(service: ServiceConfig | undefined): ServiceConfig | undefined {
  if (!service) return undefined;

  const normalized: ServiceConfig = {
    baseUrl: service.baseUrl ?? '',
    apiKey: service.apiKey ?? '',
    ...(service.apiKeyFile ? { apiKeyFile: service.apiKeyFile } : {}),
    ...(service.username ? { username: service.username } : {}),
    ...(service.password ? { password: service.password } : {}),
  };

  const timeout = typeof service.timeout === 'string' ? Number(service.timeout) : service.timeout;
  if (typeof timeout === 'number' && Number.isFinite(timeout)) {
    normalized.timeout = timeout;
  }

  return normalized;
}

function normalizeConfig(config: Partial<TsarrCliConfig>): Partial<TsarrCliConfig> {
  const services = Object.fromEntries(
    Object.entries(config.services ?? {})
      .map(([name, service]) => [name, normalizeServiceConfig(service as ServiceConfig)])
      .filter(([, service]) => service != null)
  ) as Record<string, ServiceConfig>;

  return {
    ...config,
    ...(Object.keys(services).length > 0 ? { services } : {}),
  };
}

function readJsonFile(path: string): Partial<TsarrCliConfig> {
  if (!existsSync(path)) return {};
  return normalizeConfig(JSON.parse(readFileSync(path, 'utf-8')));
}

function getEnvConfig(): Partial<TsarrCliConfig> {
  const services: Record<string, Partial<ServiceConfig>> = {};
  for (const service of SERVICES) {
    const upper = service.toUpperCase();
    const baseUrl = process.env[`TSARR_${upper}_URL`];
    const timeout = process.env[`TSARR_${upper}_TIMEOUT`];
    const partial: Partial<ServiceConfig> = {};
    if (baseUrl) partial.baseUrl = baseUrl;
    if (service === 'qbittorrent') {
      const username = process.env.TSARR_QBITTORRENT_USERNAME;
      const password = process.env.TSARR_QBITTORRENT_PASSWORD;
      if (username) partial.username = username;
      if (password) partial.password = password;
    } else {
      const apiKey = process.env[`TSARR_${upper}_API_KEY`];
      if (apiKey) partial.apiKey = apiKey;
    }
    if (timeout) partial.timeout = Number(timeout);
    if (Object.keys(partial).length > 0) {
      services[service] = partial;
    }
  }
  return Object.keys(services).length
    ? { services: services as Record<string, ServiceConfig> }
    : {};
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
  const global = readJsonFile(GLOBAL_CONFIG_PATH);
  const localPath = findLocalConfigPath();
  const local = localPath ? readJsonFile(localPath) : {};
  const env = getEnvConfig();

  // Merge: global -> local -> env (env wins)
  // Deep-merge per service so env overrides don't discard file-based config fields
  const allServiceNames = new Set([
    ...Object.keys(global.services ?? {}),
    ...Object.keys(local.services ?? {}),
    ...Object.keys(env.services ?? {}),
  ]);
  const services: Record<string, ServiceConfig> = {};
  for (const name of allServiceNames) {
    services[name] = {
      ...global.services?.[name],
      ...local.services?.[name],
      ...env.services?.[name],
    } as ServiceConfig;
  }

  const merged: TsarrCliConfig = {
    services,
    defaults: {
      ...global.defaults,
      ...local.defaults,
    },
  };

  return merged;
}

function resolveConfigRelativePath(filePath: string, configPath: string | null): string {
  if (isAbsolute(filePath) || !configPath) {
    return filePath;
  }
  return resolve(dirname(configPath), filePath);
}

function getResolvedApiKeyFilePath(
  serviceName: string,
  service: ServiceConfig,
  localPath: string | null,
  local: Partial<TsarrCliConfig>,
  global: Partial<TsarrCliConfig>
): string | undefined {
  if (!service.apiKeyFile) return undefined;

  if (local.services?.[serviceName]?.apiKeyFile) {
    return resolveConfigRelativePath(service.apiKeyFile, localPath);
  }

  if (global.services?.[serviceName]?.apiKeyFile) {
    return resolveConfigRelativePath(service.apiKeyFile, GLOBAL_CONFIG_PATH);
  }

  return service.apiKeyFile;
}

function readApiKeyFile(filePath: string): string {
  if (!existsSync(filePath)) {
    throw new Error(`API key file not found: ${filePath}`);
  }
  try {
    return readFileSync(filePath, 'utf-8').trimEnd();
  } catch (err) {
    throw new Error(
      `Failed to read API key file: ${filePath}: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

export function getServiceConfig(
  serviceName: string
): ServarrClientConfig | QBittorrentClientConfig | null {
  const global = readJsonFile(GLOBAL_CONFIG_PATH);
  const localPath = findLocalConfigPath();
  const local = localPath ? readJsonFile(localPath) : {};
  const config = loadConfig();
  const service = config.services[serviceName];
  if (!service?.baseUrl) return null;

  if (serviceName === 'qbittorrent') {
    if (!service.username || !service.password) return null;
    return {
      baseUrl: service.baseUrl,
      username: service.username,
      password: service.password,
      ...(service.timeout ? { timeout: service.timeout } : {}),
    };
  }

  // Priority: env var (already merged via getEnvConfig) > apiKeyFile > apiKey
  let apiKey = service.apiKey;
  const apiKeyFilePath = getResolvedApiKeyFilePath(serviceName, service, localPath, local, global);
  if (!apiKey && apiKeyFilePath) {
    apiKey = readApiKeyFile(apiKeyFilePath);
  }

  if (!apiKey) return null;

  return {
    baseUrl: service.baseUrl,
    apiKey,
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
  current[parts[parts.length - 1]] = parseConfigValue(key, value);

  if (global) {
    saveGlobalConfig(config as TsarrCliConfig);
  } else {
    saveLocalConfig(config as TsarrCliConfig);
  }
}

function parseConfigValue(key: string, value: string): string | number {
  if (key.endsWith('.timeout')) {
    const timeout = Number(value);
    if (!Number.isFinite(timeout) || timeout < 0) {
      throw new Error(`Invalid timeout value "${value}". Expected a non-negative number.`);
    }
    return timeout;
  }

  return value;
}

export function getConfiguredServices(): string[] {
  const config = loadConfig();
  return Object.entries(config.services)
    .filter(
      ([name, s]) =>
        s.baseUrl && (name === 'qbittorrent' ? s.username && s.password : s.apiKey || s.apiKeyFile)
    )
    .map(([name]) => name);
}

export function loadScopedConfig(scope: 'global' | 'local'): Partial<TsarrCliConfig> {
  if (scope === 'global') {
    return readJsonFile(GLOBAL_CONFIG_PATH);
  }
  const localPath = findLocalConfigPath() ?? join(process.cwd(), LOCAL_CONFIG_NAME);
  return readJsonFile(localPath);
}

export { GLOBAL_CONFIG_PATH, LOCAL_CONFIG_NAME, SERVICES };
