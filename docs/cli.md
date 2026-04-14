# CLI Guide

The TsArr CLI lets you manage all Servarr apps directly from the terminal. It supports all 6 services, multiple output formats, interactive prompts, and shell completions.

## Installation

```bash
# Global install (recommended for CLI usage)
bun add -g tsarr

# Or run without installing
bunx tsarr --help
```

## Configuration

TsArr CLI supports three configuration methods. They are merged with the following priority (highest wins):

1. **Environment variables** (highest priority)
2. **Local config** (`.tsarr.json` in project or parent directory)
3. **Global config** (`~/.config/tsarr/config.json`)

### Interactive Setup

The fastest way to get started:

```bash
tsarr config init
```

This walks you through selecting services, entering URLs and API keys, tests each connection, and saves to your chosen scope (global or local).

### Environment Variables

Best for CI/CD, Docker, and automation:

```bash
export TSARR_RADARR_URL=http://localhost:7878
export TSARR_RADARR_API_KEY=your-api-key

# Optional timeout (milliseconds)
export TSARR_RADARR_TIMEOUT=30000
```

The pattern is `TSARR_{SERVICE}_URL`, `TSARR_{SERVICE}_API_KEY`, and `TSARR_{SERVICE}_TIMEOUT` for each service.

qBittorrent uses username/password authentication instead of API keys:

```bash
export TSARR_QBITTORRENT_URL=http://localhost:8080
export TSARR_QBITTORRENT_USERNAME=admin
export TSARR_QBITTORRENT_PASSWORD=adminadmin
```

### Manual Config

```bash
# Set values in global config
tsarr config set services.radarr.baseUrl http://localhost:7878
tsarr config set services.radarr.apiKey your-api-key

# Set values in local config (useful per-project)
tsarr config set services.radarr.baseUrl http://localhost:7878 --local
```

### Config File Format

Both global (`~/.config/tsarr/config.json`) and local (`.tsarr.json`) use the same format:

```json
{
  "services": {
    "radarr": {
      "baseUrl": "http://localhost:7878",
      "apiKey": "your-api-key",
      "timeout": 30000
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

### Viewing Config

```bash
# Show the fully merged config (all sources combined)
tsarr config show

# Get a specific value
tsarr config get services.radarr.baseUrl
```

### Default Ports

| Service | Default Port |
|---------|-------------|
| Radarr | 7878 |
| Sonarr | 8989 |
| Lidarr | 8686 |
| Readarr | 8787 |
| Prowlarr | 9696 |
| Bazarr | 6767 |
| qBittorrent | 8080 |
| Seerr | 5055 |

## Command Structure

```
tsarr <service> <resource> <action> [options]
```

All commands follow a consistent three-level hierarchy: service, resource, action.

## Output Formats

Every command supports multiple output formats:

| Flag | Description | Default when |
|------|-------------|-------------|
| `--table` | Human-readable table with colors and status indicators | Terminal (TTY) |
| `--json` | Pretty-printed JSON | Piped output |
| `--plain` | TSV (tab-separated), no colors | Never (must opt-in) |
| `--quiet` / `-q` | IDs only, one per line | Never (must opt-in) |

The table format includes:
- Boolean fields shown as colored checkmarks (✓/✗)
- Status values color-coded (green=ok, red=fail, yellow=warning)
- File sizes in human-readable format (e.g. 4.2 GB)
- Dates formatted as readable strings (e.g. Mar 9, 2026)
- Column headers auto-converted from camelCase to readable labels

```bash
# Table output (default in terminal)
tsarr radarr movie list

# JSON output (pipe-friendly)
tsarr radarr movie list --json

# JSON with specific fields only
tsarr radarr movie list --json --select=title,year,monitored

# Plain TSV for piping to awk/cut/sort
tsarr radarr movie list --plain | sort -t$'\t' -k3

# IDs only (useful for scripting)
tsarr radarr movie list --quiet

# Auto-detect: table in terminal, JSON when piped
tsarr radarr movie list | jq '.[0].title'
```

## Global Flags

| Flag | Alias | Description |
|------|-------|-------------|
| `--json` | | Force JSON output |
| `--table` | | Force table output |
| `--plain` | | Force TSV output (no colors, for piping) |
| `--quiet` | `-q` | Output IDs only |
| `--select` | | Cherry-pick fields in JSON mode (comma-separated) |
| `--yes` | `-y` | Skip confirmation prompts (for automation) |

## Available Commands

### Radarr

```bash
# Movies
tsarr radarr movie list                        # List all movies
tsarr radarr movie get --id 123                # Get movie by ID
tsarr radarr movie search --term "Interstellar" # Search TMDB
tsarr radarr movie delete --id 123             # Delete (requires confirmation)
tsarr radarr movie delete --id 123 --yes       # Delete without confirmation

