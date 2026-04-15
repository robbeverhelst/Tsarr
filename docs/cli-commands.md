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
| `--table` | Output as formatted table with colors and status indicators |
| `--plain` | Output as TSV (tab-separated, no colors, stable for piping) |
| `--quiet` / `-q` | Output only IDs |
| `--no-header` | Hide the table header row |
| `--select` | Cherry-pick fields in JSON mode (comma-separated, e.g. `--select=title,year`) |
| `--yes` / `-y` | Skip confirmation prompts |
| `--dry-run` | Show what would happen without executing |
| `--instance` / `-i` | Target a specific named instance (for multi-instance services) |

## Radarr (Movies)

```bash
tsarr radarr <resource> <action> [args]
```

| Resource | Action | Args | Description |
|----------|--------|------|-------------|
| `movie` | `list` | | List all movies |
| `movie` | `get` | `<id>` | Get movie by ID |
| `movie` | `search` | `<term>` | Search TMDB for movies |
| `movie` | `add` | `[term] [--tmdb-id <id>] [--quality-profile-id <id>] [--root-folder <path>]` | Add a movie interactively or by TMDB ID |
| `movie` | `edit` | `<id> [--monitored] [--quality-profile-id] [--tags]` | Edit a movie |
| `movie` | `refresh` | `<id>` | Refresh movie metadata |
| `movie` | `manual-search` | `<id>` | Trigger a manual release search |
| `movie` | `delete` | `<id> [--delete-files] [--add-import-exclusion]` | Delete a movie |
| `moviefile` | `list` | `--movie-id <id>` | List files for a movie |
| `moviefile` | `get` | `<id>` | Get movie file by ID |
| `moviefile` | `delete` | `<id>` | Delete a movie file from disk |
| `profile` | `list` | | List quality profiles |
| `profile` | `get` | `<id>` | Get quality profile by ID |
| `tag` | `create` | `<label>` | Create a tag |
| `tag` | `delete` | `<id>` | Delete a tag |
| `tag` | `list` | | List all tags |
| `queue` | `list` | | Show download queue |
| `queue` | `status` | | Queue overview |
| `queue` | `delete` | `<id> [--blocklist] [--remove-from-client]` | Remove from queue |
| `queue` | `grab` | `<id>` | Force download a queue item |
| `rootfolder` | `list` | | List root folders |
| `rootfolder` | `add` | `<path>` | Add a root folder |
| `rootfolder` | `delete` | `<id>` | Delete a root folder |
| `system` | `status` | | System information |
| `system` | `health` | | Health check issues |
| `history` | `list` | `[--since <date>] [--until <date>]` | Recent activity (ISO 8601 date filtering) |
| `calendar` | `list` | `[--start <date>] [--end <date>] [--unmonitored]` | Upcoming movie releases |
| `notification` | `list` | | List notification providers |
| `notification` | `get` | `<id>` | Get notification by ID |
| `notification` | `add` | `<file>` | Add notification from JSON file or stdin |
| `notification` | `edit` | `<id> <file>` | Edit notification (merges JSON) |
| `notification` | `delete` | `<id>` | Delete a notification |
| `notification` | `test` | | Test all notifications |
| `downloadclient` | `list` | | List download clients |
| `downloadclient` | `get` | `<id>` | Get download client by ID |
| `downloadclient` | `add` | `<file>` | Add download client from JSON file or stdin |
| `downloadclient` | `edit` | `<id> <file>` | Edit download client (merges JSON) |
| `downloadclient` | `delete` | `<id>` | Delete a download client |
| `downloadclient` | `test` | | Test all download clients |
| `blocklist` | `list` | | List blocked releases |
| `blocklist` | `delete` | `<id>` | Remove from blocklist |
| `wanted` | `missing` | | Movies with missing files |
| `wanted` | `cutoff` | | Movies below quality cutoff |
| `importlist` | `list` | | List import lists |
| `importlist` | `get` | `<id>` | Get import list by ID |
| `importlist` | `add` | `<file>` | Add import list from JSON file or stdin |
| `importlist` | `edit` | `<id> <file>` | Edit import list (merges JSON) |
| `importlist` | `delete` | `<id>` | Delete an import list |
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
| `series` | `add` | `[term] [--tvdb-id <id>] [--quality-profile-id <id>] [--root-folder <path>]` | Add a series interactively or by TVDB ID |
| `series` | `edit` | `<id> [--monitored] [--quality-profile-id] [--tags]` | Edit a series |
| `series` | `refresh` | `<id>` | Refresh series metadata |
| `series` | `manual-search` | `<id>` | Trigger a manual release search |
| `series` | `delete` | `<id> [--delete-files] [--add-import-list-exclusion]` | Delete a series |
| `episode` | `list` | `[--series-id <id>]` | List all episodes or filter by series |
| `episode` | `get` | `<id>` | Get episode by ID |
| `episode` | `search` | `<id>` | Trigger search for an episode |
| `episodefile` | `list` | `--series-id <id>` | List files for a series |
| `episodefile` | `get` | `<id>` | Get episode file by ID |
| `episodefile` | `delete` | `<id>` | Delete an episode file from disk |
| `profile` | `list` | | List quality profiles |
| `profile` | `get` | `<id>` | Get quality profile by ID |
| `tag` | `create` | `<label>` | Create a tag |
| `tag` | `delete` | `<id>` | Delete a tag |
| `tag` | `list` | | List all tags |
| `queue` | `list` | `[--series-id <id>]` | Show download queue |
| `queue` | `status` | | Queue overview |
| `queue` | `delete` | `<id> [--blocklist] [--remove-from-client]` | Remove from queue |
| `queue` | `grab` | `<id>` | Force download a queue item |
| `rootfolder` | `list` | | List root folders |
| `rootfolder` | `add` | `<path>` | Add a root folder |
| `rootfolder` | `delete` | `<id>` | Delete a root folder |
| `system` | `status` | | System information |
| `system` | `health` | | Health check issues |
| `history` | `list` | `[--series-id <id>] [--since <date>] [--until <date>]` | Recent activity (date filtering: ISO 8601) |
| `calendar` | `list` | `[--start <date>] [--end <date>] [--unmonitored]` | Upcoming episode releases |
| `notification` | `list` | | List notification providers |
| `notification` | `get` | `<id>` | Get notification by ID |
| `notification` | `add` | `<file>` | Add notification from JSON file or stdin |
| `notification` | `edit` | `<id> <file>` | Edit notification (merges JSON) |
| `notification` | `delete` | `<id>` | Delete a notification |
| `notification` | `test` | | Test all notifications |
| `downloadclient` | `list` | | List download clients |
| `downloadclient` | `get` | `<id>` | Get download client by ID |
| `downloadclient` | `add` | `<file>` | Add download client from JSON file or stdin |
| `downloadclient` | `edit` | `<id> <file>` | Edit download client (merges JSON) |
| `downloadclient` | `delete` | `<id>` | Delete a download client |
| `downloadclient` | `test` | | Test all download clients |
| `blocklist` | `list` | | List blocked releases |
| `blocklist` | `delete` | `<id>` | Remove from blocklist |
| `wanted` | `missing` | | Episodes with missing files |
| `wanted` | `cutoff` | | Episodes below quality cutoff |
| `importlist` | `list` | | List import lists |
| `importlist` | `get` | `<id>` | Get import list by ID |
| `importlist` | `add` | `<file>` | Add import list from JSON file or stdin |
| `importlist` | `edit` | `<id> <file>` | Edit import list (merges JSON) |
| `importlist` | `delete` | `<id>` | Delete an import list |

