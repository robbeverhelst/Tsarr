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

This walks you through selecting services, entering URLs and API keys, tests each connection, and saves to your chosen scope (global or local). After configuring the first instance of a service, you'll be prompted to add additional named instances (e.g. a "4K" and "1080p" Radarr).

### Environment Variables

Best for CI/CD, Docker, and automation:

```bash
export TSARR_RADARR_URL=http://localhost:7878
export TSARR_RADARR_API_KEY=your-api-key

# Optional timeout (milliseconds)
export TSARR_RADARR_TIMEOUT=30000
```

The pattern is `TSARR_{SERVICE}_URL`, `TSARR_{SERVICE}_API_KEY`, and `TSARR_{SERVICE}_TIMEOUT` for each service. Environment variables always apply to the first (default) instance only.

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

# Set values for a specific named instance
tsarr config set services.radarr.4K.baseUrl http://localhost:7879
tsarr config set services.radarr.4K.apiKey your-4k-api-key
```

### Config File Format

Both global (`~/.config/tsarr/config.json`) and local (`.tsarr.json`) use the same format. A service can be configured as a single object (legacy) or as an array of named instances:

```json
{
  "services": {
    "sonarr": {
      "baseUrl": "http://localhost:8989",
      "apiKey": "your-api-key"
    },
    "radarr": [
      {
        "name": "1080p",
        "baseUrl": "http://localhost:7878",
        "apiKey": "your-api-key",
        "timeout": 30000
      },
      {
        "name": "4K",
        "baseUrl": "http://localhost:7879",
        "apiKey": "your-4k-api-key"
      }
    ]
  },
  "defaults": {
    "output": "table"
  }
}
```

The single-object format is still fully supported. When you configure only one instance (without a name), it is saved as a plain object for backwards compatibility.

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

## Multi-Instance Services

You can configure multiple instances of the same service (e.g. a 4K and a 1080p Radarr). Use the `--instance` / `-i` flag to target a specific instance:

```bash
# List movies from the 4K Radarr instance
tsarr radarr movie list --instance 4K

# Check status of a specific instance
tsarr radarr system status -i 1080p
```

When `--instance` is omitted, the first (default) instance is used. If the requested instance is not found, the CLI lists available instance names.

The `doctor` command automatically checks all instances and shows an "instance" column when multi-instance services are detected.

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
| `--instance` | `-i` | Target a specific named instance (for multi-instance services) |

## Available Commands

### Radarr

```bash
# Movies
tsarr radarr movie list                        # List all movies
tsarr radarr movie get --id 123                # Get movie by ID
tsarr radarr movie search --term "Interstellar" # Search TMDB
tsarr radarr movie add --term "Interstellar"   # Search and add interactively
tsarr radarr movie add --tmdb-id 157336        # Add by TMDB ID directly
tsarr radarr movie edit --id 123 --monitored false  # Edit a movie
tsarr radarr movie refresh --id 123            # Refresh movie metadata
tsarr radarr movie manual-search --id 123      # Trigger a manual release search
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
tsarr radarr tag create --label "4k"           # Create a tag
tsarr radarr tag delete --id 1                 # Delete a tag

# Download queue
tsarr radarr queue list                        # List queue items
tsarr radarr queue status                      # Queue status
tsarr radarr queue delete --id 1               # Remove from queue
tsarr radarr queue grab --id 1                 # Force download a queue item

# Root folders
tsarr radarr rootfolder list                   # List root folders
tsarr radarr rootfolder add --path /movies     # Add a root folder
tsarr radarr rootfolder delete --id 1          # Delete a root folder

# System
tsarr radarr system status                     # System status
tsarr radarr system health                     # Health check results

# History
tsarr radarr history list                      # Recent history
tsarr radarr history list --since 2024-01-01   # History since date (ISO 8601)
tsarr radarr history list --until 2024-06-01   # History until date

# Calendar
tsarr radarr calendar list                     # List upcoming releases
tsarr radarr calendar list --start 2024-01-01 --end 2024-02-01  # Date range

# Notifications
tsarr radarr notification list                 # List notification providers
tsarr radarr notification get --id 1           # Get notification details
tsarr radarr notification add config.json      # Add from JSON file
tsarr radarr notification edit --id 1 update.json  # Edit notification
tsarr radarr notification delete --id 1        # Delete a notification
tsarr radarr notification test                 # Test all notifications

# Download clients
tsarr radarr downloadclient list               # List download clients
tsarr radarr downloadclient get --id 1         # Get download client details
tsarr radarr downloadclient add config.json    # Add from JSON file
tsarr radarr downloadclient edit --id 1 update.json  # Edit download client
tsarr radarr downloadclient delete --id 1      # Delete a download client
tsarr radarr downloadclient test               # Test all download clients

