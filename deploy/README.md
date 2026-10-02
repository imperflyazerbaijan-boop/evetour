# Deploying to a free Oracle Cloud VM

Oracle Cloud's **Always Free** tier gives a real virtual machine at no cost: 2
OCPU, 12 GB RAM and 200 GB of block storage. That is a server — one long-running
process on one persistent disk — which is exactly what this app needs. SQLite,
`uploads/` and the admin panel all work unchanged, and no application code
needs to be touched.

The alternative does not work: Vercel's free plan is documented as
*non-commercial, personal use only*, and Render's free tier has the same
restriction. Cloudflare Pages allows commercial use but is serverless, so
`dev.db` and `uploads/` would be wiped between requests.

---

## Part 1 — create the VM (in the browser)

1. Go to <https://cloud.oracle.com/free> and start the free trial.
2. Choose a **home region** carefully — Always Free compute can only be created
   in the home region, and it cannot be changed later. Pick the one closest to
   you (for Azerbaijan, Frankfurt or Zurich).
3. Complete the sign-up. A credit card is required for verification and is
   **not** charged. When asked about the account type, stay on the free tier.
4. Open **Compute → Instances → Create instance**.

   | Field | Value |
   | --- | --- |
   | Name | `evetour` |
   | Image | Ubuntu 24.04 (aarch64) |
   | Shape | `VM.Standard.A1.Flex` |
   | OCPU / memory | 2 / 12 GB (the full Always Free allowance) |
   | Boot volume | 50 GB |

5. Under **Networking**, create a new VCN and public subnet if prompted.
6. Add your **SSH public key** (`ssh-keygen -t ed25519` if you do not have one).
   Without it you cannot log in.
7. **Create instance.**

**If you get "out of host capacity":** the free ARM capacity in a region is
genuinely scarce. Change the availability domain and try again, or wait a few
hours. This is the most common stumbling block — it is not a mistake in the
setup.

Note the instance's **public IP address**; you need it for the domain.

---

## Part 2 — point the domain at it

Before the site can have HTTPS, DNS must already resolve. In your domain
registrar add an **A record**:

```
@     A     <the instance public IP>
www   A     <the instance public IP>
```

Wait until it resolves (`nslookup evetour.az`) before continuing — Caddy cannot
issue a certificate for a name that does not point here.

---


## Part 3 — set up the server

SSH in as the default `ubuntu` user:

```bash
ssh -i ~/.ssh/id_ed25519 ubuntu@<public-ip>
```

Install everything:

```bash
bash <(curl -s https://raw.githubusercontent.com/imperflyazerbaijan-boop/evetour/master/deploy/setup-server.sh)
```

Or, if you have already cloned the repo, `sudo bash deploy/setup-server.sh`.
It installs Node 22, Caddy, creates the `evetour` user and turns on the
firewall. It is safe to run more than once.

---

---

## Part 4 — install the app

```bash
sudo -u evetour -H git clone https://github.com/imperflyazerbaijan-boop/evetour.git /srv/evetour
cd /srv/evetour

# .env must exist before any Prisma command — prisma.config.ts reads DATABASE_URL from it.
cp .env.example .env
nano .env
```

In `.env`, set these. Generate strong values rather than typing your own:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | `file:./dev.db` — leave as is |
| `AUTH_SECRET` | the generated string (signs the admin cookie) |
| `ADMIN_PASSWORD` | the admin password you want to log in with |
| `NEXT_PUBLIC_SITE_URL` | `https://evetour.az` — no trailing slash, must be https |

Then build and load the content:

```bash
sudo -u evetour -H npm ci
sudo -u evetour -H npm run setup    # generate client, create tables, seed content
```

## Part 5 — run it

Put your domain into the Caddyfile, then start both services:

```bash
sudo nano deploy/Caddyfile      # replace evetour.az if your domain differs
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
sudo cp deploy/evetour.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now evetour
sudo systemctl restart caddy
```

Check it:

```bash
curl -sI https://evetour.az
curl -s https://evetour.az/sitemap.xml | head
sudo systemctl status evetour
```

Then sign in at `https://evetour.az/admin` with the `ADMIN_PASSWORD` you set.

---

## Day-to-day deploys

```bash
cd /srv/evetour
git pull
bash deploy/deploy.sh
```

That runs `npm ci`, regenerates the Prisma client, rebuilds and restarts the
service. It does **not** touch `dev.db` or `uploads/`.

**Read the logs when something breaks:**

```bash
sudo journalctl -u evetour -f
```

---

## Backups — do not skip this

`dev.db` and `uploads/` are the only state that is not in git. Lose them and
you lose every content edit made through the admin and every uploaded image.
A nightly copy is enough, because SQLite writes are transactional and a `cp` of
a file nobody is writing to at that moment is a consistent snapshot:

```bash
sudo crontab -e
# add:
0 3 * * * cp /srv/evetour/dev.db /srv/backups/evetour-$(date +\%F).db && tar czf /srv/backups/uploads-$(date +\%F).tar.gz -C /srv/evetour uploads && find /srv/backups -name '*.db' -mtime +30 -delete
```

Copy them off the machine too — a backup on the same disk does not survive the
disk failing.

---

## Troubleshooting

**`curl` hangs or the site is unreachable** — the security list in Oracle blocks
ports other than 22 by default. The setup script opens 80 and 443 with ufw,
but if you created the instance with a custom VCN, also check **Networking →
Virtual Cloud Networks → Security Lists** and add ingress rules for 80/443.

**Caddy will not start** — it could not obtain a certificate. The domain does
not resolve to this IP yet, or port 80 is blocked. Check with
`sudo journalctl -u caddy -f`.

**`error: P1003` or "database does not exist"** — `.env` is missing or
`DATABASE_URL` is wrong. The setup order matters: `.env` before any Prisma
command.

**Images uploaded through the admin 404** — `uploads/` must exist and be owned
by the `evetour` user: `sudo chown -R evetour:evetour /srv/evetour/uploads`.

**The instance stops after a while** — this does not happen on Always Free;
instances are not reclaimed for idleness. If the console shows it stopped, it
was stopped by hand or reclaimed for exceeding the free quota.


