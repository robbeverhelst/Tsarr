# <img src="./docs/logo.png" alt="Tsarr Logo" width="40" height="40" style="vertical-align: middle; margin-right: 8px;"> Tsarr

*TypeScript-arr (pronounced "Tsar" /tsɑr/ - a Slavic king/emperor)*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![npm](https://img.shields.io/npm/v/tsarr?style=flat-square)](https://www.npmjs.com/package/tsarr)
[![npm downloads](https://img.shields.io/npm/dm/tsarr?style=flat-square)](https://www.npmjs.com/package/tsarr)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/robbeverhelst/Tsarr/workflows/CI/badge.svg)](https://github.com/robbeverhelst/Tsarr/actions)

**A Radarr CLI, Sonarr CLI, and type-safe TypeScript SDK for the entire Servarr ecosystem.**

Tsarr is a unified command-line tool and TypeScript SDK for managing Radarr, Sonarr, Lidarr, Readarr, Prowlarr, Bazarr, qBittorrent, and Seerr. Auto-generated from official OpenAPI specs, it gives you type-safe API clients and a powerful CLI to manage your entire *arr media stack from code or the terminal.

## Why Tsarr?

- **The only type-safe TypeScript client** for all Servarr apps in one package
- **Always up-to-date** — generated from official Swagger/OpenAPI specs, not manually maintained
- **CLI + SDK** — use it as a standalone Radarr/Sonarr CLI tool or import it as a library in your code
- **Zero dependencies for binaries** — standalone binaries for every platform, or run via Node.js/Bun
- **Built for automation** — JSON output, scripting-friendly, perfect for cron jobs and CI/CD pipelines

## Features

- 🛡️ **Type-safe** - Generated from official Swagger/OpenAPI specs
- ⚡ **Universal** - Works with Node.js, Bun, and as standalone binaries
- 📦 **Modular** - Separate clients for each Servarr app
- 💻 **CLI included** - Manage all Servarr apps from the terminal
- 🚀 **Multi-platform** - Available via npm, Homebrew, Docker, Scoop, Chocolatey, AUR, Nix, and pre-built binaries

## Supported Servarr Apps

- **Radarr** - Movie collection manager
- **Sonarr** - TV series collection manager
- **Lidarr** - Music collection manager
- **Readarr** - Book collection manager
- **Prowlarr** - Indexer manager
- **Bazarr** - Subtitle manager
- **qBittorrent** - Download client
- **Seerr** - Media request manager (Jellyseerr/Overseerr compatible)

## Installation

### npm / Node.js

```bash
# As a dependency (SDK)
npm install tsarr

# As a global CLI
npm install -g tsarr

# Or run directly without installing
npx tsarr doctor
```

### Bun

```bash
bun add tsarr
bun add -g tsarr
bunx tsarr doctor
```

### Homebrew (macOS / Linux)

```bash
brew install robbeverhelst/tsarr/tsarr
```

### OpenClaw / ClawHub

Install the published OpenClaw skill to manage your Servarr stack through TsArr:

```bash
openclaw clawhub install tsarr
# or with the registry CLI
clawhub install tsarr
```

### Pre-built Binaries

Download standalone binaries from [GitHub Releases](https://github.com/robbeverhelst/tsarr/releases) — no runtime needed:

| Platform | Download |
|---|---|
| macOS (Apple Silicon) | `tsarr-darwin-arm64` |
| macOS (Intel) | `tsarr-darwin-x64` |
| Linux (x64) | `tsarr-linux-x64` |
| Linux (arm64) | `tsarr-linux-arm64` |
| Windows (x64) | `tsarr-windows-x64.exe` |

```bash
# Example: Linux x64
curl -L https://github.com/robbeverhelst/tsarr/releases/latest/download/tsarr-linux-x64 -o tsarr
chmod +x tsarr
sudo mv tsarr /usr/local/bin/
```

### Docker

```bash
docker run --rm ghcr.io/robbeverhelst/tsarr doctor
docker run --rm -v ~/.config/tsarr:/root/.config/tsarr ghcr.io/robbeverhelst/tsarr radarr movie list
```

### Scoop (Windows)

> **Note:** Requires adding the tsarr bucket first.

```powershell
scoop bucket add tsarr https://github.com/robbeverhelst/scoop-tsarr
scoop install tsarr
```

### Chocolatey (Windows)

> **Note:** Chocolatey packaging is prepared but may still be pending moderation. See [docs/distribution.md](./docs/distribution.md).

```powershell
choco install tsarr
```

### AUR (Arch Linux)

```bash
yay -S tsarr-bin
```

### Nix

Install the repo flake directly:

```bash
nix profile install github:robbeverhelst/tsarr?dir=packaging/nix
# or run it without installing
nix run github:robbeverhelst/tsarr?dir=packaging/nix -- doctor
```

The committed flake under [`packaging/nix/flake.nix`](./packaging/nix/flake.nix) tracks the latest published release. Shared `nixpkgs` distribution still requires a maintainer submission. See [docs/distribution.md](./docs/distribution.md) for the full distribution flow.

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

## Alternatives

Looking for a Radarr CLI or Sonarr API client? Here's how Tsarr compares:

| Feature | Tsarr | Manual API calls |
|---------|-------|-----------------|
| Type safety | ✅ Full TypeScript types | ❌ None |
| All *arr apps | ✅ 8 apps in one package | ⚠️ DIY per app |
| CLI included | ✅ Built-in | ❌ No |
| Auto-generated | ✅ From official specs | ❌ Manual |
| Runtime | Node.js / Bun / standalone | curl |
| Package managers | npm, Homebrew, Docker, AUR, Nix, Scoop | N/A |

## Contributing

This project uses:
- [Bun](https://bun.sh) as the JavaScript runtime
- [Biome](https://biomejs.dev) for linting and formatting
- [@hey-api/openapi-ts](https://github.com/hey-api/openapi-ts) for code generation
- [Renovate](https://renovatebot.com) for dependency updates

## License

MIT - see [LICENSE](LICENSE) file for details.

---

<sub>**Search terms:** radarr cli · sonarr cli · lidarr cli · readarr cli · prowlarr cli · bazarr cli · qbittorrent cli · seerr cli · jellyseerr cli · overseerr cli · servarr api client · arr typescript · selfhosted media automation</sub>
