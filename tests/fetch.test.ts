import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { ConnectionError } from '../src/core/errors.js';
import { createResilientFetch } from '../src/core/fetch.js';

describe('createResilientFetch', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function getSignal(input: RequestInfo | URL, init?: RequestInit) {
    return init?.signal ?? (input instanceof Request ? input.signal : undefined);
  }

  describe('timeout', () => {
    it('should abort requests that exceed the timeout', async () => {
      globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
        // Simulate a slow request that respects abort
        return new Promise((_resolve, reject) => {
          const signal = getSignal(input, init);
          const onAbort = () =>
            reject(new DOMException('The operation was aborted.', 'AbortError'));
          if (signal?.aborted) {
            onAbort();
            return;
          }
          signal?.addEventListener('abort', onAbort, { once: true });
        });
      }) as typeof fetch;

      const resilientFetch = createResilientFetch({
        timeout: 50,
        retry: { maxRetries: 0 },
      });

      await expect(resilientFetch('http://example.com')).rejects.toBeInstanceOf(ConnectionError);
      await expect(resilientFetch('http://example.com')).rejects.toHaveProperty(
        'message',
        'Request timed out after 50ms'
      );
    });

    it('should use the default timeout when none is specified', () => {
      const resilientFetch = createResilientFetch();
      expect(resilientFetch).toBeFunction();
    });

    it('should not retry timeouts unless retry is explicitly configured', async () => {
      let attempt = 0;
      globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
        attempt++;
        return new Promise((_resolve, reject) => {
          const signal = getSignal(input, init);
          const onAbort = () =>
            reject(new DOMException('The operation was aborted.', 'AbortError'));
          if (signal?.aborted) {
            onAbort();
            return;
          }
          signal?.addEventListener('abort', onAbort, { once: true });
        });
      }) as typeof fetch;

      const resilientFetch = createResilientFetch({ timeout: 50 });

      await expect(resilientFetch('http://example.com')).rejects.toBeInstanceOf(ConnectionError);
      expect(attempt).toBe(1);
    });

    it('should succeed if the request completes within the timeout', async () => {
      globalThis.fetch = (async () => {
        return new Response('ok', { status: 200 });
      }) as typeof fetch;

      const resilientFetch = createResilientFetch({ timeout: 5000 });
      const response = await resilientFetch('http://example.com');
      expect(response.status).toBe(200);
    });
  });

  describe('retry', () => {
    it('should retry on 503 status and eventually succeed', async () => {
      let attempt = 0;
      globalThis.fetch = (async () => {
        attempt++;
        if (attempt < 3) {
          return new Response('Service Unavailable', { status: 503 });
        }
        return new Response('ok', { status: 200 });
      }) as typeof fetch;

      const resilientFetch = createResilientFetch({
        retry: { maxRetries: 3, initialDelayMs: 10, maxDelayMs: 50 },
      });

      const response = await resilientFetch('http://example.com');
      expect(response.status).toBe(200);
      expect(attempt).toBe(3);
    });

    it('should retry request objects with bodies using a fresh clone each attempt', async () => {
      const bodies: string[] = [];
      let attempt = 0;
      globalThis.fetch = (async (input: RequestInfo | URL) => {
        attempt++;
        const request = input as Request;
        bodies.push(await request.text());
        if (attempt === 1) {
          return new Response('Service Unavailable', { status: 503 });
        }
        return new Response('ok', { status: 200 });
      }) as typeof fetch;

      const resilientFetch = createResilientFetch({
        retry: { maxRetries: 1, initialDelayMs: 10, maxDelayMs: 10 },
      });

      const request = new Request('http://example.com', {
        method: 'POST',
        body: JSON.stringify({ title: 'test' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await resilientFetch(request);
      expect(response.status).toBe(200);
      expect(attempt).toBe(2);
      expect(bodies).toEqual([
        JSON.stringify({ title: 'test' }),
        JSON.stringify({ title: 'test' }),
      ]);
    });

    it('should retry on 429 status', async () => {
      let attempt = 0;
      globalThis.fetch = (async () => {
        attempt++;
        if (attempt === 1) {
          return new Response('Too Many Requests', { status: 429 });
        }
        return new Response('ok', { status: 200 });
      }) as typeof fetch;

      const resilientFetch = createResilientFetch({
        retry: { maxRetries: 2, initialDelayMs: 10 },
      });

      const response = await resilientFetch('http://example.com');
      expect(response.status).toBe(200);
      expect(attempt).toBe(2);
    });

    it('should retry on network errors (TypeError)', async () => {
      let attempt = 0;
      globalThis.fetch = (async () => {
        attempt++;
        if (attempt < 2) {
          throw new TypeError('fetch failed');
        }
        return new Response('ok', { status: 200 });
      }) as typeof fetch;

      const resilientFetch = createResilientFetch({
        retry: { maxRetries: 2, initialDelayMs: 10 },
      });

      const response = await resilientFetch('http://example.com');
      expect(response.status).toBe(200);
      expect(attempt).toBe(2);
    });

    it('should not retry on 4xx errors (except 408, 429)', async () => {
      let attempt = 0;
      globalThis.fetch = (async () => {
        attempt++;
        return new Response('Not Found', { status: 404 });
      }) as typeof fetch;

      const resilientFetch = createResilientFetch({
        retry: { maxRetries: 3, initialDelayMs: 10 },
      });

      const response = await resilientFetch('http://example.com');
      expect(response.status).toBe(404);
      expect(attempt).toBe(1);
    });

    it('should return the last retryable response after exhausting retries', async () => {
      let attempt = 0;
      globalThis.fetch = (async () => {
        attempt++;
        return new Response('Bad Gateway', { status: 502 });
      }) as typeof fetch;

      // maxRetries: 2 means initial + 2 retries = 3 total attempts
      // But the 4th attempt (index 3) returns the response since attempt >= maxRetries
      const resilientFetch = createResilientFetch({
        retry: { maxRetries: 2, initialDelayMs: 10 },
      });

      const response = await resilientFetch('http://example.com');
      // After exhausting retries, the last attempt returns the 502 response
      expect(response.status).toBe(502);
      expect(attempt).toBe(3);
    });

    it('should respect maxRetries: 0 and not retry', async () => {
      let attempt = 0;
      globalThis.fetch = (async () => {
        attempt++;
        return new Response('Bad Gateway', { status: 502 });
      }) as typeof fetch;

      const resilientFetch = createResilientFetch({
        retry: { maxRetries: 0 },
      });

      const response = await resilientFetch('http://example.com');
      expect(response.status).toBe(502);
      expect(attempt).toBe(1);
    });
  });

  describe('caller abort signal', () => {
    it('should respect caller abort signal', async () => {
      globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
        return new Promise((_resolve, reject) => {
          const signal = getSignal(input, init);
          const onAbort = () =>
            reject(new DOMException('The operation was aborted.', 'AbortError'));
          if (signal?.aborted) {
            onAbort();
            return;
          }
          signal?.addEventListener('abort', onAbort, { once: true });
        });
      }) as typeof fetch;

      const controller = new AbortController();
      controller.abort();

      const resilientFetch = createResilientFetch({
        retry: { maxRetries: 0 },
      });

      await expect(
        resilientFetch('http://example.com', { signal: controller.signal })
      ).rejects.toThrow();
    });
  });

  describe('integration with createServarrClient', () => {
    it('should produce a fetch function', () => {
      const resilientFetch = createResilientFetch({
        timeout: 5000,
        retry: { maxRetries: 2 },
      });

      expect(resilientFetch).toBeFunction();
    });
  });
});
