# Tsarr - TypeScript SDK for Servarr APIs

## Project Overview
Type-safe TypeScript SDK for Servarr APIs (Radarr, Sonarr, etc.) generated from Swagger/OpenAPI specs. Optimized for Bun runtime and Infrastructure-as-Code workflows.

## Key Commands
- `bun install` - Install dependencies
- `bun run dev` - Run development server
- `bun run build` - Build the project
- `bun run lint` - Check code quality
- `bun run lint:fix` - Fix linting issues
- `bun run format` - Format code
- `bun run typecheck` - Type check without emitting

## Architecture
- **Runtime**: Bun (leverages native fetch API)
- **Structure**: Modular design (separate modules per Servarr app)
- **Generation**: Uses swagger-typescript-api for type-safe clients
- **Target**: Tree-shakable, lightweight SDK for IaC environments

## Development Notes
- Source code in `src/` directory
- Generated APIs live in `src/generated/<service>/`, with hand-written wrappers in `src/clients/<service>.ts`
- Uses Biome for linting/formatting instead of ESLint/Prettier
- Use conventional prefixes for commit messages and PR titles: `feat:`, `fix:`, or `chore:`
- CI pipeline runs on all pushes and PRs
- Renovate handles dependency updates weekly

## Future Implementation
- Swagger file collection from Servarr instances
- Code generation scripts using `swagger-typescript-api`
- Modular API clients for each Servarr app
- Integration with PrepArr/CodeArr sidecar project
