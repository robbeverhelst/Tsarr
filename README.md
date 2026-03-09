# <img src="./docs/logo.png" alt="Tsarr Logo" width="40" height="40" style="vertical-align: middle; margin-right: 8px;"> Tsarr

*TypeScript-arr (pronounced "Tsar" /tsɑr/ - a Slavic king/emperor)*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=flat-square&logo=bun&logoColor=white)](https://bun.sh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/robbeverhelst/Tsarr/workflows/CI/badge.svg)](https://github.com/robbeverhelst/Tsarr/actions)

**Type-safe TypeScript SDK and CLI for Servarr APIs (Radarr, Sonarr, etc.)**

Tsarr provides type-safe TypeScript clients and a CLI for all Servarr APIs, generated from their Swagger/OpenAPI specifications. Use it as an SDK in your code or as a standalone CLI tool.

## Features

- 🛡️ **Type-safe** - Generated from official Swagger/OpenAPI specs
- ⚡ **Bun-optimized** - Leverages native fetch API
- 📦 **Modular** - Separate clients for each Servarr app
- 💻 **CLI included** - Manage all Servarr apps from the terminal

## Supported Servarr Apps

- **Radarr** - Movie collection manager
- **Sonarr** - TV series collection manager
- **Lidarr** - Music collection manager
- **Readarr** - Book collection manager
- **Prowlarr** - Indexer manager
- **Bazarr** - Subtitle manager

## Installation

```bash
# As a dependency (SDK)
bun add tsarr

# As a global CLI
bun add -g tsarr
```

## CLI

### Setup

```bash
# Interactive setup wizard
tsarr config init

# Or configure manually
tsarr config set services.radarr.baseUrl http://localhost:7878
tsarr config set services.radarr.apiKey your-api-key

# Or use environment variables
export TSARR_RADARR_URL=http://localhost:7878
export TSARR_RADARR_API_KEY=your-api-key
```

Config is stored in `~/.config/tsarr/config.json` (global) or `.tsarr.json` (local project). Environment variables take priority over config files.

### Usage

```bash
tsarr <service> <resource> <action> [options]

# Examples
tsarr radarr movie list
tsarr radarr movie search --term "Interstellar"
tsarr sonarr series list
tsarr prowlarr indexer list
tsarr lidarr artist search --term "Radiohead"

# Output formats
tsarr radarr movie list --table    # Table (default in terminal)
tsarr radarr movie list --json     # JSON (default when piped)
tsarr radarr movie list --quiet    # IDs only

# Diagnostics
tsarr doctor                       # Test all configured connections

# Shell completions
tsarr completions bash >> ~/.bashrc
tsarr completions zsh >> ~/.zshrc
tsarr completions fish > ~/.config/fish/completions/tsarr.fish
```

### Available Commands

| Service | Resources |
|---------|-----------|
| `radarr` | movie, profile, tag, queue, rootfolder, system, history, customformat |
| `sonarr` | series, episode, profile, tag, rootfolder, system |
| `lidarr` | artist, album, profile, tag, rootfolder, system |
| `readarr` | author, book, profile, tag, rootfolder, system |
| `prowlarr` | indexer, search, app, tag, system |
| `bazarr` | series, movie, episode, provider, language, system |

See the [CLI Guide](./docs/cli.md) for full documentation including all commands, scripting examples, and shell completions.

## SDK

### Quick Start

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

### Modular Imports

```typescript
// Import only what you need
import { RadarrClient } from 'tsarr/radarr';
import { SonarrClient } from 'tsarr/sonarr';
import type { MovieResource } from 'tsarr/radarr/types';
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

- [CLI Guide](./docs/cli.md) - Complete CLI documentation with all commands and scripting examples
- [SDK Usage Guide](./docs/usage.md) - SDK usage documentation with examples
- [API Documentation](https://robbeverhelst.github.io/Tsarr/) - Auto-generated TypeScript API docs
- [Examples](./docs/examples.md) - Real-world automation examples
- [Examples Directory](./examples/) - Runnable example scripts

## Use Cases

Perfect for building:
- **Automation scripts** - Bulk movie imports, library maintenance, and media organization
- **Management tools** - Custom dashboards, backup utilities, and monitoring scripts  
- **Integration scripts** - Connect Servarr apps with other services and workflows
- **CLI usage** - Manage your media servers directly from the terminal

## Contributing

This project uses:
- [Bun](https://bun.sh) as the JavaScript runtime
- [Biome](https://biomejs.dev) for linting and formatting
- [@hey-api/openapi-ts](https://github.com/hey-api/openapi-ts) for code generation
- [Renovate](https://renovatebot.com) for dependency updates

## License

MIT - see [LICENSE](LICENSE) file for details.