## Lidarr (Music)

```bash
tsarr lidarr <resource> <action> [args]
```

| Resource | Action | Args | Description |
|----------|--------|------|-------------|
| `artist` | `list` | | List all artists |
| `artist` | `get` | `<id>` | Get artist by ID |
| `artist` | `search` | `<term>` | Search for artists |
| `artist` | `add` | `<term>` | Search and add an artist interactively |
| `artist` | `edit` | `<id> [--monitored] [--quality-profile-id] [--tags]` | Edit an artist |
| `artist` | `refresh` | `<id>` | Refresh artist metadata |
| `artist` | `manual-search` | `<id>` | Trigger a manual release search |
| `artist` | `delete` | `<id>` | Delete an artist |
| `album` | `list` | | List all albums |
| `album` | `get` | `<id>` | Get album by ID |
| `album` | `search` | `<term>` | Search for albums |
| `album` | `add` | `<file>` | Add album from JSON file or stdin |
| `album` | `edit` | `<id> <file>` | Edit album (merges JSON) |
| `album` | `delete` | `<id>` | Delete an album |
| `trackfile` | `list` | `--artist-id <id>` | List files for an artist |
| `trackfile` | `get` | `<id>` | Get track file by ID |
| `trackfile` | `delete` | `<id>` | Delete a track file from disk |
| `profile` | `list` | | List quality profiles |
| `profile` | `get` | `<id>` | Get quality profile by ID |
| `tag` | `create` | `<label>` | Create a tag |
| `tag` | `delete` | `<id>` | Delete a tag |
| `tag` | `list` | | List all tags |
| `queue` | `list` | | Show download queue |
| `queue` | `status` | | Queue overview |
| `queue` | `delete` | `<id> [--blocklist] [--remove-from-client]` | Remove from queue |
| `queue` | `grab` | `<id>` | Force download a queue item |
| `rootfolder` | `list` | | List root folders |
| `rootfolder` | `add` | `<path>` | Add a root folder |
| `rootfolder` | `delete` | `<id>` | Delete a root folder |
| `system` | `status` | | System information |
| `system` | `health` | | Health check issues |
| `history` | `list` | `[--since <date>] [--until <date>]` | Recent activity (ISO 8601 date filtering) |
| `calendar` | `list` | `[--start <date>] [--end <date>] [--unmonitored]` | Upcoming album releases |
| `notification` | `list` | | List notification providers |
| `notification` | `get` | `<id>` | Get notification by ID |
| `notification` | `add` | `<file>` | Add notification from JSON file or stdin |
| `notification` | `edit` | `<id> <file>` | Edit notification (merges JSON) |
| `notification` | `delete` | `<id>` | Delete a notification |
| `notification` | `test` | | Test all notifications |
| `downloadclient` | `list` | | List download clients |
| `downloadclient` | `get` | `<id>` | Get download client by ID |
| `downloadclient` | `add` | `<file>` | Add download client from JSON file or stdin |
| `downloadclient` | `edit` | `<id> <file>` | Edit download client (merges JSON) |
| `downloadclient` | `delete` | `<id>` | Delete a download client |
| `downloadclient` | `test` | | Test all download clients |
| `blocklist` | `list` | | List blocked releases |
| `blocklist` | `delete` | `<id>` | Remove from blocklist |
| `wanted` | `missing` | | Albums with missing tracks |
| `wanted` | `cutoff` | | Albums below quality cutoff |
| `importlist` | `list` | | List import lists |
| `importlist` | `get` | `<id>` | Get import list by ID |
| `importlist` | `delete` | `<id>` | Delete an import list |

