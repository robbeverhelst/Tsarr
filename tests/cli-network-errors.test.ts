import { describe, expect, it } from 'bun:test';
import { classifyNetworkError } from '../src/cli/network-errors.js';
import { ConnectionError } from '../src/core/errors.js';

function withCause(message: string, cause: Record<string, unknown>) {
  return Object.assign(new Error(message), { cause });
}

describe('classifyNetworkError', () => {
  it.each([
    ['ECONNREFUSED', 'refused'],
    ['ConnectionRefused', 'refused'],
    ['ENOTFOUND', 'not-found'],
    ['ECONNRESET', 'reset'],
    ['ConnectionReset', 'reset'],
    ['ETIMEDOUT', 'timeout'],
  ])('reads %s from error.cause.code', (code, kind) => {
    expect(classifyNetworkError(withCause('boom', { code }))?.kind).toBe(kind);
  });

  it('reads the code from error.code when there is no cause', () => {
    expect(classifyNetworkError({ code: 'ECONNREFUSED', message: '' })).toEqual({
      kind: 'refused',
    });
  });

  it.each([
    ['connect ECONNREFUSED 127.0.0.1:7878', 'refused'],
    ['getaddrinfo ENOTFOUND radarr.lan', 'not-found'],
    ['read ECONNRESET', 'reset'],
    ['connect ETIMEDOUT', 'timeout'],
    ['fetch failed', 'unreachable'],
    ['Failed to fetch', 'unreachable'],
  ])('matches "%s" on the message', (message, kind) => {
    expect(classifyNetworkError(new Error(message))?.kind).toBe(kind);
  });

  it("recognises the resilient fetch's timeout error", () => {
    expect(classifyNetworkError(new ConnectionError('Request timed out after 30000ms'))?.kind).toBe(
      'timeout'
    );
  });

  it('keeps the cause message', () => {
    expect(
      classifyNetworkError(withCause('fetch failed', { message: 'self-signed cert' }))
    ).toEqual({ kind: 'unreachable', causeMessage: 'self-signed cert' });
  });

  it.each([
    ['an API error body', { title: 'Not Found', status: 404 }],
    ['an empty error', {}],
    ['a plain error', new Error('Something else')],
    ['a string', 'ECONNREFUSED'],
    ['null', null],
  ])('returns null for %s', (_label, error) => {
    expect(classifyNetworkError(error)).toBeNull();
  });
});
