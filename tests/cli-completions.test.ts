import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { completions } from '../src/cli/completions.js';

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
    expect(completions.meta?.name).toBe('completions');
    expect(completions.meta?.description).toBeDefined();
  });

  it('requires a shell positional argument', () => {
    expect(completions.args?.shell?.type).toBe('positional');
    expect(completions.args?.shell?.required).toBe(true);
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
        'seerr',
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
