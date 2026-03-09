import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { formatOutput } from '../src/cli/output.js';

describe('CLI output formatting', () => {
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

  it('prints message-only results without table chrome', () => {
    formatOutput({ message: 'Deleted: Test Movie (ID: 42)' }, { format: 'table' });

    expect(logs).toEqual(['Deleted: Test Movie (ID: 42)']);
  });

  it('flattens nested objects and arrays in table mode', () => {
    formatOutput(
      {
        originalLanguage: { id: 1, name: 'English' },
        alternateTitles: [{ title: 'Alt One' }, { title: 'Alt Two' }],
      },
      {
        format: 'table',
        columns: ['originalLanguage', 'alternateTitles'],
        noHeader: true,
      }
    );

    const output = logs.join('\n');
    expect(output).toContain('English');
    expect(output).toContain('Alt One, Alt Two');
    expect(output).not.toContain('ORIGINAL LANGUAGE');
  });

  it('uses a visible ellipsis when truncating table cells', () => {
    formatOutput([{ overview: 'x'.repeat(120) }], {
      format: 'table',
      columns: ['overview'],
    });

    expect(logs.join('\n')).toContain('…');
  });
});
