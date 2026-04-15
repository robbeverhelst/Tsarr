---
name: tsarr
description: Manage home media services through TsArr from OpenClaw. Use for Radarr, Sonarr, Lidarr, Readarr, Prowlarr, Bazarr, qBittorrent, and Seerr tasks such as checking health, inspecting queues and history, browsing libraries, searching, adding, editing, deleting items, viewing profiles, tags, and root folders, managing torrents, managing media requests, and checking TsArr configuration.
metadata:
  openclaw:
    requires:
      bins:
        - tsarr
      config:
        - .tsarr.json
        - ~/.config/tsarr/config.json
    install:
      - kind: node
        package: tsarr
        bins:
          - tsarr
    homepage: https://github.com/robbeverhelst/tsarr
    emoji: "🎬"
---

# TsArr

Manage Servarr apps through the `tsarr` CLI.

## Start

- Verify the CLI is available with `tsarr --help`.
- If setup or service health is unclear, read [references/setup.md](references/setup.md) and start with `tsarr doctor`.
- Prefer `--json` when selecting IDs, extracting fields, or comparing results.

## Safety

- Inspect before mutating.
- Fetch the current item before `edit` or `delete` when possible.
- Avoid `--yes` on destructive commands unless the user explicitly wants non-interactive execution.
- If the user says "Arr", "library", or "queue" without naming a service, clarify which service to use.
- If a service has multiple named instances and the user doesn't specify which, clarify or default to the first instance.

## Routing

- Read [references/setup.md](references/setup.md) for installation expectations, configuration, and connectivity checks.
- Read [references/common-workflows.md](references/common-workflows.md) for health checks, library browsing, search, add, queue, history, refresh, and delete flows.
- Read [references/service-cheatsheet.md](references/service-cheatsheet.md) to map a user request to the correct `service resource action` command.

## Notes

- Trust the command patterns in these references over stale prose elsewhere.
- Keep responses operational: show the command you plan to run, summarize the result, and call out any destructive effect before you execute it.
