---
title: CLI - Configuration
group: CLI
---

# CLI Configuration

TsArr CLI supports three configuration sources, merged in order of precedence.

## Configuration Precedence

1. **Environment variables** (highest priority)
2. **Local config** (`.tsarr.json` in project directory or parent)
3. **Global config** (`~/.config/tsarr/config.json`)

## Config File Format

Both global and local config files use the same JSON format:

```json
{
  "services": {
    "radarr": {
      "baseUrl": "http://localhost:7878",
      "apiKey": "your-api-key",
      "timeout": 30000,
      "headers": {
        "User-Agent": "MyApp/1.0"
      }
    },
    "sonarr": {
      "baseUrl": "http://localhost:8989",
      "apiKey": "your-api-key"
    }
  },
  "defaults": {
    "output": "table"
  }
}
```

### Service Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `baseUrl` | `string` | Yes | Service URL (e.g. `http://localhost:7878`) |
| `apiKey` | `string` | Yes | API authentication key |
| `timeout` | `number` | No | Request timeout in milliseconds |
| `headers` | `object` | No | Custom HTTP headers per request |

### Default Ports

| Service | Default Port |
|---------|-------------|
| Radarr | 7878 |
| Sonarr | 8989 |
| Lidarr | 8686 |
| Readarr | 8787 |
| Prowlarr | 9696 |
| Bazarr | 6767 |

## Environment Variables

Each service supports four environment variables:

```bash
TSARR_RADARR_URL=http://localhost:7878
TSARR_RADARR_API_KEY=your-api-key
TSARR_RADARR_TIMEOUT=30000
TSARR_RADARR_HEADERS='{"User-Agent": "MyApp/1.0"}'
```

Replace `RADARR` with the uppercase service name: `SONARR`, `LIDARR`, `READARR`, `PROWLARR`, `BAZARR`.

## Config Commands

### Interactive Setup

```bash
tsarr config init
```

Walks through service selection, URL/key input, and connection testing. Offers to save globally or locally.

### Set a Value

```bash
# Set in global config (default)
tsarr config set services.radarr.baseUrl http://localhost:7878

# Set in local config
tsarr config set services.radarr.apiKey my-key --local
```

### Get a Value

```bash
tsarr config get services.radarr.baseUrl
```

### Show Full Config

```bash
tsarr config show
```

Displays the merged configuration from all sources as formatted JSON.

## Local vs Global Config

- **Global** (`~/.config/tsarr/config.json`): Your default service connections, shared across all projects.
- **Local** (`.tsarr.json`): Project-specific overrides. TsArr searches upward from the current directory. Useful for per-project service instances or team-shared configurations (commit it to your repo).
