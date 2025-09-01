# TsArr

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=flat-square&logo=bun&logoColor=white)](https://bun.sh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/robbeverhelst/TsArr/workflows/CI/badge.svg)](https://github.com/robbeverhelst/TsArr/actions)

**Type-safe TypeScript SDK for Servarr APIs (Radarr, Sonarr, etc.)**

TsArr provides type-safe TypeScript clients for all Servarr APIs, generated from their Swagger/OpenAPI specifications. Designed to run with Bun as the JavaScript runtime and optimized for Infrastructure-as-Code (IaC) workflows in stateless Kubernetes environments.

## Features

- 🛡️ **Type-safe** - Generated from official Swagger/OpenAPI specs
- ⚡ **Bun-optimized** - Leverages Bun's native fetch API
- 📦 **Modular** - Separate modules for each Servarr app (Radarr, Sonarr, etc.)
- 🌳 **Tree-shakable** - Lightweight and dependency-minimal
- 🔄 **Auto-generated** - CI pipeline regenerates when APIs change
- ☸️ **IaC-ready** - Compatible with Helm, Terraform, and PrepArr/CodeArr

## Supported Servarr Apps

- **Radarr** - Movie collection manager
- **Sonarr** - TV series collection manager  
- **Lidarr** - Music collection manager
- **Readarr** - Book collection manager
- **Prowlarr** - Indexer manager

## Installation

```bash
bun add tsarr
```

## Quick Start

```typescript
import { RadarrClient, SonarrClient, LidarrClient } from 'tsarr';

const radarr = new RadarrClient({
  baseUrl: 'http://localhost:7878',
  apiKey: 'your-api-key'
});

// Type-safe API calls
const movies = await radarr.getMovies();
const status = await radarr.getSystemStatus();
```

## Development

Install dependencies:

```bash
bun install
```

Run development server:

```bash
bun run dev
```

Build the project:

```bash
bun run build
```

Lint and format:

```bash
bun run lint
bun run format
```

## 📖 Documentation

- [Usage Guide](./docs/usage.md) - Complete usage documentation with examples
- [Examples](./docs/examples.md) - Real-world automation examples
- [Examples Directory](./examples/) - Runnable example scripts

## Architecture

TsArr is designed for use with:
- **Automation scripts** - Bulk operations and maintenance tasks
- **CI/CD pipelines** - Automated media management
- **Containerized environments** - Docker and Kubernetes deployments
- **Modern JavaScript runtimes** - Optimized for Bun performance

## Contributing

This project uses:
- [Bun](https://bun.sh) as the JavaScript runtime
- [Biome](https://biomejs.dev) for linting and formatting
- [@hey-api/openapi-ts](https://github.com/hey-api/openapi-ts) for code generation
- [Renovate](https://renovatebot.com) for dependency updates

## License

MIT - see [LICENSE](LICENSE) file for details.
