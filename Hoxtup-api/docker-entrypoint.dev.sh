#!/bin/sh
set -e

echo "Running Prisma migrations..."
pnpm prisma migrate deploy

echo "Starting API in dev mode..."
exec pnpm dev:docker