# Blocklist
tsarr radarr blocklist list                    # List blocked releases
tsarr radarr blocklist delete --id 1           # Remove from blocklist

# Wanted
tsarr radarr wanted missing                    # Movies with missing files
tsarr radarr wanted cutoff                     # Movies below quality cutoff

# Import lists
tsarr radarr importlist list                   # List import lists
tsarr radarr importlist get --id 1             # Get import list details
tsarr radarr importlist add config.json        # Add from JSON file
tsarr radarr importlist edit --id 1 update.json  # Edit import list
tsarr radarr importlist delete --id 1          # Delete an import list

# Custom formats
tsarr radarr customformat list                 # List custom formats
```

### Sonarr

```bash
# Series
tsarr sonarr series list                       # List all series
tsarr sonarr series get --id 1                 # Get series by ID
tsarr sonarr series search --term "Breaking Bad" # Search
tsarr sonarr series add --term "Breaking Bad"  # Search and add interactively
tsarr sonarr series add --tvdb-id 81189        # Add by TVDB ID directly
tsarr sonarr series edit --id 1 --monitored false  # Edit a series
tsarr sonarr series refresh --id 1             # Refresh series metadata
tsarr sonarr series manual-search --id 1       # Trigger a manual release search
tsarr sonarr series delete --id 1              # Delete series

# Episodes
tsarr sonarr episode list                      # List all episodes
tsarr sonarr episode list --series-id 1        # List episodes for a series
tsarr sonarr episode get --id 1                # Get episode by ID
tsarr sonarr episode search --id 1             # Trigger search for an episode

# Episode files
tsarr sonarr episodefile list --series-id 1    # List files for a series
tsarr sonarr episodefile get --id 456          # Get episode file details
tsarr sonarr episodefile delete --id 456       # Delete file from disk

# Quality profiles
tsarr sonarr profile list                      # List quality profiles
tsarr sonarr profile get --id 1                # Get profile details

# Tags
tsarr sonarr tag list                          # List all tags
tsarr sonarr tag create --label "anime"        # Create a tag
tsarr sonarr tag delete --id 1                 # Delete a tag

# Download queue
tsarr sonarr queue list                        # List queue items
tsarr sonarr queue list --series-id 1          # Queue items for a series
tsarr sonarr queue status                      # Queue status
tsarr sonarr queue delete --id 1               # Remove from queue
tsarr sonarr queue grab --id 1                 # Force download a queue item

# Root folders
tsarr sonarr rootfolder list                   # List root folders
tsarr sonarr rootfolder add --path /tv         # Add a root folder
tsarr sonarr rootfolder delete --id 1          # Delete a root folder

# System
tsarr sonarr system status                     # System status
tsarr sonarr system health                     # Health check results

# History
tsarr sonarr history list                      # Recent history
tsarr sonarr history list --series-id 1        # History for a series
tsarr sonarr history list --since 2024-01-01   # History since date (ISO 8601)

# Calendar
tsarr sonarr calendar list                     # List upcoming episodes
tsarr sonarr calendar list --start 2024-01-01 --end 2024-02-01  # Date range

# Notifications
tsarr sonarr notification list                 # List notification providers
tsarr sonarr notification get --id 1           # Get notification details
tsarr sonarr notification add config.json      # Add from JSON file
tsarr sonarr notification edit --id 1 update.json  # Edit notification
tsarr sonarr notification delete --id 1        # Delete a notification
tsarr sonarr notification test                 # Test all notifications

# Download clients
tsarr sonarr downloadclient list               # List download clients
tsarr sonarr downloadclient get --id 1         # Get download client details
tsarr sonarr downloadclient add config.json    # Add from JSON file
tsarr sonarr downloadclient edit --id 1 update.json  # Edit download client
tsarr sonarr downloadclient delete --id 1      # Delete a download client
tsarr sonarr downloadclient test               # Test all download clients

# Blocklist
tsarr sonarr blocklist list                    # List blocked releases
tsarr sonarr blocklist delete --id 1           # Remove from blocklist

# Wanted
tsarr sonarr wanted missing                    # Episodes with missing files
tsarr sonarr wanted cutoff                     # Episodes below quality cutoff

