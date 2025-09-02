# Tsarr

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=flat-square&logo=bun&logoColor=white)](https://bun.sh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/robbeverhelst/Tsarr/workflows/CI/badge.svg)](https://github.com/robbeverhelst/Tsarr/actions)

**Type-safe TypeScript SDK for Servarr APIs (Radarr, Sonarr, etc.)**

Tsarr provides type-safe TypeScript clients for all Servarr APIs, generated from their Swagger/OpenAPI specifications. Perfect for building automation tools, scripts, and applications to manage your media servers.

## Features

- 🛡️ **Type-safe** - Generated from official Swagger/OpenAPI specs
- ⚡ **Bun-optimized** - Leverages Bun's native fetch API
- 📦 **Modular** - Separate modules for each Servarr app (Radarr, Sonarr, etc.)
- 🌳 **Tree-shakable** - Lightweight and dependency-minimal
- 🔄 **Auto-generated** - CI pipeline regenerates when APIs change
- 🤖 **Automation-friendly** - Perfect for building tools and scripts

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

- [API Documentation](https://robbeverhelst.github.io/Tsarr/) - Auto-generated TypeScript API docs
- [Usage Guide](./docs/usage.md) - Complete usage documentation with examples
- [Examples](./docs/examples.md) - Real-world automation examples
- [Examples Directory](./examples/) - Runnable example scripts

## Use Cases

Perfect for building:
- **Automation scripts** - Bulk movie imports, library maintenance, and media organization
- **Management tools** - Custom dashboards, backup utilities, and monitoring scripts  
- **Integration scripts** - Connect Servarr apps with other services and workflows
- **CLI tools** - Command-line utilities for media server administration

## Contributing

This project uses:
- [Bun](https://bun.sh) as the JavaScript runtime
- [Biome](https://biomejs.dev) for linting and formatting
- [@hey-api/openapi-ts](https://github.com/hey-api/openapi-ts) for code generation
- [Renovate](https://renovatebot.com) for dependency updates

## License

MIT - see [LICENSE](LICENSE) file for details.
