# Tsarr Contributor Notes

## What This Repo Is
- Tsarr is a TypeScript SDK and CLI for the Servarr ecosystem: Radarr, Sonarr, Lidarr, Readarr, Prowlarr, and Bazarr.
- The published package targets Node.js (`>=18.20.8`), while Bun is used for local development, build, generation, and tests.
- This repo already ships generated clients, handwritten wrappers, a CLI, packaging assets, and user-facing docs. Do not treat core features as "future work".

## Read First
- `README.md` for product overview, install paths, and developer commands.
- `docs/cli.md` for CLI behavior and supported command patterns.
- `docs/usage.md` for SDK usage examples.
- `docs/distribution.md` and `packaging/` for release and packaging workflows.

## Core Commands
- `bun install` - install dependencies
- `bun test` - run tests
- `bun run build` - regenerate clients/types and build the package
- `bun run generate` - regenerate all OpenAPI-derived clients
- `bun run refresh:specs` - refresh local OpenAPI specs
- `bun run typecheck` - run TypeScript checks
- `bun run lint` - run Biome checks
- `bun run cli -- --help` - inspect the CLI locally

## Repo Map
- `src/cli/` - CLI entrypoint, shared command framework, output formatting, config, prompts
- `src/clients/` - handwritten service wrappers exposed as public SDK entrypoints
- `src/generated/` - generated OpenAPI clients and types for each service
- `src/core/` - shared config validation, error types, and HTTP helpers
- `scripts/` - code generation, spec refresh, type export, and packaging automation
- `specs/` - local OpenAPI inputs used by generation
- `tests/` - unit, CLI, and integration coverage
- `examples/` - runnable SDK examples

## Generation Rules
- Generated code lives under `src/generated/`. Prefer changing generator inputs or scripts over editing generated files by hand.
- Client generation uses `@hey-api/openapi-ts`, not `swagger-typescript-api`.
- `scripts/generate.ts` includes Bazarr-specific spec normalization. Preserve that behavior when touching generation.
- If you change API surface area, keep generated code, handwritten wrappers, exports, and docs aligned.

## Editing Guidance
- Most product logic changes belong in `src/cli/`, `src/clients/`, `src/core/`, or `scripts/`.
- Keep CLI docs and smoke tests in sync when you add or rename commands.
- Treat `README.md` and `docs/` as user-facing sources of truth. Keep this file short and operational.
- There is no development server in this repo. The `dev` script runs the library entrypoint and is not an app server workflow.

## Quality Bar
- Use Biome for formatting and linting.
- Prefer adding or updating tests when changing command definitions, output behavior, config handling, or client wrappers.
- Preserve modular exports for per-service imports such as `tsarr/radarr` and `tsarr/radarr/types`.
