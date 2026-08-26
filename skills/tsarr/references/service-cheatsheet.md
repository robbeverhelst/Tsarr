# Service Cheatsheet

## Radarr

Use for movies.

```bash
tsarr radarr movie list --json
tsarr radarr movie get --id 123 --json
tsarr radarr movie search --term "Interstellar" --limit 5 --json
tsarr radarr movie add --term "Interstellar"
tsarr radarr movie refresh --id 123
tsarr radarr movie manual-search --id 123
tsarr radarr queue list --json
tsarr radarr history list --json
```

Useful helpers:

```bash
tsarr radarr profile list --json
tsarr radarr rootfolder list --json
tsarr radarr tag list --json
tsarr radarr system health --json
```

## Sonarr

Use for TV series and episodes.

```bash
tsarr sonarr series list --json
tsarr sonarr series get --id 456 --json
tsarr sonarr series search --term "Breaking Bad" --limit 5 --json
tsarr sonarr series add --term "Breaking Bad"
tsarr sonarr series refresh --id 456
tsarr sonarr series manual-search --id 456
tsarr sonarr episode list --series-id 456 --json
tsarr sonarr episode search --id 999
```

Useful helpers:

```bash
tsarr sonarr queue list --json
tsarr sonarr history list --json
tsarr sonarr system health --json
```

## Lidarr

Use for artists and albums.

```bash
tsarr lidarr artist list --json
tsarr lidarr artist get --id 789 --json
tsarr lidarr artist search --term "Radiohead" --json
tsarr lidarr artist add --term "Radiohead" --foreign-artist-id a74b1b7f-71a5-4011-9441-d0b5e4122711 --quality-profile-id 2 --metadata-profile-id 4 --root-folder /music --no-search --yes
tsarr lidarr artist refresh --id 789
tsarr lidarr album list --artist-id 789 --json
tsarr lidarr album get --id 654 --json
tsarr lidarr album search --term "OK Computer" --json
tsarr lidarr metadataprofile list --json
tsarr lidarr release list --album-id 654 --json
tsarr lidarr release grab --file selected-release.json --yes
```

Useful helpers:

```bash
tsarr lidarr queue list --json
tsarr lidarr history list --json
tsarr lidarr system health --json
```

## Readarr

Use for authors and books.

```bash
tsarr readarr author list --json
tsarr readarr author get --id 321 --json
tsarr readarr author search --term "Ursula Le Guin" --json
tsarr readarr author add --term "Ursula Le Guin"
tsarr readarr author refresh --id 321
tsarr readarr book list --json
tsarr readarr book get --id 654 --json
tsarr readarr book search --term "The Left Hand of Darkness" --json
```

Useful helpers:

```bash
tsarr readarr queue list --json
tsarr readarr history list --json
tsarr readarr system health --json
```

## Prowlarr

Use for indexers, connected apps, and cross-indexer search.

```bash
tsarr prowlarr indexer list --json
tsarr prowlarr indexer get --id 12 --json
tsarr prowlarr indexer test --json
tsarr prowlarr search run --term "ubuntu iso" --json
tsarr prowlarr app list --json
tsarr prowlarr app sync
tsarr prowlarr system health --json
```

Advanced Prowlarr add/edit flows use `--file` JSON input. Prefer read-only inspection unless the user explicitly wants to change indexers, applications, notifications, or download clients.

## Bazarr

Use for subtitle status and provider inspection.

```bash
tsarr bazarr series list --json
tsarr bazarr movie list --json
tsarr bazarr episode wanted --json
tsarr bazarr provider list --json
tsarr bazarr language list --json
tsarr bazarr language profiles --json
tsarr bazarr system status --json
tsarr bazarr system health --json
tsarr bazarr system badges --json
```

## qBittorrent

Use for torrent management and download status.

```bash
tsarr qbit torrents list --json
tsarr qbit torrents list --filter downloading --json
tsarr qbit torrents pause --hashes <hash>
tsarr qbit torrents resume --hashes <hash>
tsarr qbit torrents delete --hashes <hash> --delete-files
tsarr qbit status show --json
```

qBittorrent uses username/password authentication instead of API keys. Configure via `tsarr config init` or environment variables `TSARR_QBITTORRENT_URL`, `TSARR_QBITTORRENT_USERNAME`, `TSARR_QBITTORRENT_PASSWORD`.

## Seerr

Use for media request management. Works with Seerr, Jellyseerr, and Overseerr.

```bash
tsarr seerr requests list --json
tsarr seerr requests list --filter pending --json
tsarr seerr requests count --json
tsarr seerr requests approve --id 123
tsarr seerr requests decline --id 123
tsarr seerr search query --query "The Matrix" --json
tsarr seerr users list --json
tsarr seerr status show --json
```

Seerr uses API key authentication. Configure via `tsarr config init` or environment variables `TSARR_SEERR_URL` and `TSARR_SEERR_API_KEY`.

