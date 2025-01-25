#!/bin/sh
set -e
yarn migrate || true
yarn seed || true

export HOSTNAME="0.0.0.0"

yarn start