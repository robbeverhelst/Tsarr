export type OutputFormat = 'json' | 'table' | 'quiet';

export function detectFormat(args: {
  json?: boolean;
  table?: boolean;
  quiet?: boolean;
}): OutputFormat {
  if (args.quiet) return 'quiet';
  if (args.json) return 'json';
  if (args.table) return 'table';
  return process.stdout.isTTY ? 'table' : 'json';
}

export function formatOutput(
  data: unknown,
  options: {
    format: OutputFormat;
    columns?: string[];
    idField?: string;
    noHeader?: boolean;
  }
): void {
  if (data == null) {
    return;
  }

  switch (options.format) {
    case 'json':
      console.log(JSON.stringify(data, null, 2));
      break;
    case 'quiet': {
      const items = Array.isArray(data) ? data : [data];
      const field = options.idField ?? 'id';
      for (const item of items) {
        if (item?.[field] != null) console.log(item[field]);
      }
      break;
    }
    case 'table':
      printTable(data, options.columns, options.noHeader);
      break;
  }
}

function printTable(data: unknown, columns?: string[], noHeader?: boolean): void {
  const items = Array.isArray(data) ? data : [data];
  if (items.length === 0) {
    console.log('No results.');
    return;
  }

  const cols = columns ?? Object.keys(items[0] ?? {}).slice(0, 8);
  if (cols.length === 0) return;

  // Calculate column widths (cap at 60 chars to keep table readable)
  const maxColWidth = 60;
  const widths = cols.map(col => {
    const values = items.map(item => formatCell(item?.[col]));
    return Math.min(maxColWidth, Math.max(col.length, ...values.map(v => v.length)));
  });

  // Header
  if (!noHeader) {
    const header = cols.map((col, i) => col.toUpperCase().padEnd(widths[i])).join('  ');
    console.log(header);
    console.log(cols.map((_, i) => '─'.repeat(widths[i])).join('  '));
  }

  // Rows
  for (const item of items) {
    const row = cols
      .map((col, i) => {
        const cell = formatCell(item?.[col]);
        const truncated = cell.length > widths[i] ? `${cell.slice(0, widths[i] - 1)}…` : cell;
        return truncated.padEnd(widths[i]);
      })
      .join('  ');
    console.log(row);
  }

  console.log(`\n${items.length} result${items.length === 1 ? '' : 's'}`);
}

function formatCell(value: unknown): string {
  if (value == null) return '—';
  if (typeof value === 'boolean') return value ? 'yes' : 'no';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
