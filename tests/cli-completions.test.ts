import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import type { ArgsDef, CommandMeta } from 'citty';

import { resources as bazarr } from '../src/cli/commands/bazarr.js';
import { resources as jellyfin } from '../src/cli/commands/jellyfin.js';
import { resources as lidarr } from '../src/cli/commands/lidarr.js';
import { resources as prowlarr } from '../src/cli/commands/prowlarr.js';
import { resources as qbit } from '../src/cli/commands/qbit.js';
import { resources as radarr } from '../src/cli/commands/radarr.js';
import { resources as readarr } from '../src/cli/commands/readarr.js';
import { resources as seerr } from '../src/cli/commands/seerr.js';
import type { ResourceDef } from '../src/cli/commands/service.js';
import { resources as sonarr } from '../src/cli/commands/sonarr.js';
import { completions } from '../src/cli/completions.js';

const SERVICE_RESOURCES: Record<string, ResourceDef[]> = {
  radarr,
  sonarr,
  lidarr,
  readarr,
  prowlarr,
  bazarr,
  qbit,
  seerr,
  jellyfin,
};

describe('Shell completions', () => {
  const logs: string[] = [];
  const originalLog = console.log;

  beforeEach(() => {
    logs.length = 0;
    console.log = (...args: unknown[]) => {
      logs.push(args.join(' '));
    };
  });

  afterEach(() => {
    console.log = originalLog;
  });

  it('has correct command metadata', () => {
    const meta = completions.meta as CommandMeta;
    expect(meta.name).toBe('completions');
    expect(meta.description).toBeDefined();
  });

  it('requires a shell positional argument', () => {
    const args = completions.args as ArgsDef;
    expect(args.shell?.type).toBe('positional');
    expect(args.shell?.required).toBe(true);
  });

  describe('bash completions', () => {
    it('generates bash completion script', () => {
      completions.run!({ args: { shell: 'bash' } } as any);
      const output = logs.join('\n');
      expect(output).toContain('_tsarr_completions');
      expect(output).toContain('complete -F _tsarr_completions tsarr');
    });

    it('includes all services', () => {
      completions.run!({ args: { shell: 'bash' } } as any);
      const output = logs.join('\n');
      for (const service of [
        'radarr',
        'sonarr',
        'lidarr',
        'readarr',
        'prowlarr',
        'bazarr',
        'qbit',
        'seerr',
        'jellyfin',
      ]) {
        expect(output).toContain(service);
      }
    });

    it('includes global commands', () => {
      completions.run!({ args: { shell: 'bash' } } as any);
      const output = logs.join('\n');
      expect(output).toContain('doctor');
      expect(output).toContain('config');
      expect(output).toContain('completions');
    });

    it('completes every resource and action of every service', () => {
      completions.run!({ args: { shell: 'bash' } } as any);
      const output = logs.join('\n');
      for (const [svc, resources] of Object.entries(SERVICE_RESOURCES)) {
        expect(output).toContain(
          `local ${svc}_resources="${resources.map(r => r.name).join(' ')}"`
        );
        for (const resource of resources) {
          const actions = resource.actions.map(a => a.name).join(' ');
          expect(output).toContain(
            `${svc}:${resource.name}) COMPREPLY=( $(compgen -W "${actions}" -- "$cur") ) ;;`
          );
        }
      }
    });

    it('includes config subcommands', () => {
      completions.run!({ args: { shell: 'bash' } } as any);
      const output = logs.join('\n');
      expect(output).toContain('init set get show');
    });
  });

  describe('zsh completions', () => {
    it('generates zsh completion script', () => {
      completions.run!({ args: { shell: 'zsh' } } as any);
      const output = logs.join('\n');
      expect(output).toContain('#compdef tsarr');
      expect(output).toContain('_tsarr');
    });

    it('includes service resources', () => {
      completions.run!({ args: { shell: 'zsh' } } as any);
      const output = logs.join('\n');
      expect(output).toContain('radarr');
      expect(output).toContain('movie');
      expect(output).toContain('artist');
      expect(output).toContain('author');
      expect(output).toContain('metadataprofile');
      expect(output).toContain('release');
      expect(output).toContain('list grab');
    });

    it('completes every resource and action of every service', () => {
      completions.run!({ args: { shell: 'zsh' } } as any);
      const output = logs.join('\n');
      for (const [svc, resources] of Object.entries(SERVICE_RESOURCES)) {
        expect(output).toContain(`    ${svc} "${resources.map(r => r.name).join(' ')}"`);
        for (const resource of resources) {
          const actions = resource.actions.map(a => a.name).join(' ');
          expect(output).toContain(`    ${svc}:${resource.name} "${actions}"`);
        }
      }
    });

    it('includes global options', () => {
      completions.run!({ args: { shell: 'zsh' } } as any);
      const output = logs.join('\n');
      expect(output).toContain('--json');
      expect(output).toContain('--table');
      expect(output).toContain('--quiet');
      expect(output).toContain('--yes');
      expect(output).toContain('--instance');
    });
  });

  describe('fish completions', () => {
    it('generates fish completion script', () => {
      completions.run!({ args: { shell: 'fish' } } as any);
      const output = logs.join('\n');
      expect(output).toContain('complete -c tsarr');
    });

    it('completes every resource and action of every service', () => {
      completions.run!({ args: { shell: 'fish' } } as any);
      const output = logs.join('\n');
      for (const [svc, resources] of Object.entries(SERVICE_RESOURCES)) {
        expect(output).toContain(`-a "${resources.map(r => r.name).join(' ')}"`);
        for (const resource of resources) {
          const actions = resource.actions.map(a => a.name).join(' ');
          expect(output).toContain(
            `__fish_seen_subcommand_from ${svc}; and __fish_seen_subcommand_from ${resource.name}; and not __fish_seen_subcommand_from ${actions}" -a "${actions}"`
          );
        }
      }
    });

    it('includes service and global options', () => {
      completions.run!({ args: { shell: 'fish' } } as any);
      const output = logs.join('\n');
      expect(output).toContain('radarr');
      expect(output).toContain('config');
      expect(output).toContain('-l json');
      expect(output).toContain('-l table');
      expect(output).toContain('-l quiet');
    });
  });
});
