#!/usr/bin/env bash

set -exo pipefail

# tear down previous containers
# docker compose --file docker-compose.production.yml down -t 1

# Build and run the latest version of the app
docker compose --file docker-compose.production.yml up --build --detach nginx

# reload after we have build our new container incase nginx caches anything
# sudo nginx -s reload

# Remove the unused containers
docker system prune --force