## Readarr (Books)

```bash
tsarr readarr <resource> <action> [args]
```

| Resource | Action | Args | Description |
|----------|--------|------|-------------|
| `author` | `list` | | List all authors |
| `author` | `get` | `<id>` | Get author by ID |
| `author` | `search` | `<term>` | Search for authors |
| `author` | `add` | `<term>` | Search and add an author interactively |
| `author` | `edit` | `<id> [--monitored] [--quality-profile-id] [--tags]` | Edit an author |
| `author` | `refresh` | `<id>` | Refresh author metadata |
| `author` | `manual-search` | `<id>` | Trigger a manual release search |
| `author` | `delete` | `<id>` | Delete an author |
| `book` | `list` | | List all books |
| `book` | `get` | `<id>` | Get book by ID |
| `book` | `search` | `<term>` | Search for books |
| `book` | `add` | `<file>` | Add book from JSON file or stdin |
| `book` | `edit` | `<id> <file>` | Edit book (merges JSON) |
| `book` | `delete` | `<id>` | Delete a book |
| `bookfile` | `list` | `--author-id <id>` | List files for an author |
| `bookfile` | `get` | `<id>` | Get book file by ID |
| `bookfile` | `delete` | `<id>` | Delete a book file from disk |
| `profile` | `list` | | List quality profiles |
| `profile` | `get` | `<id>` | Get quality profile by ID |
| `tag` | `create` | `<label>` | Create a tag |
| `tag` | `delete` | `<id>` | Delete a tag |
| `tag` | `list` | | List all tags |
| `queue` | `list` | | Show download queue |
| `queue` | `status` | | Queue overview |
| `queue` | `delete` | `<id> [--blocklist] [--remove-from-client]` | Remove from queue |
| `queue` | `grab` | `<id>` | Force download a queue item |
| `rootfolder` | `list` | | List root folders |
| `rootfolder` | `add` | `<path>` | Add a root folder |
| `rootfolder` | `delete` | `<id>` | Delete a root folder |
| `system` | `status` | | System information |
| `system` | `health` | | Health check issues |
| `history` | `list` | `[--since <date>] [--until <date>]` | Recent activity (ISO 8601 date filtering) |
| `calendar` | `list` | `[--start <date>] [--end <date>] [--unmonitored]` | Upcoming book releases |
| `notification` | `list` | | List notification providers |
| `notification` | `get` | `<id>` | Get notification by ID |
| `notification` | `add` | `<file>` | Add notification from JSON file or stdin |
| `notification` | `edit` | `<id> <file>` | Edit notification (merges JSON) |
| `notification` | `delete` | `<id>` | Delete a notification |
| `notification` | `test` | | Test all notifications |
| `downloadclient` | `list` | | List download clients |
| `downloadclient` | `get` | `<id>` | Get download client by ID |
| `downloadclient` | `add` | `<file>` | Add download client from JSON file or stdin |
| `downloadclient` | `edit` | `<id> <file>` | Edit download client (merges JSON) |
| `downloadclient` | `delete` | `<id>` | Delete a download client |
| `downloadclient` | `test` | | Test all download clients |
| `blocklist` | `list` | | List blocked releases |
| `blocklist` | `delete` | `<id>` | Remove from blocklist |
| `wanted` | `missing` | | Books with missing files |
| `wanted` | `cutoff` | | Books below quality cutoff |
| `importlist` | `list` | | List import lists |
| `importlist` | `get` | `<id>` | Get import list by ID |
| `importlist` | `delete` | `<id>` | Delete an import list |

