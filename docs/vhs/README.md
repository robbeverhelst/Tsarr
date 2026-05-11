# VHS recordings

These [VHS](https://github.com/charmbracelet/vhs) tapes generate the demos embedded in the project README.

## Render

```bash
brew install vhs
vhs docs/vhs/hero.tape
vhs docs/vhs/workflow.tape
```

Both tapes expect a configured Tsarr install with reachable services. Run `tsarr config init` and `tsarr doctor` first to confirm everything responds before recording — the hero tape leans on a full 8-service green-check moment.

## Tapes

- `hero.tape` — `tsarr doctor` + `tsarr radarr movie list --table`. Used as the top-of-README hero.
- `workflow.tape` — `tsarr doctor` + `radarr movie search` + `radarr movie add`. Used inside the CLI section to show a realistic flow.
