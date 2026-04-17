# Contributing to Tsarr

Thanks for your interest in contributing! This document covers the basics for
getting a change merged.

## Prerequisites

- [Bun](https://bun.sh) 1.3.12 or newer (used for dev, build, test, generation)
- Node.js 24.15.0 or newer (used by consumers of the published package)

## Setup

```bash
git clone https://github.com/robbeverhelst/tsarr.git
cd tsarr
bun install
```

## Common commands

```bash
bun test              # run the test suite
bun run typecheck     # run TypeScript checks
bun run lint          # run Biome checks
bun run lint:fix      # auto-fix lint and formatting
bun run build         # regenerate clients/types and build the package
bun run generate      # regenerate OpenAPI-derived clients
bun run refresh:specs # refresh local OpenAPI specs
bun run cli -- --help # inspect the CLI locally
```

See `CLAUDE.md` and `docs/` for repo structure and deeper context.

## Making changes

1. Create a branch from `main`.
2. Make your change. Keep the scope focused.
3. Add or update tests for any behavior change.
4. Run `bun run lint`, `bun run typecheck`, and `bun test` before pushing.
5. Open a pull request.

### Working with generated code

Generated clients live under `src/generated/`. Do not edit them directly —
change the generator inputs (`specs/`) or scripts (`scripts/generate.ts`) and
re-run `bun run generate`.

If your change alters API surface area, keep generated code, handwritten
wrappers (`src/clients/`), exports (`package.json`), and docs in sync.

## Commit messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/)
with a scope. Release versioning is driven by commit messages via
[semantic-release](https://semantic-release.gitbook.io/).

Format: `type(scope): description`

Common types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `build`, `ci`.

Examples:

```
feat(cli): add --json output to list commands
fix(radarr): handle missing apiKey without crashing
refactor(core): extract retry logic into shared helper
```

A `feat` commit triggers a minor release; `fix` triggers a patch; a `BREAKING
CHANGE:` footer triggers a major.

## Pull requests

- Keep PRs focused and small when possible. Bundle related refactor and
  cleanup into a single PR — don't artificially split.
- Fill out the PR template.
- Make sure CI is green before requesting review.

## Reporting bugs and requesting features

Use the GitHub issue templates. Include reproduction steps, expected vs actual
behavior, and the version of Tsarr and the relevant Servarr product.

## Security

Do not open public issues for security reports. See `SECURITY.md`.

## License

By contributing, you agree your contributions are licensed under the MIT
license (see `LICENSE`).
