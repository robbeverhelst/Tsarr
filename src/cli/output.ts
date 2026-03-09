export type OutputFormat = 'json' | 'table' | 'quiet' | 'plain';

export function detectFormat(args: {
  json?: boolean;
  table?: boolean;
  quiet?: boolean;
  plain?: boolean;
}): OutputFormat {
  if (args.quiet) return 'quiet';
  if (args.json) return 'json';
  if (args.plain) return 'plain';
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
    select?: string;
  }
): void {
  if (data == null) {
    return;
  }

  switch (options.format) {
    case 'json': {
      const output = options.select ? selectFields(data, options.select) : data;
      console.log(JSON.stringify(output, null, 2));
      break;
    }
    case 'quiet': {
      const items = Array.isArray(data) ? data : [data];
      const field = options.idField ?? 'id';
      for (const item of items) {
        if (item?.[field] != null) console.log(item[field]);
      }
      break;
    }
    case 'plain':
      printPlain(data, options.columns);
      break;
    case 'table':
      printTable(data, options.columns, options.noHeader);
      break;
  }
}

function selectFields(data: unknown, select: string): unknown {
  const fields = select.split(',').map(f => f.trim());
  if (Array.isArray(data)) {
    return data.map(item => pickFields(item, fields));
  }
  return pickFields(data, fields);
}

function pickFields(item: unknown, fields: string[]): Record<string, unknown> {
  if (item == null || typeof item !== 'object') return {};
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    result[field] = (item as Record<string, unknown>)[field];
  }
  return result;
}

function printPlain(data: unknown, columns?: string[]): void {
  const items = Array.isArray(data) ? data : [data];
  if (items.length === 0) return;

  const cols = columns ?? Object.keys(items[0] ?? {}).slice(0, 8);
  if (cols.length === 0) return;

  // Header
  console.log(cols.join('\t'));

  // Rows
  for (const item of items) {
    const row = cols.map(col => formatCellPlain(item?.[col])).join('\t');
    console.log(row);
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

  // Format all cells first
  const formattedRows = items.map(item => cols.map(col => formatCell(col, item?.[col])));

  // Calculate column widths (cap at 60 chars to keep table readable)
  const maxColWidth = 60;
  const headers = cols.map(col => formatHeader(col));
  const widths = cols.map((_, i) => {
    const values = formattedRows.map(row => stripAnsi(row[i]).length);
    return Math.min(maxColWidth, Math.max(headers[i].length, ...values));
  });

  // Header
  if (!noHeader) {
    const header = headers.map((h, i) => h.padEnd(widths[i])).join('  ');
    console.log(header);
    console.log(cols.map((_, i) => '\u2500'.repeat(widths[i])).join('  '));
  }

  // Rows
  for (const row of formattedRows) {
    const line = row
      .map((cell, i) => {
        const visible = stripAnsi(cell).length;
        const truncated = visible > widths[i] ? truncateWithAnsi(cell, widths[i]) : cell;
        const pad = widths[i] - stripAnsi(truncated).length;
        return truncated + ' '.repeat(Math.max(0, pad));
      })
      .join('  ');
    console.log(line);
  }

  console.log(`\n${items.length} result${items.length === 1 ? '' : 's'}`);
}

function formatHeader(col: string): string {
  // Convert camelCase/snake_case to Title Case
  return col
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .toUpperCase();
}

const ESC = String.fromCharCode(27);
const GREEN = `${ESC}[32m`;
const RED = `${ESC}[31m`;
const YELLOW = `${ESC}[33m`;
const RESET = `${ESC}[0m`;

function formatCell(column: string, value: unknown): string {
  if (value == null) return '\u2014';

  // Boolean fields: show status indicators
  if (typeof value === 'boolean') {
    return value ? `${GREEN}\u2713${RESET}` : `${RED}\u2717${RESET}`;
  }

  // Status-like string fields
  if (column === 'status') {
    return formatStatus(String(value));
  }

  // Size fields: human-readable bytes
  if (
    typeof value === 'number' &&
    (column.toLowerCase().includes('size') || column === 'freeSpace' || column === 'sizeleft')
  ) {
    return formatBytes(value);
  }

  // Date fields
  if (column.toLowerCase().includes('date') || column === 'createdAt' || column === 'updatedAt') {
    return formatDate(value);
  }

  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function formatCellPlain(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function formatStatus(status: string): string {
  const lower = status.toLowerCase();
  if (lower === 'ok' || lower === 'available' || lower === 'ended' || lower === 'continuing') {
    return `${GREEN}${status}${RESET}`;
  }
  if (lower === 'fail' || lower === 'missing' || lower === 'not configured') {
    return `${RED}${status}${RESET}`;
  }
  if (lower === 'warning' || lower === 'downloading' || lower === 'queued') {
    return `${YELLOW}${status}${RESET}`;
  }
  return status;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / 1024 ** i;
  return `${val < 10 ? val.toFixed(1) : Math.round(val)} ${units[i]}`;
}

function formatDate(value: unknown): string {
  if (typeof value !== 'string' && !(value instanceof Date)) return String(value);
  try {
    const d = new Date(value as string | Date);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return String(value);
  }
}

// Simple ANSI escape stripping for width calculation
const ANSI_PATTERN = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');
function stripAnsi(str: string): string {
  return str.replace(ANSI_PATTERN, '');
}

function truncateWithAnsi(str: string, maxWidth: number): string {
  let visible = 0;
  let i = 0;
  while (i < str.length && visible < maxWidth - 1) {
    if (str[i] === ESC) {
      const end = str.indexOf('m', i);
      if (end !== -1) {
        i = end + 1;
        continue;
      }
    }
    visible++;
    i++;
  }
  return `${str.slice(0, i)}\u2026${RESET}`;
}