## Jellyfin

Use for media server tasks: trigger library scans, read watched state, see who is streaming, control playback, manage playlists and collections, and fix artwork.

Full command surface:

```bash
tsarr jellyfin library refresh
tsarr jellyfin library folders
tsarr jellyfin library add --name <name> [--collection-type <collection-type>] [--paths <paths>] [--refresh]
tsarr jellyfin library remove --name <name>
tsarr jellyfin item list [--search <search>] [--type <type>] [--parent <parent>] [--user <user>] [--played] [--limit <limit>]
tsarr jellyfin item get --id <id> --user <user>
tsarr jellyfin item refresh --id <id> [--mode <mode>] [--replace-metadata] [--replace-images]
tsarr jellyfin item delete --id <id>
tsarr jellyfin item counts [--user <user>]
tsarr jellyfin item latest --user <user> [--limit <limit>]
tsarr jellyfin item nextup --user <user> [--limit <limit>]
tsarr jellyfin item resume --user <user> [--limit <limit>]
tsarr jellyfin image list --id <id>
tsarr jellyfin image remote --id <id> [--type <type>] [--provider <provider>] [--all-languages] [--limit <limit>]
tsarr jellyfin image providers --id <id>
tsarr jellyfin image set --id <id> --type <type> --url <url>
tsarr jellyfin image delete --id <id> --type <type> [--index <index>]
tsarr jellyfin watched status --id <id> --user <user>
tsarr jellyfin watched mark --id <id> --user <user>
tsarr jellyfin watched unmark --id <id> --user <user>
tsarr jellyfin watched favorite --id <id> --user <user>
tsarr jellyfin watched unfavorite --id <id> --user <user>
tsarr jellyfin session list [--active-within <active-within>]
tsarr jellyfin session play --id <id> --items <a,b> [--mode <mode>] [--position <position>]
tsarr jellyfin session pause --id <id>
tsarr jellyfin session unpause --id <id>
tsarr jellyfin session stop --id <id>
tsarr jellyfin session seek --id <id> --position <position>
tsarr jellyfin session message --id <id> --text <text> [--header <header>] [--timeout <timeout>]
tsarr jellyfin session command --id <id> --command <command>
tsarr jellyfin session system --id <id> --command <command>
tsarr jellyfin session display --id <id> --item <item> --name <name> --type <type>
tsarr jellyfin session add-user --id <id> --user <user>
tsarr jellyfin session remove-user --id <id> --user <user>
tsarr jellyfin playlist create --name <name> --user <user> [--items <a,b>] [--type <type>]
tsarr jellyfin playlist items --id <id> --user <user> [--limit <limit>]
tsarr jellyfin playlist add --id <id> --items <a,b> --user <user>
tsarr jellyfin playlist remove --id <id> --entries <a,b>
tsarr jellyfin collection create --name <name> [--items <a,b>] [--parent <parent>]
tsarr jellyfin collection add --id <id> --items <a,b>
tsarr jellyfin collection remove --id <id> --items <a,b>
tsarr jellyfin user list
tsarr jellyfin user get --id <id>
tsarr jellyfin task list
tsarr jellyfin task start --id <id>
tsarr jellyfin task stop --id <id>
tsarr jellyfin search query --query <query> [--type <type>] [--limit <limit>]
tsarr jellyfin system status
tsarr jellyfin system activity [--limit <limit>]
```

Add `--json` to any command when extracting values.

Jellyfin uses API key authentication. Configure via `tsarr config init` or environment variables `TSARR_JELLYFIN_URL` and `TSARR_JELLYFIN_API_KEY`. Get a key from Dashboard -> Advanced -> API Keys.

**Important:** Jellyfin returns PascalCase JSON (`Id`, `Name`, `Type`, `Items`), unlike the camelCase used by the Servarr services. Use PascalCase when parsing output or passing `--select`.

`--user <userId>` is **required** on `item get`, `item latest`, `item nextup`, `item resume` and all `watched` and `playlist` commands. Jellyfin's spec marks it optional but the server returns 400 without it. Get IDs from `tsarr jellyfin user list --json`.

There is no `playlist get` or `playlist move` — those Jellyfin endpoints need a user-context token and reject API keys; use `tsarr jellyfin item get --id <playlistId> --user <userId>` instead.

See "Fix a missing or poor cover image" in common-workflows.md for the artwork workflow.

## Multi-instance services

When a service has multiple named instances, append `--instance <name>` or `-i <name>` to target a specific one. Without `--instance`, the first (default) instance is used.

```bash
tsarr radarr movie list --instance 4K --json
tsarr sonarr series list -i main --json
```

## Mutation rules

- Run `get` or `list` first when a delete or edit is requested.
- Use `--json` when extracting IDs or confirming the target.
- Reserve `--yes` for explicit automation requests.
- Expect some advanced add/edit commands to require JSON input files instead of simple flags.
