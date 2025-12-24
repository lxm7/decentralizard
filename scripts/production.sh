#!/usr/bin/env bash

set -exo pipefail

COMPOSE_FILE="docker-compose.production.yml"

## Ensure nginx is running (only start if not already running)
if ! docker ps --filter "name=decentralizard-nginx" --filter "status=running" --format "{{.Names}}" | grep -q "decentralizard-nginx"; then
  echo "Starting nginx..."
  # Remove any stopped nginx containers first
  docker rm -f decentralizard-nginx 2>/dev/null || true
  docker compose -f $COMPOSE_FILE up -d nginx
else
  echo "Nginx already running, skipping..."
fi

## Blue-green deployment: scale to 2 app containers, wait for health, then scale back to 1
docker compose -f $COMPOSE_FILE build app
docker compose -f $COMPOSE_FILE up -d --no-deps --scale app=2 app
sleep 15 # Wait for healthcheck (adjust as needed)
docker compose -f $COMPOSE_FILE up -d --no-deps --scale app=1 app
