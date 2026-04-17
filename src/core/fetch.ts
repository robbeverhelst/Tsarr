import { ConnectionError } from './errors';

export interface RetryOptions {
  /** Maximum number of retry attempts for transient failures (default: 3) */
  maxRetries?: number;
  /** Initial delay in ms before the first retry (default: 1000) */
  initialDelayMs?: number;
  /** Maximum delay in ms between retries (default: 10000) */
  maxDelayMs?: number;
}

export interface ResilientFetchOptions {
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Retry configuration for transient failures. Omit to disable retries. */
  retry?: RetryOptions;
}

const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_INITIAL_DELAY = 1_000;
const DEFAULT_MAX_DELAY = 10_000;

const RETRYABLE_STATUS_CODES = new Set([408, 429, 502, 503, 504]);

function isRetryable(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return false;
  }
  if (error instanceof TypeError) {
    // Network errors from fetch (e.g. DNS failure, connection refused)
    return true;
  }
  return false;
}

function getRetryDelay(attempt: number, initialDelayMs: number, maxDelayMs: number): number {
  const delay = initialDelayMs * 2 ** attempt;
  const jitter = delay * 0.2 * Math.random();
  return Math.min(delay + jitter, maxDelayMs);
}

/**
 * Creates a fetch function with timeout and retry support.
 *
 * - Timeout uses AbortController to cancel requests that exceed the limit.
 * - Retry uses exponential backoff with jitter for transient failures
 *   (network errors and 408/429/502/503/504 status codes).
 */
export function createResilientFetch(options: ResilientFetchOptions = {}): typeof fetch {
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const maxRetries = options.retry ? (options.retry.maxRetries ?? DEFAULT_MAX_RETRIES) : 0;
  const initialDelayMs = options.retry?.initialDelayMs ?? DEFAULT_INITIAL_DELAY;
  const maxDelayMs = options.retry?.maxDelayMs ?? DEFAULT_MAX_DELAY;

  const resilientFetch = async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    let lastError: unknown;
    const template = createRequestTemplate(input, init);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Merge abort signals: respect caller's signal and our timeout
      const callerSignal = init?.signal;
      if (callerSignal?.aborted) {
        clearTimeout(timeoutId);
        throw callerSignal.reason ?? new DOMException('The operation was aborted.', 'AbortError');
      }

      const onCallerAbort = () => controller.abort(callerSignal!.reason);
      callerSignal?.addEventListener('abort', onCallerAbort, { once: true });

      try {
        const response = await globalThis.fetch(
          new Request(template.clone(), { signal: controller.signal })
        );

        clearTimeout(timeoutId);
        callerSignal?.removeEventListener('abort', onCallerAbort);

        if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < maxRetries) {
          lastError = new ConnectionError(`Request failed with status ${response.status}`);
          const delay = getRetryDelay(attempt, initialDelayMs, maxDelayMs);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        callerSignal?.removeEventListener('abort', onCallerAbort);

        // If the caller aborted, don't retry
        if (callerSignal?.aborted) {
          throw callerSignal.reason ?? new DOMException('The operation was aborted.', 'AbortError');
        }

        // Timeout: wrap as ConnectionError
        if (error instanceof DOMException && error.name === 'AbortError') {
          lastError = new ConnectionError(`Request timed out after ${timeout}ms`);
          if (attempt < maxRetries) {
            const delay = getRetryDelay(attempt, initialDelayMs, maxDelayMs);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          throw lastError;
        }

        if (isRetryable(error) && attempt < maxRetries) {
          lastError = error;
          const delay = getRetryDelay(attempt, initialDelayMs, maxDelayMs);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  };

  return Object.assign(resilientFetch, {
    preconnect: globalThis.fetch.preconnect?.bind(globalThis.fetch),
  }) as typeof fetch;
}

function createRequestTemplate(input: RequestInfo | URL, init?: RequestInit): Request {
  const { signal: _signal, ...requestInit } = init ?? {};

  if (input instanceof Request) {
    return init ? new Request(input.clone(), requestInit) : input.clone();
  }

  return new Request(input, requestInit);
}
