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
tsarr lidarr artist add --term "Radiohead"
tsarr lidarr artist refresh --id 789
tsarr lidarr album list --json
tsarr lidarr album get --id 654 --json
tsarr lidarr album search --term "OK Computer" --json
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

## Mutation rules

- Run `get` or `list` first when a delete or edit is requested.
- Use `--json` when extracting IDs or confirming the target.
- Reserve `--yes` for explicit automation requests.
- Expect some advanced add/edit commands to require JSON input files instead of simple flags.
