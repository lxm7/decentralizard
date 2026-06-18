#!/bin/bash
set -euo pipefail

SHA="${1:?Usage: deploy.sh <commit-sha>}"
REGISTRY="158871758094.dkr.ecr.eu-west-1.amazonaws.com"
IMAGE="$REGISTRY/decentralizard"
COMPOSE_FILE="/opt/decentralizard/docker-compose.yml"
export APP_TAG="$SHA"

dc() { docker compose -f "$COMPOSE_FILE" "$@"; }

# --- 1. Pull the new image up-front (nothing running is touched yet) ---
docker pull "$IMAGE:$SHA"
docker tag "$IMAGE:$SHA" "$IMAGE:latest"

# --- 2. Reconcile the long-lived edge (network + cloudflared) ---
# A full reconcile repairs topology drift — e.g. cloudflared stranded on the
# default network instead of `web` (the exact split that caused the 502s).
# Idempotent: cloudflared is only recreated if its definition actually changed,
# so on a healthy box the tunnel stays connected and this is a no-op.
# --no-deps so this never drags the app into a recreate behind our back.
dc up -d --no-deps cloudflared

# --- 3. Blue-green the app on the `web` network ---
# `next start` only (no boot migrations), so old + new can serve at once.
OLD_APP="$(dc ps -q app || true)"

if [ -z "$OLD_APP" ]; then
  # Cold start: nothing running yet, just bring the app up.
  dc up -d --no-deps app
else
  # Warm: start a 2nd container on the new image alongside the old. Docker DNS
  # resolves `app` to both, so cloudflared keeps serving from the old one while
  # the new boots. The cutover window is "new is healthy", not "app is down".
  dc up -d --no-deps --no-recreate --scale app=2 app

  NEW_APP="$(dc ps -q app | grep -vxF "$OLD_APP" | head -n1 || true)"
  [ -n "$NEW_APP" ] || { echo "Could not identify new app container — aborting."; exit 1; }
  echo "New container $NEW_APP starting; waiting for healthy…"

  healthy=""
  for _ in $(seq 1 45); do
    s="$(docker inspect -f '{{.State.Health.Status}}' "$NEW_APP" 2>/dev/null || echo none)"
    [ "$s" = "healthy" ] && { healthy=1; break; }
    [ "$s" = "unhealthy" ] && break
    sleep 2
  done

  if [ -z "$healthy" ]; then
    echo "New container never went healthy — rolling back, old container kept serving."
    docker rm -f "$NEW_APP" || true
    dc up -d --no-deps --no-recreate --scale app=1 app
    exit 1
  fi

  # New is healthy → retire the old container, settle back to a single replica.
  docker rm -f "$OLD_APP"
  dc up -d --no-deps --no-recreate --scale app=1 app
fi

echo "Deploy complete: $IMAGE:$SHA"
