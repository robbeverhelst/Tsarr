# Common Workflows

## Output modes

Prefer:

- `--json` for parsing and field selection
- `--table` for human inspection in a terminal
- `--plain` for TSV-style piping
- `--quiet` when only IDs are needed
- `--select=field1,field2` to reduce noisy JSON
- `--instance <name>` / `-i <name>` to target a specific named instance (for multi-instance services)

Examples:

```bash
tsarr radarr movie list --json --select=title,year,monitored
tsarr sonarr series list --quiet
tsarr radarr movie list --instance 4K --json
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
tsarr lidarr artist add --term "Radiohead" --foreign-artist-id a74b1b7f-71a5-4011-9441-d0b5e4122711 --quality-profile-id 2 --metadata-profile-id 4 --root-folder /music --no-search --yes
tsarr lidarr album list --artist-id <artistId> --json
tsarr lidarr release list --album-id <albumId> --json
tsarr lidarr release grab --file selected-release.json --yes

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

## Media server (Jellyfin)

Trigger a scan after an import, then confirm the item landed:

```bash
tsarr jellyfin library refresh
tsarr jellyfin item list --type Movie --search "The Matrix" --json
```

Check nobody is streaming before running maintenance:

```bash
tsarr jellyfin session list --active-within 300 --json
```

Read watched state (per user — get the ID from `tsarr jellyfin user list --json`):

```bash
tsarr jellyfin user list --json
tsarr jellyfin watched status --id <itemId> --user <userId> --json
tsarr jellyfin item list --type Movie --user <userId> --played true --json
```

Jellyfin output is PascalCase, so extract fields accordingly:

```bash
tsarr jellyfin item list --type Movie --json --select Id,Name
```

## Fix a missing or poor cover image

When someone says a title has no cover, or a bad one, resolve it in four steps.
Never guess an item ID — look it up.

```bash
# 1. Find the item
tsarr jellyfin item list --search "Pokemon" --type Movie --json --select Id,Name,ProductionYear

# 2. Inspect what artwork it has. No Primary row means no cover; a small
#    Width/Height means a poor one.
tsarr jellyfin image list --id <itemId> --json

# 3. List candidates from the metadata providers
tsarr jellyfin image remote --id <itemId> --type Primary --limit 10 --json

# 4. Apply the chosen one
tsarr jellyfin image set --id <itemId> --type Primary --url "<url>"
```

Choosing a candidate:

- Prefer higher `Width`/`Height`, then higher `CommunityRating`.
- **`Width`/`Height` are absent on Jellyfin 12.0** (present on 10.11), even
  though the API schema declares them. When they are missing, rank by
  `CommunityRating` and `VoteCount` instead.
- `Language` matters for posters with title text; pass `--all-languages` to
  widen the search.

`--url` accepts **any reachable image URL**, not only provider candidates, so a
cover found elsewhere can be applied directly:

```bash
tsarr jellyfin image set --id <itemId> --type Primary --url "https://example.com/poster.jpg"
```

Other artwork types work the same way — `Backdrop`, `Logo`, `Thumb`, `Banner`.
To drop a bad image without replacing it:

```bash
tsarr jellyfin image delete --id <itemId> --type Primary --yes
```

To sweep a whole library for missing covers:

```bash
for id in $(tsarr jellyfin item list --type Movie --quiet); do
  tsarr jellyfin image list --id "$id" --json \
    | grep -q '"Primary"' || echo "no cover: $id"
done
```

## Configuration checks

When a command fails unexpectedly, inspect TsArr’s merged configuration:

```bash
tsarr config show
tsarr config get services.prowlarr.baseUrl
```
