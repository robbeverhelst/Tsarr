---
title: CLI - Command Reference
group: CLI
---

# CLI Command Reference

Complete reference for all `tsarr` commands.

## Global Options

These flags are available on all service resource actions:

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON |
| `--table` | Output as formatted table |
| `--quiet` / `-q` | Output only IDs |
| `--yes` / `-y` | Skip confirmation prompts |

## Radarr (Movies)

```bash
tsarr radarr <resource> <action> [args]
```

| Resource | Action | Args | Description |
|----------|--------|------|-------------|
| `movie` | `list` | | List all movies |
| `movie` | `get` | `<id>` | Get movie by ID |
| `movie` | `search` | `<term>` | Search TMDB for movies |
| `movie` | `delete` | `<id>` | Delete a movie |
| `profile` | `list` | | List quality profiles |
| `profile` | `get` | `<id>` | Get quality profile by ID |
| `tag` | `list` | | List all tags |
| `queue` | `list` | | Show download queue |
| `queue` | `status` | | Queue overview |
| `rootfolder` | `list` | | List root folders |
| `system` | `status` | | System information |
| `system` | `health` | | Health check issues |
| `history` | `list` | | Recent activity |
| `customformat` | `list` | | List custom formats |

## Sonarr (TV Shows)

```bash
tsarr sonarr <resource> <action> [args]
```

| Resource | Action | Args | Description |
|----------|--------|------|-------------|
| `series` | `list` | | List all series |
| `series` | `get` | `<id>` | Get series by ID |
| `series` | `search` | `<term>` | Search for TV series |
| `series` | `delete` | `<id>` | Delete a series |
| `episode` | `list` | | List all episodes |
| `episode` | `get` | `<id>` | Get episode by ID |
| `profile` | `list` | | List quality profiles |
| `tag` | `list` | | List all tags |
| `rootfolder` | `list` | | List root folders |
| `system` | `status` | | System information |
| `system` | `health` | | Health check issues |

## Lidarr (Music)

```bash
tsarr lidarr <resource> <action> [args]
```

| Resource | Action | Args | Description |
|----------|--------|------|-------------|
| `artist` | `list` | | List all artists |
| `artist` | `get` | `<id>` | Get artist by ID |
| `artist` | `search` | `<term>` | Search for artists |
| `artist` | `delete` | `<id>` | Delete an artist |
| `album` | `list` | | List all albums |
| `album` | `get` | `<id>` | Get album by ID |
| `album` | `search` | `<term>` | Search for albums |
| `profile` | `list` | | List quality profiles |
| `tag` | `list` | | List all tags |
| `rootfolder` | `list` | | List root folders |
| `system` | `status` | | System information |
| `system` | `health` | | Health check issues |

## Readarr (Books)

```bash
tsarr readarr <resource> <action> [args]
```

| Resource | Action | Args | Description |
|----------|--------|------|-------------|
| `author` | `list` | | List all authors |
| `author` | `get` | `<id>` | Get author by ID |
| `author` | `search` | `<term>` | Search for authors |
| `author` | `delete` | `<id>` | Delete an author |
| `book` | `list` | | List all books |
| `book` | `get` | `<id>` | Get book by ID |
| `book` | `search` | `<term>` | Search for books |
| `profile` | `list` | | List quality profiles |
| `tag` | `list` | | List all tags |
| `rootfolder` | `list` | | List root folders |
| `system` | `status` | | System information |
| `system` | `health` | | Health check issues |

## Prowlarr (Indexers)

```bash
tsarr prowlarr <resource> <action> [args]
```

| Resource | Action | Args | Description |
|----------|--------|------|-------------|
| `indexer` | `list` | | List all indexers |
| `indexer` | `get` | `<id>` | Get indexer by ID |
| `indexer` | `delete` | `<id>` | Delete an indexer |
| `search` | `run` | `<query>` | Search across all indexers |
| `app` | `list` | | List connected applications |
| `app` | `get` | `<id>` | Get application by ID |
| `tag` | `list` | | List all tags |
| `system` | `status` | | System information |
| `system` | `health` | | Health check issues |

## Bazarr (Subtitles)

```bash
tsarr bazarr <resource> <action> [args]
```

| Resource | Action | Args | Description |
|----------|--------|------|-------------|
| `series` | `list` | | List series with subtitle info |
| `movie` | `list` | | List movies with subtitle info |
| `episode` | `wanted` | | Episodes needing subtitles |
| `provider` | `list` | | List subtitle providers |
| `language` | `list` | | List available languages |
| `language` | `profiles` | | List language profiles |
| `system` | `status` | | System information |
| `system` | `health` | | Health check issues |
| `system` | `badges` | | Notification badges |

## Utility Commands

### Doctor

Test connectivity to all configured services:

```bash
tsarr doctor
```

### Config

Manage CLI configuration:

```bash
tsarr config init                    # Interactive setup
tsarr config set <key> <value>       # Set a config value
tsarr config get <key>               # Get a config value
tsarr config show                    # Show full merged config
```

See [CLI Configuration](./cli-configuration.md) for details.

### Completions

Generate shell completions:

```bash
tsarr completions bash
tsarr completions zsh
tsarr completions fish
```
