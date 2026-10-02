/**
 * Verifies the poster-derived tour content landed in the database, and that
 * every ICU message in both locales actually parses with a sample value set.
 * Double-brace placeholders (`{{km}}`) parse as errors in ICU, which would
 * otherwise only surface as a build-time exception.
 */
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { IntlMessageFormat } from 'intl-messageformat'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma/client'
import { repairMojibake } from '../src/lib/mojibake'

const dbUrl = process.env.DATABASE_URL ?? 'file:./dev.db'
const dbFile = dbUrl.startsWith('file:') ? dbUrl.slice('file:'.length) : dbUrl
const dbPath =
  dbFile.startsWith('/') || /^[A-Za-z]:/.test(dbFile)
    ? dbFile
    : path.join(process.cwd(), dbFile)

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: dbPath }) })
const PUBLIC = path.join(process.cwd(), 'public')

let failed = 0
const check = (label: string, ok: boolean, detail = '') => {
  if (!ok) failed++
  console.log(`${ok ? 'PASS ' : 'FAIL '} ${label}${detail ? ` — ${detail}` : ''}`)
}

/** True when the JSON blob carries non-empty text for both locales. */
const bilingual = (raw: string): boolean => {
  try {
    const v = JSON.parse(raw)
    return typeof v?.en === 'string' && v.en.length > 0 &&
           typeof v?.ru === 'string' && v.ru.length > 0
  } catch {
    return false
  }
}

/** True when every element of the JSON array has both locales. */
const bilingualList = (raw: string): boolean => {
  try {
    const arr = JSON.parse(raw)
    return (
      Array.isArray(arr) && arr.length > 0 &&
      arr.every((i) => typeof i?.en === 'string' && i.en.length > 0 &&
                       typeof i?.ru === 'string' && i.ru.length > 0)
    )
  } catch {
    return false
  }
}

/** Sample values so every placeholder in the catalogue gets exercised. */
const SAMPLE: Record<string, string | number> = {
  count: 3,
  km: 40,
  rating: 5,
}

/** Walks the message tree and formats every leaf with SAMPLE values. */
function walkMessages(node: unknown, trail: string[], out: string[]) {
  if (typeof node === 'string') {
    try {
      new IntlMessageFormat(node).format(SAMPLE)
    } catch (e) {
      out.push(`${trail.join('.')}: ${(e as Error).message} — ${JSON.stringify(node)}`)
    }
    return
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) walkMessages(v, [...trail, k], out)
  }
}

