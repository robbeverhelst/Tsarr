# Setup

## Verify the CLI

- Check whether `tsarr` is installed with `tsarr --help`.
- If the binary is missing, let OpenClaw satisfy the declared install dependency for `tsarr`.

## Configure TsArr

Use the interactive wizard first when the user has not configured their services yet:

```bash
tsarr config init
```

Inspect current configuration with:

```bash
tsarr config show
tsarr config get services.radarr.baseUrl
```

Set values manually with:

```bash
tsarr config set services.radarr.baseUrl http://localhost:7878
tsarr config set services.radarr.apiKey your-api-key
tsarr config set services.radarr.baseUrl http://localhost:7878 --local
```

## Connectivity checks

Start here when a user says setup is broken, credentials may be wrong, or a service may be offline:

```bash
tsarr doctor
tsarr radarr system status --json
tsarr sonarr system health --json
```

## Config precedence

TsArr merges configuration in this order:

1. Service-specific environment variables
2. Local config at `.tsarr.json`
3. Global config at `~/.config/tsarr/config.json`

Use local config for project-specific stacks. Use global config for the user’s default home setup.

## Environment variable pattern

TsArr also supports service-specific environment variables with these patterns:

- `TSARR_{SERVICE}_URL`
- `TSARR_{SERVICE}_API_KEY`
- `TSARR_{SERVICE}_TIMEOUT`

Replace `{SERVICE}` with `RADARR`, `SONARR`, `LIDARR`, `READARR`, `PROWLARR`, or `BAZARR`.

qBittorrent uses username/password instead of API keys:

- `TSARR_QBITTORRENT_URL`
- `TSARR_QBITTORRENT_USERNAME`
- `TSARR_QBITTORRENT_PASSWORD`

## Default ports

- Radarr: `7878`
- Sonarr: `8989`
- Lidarr: `8686`
- Readarr: `8787`
- Prowlarr: `9696`
- Bazarr: `6767`
- qBittorrent: `8080`

## Practical workflow

1. Run `tsarr doctor`.
2. If a service is missing, inspect `tsarr config show`.
3. If a single value looks wrong, use `tsarr config get ...` or `tsarr config set ...`.
4. Retry the failing service command with `--json` so output is easy to inspect.
