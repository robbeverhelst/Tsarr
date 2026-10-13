import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { runCommand } from 'citty';
import consola from 'consola';
import { buildServiceCommand } from '../src/cli/commands/service.js';

class ExitError extends Error {}

describe('service command thrown transport errors', () => {
  const errors: string[] = [];
  const original = { error: consola.error, exit: process.exit };
  const env = { url: process.env.TSARR_RADARR_URL, key: process.env.TSARR_RADARR_API_KEY };

  beforeEach(() => {
    errors.length = 0;
    process.env.TSARR_RADARR_URL = 'http://127.0.0.1:1';
    process.env.TSARR_RADARR_API_KEY = 'test-key';
    consola.error = ((msg: string) => errors.push(msg)) as typeof consola.error;
    process.exit = (() => {
      throw new ExitError();
    }) as typeof process.exit;
  });

  afterEach(() => {
    consola.error = original.error;
    process.exit = original.exit;
    if (env.url === undefined) delete process.env.TSARR_RADARR_URL;
    else process.env.TSARR_RADARR_URL = env.url;
    if (env.key === undefined) delete process.env.TSARR_RADARR_API_KEY;
    else process.env.TSARR_RADARR_API_KEY = env.key;
  });

  async function runThrowing(message: string) {
    const command = buildServiceCommand('radarr', 'Radarr', () => ({}), [
      {
        name: 'system',
        description: 'System',
        actions: [
          {
            name: 'status',
            description: 'Status',
            run: async () => {
              throw new Error(message);
            },
          },
        ],
      },
    ]);
    await expect(
      runCommand(command, { rawArgs: ['system', 'status', '--json'] })
    ).rejects.toBeInstanceOf(ExitError);
    return errors.join('\n');
  }

  it.each([
    ['connect ECONNREFUSED 10.0.0.5:7878', 'Connection refused. Is radarr running?'],
    ['The operation has timed out', 'Connection timed out for radarr.'],
  ])('classifies "%s" from the message', async (message, expected) => {
    const output = await runThrowing(message);
    expect(output).toContain(expected);
    expect(output).toContain('Run `tsarr doctor` to diagnose.');
  });
});
