/**
 * Repairs the double-encoded Russian stored in the database.
 *
 * The seed data was UTF-8 encoded and then decoded as Windows-1252, so the
 * Russian reads as `Ð¡Ñ‚Ð°Ñ€Ñ‹Ð¹` instead of `Старый`. The damage is exactly
 * reversible — see src/lib/mojibake.ts — but it was never noticed because a
 * build renders mojibake happily.
 *
 * This rewrites the affected columns in place. It backs the database up first
 * and defaults to a dry run, so nothing is changed until you pass --write.
 *
 * Run:  npx tsx scripts/fix-mojibake.ts            # report only
 *       npx tsx scripts/fix-mojibake.ts --write    # apply, after the report
 */
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma/client'
import { repairJson, repairMojibake } from '../src/lib/mojibake'

const dbUrl = process.env.DATABASE_URL ?? 'file:./dev.db'
const dbFile = dbUrl.startsWith('file:') ? dbUrl.slice(5) : dbUrl
const dbPath = /^[A-Za-z]:/.test(dbFile) ? dbFile : path.join(process.cwd(), dbFile)

const WRITE = process.argv.includes('--write')

/** Which columns hold translatable or free text, per model. */
const TARGETS: Record<string, { text: string[]; json: string[] }> = {
  tour: {
    text: ['title', 'subtitle', 'excerpt', 'description', 'duration', 'region', 'category'],
    json: ['highlights', 'includes', 'excludes', 'itinerary', 'images'],
  },
  place: {
    text: ['title', 'description', 'summary', 'bestSeason', 'image', 'slug'],
    json: ['highlights', 'images'],
  },
  review: {
    text: ['author', 'sourceImage'],
    json: ['text', 'tourTitle'],
  },
  heroSlide: {
    text: ['image'],
    json: ['title', 'subtitle'],
  },
  setting: { text: ['key'], json: ['value'] },
}

async function main() {
  if (fs.existsSync(dbPath)) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backup = `${dbPath}.pre-mojibake-${stamp}.bak`
    fs.copyFileSync(dbPath, backup)
    console.log(`Backup: ${path.basename(backup)}\n`)
  }

  const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: dbPath }) })
  let changedRows = 0
  let changedFields = 0

  for (const [model, spec] of Object.entries(TARGETS)) {
    const rows = (await (
      prisma[model as keyof typeof prisma] as {
        findMany: (a?: unknown) => Promise<Record<string, unknown>[]>
        update: (a: unknown) => Promise<unknown>
      }
    ).findMany()) as Record<string, unknown>[]

    let modelChanges = 0

    for (const row of rows) {
      const data: Record<string, unknown> = {}
      for (const field of spec.text) {
        const value = row[field]
        if (typeof value !== 'string') continue
        const fixed = repairMojibake(value)
        if (fixed !== value) {
          data[field] = fixed
          changedFields++
        }
      }
      for (const field of spec.json) {
        const value = row[field]
        if (typeof value !== 'string') continue
        const fixed = repairJson(value)
        if (fixed !== value) {
          data[field] = fixed
          changedFields++
        }
      }
      if (Object.keys(data).length > 0) {
        modelChanges++
        changedRows++
        if (WRITE) {
          await (prisma[model as keyof typeof prisma] as { update: (a: unknown) => Promise<unknown> }).update({
            where: { id: row.id },
            data,
          })
        }
      }
    }
    console.log(`${model}: ${modelChanges} row(s) need repair`)
  }

  console.log(
    `\n${changedRows} row(s), ${changedFields} field(s) ${WRITE ? 'repaired' : 'would be repaired'}.`,
  )
  if (!WRITE && changedRows > 0) {
    console.log('Nothing was changed. Re-run with --write to apply.')
  }
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})