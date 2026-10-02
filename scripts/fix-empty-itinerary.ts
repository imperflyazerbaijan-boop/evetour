/**
 * Fills an itinerary stop whose title and description are both blank.
 *
 * An incomplete stop renders as an empty card on the tour page, and the
 * bilingual lint flags it. This writes the missing text for the known seed
 * rows and leaves every other tour untouched.
 *
 * Run:  npx tsx scripts/fix-empty-itinerary.ts
 */
import 'dotenv/config'
import path from 'node:path'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma/client'
import { parseItinerary } from '../src/lib/i18n-fields'

const dbUrl = process.env.DATABASE_URL ?? 'file:./dev.db'
const dbFile = dbUrl.startsWith('file:') ? dbUrl.slice(5) : dbUrl
const dbPath = /^[A-Za-z]:/.test(dbFile) ? dbFile : path.join(process.cwd(), dbFile)
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: dbPath }) })

/** Slug → replacement text, keyed by the stop's index in the array. */
const FILL: Record<
  string,
  Record<number, { title: [string, string]; desc: [string, string] }>
> = {
  'baku-classic': {
    1: {
      title: [
        'Highland Park & Flame Towers',
        'Парк и Пламенные башни',
      ],
      desc: [
        'The classic viewpoint over the bay, then the towers at night.',
        'Классический вид на залив, затем вечером башни.',
      ],
    },
  },
}

async function main() {
  let fixed = 0

  for (const [slug, replacements] of Object.entries(FILL)) {
    const tour = await prisma.tour.findUnique({ where: { slug } })
    if (!tour) {
      console.log(`${slug}: not found`)
      continue
    }
    const stops = parseItinerary(tour.itinerary)
    // A stop is incomplete when either half of a field is missing, not just
    // when everything is blank.
    const blank = stops.findIndex(
      (s) => !s.title?.en || !s.title?.ru || !s.desc?.en || !s.desc?.ru,
    )
    if (blank < 0) {
      console.log(`${slug}: nothing blank`)
      continue
    }

    const patch = replacements[blank]
    if (!patch) {
      console.log(`${slug}: no replacement text for stop ${blank}`)
      continue
    }

    // Write nested objects, the shape the admin form now produces.
    const rebuilt = stops.map((stop, i) =>
      i === blank
        ? {
            ...stop,
            title: { en: patch.title[0], ru: patch.title[1] },
            desc: { en: patch.desc[0], ru: patch.desc[1] },
          }
        : stop,
    )
    await prisma.tour.update({
      where: { slug },
      data: { itinerary: JSON.stringify(rebuilt) },
    })
    console.log(`${slug}: filled stop ${blank} — "${patch.title[0]}"`)
    fixed++
  }

  console.log(`\n${fixed} tour(s) fixed.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())