# Movie files
tsarr radarr moviefile list --movie-id 123     # List files for a movie
tsarr radarr moviefile get --id 456            # Get movie file details
tsarr radarr moviefile delete --id 456         # Delete file from disk

# Quality profiles
tsarr radarr profile list                      # List quality profiles
tsarr radarr profile get --id 1                # Get profile details

# Tags
tsarr radarr tag list                          # List all tags

# Download queue
tsarr radarr queue list                        # List queue items
tsarr radarr queue status                      # Queue status

# Root folders
tsarr radarr rootfolder list                   # List root folders

# System
tsarr radarr system status                     # System status
tsarr radarr system health                     # Health check results

# History
tsarr radarr history list                      # Recent history

# Custom formats
tsarr radarr customformat list                 # List custom formats
```

### Sonarr

```bash
# Series
tsarr sonarr series list                       # List all series
tsarr sonarr series get --id 1                 # Get series by ID
tsarr sonarr series search --term "Breaking Bad" # Search
tsarr sonarr series delete --id 1              # Delete series

# Episodes
tsarr sonarr episode list                      # List all episodes
tsarr sonarr episode get --id 1                # Get episode by ID

# Episode files
tsarr sonarr episodefile list --series-id 1    # List files for a series
tsarr sonarr episodefile get --id 456          # Get episode file details
tsarr sonarr episodefile delete --id 456       # Delete file from disk

# Quality profiles, tags, root folders, system
tsarr sonarr profile list
tsarr sonarr tag list
tsarr sonarr rootfolder list
tsarr sonarr system status
tsarr sonarr system health
```

### Lidarr

```bash
# Artists
tsarr lidarr artist list                       # List all artists
tsarr lidarr artist get --id 1                 # Get artist by ID
tsarr lidarr artist search --term "Radiohead"  # Search
tsarr lidarr artist delete --id 1              # Delete artist

# Albums
tsarr lidarr album list                        # List all albums
tsarr lidarr album get --id 1                  # Get album by ID
tsarr lidarr album search --term "OK Computer" # Search albums

# Track files
tsarr lidarr trackfile list --artist-id 1      # List files for an artist
tsarr lidarr trackfile get --id 456            # Get track file details
tsarr lidarr trackfile delete --id 456         # Delete file from disk

# Quality profiles, tags, root folders, system
tsarr lidarr profile list
tsarr lidarr tag list
tsarr lidarr rootfolder list
tsarr lidarr system status
tsarr lidarr system health
```

### Readarr

```bash
# Authors
tsarr readarr author list                      # List all authors
tsarr readarr author get --id 1                # Get author by ID
tsarr readarr author search --term "Tolkien"   # Search
tsarr readarr author delete --id 1             # Delete author

# Books
tsarr readarr book list                        # List all books
tsarr readarr book get --id 1                  # Get book by ID
tsarr readarr book search --term "Dune"        # Search books

# Book files
tsarr readarr bookfile list --author-id 1      # List files for an author
tsarr readarr bookfile get --id 456            # Get book file details
tsarr readarr bookfile delete --id 456         # Delete file from disk

# Quality profiles, tags, root folders, system
tsarr readarr profile list
tsarr readarr tag list
tsarr readarr rootfolder list
tsarr readarr system status
tsarr readarr system health
```

### Prowlarr

```bash
# Indexers
tsarr prowlarr indexer list                    # List all indexers
tsarr prowlarr indexer get --id 1              # Get indexer details
tsarr prowlarr indexer delete --id 1           # Delete indexer

# Search
tsarr prowlarr search run --query "ubuntu"     # Search across indexers

# Applications
tsarr prowlarr app list                        # List configured apps
tsarr prowlarr app get --id 1                  # Get app details

# Tags, system
tsarr prowlarr tag list
tsarr prowlarr system status
tsarr prowlarr system health
```

### Bazarr

```bash
# Subtitles
tsarr bazarr series list                       # List series subtitle info
tsarr bazarr movie list                        # List movie subtitle info
tsarr bazarr episode wanted                    # Episodes with wanted subtitles

# Providers & languages
tsarr bazarr provider list                     # List subtitle providers
tsarr bazarr language list                     # List available languages
tsarr bazarr language profiles                 # List language profiles

# System
tsarr bazarr system status                     # System status
tsarr bazarr system health                     # Health check
tsarr bazarr system badges                     # Badge counts
```

### qBittorrent

```bash
# Torrents
tsarr qbit torrents list                       # List all torrents
tsarr qbit torrents list --filter downloading  # Filter by state
tsarr qbit torrents pause --hashes <hash>      # Pause a torrent
tsarr qbit torrents resume --hashes <hash>     # Resume a torrent
tsarr qbit torrents delete --hashes <hash>     # Delete a torrent
tsarr qbit torrents delete --hashes <hash> --delete-files  # Delete with files

