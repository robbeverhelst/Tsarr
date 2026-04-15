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

  it('select filters fields from an array of objects', () => {
    formatOutput(
      [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
      ],
      { format: 'json', select: 'id,name' }
    );

    const parsed = JSON.parse(logs.join('\n'));
    expect(parsed).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]);
  });

  it('quiet mode extracts id field from array items', () => {
    formatOutput([{ id: 10 }, { id: 20 }, { id: 30 }], { format: 'quiet', idField: 'id' });

    expect(logs).toEqual(['10', '20', '30']);
  });

  it('plain mode renders rows from array items', () => {
    formatOutput(
      [
        { id: 1, status: 'ok' },
        { id: 2, status: 'fail' },
      ],
      { format: 'plain', columns: ['id', 'status'] }
    );

    expect(logs[0]).toBe('id\tstatus');
    expect(logs[1]).toBe('1\tok');
    expect(logs[2]).toBe('2\tfail');
  });

  it('json mode applies columns to arrays by default', () => {
    formatOutput(
      [
        { id: 1, name: 'Alice', email: 'alice@example.com', extra: 'data' },
        { id: 2, name: 'Bob', email: 'bob@example.com', extra: 'more' },
      ],
      { format: 'json', columns: ['id', 'name'] }
    );

    const parsed = JSON.parse(logs.join('\n'));
    expect(parsed).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]);
  });

  it('json mode does not apply columns to single objects', () => {
    formatOutput(
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { format: 'json', columns: ['id', 'name'] }
    );

    const parsed = JSON.parse(logs.join('\n'));
    expect(parsed).toEqual({ id: 1, name: 'Alice', email: 'alice@example.com' });
  });

  it('select overrides columns in json mode', () => {
    formatOutput([{ id: 1, name: 'Alice', email: 'alice@example.com' }], {
      format: 'json',
      columns: ['id', 'name'],
      select: 'email',
    });

    const parsed = JSON.parse(logs.join('\n'));
    expect(parsed).toEqual([{ email: 'alice@example.com' }]);
  });

  it('uses a visible ellipsis when truncating table cells', () => {
    formatOutput([{ overview: 'x'.repeat(120) }], {
      format: 'table',
      columns: ['overview'],
    });

    expect(logs.join('\n')).toContain('…');
  });
});
