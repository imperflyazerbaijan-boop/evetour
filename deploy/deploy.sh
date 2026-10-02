#!/usr/bin/env bash
#
# Deploy EVE TOUR on a plain Ubuntu server (Oracle Cloud Always Free, or any
# VPS). Run on the server, as the evetour user:
#
#   git pull
#   bash deploy/deploy.sh
#
# What it does, in order:
#   1. npm ci          — exact versions from package-lock.json
#   2. prisma generate — recreates src/generated (gitignored; postinstall also runs)
#   3. npm run build   — produces .next/
#   4. restart service — systemd picks up the new build
#
# The database is NOT touched. dev.db and uploads/ live on the persistent boot
# volume, and `prisma db push` against a real database would be a data-loss
# risk for no benefit — the schema only changes when you change it yourself.

set -euo pipefail

APP_DIR="${APP_DIR:-/srv/evetour}"
SERVICE="${SERVICE:-evetour}"

cd "$APP_DIR"

echo "==> Installing dependencies"
npm ci

echo "==> Generating the Prisma client"
npx prisma generate

echo "==> Building"
# Runs `prisma generate && next build` (see package.json).
npm run build

# `next build` prerenders the public pages by querying the database, so a
# missing dev.db here would produce a site full of empty sections. Fail loudly
# instead of deploying that.
if [ ! -f "$APP_DIR/dev.db" ]; then
  echo "ERROR: dev.db is missing. Restore it from backup before deploying." >&2
  exit 1
fi

echo "==> Restarting $SERVICE"
if [ "$(id -u)" -eq 0 ]; then
  systemctl restart "$SERVICE"
else
  sudo systemctl restart "$SERVICE"
fi

echo "==> Done. Check it responds:"
echo "      curl -sI https://$(grep -oP '(?<=^)[^ ]+' deploy/Caddyfile | head -1 | cut -d, -f1)"