# Import lists
tsarr sonarr importlist list                   # List import lists
tsarr sonarr importlist get --id 1             # Get import list details
tsarr sonarr importlist add config.json        # Add from JSON file
tsarr sonarr importlist edit --id 1 update.json  # Edit import list
tsarr sonarr importlist delete --id 1          # Delete an import list
```

### Lidarr

```bash
# Artists
tsarr lidarr artist list                       # List all artists
tsarr lidarr artist get --id 1                 # Get artist by ID
tsarr lidarr artist search --term "Radiohead"  # Search
tsarr lidarr artist add --term "Radiohead"     # Search and add interactively
tsarr lidarr artist edit --id 1 --monitored false  # Edit an artist
tsarr lidarr artist refresh --id 1             # Refresh artist metadata
tsarr lidarr artist manual-search --id 1       # Trigger a manual release search
tsarr lidarr artist delete --id 1              # Delete artist

# Albums
tsarr lidarr album list                        # List all albums
tsarr lidarr album get --id 1                  # Get album by ID
tsarr lidarr album search --term "OK Computer" # Search albums
tsarr lidarr album add config.json             # Add from JSON file
tsarr lidarr album edit --id 1 update.json     # Edit an album
tsarr lidarr album delete --id 1               # Delete an album

# Track files
tsarr lidarr trackfile list --artist-id 1      # List files for an artist
tsarr lidarr trackfile get --id 456            # Get track file details
tsarr lidarr trackfile delete --id 456         # Delete file from disk

# Quality profiles
tsarr lidarr profile list                      # List quality profiles
tsarr lidarr profile get --id 1                # Get profile details

# Tags
tsarr lidarr tag list                          # List all tags
tsarr lidarr tag create --label "rock"         # Create a tag
tsarr lidarr tag delete --id 1                 # Delete a tag

# Download queue
tsarr lidarr queue list                        # List queue items
tsarr lidarr queue status                      # Queue status
tsarr lidarr queue delete --id 1               # Remove from queue
tsarr lidarr queue grab --id 1                 # Force download a queue item

# Root folders
tsarr lidarr rootfolder list                   # List root folders
tsarr lidarr rootfolder add --path /music      # Add a root folder
tsarr lidarr rootfolder delete --id 1          # Delete a root folder

# System
tsarr lidarr system status                     # System status
tsarr lidarr system health                     # Health check results

# History
tsarr lidarr history list                      # Recent history
tsarr lidarr history list --since 2024-01-01   # History since date (ISO 8601)

# Calendar
tsarr lidarr calendar list                     # List upcoming albums
tsarr lidarr calendar list --start 2024-01-01 --end 2024-02-01  # Date range

# Notifications
tsarr lidarr notification list                 # List notification providers
tsarr lidarr notification get --id 1           # Get notification details
tsarr lidarr notification add config.json      # Add from JSON file
tsarr lidarr notification edit --id 1 update.json  # Edit notification
tsarr lidarr notification delete --id 1        # Delete a notification
tsarr lidarr notification test                 # Test all notifications

# Download clients
tsarr lidarr downloadclient list               # List download clients
tsarr lidarr downloadclient get --id 1         # Get download client details
tsarr lidarr downloadclient add config.json    # Add from JSON file
tsarr lidarr downloadclient edit --id 1 update.json  # Edit download client
tsarr lidarr downloadclient delete --id 1      # Delete a download client
tsarr lidarr downloadclient test               # Test all download clients

# Blocklist
tsarr lidarr blocklist list                    # List blocked releases
tsarr lidarr blocklist delete --id 1           # Remove from blocklist

# Wanted
tsarr lidarr wanted missing                    # Albums with missing tracks
tsarr lidarr wanted cutoff                     # Albums below quality cutoff

# Import lists
tsarr lidarr importlist list                   # List import lists
tsarr lidarr importlist get --id 1             # Get import list details
tsarr lidarr importlist delete --id 1          # Delete an import list
```

### Readarr

```bash
# Authors
tsarr readarr author list                      # List all authors
tsarr readarr author get --id 1                # Get author by ID
tsarr readarr author search --term "Tolkien"   # Search
tsarr readarr author add --term "Tolkien"      # Search and add interactively
tsarr readarr author edit --id 1 --monitored false  # Edit an author
tsarr readarr author refresh --id 1            # Refresh author metadata
tsarr readarr author manual-search --id 1      # Trigger a manual release search
tsarr readarr author delete --id 1             # Delete author

# Books
tsarr readarr book list                        # List all books
tsarr readarr book get --id 1                  # Get book by ID
tsarr readarr book search --term "Dune"        # Search books
tsarr readarr book add config.json             # Add from JSON file
tsarr readarr book edit --id 1 update.json     # Edit a book
tsarr readarr book delete --id 1               # Delete a book

# Book files
tsarr readarr bookfile list --author-id 1      # List files for an author
tsarr readarr bookfile get --id 456            # Get book file details
tsarr readarr bookfile delete --id 456         # Delete file from disk

