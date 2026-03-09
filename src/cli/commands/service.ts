import { defineCommand } from 'citty';
import consola from 'consola';
import { ApiKeyError, ConnectionError, NotFoundError, TsarrError } from '../../core/errors.js';
import type { ServarrClientConfig } from '../../core/types.js';
import { getServiceConfig } from '../config.js';
import { detectFormat, formatOutput } from '../output.js';
import { promptConfirm, promptIfMissing } from '../prompt.js';

export interface ActionArg {
  name: string;
  description: string;
  required?: boolean;
  type?: 'string' | 'number';
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

export function buildServiceCommand(
  serviceName: string,
  description: string,
  clientFactory: (config: ServarrClientConfig) => any,
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
          quiet: { type: 'boolean', alias: 'q', description: 'Output IDs only' },
          yes: { type: 'boolean', alias: 'y', description: 'Skip confirmation prompts' },
          ...(action.args ?? []).reduce(
            (acc, arg) => {
              acc[arg.name] = {
                type: arg.type === 'number' ? 'string' : 'string',
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
            consola.error(
              `${serviceName} is not configured. Run \`tsarr config init\` or set TSARR_${serviceName.toUpperCase()}_URL and TSARR_${serviceName.toUpperCase()}_API_KEY environment variables.`
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
              }
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
                consola.error(
                  `Unauthorized. Check your API key.\nRun \`tsarr config init\` or set TSARR_${serviceName.toUpperCase()}_API_KEY`
                );
              } else if (status === 404) {
                consola.error('Not found.');
              } else {
                consola.error(err?.title ?? err?.message ?? `API error (${status ?? 'unknown'})`);
              }
              process.exit(1);
            }
            // Unwrap the { data, request, response } wrapper from hey-api clients
            let result = raw?.data !== undefined ? raw.data : raw;
            // Unwrap paginated responses (e.g. { records: [...], page, totalRecords })
            if (result?.records !== undefined && Array.isArray(result.records)) {
              result = result.records;
            }
            const format = detectFormat(args);
            formatOutput(result, {
              format,
              columns: action.columns,
              idField: action.idField,
            });
          } catch (error) {
            handleError(error, serviceName);
          }
        },
      });
    }

    subCommands[resource.name] = defineCommand({
      meta: {
        name: resource.name,
        description: resource.description,
      },
      subCommands: actionCommands,
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
