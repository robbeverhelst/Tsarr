/**
 * Binds a generated API namespace to one specific client instance.
 *
 * The generated `client.gen.ts` for each service exports a **module-level
 * singleton**, and every generated operation falls back to it
 * (`(options?.client ?? client)`). Configuring a wrapper by mutating that
 * singleton means the last wrapper constructed wins: a second client silently
 * rebinds the first one's base URL and credentials, so requests — and API keys
 * — can go to the wrong server with no error.
 *
 * Wrapping the namespace injects a per-instance `client` into every call, so
 * each wrapper is isolated. Call sites and types are unchanged.
 */
export function bindApiClient<T extends object>(api: T, client: unknown): T {
  // Generated operations are stable, so cache the wrapper per property to keep
  // referential equality — some clients store these references in a lookup map.
  const bound = new Map<PropertyKey, unknown>();

  return new Proxy(api, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver);
      if (typeof value !== 'function') return value;

      if (!bound.has(property)) {
        bound.set(property, (options?: Record<string, unknown>) =>
          (value as (o: unknown) => unknown)({ ...(options ?? {}), client })
        );
      }
      return bound.get(property);
    },
  }) as T;
}
