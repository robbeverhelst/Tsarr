import consola from 'consola';

export async function promptIfMissing(value: string | undefined, message: string): Promise<string> {
  if (value) return value;
  if (!process.stdin.isTTY) {
    throw new Error(`Missing required argument. Use --help for usage info.`);
  }
  const result = await consola.prompt(message, { type: 'text' });
  if (typeof result !== 'string' || !result.trim()) {
    throw new Error('No input provided.');
  }
  return result.trim();
}

export async function promptConfirm(message: string, skipPrompt = false): Promise<boolean> {
  if (skipPrompt) return true;
  if (!process.stdin.isTTY) {
    throw new Error(
      'Destructive action requires confirmation. Use --yes to skip in non-interactive mode.'
    );
  }
  const result = await consola.prompt(message, { type: 'confirm' });
  return result === true;
}

export async function promptSelect(
  message: string,
  options: { label: string; value: string }[]
): Promise<string> {
  if (!process.stdin.isTTY) {
    throw new Error('Interactive selection requires a TTY.');
  }
  const result = await consola.prompt(message, {
    type: 'select',
    options: options.map(o => ({ label: o.label, value: o.value })),
  });
  return result as string;
}

export async function promptMultiSelect(
  message: string,
  options: { label: string; value: string }[]
): Promise<string[]> {
  if (!process.stdin.isTTY) {
    throw new Error('Interactive selection requires a TTY.');
  }
  const result = await consola.prompt(message, {
    type: 'multiselect',
    options: options.map(o => ({ label: o.label, value: o.value })),
  });
  return result as unknown as string[];
}
