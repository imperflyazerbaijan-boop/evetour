/**
 * Restores the tour row the E2E itinerary test overwrites.
 *
 * The test posts a partial form on purpose, which zeroes the fields it does not
 * include. This copies those columns back from the newest backup so a test run
 * never leaves the development database damaged.
 *
 * Run:  npx tsx scripts/restore-tour-row.ts <backup-file>
 */
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma/client'

const dbUrl = process.env.DATABASE_URL ?? 'file:./dev.db'
const dbFile = dbUrl.startsWith('file:') ? dbUrl.slice(5) : dbUrl
const dbPath = /^[A-Za-z]:/.test(dbFile) ? dbFile : path.join(process.cwd(), dbFile)
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: dbPath }) })

const TARGET = 'baku-classic'

async function main() {
  const backupArg = process.argv[2]
  const dir = path.dirname(dbPath)
  const backups = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(path.basename(dbPath) + '.pre-mojibake-') && f.endsWith('.bak'))
    .sort()
  if (backups.length === 0) {
    console.log('No backup found — nothing to restore.')
    return
  }
  const backupName = backupArg ?? backups[backups.length - 1]
  const backupPath = path.join(dir, backupName)
  const backup = new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: backupPath }),
  })

  const from = await backup.tour.findUnique({ where: { slug: TARGET } })
  if (!from) {
    console.log(`${TARGET} not in the backup.`)
    return
  }

  // Every column except the identity and the audit timestamps.
  const data = {
    subtitle: from.subtitle,
    excerpt: from.excerpt,
    description: from.description,
    highlights: from.highlights,
    includes: from.includes,
    excludes: from.excludes,
    category: from.category,
    region: from.region,
    duration: from.duration,
    priceFrom: from.priceFrom,
    priceMode: from.priceMode,
    durationDays: from.durationDays,
    coverImage: from.coverImage,
    images: from.images,
    isFeatured: from.isFeatured,
    isPublished: from.isPublished,
    sortOrder: from.sortOrder,
  }

  await prisma.tour.update({ where: { slug: TARGET }, data })
  console.log(`Restored ${TARGET} from ${backupName}`)

  // Confirm the content is whole again.
  const check = await prisma.tour.findUnique({ where: { slug: TARGET } })
  const ok = (v: string) => {
    try {
      const p = JSON.parse(v)
      return typeof p?.en === 'string' && p.en.length > 0
    } catch {
      return false
    }
  }
  console.log(
    `description ${ok(check!.description) ? 'ok' : 'EMPTY'}, ` +
      `highlights ${JSON.parse(check!.highlights).length} item(s), ` +
      `includes ${JSON.parse(check!.includes).length} item(s)`,
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())