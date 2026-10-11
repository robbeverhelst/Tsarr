export type NetworkErrorKind = 'refused' | 'not-found' | 'reset' | 'timeout' | 'unreachable';

export interface NetworkError {
  kind: NetworkErrorKind;
  /** Message of the underlying cause, when the runtime supplies one. */
  causeMessage?: string;
}

/**
 * Recognises transport failures (refused, DNS, reset, timeout, unreachable)
 * from a thrown error or a generated client's `error` value. Codes are read
 * from `error.cause.code` or `error.code`; runtimes that only put the code in
 * the message are matched on the message. Returns null for anything else.
 */
export function classifyNetworkError(error: unknown): NetworkError | null {
  if (!error || typeof error !== 'object') return null;
  const err = error as Record<string, any>;
  const cause = err.cause;
  const code = cause?.code ?? err.code;
  const msg = typeof err.message === 'string' ? err.message : '';
  const causeMessage = typeof cause?.message === 'string' ? cause.message : undefined;

  let kind: NetworkErrorKind | null = null;
  if (code === 'ECONNREFUSED' || code === 'ConnectionRefused' || msg.includes('ECONNREFUSED')) {
    kind = 'refused';
  } else if (code === 'ENOTFOUND' || msg.includes('ENOTFOUND')) {
    kind = 'not-found';
  } else if (code === 'ECONNRESET' || code === 'ConnectionReset' || msg.includes('ECONNRESET')) {
    kind = 'reset';
  } else if (code === 'ETIMEDOUT' || msg.includes('ETIMEDOUT') || msg.includes('timed out')) {
    kind = 'timeout';
  } else if (msg.includes('fetch failed') || msg.includes('Failed to fetch')) {
    kind = 'unreachable';
  }

  if (!kind) return null;
  return causeMessage ? { kind, causeMessage } : { kind };
}
