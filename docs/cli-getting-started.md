---
title: CLI - Getting Started
group: CLI
---

# CLI Getting Started

TsArr includes a command-line interface for interacting with Servarr services directly from your terminal.

## Installation

```bash
bun add -g tsarr
```

Once installed, the `tsarr` command is available globally.

## Quick Start

### 1. Configure a service

Run the interactive setup wizard:

```bash
tsarr config init
```

This will prompt you to select services, enter URLs and API keys, and test the connections.

Alternatively, configure manually:

```bash
tsarr config set services.radarr.baseUrl http://localhost:7878
tsarr config set services.radarr.apiKey your-api-key
```

Or use environment variables:

```bash
export TSARR_RADARR_URL=http://localhost:7878
export TSARR_RADARR_API_KEY=your-api-key
```

### 2. Verify connectivity

```bash
tsarr doctor
```

Output:

```
radarr     http://localhost:7878     v3.2.2    OK
sonarr     http://localhost:8989     v4.0.1    OK
lidarr     —                                  (not configured)
```

### 3. Start using it

```bash
# List all movies
tsarr radarr movie list

# Search for a movie
tsarr radarr movie search "Inception"

# Get system health
tsarr radarr system health

# Show download queue
tsarr radarr queue list
```

## Command Structure

All service commands follow the same pattern:

```
tsarr <service> <resource> <action> [args] [options]
```

For example:

```bash
tsarr sonarr series list
tsarr radarr movie get 123
tsarr lidarr artist search "Radiohead"
tsarr prowlarr search run "ubuntu iso"
```

## Output Formats

Control how results are displayed:

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON (default for non-TTY) |
| `--table` | Output as formatted table (default for TTY) |
| `--quiet` / `-q` | Output only IDs |

```bash
# Pipe movie IDs into another command
tsarr radarr movie list --quiet | xargs -I {} tsarr radarr movie get {}

# Get JSON for scripting
tsarr sonarr series list --json | jq '.[].title'
```

## Confirmation Prompts

Destructive actions (like `delete`) require confirmation. Skip the prompt with `--yes` / `-y`:

```bash
tsarr radarr movie delete 123 --yes
```

## Shell Completions

Generate completions for your shell:

```bash
# Bash
tsarr completions bash >> ~/.bashrc

# Zsh
tsarr completions zsh >> ~/.zshrc

# Fish
tsarr completions fish > ~/.config/fish/completions/tsarr.fish
```
