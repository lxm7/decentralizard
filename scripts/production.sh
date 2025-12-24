#!/usr/bin/env bash

set -exo pipefail
## Keep existing nginx running while deploying new app containers
docker compose build app
docker compose up -d --no-deps --scale app=2 app
sleep 15 # Wait for healthcheck (adjust as needed)
docker compose up -d --no-deps --scale app=1 app