# Status
tsarr qbit status show                         # Transfer info (speed, connections)
```

### Seerr

```bash
# Media requests
tsarr seerr requests list                      # List all requests
tsarr seerr requests list --filter pending      # Filter by status
tsarr seerr requests count                     # Get request counts
tsarr seerr requests approve --id 123          # Approve a request
tsarr seerr requests decline --id 123          # Decline a request

# Search
tsarr seerr search query --query "The Matrix"  # Search movies and TV shows

# Users
tsarr seerr users list                         # List all users

# Status
tsarr seerr status show                        # Server status and version
```

### Diagnostics

```bash
tsarr doctor                                   # Test all configured connections
tsarr doctor --json                            # JSON output for scripting
tsarr doctor --plain                           # TSV output for piping
```

The `doctor` command connects to every configured service, calls `getSystemStatus()`, and reports the version or error for each. Error messages are specific to the failure type:

| Error Type | Example Message |
|------------|----------------|
| Service down | `Connection refused - is the service running?` |
| Bad URL | `Host not found - check the URL` |
| Auth failure | `Authentication failed (401) - check your API key` |
| Timeout | `Connection timed out - service may be unreachable` |
| Proxy issue | `Bad gateway (502) - reverse proxy or service issue` |
| SSL/TLS | `SSL/TLS certificate error - check HTTPS configuration` |

## Scripting & Automation

### Non-Interactive Mode

When stdin is not a TTY (piped input, cron jobs, CI/CD), the CLI behaves differently:

- **Missing required args** throw an error instead of prompting
- **Confirmation prompts** throw an error — use `--yes` to skip them
- **Output defaults to JSON** instead of table

```bash
# In a cron job or script
tsarr radarr movie list --json | jq '.[].title'

# Delete without confirmation in automation
tsarr radarr movie delete --id 123 --yes

# Get just IDs for piping
tsarr radarr movie list --quiet | xargs -I {} tsarr radarr movie get --id {}
```

### Examples

```bash
# Find all unmonitored movies
tsarr radarr movie list --json | jq '[.[] | select(.monitored == false)] | length'

# Export movie library as JSON
tsarr radarr movie list --json > movies-backup.json

# Export only titles and years
tsarr radarr movie list --json --select=title,year > movies-summary.json

# Check all services are healthy
tsarr doctor --json | jq '.[] | select(.status != "ok")'

# Get Radarr version
tsarr radarr system status --json | jq -r '.version'

# Count movies per year
tsarr radarr movie list --json | jq 'group_by(.year) | map({year: .[0].year, count: length}) | sort_by(.count) | reverse | .[:10]'

# Plain TSV for spreadsheet import
tsarr radarr movie list --plain > movies.tsv

# Sort queue by size using plain output
tsarr radarr queue list --plain | sort -t$'\t' -k4 -h
```

### Docker Usage

```bash
# With environment variables
docker run --rm \
  -e TSARR_RADARR_URL=http://radarr:7878 \
  -e TSARR_RADARR_API_KEY=your-key \
  tsarr radarr movie list --json

# With a config file
docker run --rm \
  -v ~/.config/tsarr:/root/.config/tsarr:ro \
  tsarr doctor
```

## Shell Completions

Generate completion scripts for your shell:

```bash
# Bash
tsarr completions bash >> ~/.bashrc

# Zsh
tsarr completions zsh >> ~/.zshrc

# Fish
tsarr completions fish > ~/.config/fish/completions/tsarr.fish
```

After adding completions, restart your shell or source the config file. Then press Tab to autocomplete services, resources, and actions:

```
tsarr r<TAB>        → radarr, readarr
tsarr radarr m<TAB> → movie
tsarr radarr movie <TAB> → list, get, search, delete
```

## Error Handling

The CLI provides clear error messages for common issues:

| Error | Message | Solution |
|-------|---------|----------|
| Not configured | `radarr is not configured` | Run `tsarr config init` or set env vars |
| Bad API key | `Unauthorized. Check your API key.` | Verify the API key in Settings > General |
| Can't connect | `Connection error: ...` | Check the URL and run `tsarr doctor` |
| Not found | `Not found.` | Verify the resource ID exists |
| Non-interactive | `Destructive action requires confirmation` | Add `--yes` flag |

## Tips

- Use `tsarr doctor` after initial setup to verify all connections work
- Local `.tsarr.json` files are useful for per-project configs (e.g., different Radarr instances for different media libraries)
- Pipe JSON output to `jq` for powerful filtering and transformation
- Use `--quiet` to get IDs for batch operations
- The `--yes` flag makes destructive commands safe for automation
