import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import type { QBittorrentClientConfig, ServarrClientConfig } from '../core/types';

export interface ServiceConfig {
  name?: string;
  baseUrl: string;
  apiKey?: string;
  apiKeyFile?: string;
  username?: string;
  password?: string;
  timeout?: number;
}

/** Internal config — services always normalized to arrays */
export interface TsarrCliConfig {
  services: Record<string, ServiceConfig[]>;
  defaults?: {
    output?: 'json' | 'table' | 'quiet';
  };
}

/** On-disk format accepts both single object and array per service */
interface RawTsarrCliConfig {
  services?: Record<string, ServiceConfig | ServiceConfig[]>;
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
    ...(service.name ? { name: service.name } : {}),
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

function normalizeServiceEntry(entry: ServiceConfig | ServiceConfig[]): ServiceConfig[] {
  if (Array.isArray(entry)) {
    return entry
      .map(item => normalizeServiceConfig(item))
      .filter((item): item is ServiceConfig => item != null);
  }
  const normalized = normalizeServiceConfig(entry);
  return normalized ? [normalized] : [];
}

function normalizeConfig(config: Partial<RawTsarrCliConfig>): Partial<TsarrCliConfig> {
  const services = Object.fromEntries(
    Object.entries(config.services ?? {})
      .map(([name, entry]) => [
        name,
        normalizeServiceEntry(entry as ServiceConfig | ServiceConfig[]),
      ])
      .filter(([, instances]) => (instances as ServiceConfig[]).length > 0)
  ) as Record<string, ServiceConfig[]>;

  const result: Partial<TsarrCliConfig> = {};
  if (Object.keys(services).length > 0) result.services = services;
  if (config.defaults) result.defaults = config.defaults;
  return result;
}

function readJsonFile(path: string): Partial<TsarrCliConfig> {
  if (!existsSync(path)) return {};
  return normalizeConfig(JSON.parse(readFileSync(path, 'utf-8')));
}

function getEnvConfig(): Partial<TsarrCliConfig> {
  const services: Record<string, ServiceConfig[]> = {};
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
      services[service] = [partial as ServiceConfig];
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

function isArrayEntry(raw: unknown): boolean {
  return Array.isArray(raw);
}

export function loadConfig(): TsarrCliConfig {
  const globalRaw = readJsonFile(GLOBAL_CONFIG_PATH);
  const localPath = findLocalConfigPath();
  const localRaw = localPath ? readJsonFile(localPath) : {};
  const env = getEnvConfig();

  // Read raw (pre-normalized) files to detect array vs object format
  let globalDiskRaw: Partial<RawTsarrCliConfig> = {};
  let localDiskRaw: Partial<RawTsarrCliConfig> = {};
  try {
    if (existsSync(GLOBAL_CONFIG_PATH)) {
      globalDiskRaw = JSON.parse(readFileSync(GLOBAL_CONFIG_PATH, 'utf-8'));
    }
  } catch {}
  try {
    if (localPath && existsSync(localPath)) {
      localDiskRaw = JSON.parse(readFileSync(localPath, 'utf-8'));
    }
  } catch {}

  const allServiceNames = new Set([
    ...Object.keys(globalRaw.services ?? {}),
    ...Object.keys(localRaw.services ?? {}),
    ...Object.keys(env.services ?? {}),
  ]);

  const services: Record<string, ServiceConfig[]> = {};
  for (const name of allServiceNames) {
    const globalInstances = globalRaw.services?.[name] ?? [];
    const localInstances = localRaw.services?.[name] ?? [];
    const envInstances = env.services?.[name] ?? [];

    const globalIsArray = isArrayEntry(globalDiskRaw.services?.[name]);
    const localIsArray = isArrayEntry(localDiskRaw.services?.[name]);

    // If either side uses array format, local wins entirely (can't merge instance arrays)
    if (globalIsArray || localIsArray) {
      const base = localInstances.length > 0 ? localInstances : globalInstances;
      // Merge env into the first/default instance
      if (envInstances.length > 0 && base.length > 0) {
        base[0] = { ...base[0], ...envInstances[0] };
      } else if (envInstances.length > 0) {
        services[name] = envInstances;
        continue;
      }
      services[name] = base;
    } else {
      // Both are single objects — per-field merge (preserves current behavior)
      const globalObj = globalInstances[0];
      const localObj = localInstances[0];
      const envObj = envInstances[0];
      const merged = {
        ...globalObj,
        ...localObj,
        ...envObj,
      } as ServiceConfig;
      services[name] = [merged];
    }
  }

  const merged: TsarrCliConfig = {
    services,
    defaults: {
      ...globalRaw.defaults,
      ...localRaw.defaults,
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
  instance: ServiceConfig,
  localPath: string | null,
  local: Partial<TsarrCliConfig>,
  global: Partial<TsarrCliConfig>
): string | undefined {
  if (!instance.apiKeyFile) return undefined;

  // Check if the apiKeyFile was defined in local config
  const localInstances = local.services?.[serviceName] ?? [];
  const localMatch = localInstances.find(
    i => i.apiKeyFile && (instance.name ? i.name === instance.name : true)
  );
  if (localMatch) {
    return resolveConfigRelativePath(instance.apiKeyFile, localPath);
  }

  // Check if defined in global config
  const globalInstances = global.services?.[serviceName] ?? [];
  const globalMatch = globalInstances.find(
    i => i.apiKeyFile && (instance.name ? i.name === instance.name : true)
  );
  if (globalMatch) {
    return resolveConfigRelativePath(instance.apiKeyFile, GLOBAL_CONFIG_PATH);
  }

  return instance.apiKeyFile;
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

/** Returns all instances for a service (normalized, always an array). */
export function getServiceInstances(serviceName: string): ServiceConfig[] {
  const config = loadConfig();
  return config.services[serviceName] ?? [];
}

/** Returns instance names for a service. */
export function getInstanceNames(serviceName: string): string[] {
  return getServiceInstances(serviceName)
    .map(i => i.name)
    .filter((n): n is string => !!n);
}

function resolveInstance(
  instances: ServiceConfig[],
  instanceName?: string
): ServiceConfig | undefined {
  if (!instances.length) return undefined;
  if (!instanceName) return instances[0];
  return instances.find(i => i.name?.toLowerCase() === instanceName.toLowerCase());
}

export function getServiceConfig(
  serviceName: string,
  instanceName?: string
): ServarrClientConfig | QBittorrentClientConfig | null {
  const global = readJsonFile(GLOBAL_CONFIG_PATH);
  const localPath = findLocalConfigPath();
  const local = localPath ? readJsonFile(localPath) : {};
  const config = loadConfig();
  const instances = config.services[serviceName] ?? [];
  const instance = resolveInstance(instances, instanceName);
  if (!instance?.baseUrl) return null;

  if (serviceName === 'qbittorrent') {
    if (!instance.username || !instance.password) return null;
    return {
      baseUrl: instance.baseUrl,
      username: instance.username,
      password: instance.password,
      ...(instance.timeout ? { timeout: instance.timeout } : {}),
    };
  }

  let apiKey = instance.apiKey;
  const apiKeyFilePath = getResolvedApiKeyFilePath(serviceName, instance, localPath, local, global);
  if (!apiKey && apiKeyFilePath) {
    apiKey = readApiKeyFile(apiKeyFilePath);
  }

  if (!apiKey) return null;

  return {
    baseUrl: instance.baseUrl,
    apiKey,
    ...(instance.timeout ? { timeout: instance.timeout } : {}),
  };
}

/** Serialize config for saving — single instances saved as objects for backwards compat */
function serializeForDisk(config: TsarrCliConfig): RawTsarrCliConfig {
  const services: Record<string, ServiceConfig | ServiceConfig[]> = {};
  for (const [name, instances] of Object.entries(config.services)) {
    if (instances.length === 1 && !instances[0].name) {
      // Single unnamed instance — save as plain object
      const { name: _name, ...rest } = instances[0];
      services[name] = rest;
    } else {
      services[name] = instances;
    }
  }
  return { services, defaults: config.defaults };
}

export function saveGlobalConfig(config: TsarrCliConfig): void {
  mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true });
  writeFileSync(GLOBAL_CONFIG_PATH, `${JSON.stringify(serializeForDisk(config), null, 2)}\n`);
}

export function saveLocalConfig(config: TsarrCliConfig): void {
  const existingPath = findLocalConfigPath();
  const targetPath = existingPath ?? join(process.cwd(), LOCAL_CONFIG_NAME);
  writeFileSync(targetPath, `${JSON.stringify(serializeForDisk(config), null, 2)}\n`);
}

function resolveArrayPath(instances: ServiceConfig[], segment: string): ServiceConfig | undefined {
  // Try matching by instance name
  const byName = instances.find(i => i.name === segment);
  if (byName) return byName;
  // Try matching by index
  const idx = Number(segment);
  if (Number.isInteger(idx) && idx >= 0 && idx < instances.length) return instances[idx];
  return undefined;
}

export function getConfigValue(key: string): string | undefined {
  const config = loadConfig();
  const parts = key.split('.');
  let current: any = config;
  for (let i = 0; i < parts.length; i++) {
    if (current == null || typeof current !== 'object') return undefined;
    if (Array.isArray(current)) {
      // Try to resolve via instance name or index
      const resolved = resolveArrayPath(current, parts[i]);
      if (resolved) {
        current = resolved;
        continue;
      }
      // Fall back to default instance (index 0) and retry current segment
      current = current[0]?.[parts[i]];
    } else {
      current = current[parts[i]];
    }
  }
  return current != null ? String(current) : undefined;
}

export function setConfigValue(key: string, value: string, global = true): void {
  const configPath = global
    ? GLOBAL_CONFIG_PATH
    : (findLocalConfigPath() ?? join(process.cwd(), LOCAL_CONFIG_NAME));
  const raw = existsSync(configPath) ? JSON.parse(readFileSync(configPath, 'utf-8')) : {};
  const parts = key.split('.');
  let current = raw;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (Array.isArray(current[part])) {
      // Navigate into array by instance name or index
      const nextPart = parts[i + 1];
      const resolved = resolveArrayPath(current[part], nextPart);
      if (resolved) {
        current = resolved;
        i++; // skip the instance name segment
        continue;
      }
      // Fall back to first element
      current = current[part][0];
      continue;
    }
    if (current[part] == null || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = parseConfigValue(key, value);

  if (global) {
    mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true });
    writeFileSync(configPath, `${JSON.stringify(raw, null, 2)}\n`);
  } else {
    writeFileSync(configPath, `${JSON.stringify(raw, null, 2)}\n`);
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
    .filter(([name, instances]) =>
      instances.some(
        s =>
          s.baseUrl &&
          (name === 'qbittorrent' ? s.username && s.password : s.apiKey || s.apiKeyFile)
      )
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
