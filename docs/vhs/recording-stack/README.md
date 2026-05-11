# Recording stack

Disposable Docker Compose stack that brings up all 8 supported services on `localhost` with fresh empty configs. Purpose: a reproducible rig for recording `tsarr doctor` and the workflow demo without touching your real homelab.

## One-time setup

```bash
cd docs/vhs/recording-stack
docker compose up -d
# Wait ~30 seconds for the *arr apps to write their initial configs.
chmod +x extract-keys.sh
./extract-keys.sh
```

`extract-keys.sh` prints a ready-to-paste Tsarr config with the auto-generated API keys for Radarr, Sonarr, Lidarr, Readarr, Prowlarr, and Bazarr.

## Manual steps for two services

**qBittorrent** generates a one-time admin password and writes it to the container log. Grab it:

```bash
docker logs tsarr-rec-qbittorrent 2>&1 | grep -iE 'temporary password'
```

Log in at <http://localhost:8080> with `admin` + that password, change it, then put `admin` / `<your new password>` in your Tsarr config.

**Jellyseerr** needs one-time setup at <http://localhost:5055>: skip the Plex/Jellyfin step (or point at a fake one), then **Settings → General → API Key**. Paste that into your Tsarr config.

## Use it

```bash
# Paste the printed config into ~/.config/tsarr/config.json, then:
tsarr doctor        # should show 8 ✓'s

# Record:
cd ../../..
vhs docs/vhs/hero.tape
vhs docs/vhs/workflow.tape
```

The workflow tape includes `radarr movie add` — that's fine because this Radarr is disposable.

## Teardown

```bash
docker compose down -v
rm -rf data/      # wipes generated configs so the next run is fresh
```

## Why this is gitignored

The `data/` directory contains generated configs (API keys, SQLite DBs) and gets wiped between recordings. Don't commit it.
