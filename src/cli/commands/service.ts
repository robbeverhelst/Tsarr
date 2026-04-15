import { defineCommand } from 'citty';
import consola from 'consola';
import { ApiKeyError, ConnectionError, NotFoundError, TsarrError } from '../../core/errors.js';
import { getServiceConfig } from '../config.js';
import { detectFormat, formatOutput } from '../output.js';
import { promptConfirm, promptIfMissing } from '../prompt.js';

export interface ActionArg {
  name: string;
  description: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean';
}

export interface ActionDef {
  name: string;
  description: string;
  args?: ActionArg[];
  columns?: string[];
  idField?: string;
  confirmMessage?: string;
  run: (client: any, args: Record<string, any>) => Promise<any>;
}

export interface ResourceDef {
  name: string;
  description: string;
  actions: ActionDef[];
}

export const COMMAND_OUTPUT_COLUMNS = ['id', 'name', 'status', 'result', 'queued', 'trigger'];

export function limitResults<T>(results: T[], limit: number | undefined): T[] {
  if (limit === undefined) return results;
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error('--limit must be a positive integer.');
  }
  return results.slice(0, limit);
}

export function buildServiceCommand(
  serviceName: string,
  description: string,
  clientFactory: (config: any) => any,
  resources: ResourceDef[]
) {
  const subCommands: Record<string, any> = {};

  for (const resource of resources) {
    const actionCommands: Record<string, any> = {};

    for (const action of resource.actions) {
      actionCommands[action.name] = defineCommand({
        meta: {
          name: action.name,
          description: action.description,
        },
        args: {
          json: { type: 'boolean', description: 'Output as JSON' },
          table: { type: 'boolean', description: 'Output as table' },
          plain: { type: 'boolean', description: 'Output as TSV (no colors, for piping)' },
          quiet: { type: 'boolean', alias: 'q', description: 'Output IDs only' },
          'no-header': { type: 'boolean', description: 'Hide table header row' },
          'dry-run': { type: 'boolean', description: 'Show what would happen without executing' },
          select: {
            type: 'string',
            description: 'Cherry-pick fields (comma-separated, JSON mode)',
          },
          yes: { type: 'boolean', alias: 'y', description: 'Skip confirmation prompts' },
          ...(action.args ?? []).reduce(
            (acc, arg) => {
              acc[arg.name] = {
                type:
                  arg.type === 'boolean' ? 'boolean' : arg.type === 'number' ? 'string' : 'string',
                description: arg.description,
                required: false, // We handle required ourselves with prompts
              };
              return acc;
            },
            {} as Record<string, any>
          ),
        },
        async run({ args }) {
          const config = getServiceConfig(serviceName);
          if (!config) {
            const envHint =
              serviceName === 'qbittorrent'
                ? `TSARR_QBITTORRENT_URL, TSARR_QBITTORRENT_USERNAME, and TSARR_QBITTORRENT_PASSWORD`
                : `TSARR_${serviceName.toUpperCase()}_URL and TSARR_${serviceName.toUpperCase()}_API_KEY`;
            consola.error(
              `${serviceName} is not configured. Run \`tsarr config init\` or set ${envHint} environment variables.`
            );
            process.exit(1);
          }

          try {
            const client = clientFactory(config);

            // Resolve args with prompts for missing required ones
            const resolvedArgs: Record<string, any> = { ...args };
            for (const argDef of action.args ?? []) {
              if (argDef.required) {
                resolvedArgs[argDef.name] = await promptIfMissing(
                  resolvedArgs[argDef.name],
                  `${argDef.description}:`
                );
              }
              if (argDef.type === 'number' && resolvedArgs[argDef.name] != null) {
                resolvedArgs[argDef.name] = Number(resolvedArgs[argDef.name]);
                if (Number.isNaN(resolvedArgs[argDef.name])) {
                  consola.error(`${argDef.name} must be a number.`);
                  process.exit(1);
                }
              } else if (argDef.type === 'boolean' && resolvedArgs[argDef.name] != null) {
                resolvedArgs[argDef.name] = coerceBooleanArg(resolvedArgs[argDef.name]);
              }
            }

            const format = detectFormat(args);
            const noHeader =
              process.argv.includes('--no-header') || !!(args as Record<string, any>).noHeader;
            const dryRun = !!(
              (args as Record<string, any>)['dry-run'] ??
              (args as Record<string, any>).dryRun ??
              process.argv.includes('--dry-run')
            );

            if (dryRun) {
              formatOutput(
                buildDryRunPreview(format, serviceName, resource.name, action.name, resolvedArgs),
                {
                  format,
                  noHeader,
                }
              );
              return;
            }

            // Confirmation prompt for destructive actions
            if (action.confirmMessage) {
              const confirmed = await promptConfirm(action.confirmMessage, !!args.yes);
              if (!confirmed) {
                consola.info('Cancelled.');
                return;
              }
            }

            const raw = await action.run(client, resolvedArgs);
            // Check for API error responses
            if (raw?.error !== undefined) {
              const err = raw.error;
              const status = err?.status ?? raw?.response?.status;
              if (status === 401) {
                const authHint =
                  serviceName === 'qbittorrent'
                    ? 'Check your username and password.'
                    : `Check your API key.\nRun \`tsarr config init\` or set TSARR_${serviceName.toUpperCase()}_API_KEY`;
                consola.error(`Unauthorized. ${authHint}`);
              } else if (status === 404) {
                consola.error('Not found.');
              } else {
                consola.error(err?.title ?? err?.message ?? `API error (${status ?? 'unknown'})`);
              }
              process.exit(1);
            }
            // Unwrap the { data, request, response } wrapper from hey-api clients
            let result = raw?.data !== undefined ? raw.data : raw;
            if (
              result != null &&
              typeof result === 'object' &&
              'data' in result &&
              Object.keys(result).length === 1
            ) {
              result = result.data;
            }
            // Unwrap paginated responses (e.g. { records: [...] } or { results: [...] })
            if (result?.records !== undefined && Array.isArray(result.records)) {
              result = result.records;
            } else if (result?.results !== undefined && Array.isArray(result.results)) {
              result = result.results;
            }
            formatOutput(result, {
              format,
              columns: action.columns,
              idField: action.idField,
              noHeader,
              select: args.select,
            });
          } catch (error) {
            handleError(error, serviceName);
          }
        },
      });
    }

    // When a resource has exactly one action, make it the default so
    // e.g. `tsarr qbit status` works without requiring `tsarr qbit status show`
    const singleAction = resource.actions.length === 1 ? actionCommands[resource.actions[0].name] : undefined;

    subCommands[resource.name] = defineCommand({
      meta: {
        name: resource.name,
        description: resource.description,
      },
      subCommands: actionCommands,
      ...(singleAction ? { run: singleAction.run } : {}),
    });
  }

  return defineCommand({
    meta: {
      name: serviceName,
      description,
    },
    subCommands,
  });
}

