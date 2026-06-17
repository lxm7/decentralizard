#!/bin/bash
set -euo pipefail

SHA="${1:?Usage: deploy.sh <commit-sha>}"
REGISTRY="158871758094.dkr.ecr.eu-west-1.amazonaws.com"
IMAGE="$REGISTRY/decentralizard"
REGION="eu-west-1"

aws ecr get-login-password --region "$REGION" | \
  docker login --username AWS --password-stdin "$REGISTRY"

docker pull "$IMAGE:$SHA"
docker tag "$IMAGE:$SHA" "$IMAGE:latest"

docker compose -f /opt/decentralizard/docker-compose.yml up -d --no-deps --pull never app