# Quality profiles
tsarr readarr profile list                     # List quality profiles
tsarr readarr profile get --id 1               # Get profile details

# Tags
tsarr readarr tag list                         # List all tags
tsarr readarr tag create --label "scifi"       # Create a tag
tsarr readarr tag delete --id 1                # Delete a tag

# Download queue
tsarr readarr queue list                       # List queue items
tsarr readarr queue status                     # Queue status
tsarr readarr queue delete --id 1              # Remove from queue
tsarr readarr queue grab --id 1                # Force download a queue item

# Root folders
tsarr readarr rootfolder list                  # List root folders
tsarr readarr rootfolder add --path /books     # Add a root folder
tsarr readarr rootfolder delete --id 1         # Delete a root folder

# System
tsarr readarr system status                    # System status
tsarr readarr system health                    # Health check results

# History
tsarr readarr history list                     # Recent history
tsarr readarr history list --since 2024-01-01  # History since date (ISO 8601)

# Calendar
tsarr readarr calendar list                    # List upcoming books
tsarr readarr calendar list --start 2024-01-01 --end 2024-02-01  # Date range

# Notifications
tsarr readarr notification list                # List notification providers
tsarr readarr notification get --id 1          # Get notification details
tsarr readarr notification add config.json     # Add from JSON file
tsarr readarr notification edit --id 1 update.json  # Edit notification
tsarr readarr notification delete --id 1       # Delete a notification
tsarr readarr notification test                # Test all notifications

# Download clients
tsarr readarr downloadclient list              # List download clients
tsarr readarr downloadclient get --id 1        # Get download client details
tsarr readarr downloadclient add config.json   # Add from JSON file
tsarr readarr downloadclient edit --id 1 update.json  # Edit download client
tsarr readarr downloadclient delete --id 1     # Delete a download client
tsarr readarr downloadclient test              # Test all download clients

# Blocklist
tsarr readarr blocklist list                   # List blocked releases
tsarr readarr blocklist delete --id 1          # Remove from blocklist

# Wanted
tsarr readarr wanted missing                   # Books with missing files
tsarr readarr wanted cutoff                    # Books below quality cutoff

# Import lists
tsarr readarr importlist list                  # List import lists
tsarr readarr importlist get --id 1            # Get import list details
tsarr readarr importlist delete --id 1         # Delete an import list
```

### Prowlarr

```bash
# Indexers
tsarr prowlarr indexer list                    # List all indexers
tsarr prowlarr indexer get --id 1              # Get indexer details
tsarr prowlarr indexer add config.json         # Add from JSON file
tsarr prowlarr indexer edit --id 1 update.json # Edit an indexer
tsarr prowlarr indexer delete --id 1           # Delete indexer
tsarr prowlarr indexer test                    # Test all indexers
tsarr prowlarr indexer test --id 1             # Test a specific indexer

# Search
tsarr prowlarr search run --query "ubuntu"     # Search across indexers

# Applications
tsarr prowlarr app list                        # List configured apps
tsarr prowlarr app get --id 1                  # Get app details
tsarr prowlarr app add config.json             # Add from JSON file
tsarr prowlarr app edit --id 1 update.json     # Edit an application
tsarr prowlarr app delete --id 1               # Delete an application
tsarr prowlarr app sync                        # Trigger app indexer sync

# Indexer stats
tsarr prowlarr indexerstats list               # Get indexer performance statistics

# Tags
tsarr prowlarr tag list                        # List all tags
tsarr prowlarr tag create --label "public"     # Create a tag
tsarr prowlarr tag delete --id 1               # Delete a tag

# Notifications
tsarr prowlarr notification list               # List notification providers
tsarr prowlarr notification get --id 1         # Get notification details
tsarr prowlarr notification add config.json    # Add from JSON file
tsarr prowlarr notification edit --id 1 update.json  # Edit notification
tsarr prowlarr notification delete --id 1      # Delete a notification
tsarr prowlarr notification test               # Test all notifications

# Download clients
tsarr prowlarr downloadclient list             # List download clients
tsarr prowlarr downloadclient get --id 1       # Get download client details
tsarr prowlarr downloadclient add config.json  # Add from JSON file
tsarr prowlarr downloadclient edit --id 1 update.json  # Edit download client
tsarr prowlarr downloadclient delete --id 1    # Delete a download client
tsarr prowlarr downloadclient test             # Test all download clients

# System
tsarr prowlarr system status                   # System status
tsarr prowlarr system health                   # Health check results
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
tsarr radarr movie <TAB> → list, get, search, add, edit, refresh, manual-search, delete
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