function coerceBooleanArg(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }

  return Boolean(value);
}

function buildDryRunPreview(
  format: 'json' | 'table' | 'quiet' | 'plain',
  serviceName: string,
  resourceName: string,
  actionName: string,
  args: Record<string, any>
) {
  const filteredArgs = Object.fromEntries(
    Object.entries(args).filter(
      ([key, value]) =>
        value !== undefined &&
        key !== '_' &&
        key !== 'json' &&
        key !== 'table' &&
        key !== 'plain' &&
        key !== 'quiet' &&
        key !== 'select' &&
        key !== 'no-header' &&
        key !== 'noHeader' &&
        key !== 'dry-run' &&
        key !== 'dryRun'
    )
  );

  if (format === 'json') {
    return {
      dryRun: true,
      service: serviceName,
      resource: resourceName,
      action: actionName,
      args: filteredArgs,
    };
  }

  return {
    message: `Dry run: would execute ${serviceName} ${resourceName} ${actionName}${formatDryRunArgs(filteredArgs)}`,
  };
}

function formatDryRunArgs(args: Record<string, any>): string {
  const entries = Object.entries(args);
  if (entries.length === 0) return '';

  return ` with ${entries.map(([key, value]) => `${key}=${String(value)}`).join(', ')}`;
}

function handleError(error: unknown, serviceName: string): never {
  if (error instanceof ApiKeyError) {
    consola.error(
      `API key error: ${error.message}\nRun \`tsarr config init\` or set TSARR_${serviceName.toUpperCase()}_API_KEY`
    );
  } else if (error instanceof ConnectionError) {
    consola.error(`Connection error: ${error.message}\nRun \`tsarr doctor\` to diagnose.`);
  } else if (error instanceof NotFoundError) {
    consola.error(error.message);
  } else if (error instanceof TsarrError) {
    consola.error(`Error: ${error.message}`);
  } else if (error instanceof Error) {
    consola.error(error.message);
  } else {
    consola.error('An unexpected error occurred.');
  }
  process.exit(1);
}
