# Common Workflows

## Output modes

Prefer:

- `--json` for parsing and field selection
- `--table` for human inspection in a terminal
- `--plain` for TSV-style piping
- `--quiet` when only IDs are needed
- `--select=field1,field2` to reduce noisy JSON

Examples:

```bash
tsarr radarr movie list --json --select=title,year,monitored
tsarr sonarr series list --quiet
```

## Health and status

Start here when the user wants to know whether the stack is healthy:

```bash
tsarr doctor
tsarr radarr system status --json
tsarr radarr system health --json
tsarr sonarr system status --json
tsarr prowlarr system health --json
tsarr bazarr system status --json
tsarr qbit status show --json
tsarr seerr status show --json
```

## Browse libraries

Use these for inspection before any write operation:

```bash
tsarr radarr movie list --json
tsarr radarr movie get --id 123 --json

tsarr sonarr series list --json
tsarr sonarr series get --id 456 --json
tsarr sonarr episode list --series-id 456 --json

tsarr lidarr artist list --json
tsarr lidarr album list --json

tsarr readarr author list --json
tsarr readarr book list --json

tsarr bazarr series list --json
tsarr bazarr movie list --json
tsarr bazarr episode wanted --json

tsarr qbit torrents list --json
tsarr qbit torrents list --filter downloading --json

tsarr seerr requests list --json
tsarr seerr users list --json
```

## Search and add

Use search first. Let TsArr prompt for quality profile and root folder when needed.

```bash
tsarr radarr movie search --term "Interstellar" --limit 5 --json
tsarr radarr movie add --term "Interstellar"

tsarr sonarr series search --term "Breaking Bad" --limit 5 --json
tsarr sonarr series add --term "Breaking Bad"

tsarr lidarr artist search --term "Radiohead" --json
tsarr lidarr artist add --term "Radiohead"

tsarr readarr author search --term "Ursula Le Guin" --json
tsarr readarr author add --term "Ursula Le Guin"
```

Use ID-based adds when the user already knows the external identifier:

```bash
tsarr radarr movie add --tmdb-id 157336
tsarr sonarr series add --tvdb-id 81189
```

## Queue and history

Use these to inspect stuck downloads, failed grabs, or recent activity:

```bash
tsarr radarr queue list --json
tsarr radarr queue status --json
tsarr radarr history list --json

tsarr sonarr queue list --json
tsarr sonarr history list --json

tsarr lidarr queue list --json
tsarr readarr queue list --json
```

## Metadata and helpers

Use these when the user needs supporting IDs before an add or edit:

```bash
tsarr radarr profile list --json
tsarr radarr rootfolder list --json
tsarr radarr tag list --json

tsarr sonarr profile list --json
tsarr sonarr rootfolder list --json

tsarr lidarr profile list --json
tsarr readarr profile list --json

tsarr prowlarr indexer list --json
tsarr prowlarr app list --json
tsarr prowlarr search run --term "ubuntu iso" --json
```

## Refresh and manual search

Use these when the library exists but metadata or release search needs to be retriggered:

```bash
tsarr radarr movie refresh --id 123
tsarr radarr movie manual-search --id 123

tsarr sonarr series refresh --id 456
tsarr sonarr series manual-search --id 456

tsarr lidarr artist refresh --id 789
tsarr readarr author refresh --id 321
```

## Delete safely

Inspect first, then delete. Do not pass `--yes` unless the user explicitly wants automation.

```bash
tsarr radarr movie get --id 123 --json
tsarr radarr movie delete --id 123

tsarr sonarr series get --id 456 --json
tsarr sonarr series delete --id 456

tsarr lidarr artist get --id 789 --json
tsarr lidarr artist delete --id 789

tsarr readarr author get --id 321 --json
tsarr readarr author delete --id 321
```

Use extra destructive flags only when the user clearly asks for them:

```bash
tsarr radarr movie delete --id 123 --delete-files
tsarr sonarr series delete --id 456 --delete-files
tsarr qbit torrents delete --hashes <hash> --delete-files
```

## Configuration checks

When a command fails unexpectedly, inspect TsArr’s merged configuration:

```bash
tsarr config show
tsarr config get services.prowlarr.baseUrl
```
