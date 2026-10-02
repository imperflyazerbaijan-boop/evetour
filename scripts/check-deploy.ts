/**
 * Deployment readiness check.
 *
 * Catches the failure modes that are invisible in development but would expose
 * the whole admin panel in production: a development AUTH_SECRET, the default
 * password, an http:// site URL, or a missing uploads directory.
 *
 * Run:  npx tsx scripts/check-deploy.ts
 */
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma/client'

const dbUrl = process.env.DATABASE_URL ?? 'file:./dev.db'
const dbFile = dbUrl.startsWith('file:') ? dbUrl.slice('file:'.length) : dbUrl
const dbPath =
  dbFile.startsWith('/') || /^[A-Za-z]:/.test(dbFile)
    ? dbFile
    : path.join(process.cwd(), dbFile)

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: dbPath }) })

let failed = 0
let warned = 0
const fail = (label: string, detail = '') => {
  failed++
  console.log(`FAIL  ${label}${detail ? ` — ${detail}` : ''}`)
}
const pass = (label: string) => console.log(`PASS  ${label}`)
const warn = (label: string, detail = '') => {
  warned++
  console.log(`WARN  ${label}${detail ? ` — ${detail}` : ''}`)
}

/** Values that ship in the repository and must never reach production. */
const KNOWN_BAD_SECRETS = ['dev-secret-change-me', 'change-me', 'eve-tour-dev']

/**
 * The seeded password — also what `prisma/seed.ts` falls back to, so an
 * operator who never set ADMIN_PASSWORD ends up with it.
 */
const DEFAULT_PASSWORD = 'eve-tour-2026'

/** Judges a secret without ever printing it. */
function secretProblems(value: string) {
  const problems: string[] = []
  if (value.length < 32) problems.push('shorter than 32 characters')
  if (KNOWN_BAD_SECRETS.some((bad) => value.toLowerCase().includes(bad))) {
    problems.push('matches a known placeholder value')
  }
  if (/^[a-z]+$/.test(value)) problems.push('lowercase letters only')
  return problems
}

async function main() {
  console.log('Deployment readiness\n')

  // --- Secrets ---------------------------------------------------------
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    fail('AUTH_SECRET is set', 'not found in the environment')
  } else {
    const problems = secretProblems(secret)
    if (problems.length === 0) pass('AUTH_SECRET is set and looks strong')
    else fail('AUTH_SECRET is not a development value', problems.join('; '))
  }

  const password = process.env.ADMIN_PASSWORD
  if (!password) {
    fail(
      'ADMIN_PASSWORD is set in the environment',
      'not set — prisma/seed.ts falls back to the default password',
    )
  } else if (password === DEFAULT_PASSWORD) {
    fail('ADMIN_PASSWORD is not the default', `it is still "${DEFAULT_PASSWORD}"`)
  } else {
    pass('ADMIN_PASSWORD is set and is not the default')
  }

  // The database must not still hold the default password, whether or not the
  // env var was set — seeding writes the hash straight to the row.
  const admins = await prisma.adminUser.findMany()
  if (admins.length === 0) {
    fail('an admin account exists')
  } else {
    const bcrypt = (await import('bcryptjs')).default
    for (const admin of admins) {
      const stillDefault = await bcrypt.compare(DEFAULT_PASSWORD, admin.passwordHash)
      if (stillDefault) {
        fail(
          `admin ${admin.email} password was changed`,
          'it still matches the default seeded password',
        )
      } else {
        pass(`admin ${admin.email} password was changed`)
      }
    }
  }

  // --- Site URL --------------------------------------------------------
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  if (!siteUrl) {
    fail('NEXT_PUBLIC_SITE_URL is set', 'not set — falls back to http://localhost:3000')
  } else if (siteUrl.startsWith('http://')) {
    fail('NEXT_PUBLIC_SITE_URL uses https', `"${siteUrl}" — plain http hurts SEO and trust`)
  } else {
    pass(`NEXT_PUBLIC_SITE_URL is https (${new URL(siteUrl).host})`)
  }

  // --- Database --------------------------------------------------------
  if (dbUrl.startsWith('file:')) {
    // SQLite is only safe where the filesystem is persistent and shared by one
    // process. On a serverless platform each instance gets its own ephemeral
    // copy, so writes vanish and uploads vanish with them.
    const serverless =
      Boolean(process.env.VERCEL) ||
      Boolean(process.env.NETLIFY) ||
      Boolean(process.env.CF_PAGES) ||
      Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME)
    if (serverless) {
      fail(
        'DATABASE_URL is not a local file on a serverless host',
        'each instance would get its own throwaway database — ' +
          'set DATABASE_URL to a postgres:// URL before deploying',
      )
    } else {
      warn(
        'DATABASE_URL points at a local SQLite file',
        `${dbFile} — fine on one long-running server, but make sure the file is ` +
          'on a persistent volume and included in your backups',
      )
    }
  } else {
    pass('DATABASE_URL points at a managed database')
  }

  // --- Source assets must stay private ---------------------------------
  const inPublic: string[] = []
  const publicMedia = path.join(process.cwd(), 'public', 'media')
  if (fs.existsSync(publicMedia)) {
    for (const entry of fs.readdirSync(publicMedia, { withFileTypes: true })) {
      if (/poster|service|screenshot|review/i.test(entry.name)) inPublic.push(entry.name)
    }
  }
  if (inPublic.length === 0) pass('no source material under public/media')
  else fail('source material is under public/', inPublic.join(', '))

  // --- Uploads ---------------------------------------------------------
  if (!fs.existsSync(path.join(process.cwd(), 'uploads'))) {
    fail('uploads/ exists', 'create it before deploying or image uploads will fail')
  } else {
    pass('uploads/ exists')
  }

  // --- Content readiness ----------------------------------------------
  const draftTours = await prisma.tour.count({ where: { isPublished: false } })
  const unapproved = await prisma.review.count({ where: { isApproved: false } })
  console.log(
    `\nContent: ${draftTours} unpublished tour(s), ${unapproved} unapproved review(s).`,
  )
  if (draftTours > 0) warn('tours are unpublished', `${draftTours} still draft`)

  console.log(
    failed === 0
      ? `\nReady to deploy${warned > 0 ? ` (${warned} warning(s)).` : '.'}`
      : `\n${failed} blocker(s) before deploying.`,
  )
  if (failed > 0) process.exit(1)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
