# Deploying EVE TOUR

## Why not GitHub Pages

GitHub Pages serves static files only — there is no Node.js runtime. This app
cannot run there:

| Feature in this repo | GitHub Pages |
| --- | --- |
| `src/proxy.ts` (next-intl locale routing) | needs a server |
| `src/app/admin/actions.ts`, `content-actions.ts` (`'use server'`) | Server Actions need a server |
| `src/app/api/messages/route.ts` (POST → Prisma) | route handlers need a server |
| `src/app/api/admin/media/route.ts` (writes files) | needs a writable filesystem |
| `src/lib/admin-auth.ts` (`cookies()`) | needs a server |
| `uploads/` (admin media) | no persistent disk |

Next.js can emit a static export (`output: 'export'`), but the docs list Proxy,
Server Actions, Route Handlers and Cookies as unsupported — which is the whole
admin panel plus the contact form. A static export would also freeze the content
at build time, so every edit in the admin would need a rebuild and a push.

The repository stays on GitHub as the source of truth. The *running* site needs
a host with a Node.js runtime.

## Before you start

```bash
npm run check:deploy
```

This fails on the things that are invisible in development but fatal in
production: a development `AUTH_SECRET`, the default admin password, an `http://`
site URL, and a local database file on a serverless host. Fix every FAIL, then
deploy. A single WARN is acceptable and explained below.

## The database: pick your hosting first

This is the one decision everything else hangs on.

| You deploy to | Database | Why |
| --- | --- | --- |
| A VPS / cloud server you control | **SQLite is fine** | One long-running process, one persistent disk. No migration needed. |
| Vercel, Netlify, Cloudflare Pages | **Postgres is required** | Every instance gets its own throwaway filesystem, so a SQLite file would be lost or silently diverge between instances. |

`check:deploy` detects the serverless case and fails rather than letting you
discover it after a customer writes a contact form that goes nowhere.

### Free hosting that works: Oracle Cloud Always Free

A free ARM VM (2 OCPU, 12 GB, 200 GB block volume) is a real server: one
long-running process on one persistent disk. That is exactly what this app
wants, so **SQLite and `uploads/` both keep working and no application code
changes**.

Vercel's free plan is explicitly *non-commercial, personal use only* — not
suitable for a business that sells tours. Render's free tier has the same
restriction. Cloudflare Pages is commercial-friendly but has the serverless
filesystem problem above.

Full walkthrough in [`deploy/README.md`](../deploy/README.md). The short version:

```bash
# On a fresh Ubuntu 24.04 instance, as root:
bash deploy/setup-server.sh          # Node 22, Caddy, evetour user, firewall

# Then as the app user:
git clone https://github.com/imperflyazerbaijan-boop/evetour.git /srv/evetour
cp .env.example .env                 # edit: AUTH_SECRET, ADMIN_PASSWORD, site URL
npm ci && npm run setup              # generate client, create tables, seed
sudo cp deploy/evetour.service /etc/systemd/system/
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile   # put your domain in it first
sudo systemctl enable --now evetour
```

Point the domain's A record at the server before starting Caddy — TLS will not
be issued otherwise. Every later deploy is `git pull && bash deploy/deploy.sh`.

**Backup `dev.db` and `uploads/`.** They are the only state that is not in git,
and losing them loses all content edits and every uploaded image.

### Option A — one server, keep SQLite

Nothing to change. Just make sure:

- `dev.db` lives on a persistent disk, not an ephemeral container layer.
- Back it up. A nightly copy is enough:

  ```bash
  # crontab -e
  0 3 * * * cp /srv/evetour/dev.db /srv/backups/evetour-$(date +\%F).db
  ```

  Prisma's SQLite writes are transactional, so a `cp` of a file that is not
  being written to at that moment is a consistent snapshot.

- Include `uploads/` in the same backup — that folder holds every image you
  upload through the admin panel, and it lives outside `public/` on purpose.

### Option B — move to Postgres

The code supports both. `src/lib/db-adapter.ts` picks the driver from
`DATABASE_URL`, so no application code changes.

**1. Create a database.** Any of these work:

- [Neon](https://neon.tech) — free tier, serverless-friendly, has a generous
  free tier that suits a small site
- [Supabase](https://supabase.com) — free tier includes a hosted Postgres plus
  a dashboard for reading the tables
- A Postgres container on the same VPS, if you would rather keep everything in
  one place

**2. Put the connection string in the environment.**

```bash
# .env  (or your host's environment settings)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
```

**3. Switch the provider and push the schema.**

In `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
}
```

Then:

```bash
npx prisma db push     # creates the tables
npm run db:seed        # loads the content
```

**4. Verify.** The check suite is driver-agnostic and will run against
Postgres unchanged:

```bash
npm run check:all
```

#### Moving existing content

`db push` creates empty tables. To carry your current content across, dump the
SQLite rows and re-seed. The seed files hold the same content, so on a fresh
database `npm run db:seed` is usually enough. If you have edited content in the
admin since the last seed, export the tables you care about first:

```bash
sqlite3 dev.db ".dump Tour Place Review HeroSlide Setting Message AdminUser" > content.sql
```

Review `content.sql` before applying it to Postgres — the DDL statements are
SQLite syntax and must be discarded; only the `INSERT` rows transfer cleanly.

#### Notes specific to Postgres

- **Case sensitivity.** Postgres folds unquoted identifiers to lowercase, and
  the schema uses `@map`-free CamelCase model names. Prisma handles the mapping,
  but hand-written SQL in a console must quote names: `"Tour"` not `Tour`.
- **Sorting.** `ORDER BY` on text is collation-dependent and differs from
  SQLite's binary order. Russian titles will sort correctly, but if you rely on
  alphabetical ordering anywhere, add `COLLATE "C"` for exact byte order.
- **Connection limit.** Serverless platforms open many short-lived connections.
  Neon and Supabase pool for you; if you self-host, put PgBouncer in front.

## Uploads are not in `public/`

Images uploaded through the admin are written to `uploads/` at the project
root and served by `src/app/media/uploads/[name]/route.ts`.

This is deliberate: Next.js snapshots `public/` at build time, so a file added
to it after the build 404s in production until the app is rebuilt. Serving from
a route handler means an upload is live immediately.

**On a serverless platform, `uploads/` is ephemeral** — the same problem as
SQLite. Move the folder to object storage (S3, Cloudflare R2, Vercel Blob) and
have the route handler read from there instead. The admin UI does not change.

## Environment variables

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | `file:./dev.db` or `postgresql://…` |
| `AUTH_SECRET` | Signs the admin session cookie. Anyone holding it can mint an admin session. Rotate if exposed. |
| `ADMIN_PASSWORD` | Only read by `npm run db:seed`. Change it and re-seed. |
| `NEXT_PUBLIC_SITE_URL` | Must be `https://` in production — used for canonical URLs, the sitemap and schema.org. |

See `.env.example`.

## The admin panel

- Session cookies are `httpOnly`, `sameSite=lax`, and `secure` in production.
- Deleting anything requires typing the item's name, and the server action
  re-checks it — a guard that lived only in the browser would not survive a
  direct POST.
- `npm run check:admin-e2e` signs in and exercises the panel end to end.

## After deploying

```bash
curl -I https://evetour.az
curl -s https://evetour.az/sitemap.xml | head
```

Then sign in at `/admin` with the new password, and confirm a contact-form
submission arrives — that is the one write path the automated checks cannot
verify for you.
