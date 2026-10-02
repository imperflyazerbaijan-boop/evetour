#!/usr/bin/env bash
#
# First-time setup on a fresh Ubuntu 24.04 server (Oracle Cloud Always Free ARM,
# or any VPS). Run as root or with sudo:
#
#   sudo bash deploy/setup-server.sh
#
# Idempotent — safe to run again. It creates the evetour user, clones nothing
# (you do that yourself, so SSH keys work), and installs Node 22, Caddy and the
# systemd unit.

set -euo pipefail

APP_USER=evetour
APP_DIR=/srv/evetour
NODE_MAJOR=22

echo "==> System packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl ca-certificates git build-essential ufw

echo "==> Node.js ${NODE_MAJOR}"
# NodeSource, because Ubuntu 24.04 ships Node 18 and Next.js 16 needs 20+.
curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
apt-get install -y -qq nodejs

echo "==> Caddy"
# The official apt repo. Caddy handles TLS certificates on its own, so there is
# no certbot or renewal cron to configure.
curl -fsSL "https://dl.cloudsmith.io/public/caddy/stable/gpg.key" \
  | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/caddy-stable-archive-keyring.gpg] https://dl.cloudsmith.io/public/caddy/stable/debian/ any main" \
  > /etc/apt/sources.list.d/caddy-stable.list
apt-get update -qq
apt-get install -y -qq caddy

echo "==> Application user and directory"
id -u "$APP_USER" >/dev/null 2>&1 || useradd --system --shell /usr/sbin/nologin "$APP_USER"
mkdir -p "$APP_DIR/uploads"
# better-sqlite3 is a native module: npm ci compiles it, so the user needs a
# toolchain and write access to the cache.
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

echo "==> Firewall"
# Caddy needs 80 and 443 for the ACME challenge and TLS. 22 stays open for SSH.
ufw allow OpenSSH
ufw allow 'HTTP'
ufw allow 'HTTPS'
ufw --force enable

cat <<EOF

Setup complete. Next steps, as the $APP_USER account:

  sudo -u $APP_USER -H git clone https://github.com/imperflyazerbaijan-boop/evetour.git $APP_DIR

  # .env must exist before any prisma command — prisma.config.ts reads
  # DATABASE_URL from it. Copy the example and edit it first:
  sudo -u $APP_USER -H cp $APP_DIR/.env.example $APP_DIR/.env
  sudo -u $APP_USER -H nano $APP_DIR/.env

  # Then install, create the tables and load the content:
  sudo -u $APP_USER -H bash -c "cd $APP_DIR && npm ci && npm run setup"

  # Copy the unit + Caddyfile, replacing the domain in Caddyfile first:
  sudo cp $APP_DIR/deploy/evetour.service /etc/systemd/system/
  sudo cp $APP_DIR/deploy/Caddyfile /etc/caddy/Caddyfile
  sudo systemctl daemon-reload && sudo systemctl enable --now evetour

After that, every deploy is:  git pull && bash deploy/deploy.sh
EOF