## Prowlarr (Indexers)

```bash
tsarr prowlarr <resource> <action> [args]
```

| Resource | Action | Args | Description |
|----------|--------|------|-------------|
| `indexer` | `list` | | List all indexers |
| `indexer` | `get` | `<id>` | Get indexer by ID |
| `indexer` | `add` | `<file>` | Add indexer from JSON file or stdin |
| `indexer` | `edit` | `<id> <file>` | Edit indexer (merges JSON) |
| `indexer` | `delete` | `<id>` | Delete an indexer |
| `indexer` | `test` | `[--id <id>]` | Test one or all indexers |
| `search` | `run` | `<term>` or `<query>` | Search across all indexers |
| `app` | `list` | | List connected applications |
| `app` | `get` | `<id>` | Get application by ID |
| `app` | `add` | `<file>` | Add application from JSON file or stdin |
| `app` | `edit` | `<id> <file>` | Edit application (merges JSON) |
| `app` | `delete` | `<id>` | Delete an application |
| `app` | `sync` | | Trigger app indexer sync |
| `indexerstats` | `list` | | Get indexer performance statistics |
| `tag` | `create` | `<label>` | Create a tag |
| `tag` | `delete` | `<id>` | Delete a tag |
| `tag` | `list` | | List all tags |
| `notification` | `list` | | List notification providers |
| `notification` | `get` | `<id>` | Get notification by ID |
| `notification` | `add` | `<file>` | Add notification from JSON file or stdin |
| `notification` | `edit` | `<id> <file>` | Edit notification (merges JSON) |
| `notification` | `delete` | `<id>` | Delete a notification |
| `notification` | `test` | | Test all notifications |
| `downloadclient` | `list` | | List download clients |
| `downloadclient` | `get` | `<id>` | Get download client by ID |
| `downloadclient` | `add` | `<file>` | Add download client from JSON file or stdin |
| `downloadclient` | `edit` | `<id> <file>` | Edit download client (merges JSON) |
| `downloadclient` | `delete` | `<id>` | Delete a download client |
| `downloadclient` | `test` | | Test all download clients |
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

## qBittorrent (Torrent Client)

```bash
tsarr qbit <resource> <action> [args]
```

| Resource | Action | Args | Description |
|----------|--------|------|-------------|
| `torrents` | `list` | `[--filter <state>]` | List torrents (filters: all, downloading, seeding, completed, paused, active, inactive, resumed, stalled, stalled_uploading, stalled_downloading, errored) |
| `torrents` | `pause` | `<hashes>` | Pause torrents (comma-separated hashes or "all") |
| `torrents` | `resume` | `<hashes>` | Resume torrents (comma-separated hashes or "all") |
| `torrents` | `delete` | `<hashes> [--delete-files]` | Delete torrents (comma-separated hashes or "all") |
| `status` | `show` | | Transfer info (speed, connections, DHT nodes) |

## Seerr (Media Requests)

```bash
tsarr seerr <resource> <action> [args]
```

| Resource | Action | Args | Description |
|----------|--------|------|-------------|
| `requests` | `list` | `[--filter <status>]` | List media requests (filters: all, approved, available, pending, processing, unavailable, failed, deleted, completed) |
| `requests` | `count` | | Get request count summary |
| `requests` | `approve` | `<id>` | Approve a request |
| `requests` | `decline` | `<id>` | Decline a request |
| `search` | `query` | `<query>` | Search for movies and TV shows |
| `users` | `list` | | List all users |
| `status` | `show` | | Server status and version |

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
