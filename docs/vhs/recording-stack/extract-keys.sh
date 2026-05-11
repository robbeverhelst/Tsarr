#!/usr/bin/env bash
# Extract API keys from the Servarr-family containers and print a ready-to-paste
# Tsarr config block. Run after `docker compose up -d` and ~30s of startup.

set -euo pipefail
cd "$(dirname "$0")"

wait_for_config() {
  local svc=$1
  local path=$2
  local tries=60
  while (( tries-- > 0 )); do
    if docker compose exec -T "$svc" test -f "$path" 2>/dev/null; then return 0; fi
    sleep 1
  done
  echo "timeout waiting for $svc:$path" >&2
  return 1
}

extract_arr_key() {
  local svc=$1
  wait_for_config "$svc" /config/config.xml
  docker compose exec -T "$svc" cat /config/config.xml \
    | grep -oE '<ApiKey>[^<]+</ApiKey>' \
    | sed -E 's|</?ApiKey>||g' \
    | tr -d '\r\n'
}

extract_bazarr_key() {
  wait_for_config bazarr /config/config/config.yaml
  docker compose exec -T bazarr cat /config/config/config.yaml \
    | grep -E '^\s*apikey:' | head -n1 | awk -F': ' '{print $2}' | tr -d '\r\n'
}

echo "Extracting keys (this can take ~30s on first boot)..." >&2

RADARR=$(extract_arr_key radarr)
SONARR=$(extract_arr_key sonarr)
LIDARR=$(extract_arr_key lidarr)
READARR=$(extract_arr_key readarr)
PROWLARR=$(extract_arr_key prowlarr)
BAZARR=$(extract_bazarr_key || echo "")

cat <<EOF

# Paste this into ~/.config/tsarr/config.json — or feed it to \`tsarr config import\`.
# qBittorrent and Jellyseerr need one-time web UI setup before they expose an API key.

{
  "services": {
    "radarr":      { "baseUrl": "http://localhost:7878", "apiKey": "$RADARR" },
    "sonarr":      { "baseUrl": "http://localhost:8989", "apiKey": "$SONARR" },
    "lidarr":      { "baseUrl": "http://localhost:8686", "apiKey": "$LIDARR" },
    "readarr":     { "baseUrl": "http://localhost:8787", "apiKey": "$READARR" },
    "prowlarr":    { "baseUrl": "http://localhost:9696", "apiKey": "$PROWLARR" },
    "bazarr":      { "baseUrl": "http://localhost:6767", "apiKey": "$BAZARR" },
    "qbittorrent": { "baseUrl": "http://localhost:8080", "username": "admin", "password": "<see container logs: docker logs tsarr-rec-qbittorrent>" },
    "jellyseerr":  { "baseUrl": "http://localhost:5055", "apiKey": "<open http://localhost:5055, finish setup, then Settings → General → API Key>" }
  }
}
EOF
