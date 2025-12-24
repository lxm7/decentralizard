#!/usr/bin/env bash

set -exo pipefail

COMPOSE_FILE="docker-compose.production.yml"

## Ensure nginx is running (idempotent - won't recreate if already running)
docker compose -f $COMPOSE_FILE up -d --no-recreate nginx

## Blue-green deployment: scale to 2 app containers, wait for health, then scale back to 1
docker compose -f $COMPOSE_FILE build app
docker compose -f $COMPOSE_FILE up -d --no-deps --scale app=2 app
sleep 15 # Wait for healthcheck (adjust as needed)
docker compose -f $COMPOSE_FILE up -d --no-deps --scale app=1 app