async function main() {
  for (const locale of ['en', 'ru']) {
    const messages = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'src', 'messages', `${locale}.json`), 'utf8'),
    )
    const broken: string[] = []
    walkMessages(messages, [], broken)
    check(`${locale}: all ICU messages parse`, broken.length === 0, broken.join(' | '))
  }

  const tours = await prisma.tour.findMany({ orderBy: { sortOrder: 'asc' } })
  console.log(`\nVerifying ${tours.length} tours\n`)

  for (const tour of tours) {
    const label = tour.slug.padEnd(26)
    check(`${label} title bilingual`, bilingual(tour.title))
    check(`${label} description bilingual`, bilingual(tour.description))
    check(`${label} highlights bilingual`, bilingualList(tour.highlights))
    check(`${label} includes bilingual`, bilingualList(tour.includes))

    const images: string[] = JSON.parse(tour.images)
    const iti: { image?: string }[] = JSON.parse(tour.itinerary)
    const paths = [tour.coverImage, ...images, ...iti.map((i) => i.image ?? '')]
    const missing = paths.filter(
      (p) => !p || !fs.existsSync(path.join(PUBLIC, p.replace(/^\//, ''))),
    )
    check(`${label} images exist`, missing.length === 0, missing.join(', '))
  }

  // The about-us text from the poster.
  const aboutRow = await prisma.setting.findUnique({ where: { key: 'about' } })
  check('about setting stored', aboutRow !== null)

  // Sweep every public route: no English UI strings may survive on a Russian
  // page. (On an English page those same strings are the expected output.)
  // Screenshots and service posters are source material, not site content.
  // Nothing under /media may point at them.
  const POSTER_NAMES = [
    'baku-city-tour',
    'gabala-tour',
    'qusar-shahdag-tour',
    'sheki-tour',
    'guba-tour',
    'baku-absheron-tour',
    'about-us',
  ]
  const servedFiles = fs.readdirSync(path.join(PUBLIC, 'media'))
  const leakedFiles = servedFiles.filter((f) => POSTER_NAMES.some((n) => f.startsWith(n)))
  check(
    'no posters in public/media',
    leakedFiles.length === 0,
    leakedFiles.join(', '),
  )
  check(
    'no reviews folder in public/media',
    !fs.existsSync(path.join(PUBLIC, 'media', 'reviews')),
  )

  const withImage = await prisma.review.count({ where: { image: { not: null } } })
  check('no review screenshots published', withImage === 0, `${withImage} still set`)

  // The originals must still be on disk, outside public/, for provenance.
  const srcDir = path.join(process.cwd(), 'source-assets', 'review-screenshots')
  check(
    'review screenshots kept as source',
    fs.existsSync(srcDir) && fs.readdirSync(srcDir).filter((f) => f !== 'README.md').length > 0,
  )
  const posterDir = path.join(process.cwd(), 'source-assets', 'service-posters')
  check(
    'service posters kept as source',
    fs.existsSync(posterDir) && fs.readdirSync(posterDir).length > 0,
  )

  // Mojibake in the *source* files is what put broken Russian into the
  // database in the first place: re-seeding from damaged files reintroduces
  // it, so a database-only fix does not hold.
  //
  // The test is whether repairMojibake actually changes the line, not whether
  // it merely contains a Latin-1 character — legitimate text (em dashes, “”,
  // arrows) and the repair code itself both trip a naive character test.
  const damagedSources: string[] = []
  for (const dir of ['prisma', 'src']) {
    const walk = (d: string) => {
      for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, entry.name)
        if (entry.isDirectory()) {
          if (entry.name === 'node_modules' || entry.name === 'generated') continue
          walk(full)
        } else if (/\.(ts|tsx|json)$/.test(entry.name)) {
          // The repair module necessarily contains damaged samples.
          if (full.endsWith(path.join('lib', 'mojibake.ts'))) continue
          const hasDamage = fs
            .readFileSync(full, 'utf8')
            .split('\n')
            .some((line) => repairMojibake(line) !== line)
          if (hasDamage) damagedSources.push(path.relative(process.cwd(), full))
        }
      }
    }
    const base = path.join(process.cwd(), dir)
    if (fs.existsSync(base)) walk(base)
  }
  check(
    'no mojibake in source files',
    damagedSources.length === 0,
    damagedSources.join(', '),
  )

  const ROUTES = ['/', '/tours', '/places', '/reviews', '/gallery', '/contact']
  const ENGLISH_LEAKS = [
    'Featured destinations',
    'Change language',
    'data-cursor-label="View"',
    'EVE TOUR home',
  ]
  for (const route of ROUTES) {
    for (const locale of ['en', 'ru']) {
      const res = await fetch(`http://localhost:3000/${locale}${route}`)
      const html = await res.text()
      check(`${locale}${route} responds 200`, res.status === 200, `status ${res.status}`)
      if (locale !== 'ru') continue
      const leaks = ENGLISH_LEAKS.filter((s) => html.includes(s))
      check(`${locale}${route} has no English leak`, leaks.length === 0, leaks.join(', '))
    }
  }

  // Settings are free-form JSON and some keys are nested, so the admin
  // editor round-trips them as raw JSON. A flat {en,ru} form would read
  // these as empty and wipe the document on save — check that is impossible.
  const settings = await prisma.setting.findMany({ orderBy: { key: 'asc' } })
  check('settings present', settings.length > 0, `${settings.length} rows`)
  for (const s of settings) {
    let parsed: unknown
    try {
      parsed = JSON.parse(s.value)
      check(`setting "${s.key}" is valid JSON`, true)
    } catch (e) {
      check(`setting "${s.key}" is valid JSON`, false, (e as Error).message)
      continue
    }
    check(
      `setting "${s.key}" is a JSON object`,
      typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed),
    )
  }
  // `about` holds the transcribed About-us text and must keep its fields.
  const about = settings.find((s) => s.key === 'about')
  check('about setting stored', about !== null)
  if (about) {
    const v = JSON.parse(about.value)
    check('about body bilingual', bilingual(JSON.stringify(v.body)))
    check('about author = Emil Valiyev', v.author?.en === 'Emil Valiyev')
  }

  const missingJpeg = fs
    .readdirSync(path.join(PUBLIC, 'media'))
    .filter((f) => f.includes('services'))
  check('no leftover "services (n)" files', missingJpeg.length === 0, missingJpeg.join(', '))

  console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) failed.`)
  if (failed > 0) process.exit(1)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
