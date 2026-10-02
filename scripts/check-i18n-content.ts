/**
 * Bilingual content lint.
 *
 * The site is EN + RU, and seeded translations are easy to get subtly wrong in
 * ways a build will not catch: a Russian field left in English, a placeholder
 * that exists in one locale but not the other, a field copied verbatim into
 * both. This reports every case so a human can fix the list.
 *
 * Run:  npx tsx scripts/check-i18n-content.ts
 */
import 'dotenv/config'
import path from 'node:path'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma/client'
import { parseItinerary } from '../src/lib/i18n-fields'

const dbUrl = process.env.DATABASE_URL ?? 'file:./dev.db'
const dbFile = dbUrl.startsWith('file:') ? dbUrl.slice('file:'.length) : dbUrl
const dbPath =
  dbFile.startsWith('/') || /^[A-Za-z]:/.test(dbFile)
    ? dbFile
    : path.join(process.cwd(), dbFile)

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: dbPath }) })

const CYRILLIC = /[Ѐ-ӿ]/
const LATIN = /[A-Za-z]/

/** Words that legitimately appear in Latin script inside Russian text. */
const ALLOWED_IN_RU = new Set([
  'whatsapp', 'telegram', 'instagram', 'facebook', 'youtube', 'viber',
  'email', 'wifi', 'gps', 'jet', 'dubai', 'shopping', 'transfer', 'check',
  'in', 'out', 'and', 'from', 'the', 'vip', 'city', 'tour', 'day', 'night',
])

/** Proper nouns that stay in Latin script in the Russian copy. */
const PROPER_NOUNS = new Set([
  'azerbaijan', 'baku', 'absheron', 'gobustan', 'quba', 'sheki', 'shaki',
  'euro', 'azn', 'eur', 'usd', 'hiking', 'paragliding', 'flame', 'towers',
  'caspian', 'shahdag', 'shirvanshahs', 'mystique', 'romantic', 'old',
  'new', 'highland', 'mountains', 'road', 'palace', 'tour',
])

type Issue = { where: string; kind: string; detail: string }

const issues: Issue[] = []
const add = (where: string, kind: string, detail: string) =>
  issues.push({ where, kind, detail })

/** Reads a {en,ru} blob, or null when it is not one. */
function pair(raw: string): { en: string; ru: string } | null {
  try {
    const v = JSON.parse(raw)
    if (typeof v?.en === 'string' && typeof v?.ru === 'string') {
      return { en: v.en, ru: v.ru }
    }
  } catch {
    /* reported by the caller */
  }
  return null
}

/** Reads a [{en,ru}] blob. */
function pairs(raw: string): { en: string; ru: string }[] {
  try {
    const v = JSON.parse(raw)
    if (Array.isArray(v)) return v
  } catch {
    /* reported by the caller */
  }
  return []
}

/** ICU-ish placeholders: {name} or {name, plural, …}. */
const placeholders = (s: string) =>
  [...s.matchAll(/\{\s*([a-zA-Z0-9_]+)/g)].map((m) => m[1]).sort()

const words = (s: string) => s.toLowerCase().match(/[a-z]+/g) ?? []

/** True when the Russian text is actually still English. */
function untranslated(en: string, ru: string): boolean {
  if (ru.trim() === en.trim() && en.trim().length > 0) return true
  if (!CYRILLIC.test(ru)) {
    const meaningful = words(ru).filter(
      (w) => w.length > 2 && !ALLOWED_IN_RU.has(w) && !PROPER_NOUNS.has(w),
    )
    if (meaningful.length > 0) return true
  }
  return false
}

/** Applies every rule to one EN/RU pair. */
function lintPair(where: string, en: string, ru: string) {
  if (!en.trim()) add(where, 'empty-en', 'English is blank')
  if (!ru.trim()) {
    add(where, 'empty-ru', 'Russian is blank')
    return
  }
  if (untranslated(en, ru)) add(where, 'untranslated', `"${ru.slice(0, 48)}"`)

  // Placeholders must match, or a formatted value silently disappears.
  const pe = placeholders(en)
  const pr = placeholders(ru)
  if (pe.join(',') !== pr.join(',')) {
    add(where, 'placeholder-mismatch', `en [${pe}] vs ru [${pr}]`)
  }

  if (ru.length > 25 && !CYRILLIC.test(ru) && LATIN.test(ru)) {
    add(where, 'no-cyrillic', `"${ru.slice(0, 48)}"`)
  }
}

async function main() {
  const tours = await prisma.tour.findMany({ orderBy: { sortOrder: 'asc' } })
  for (const tour of tours) {
    const base = `tour ${tour.slug}`
    for (const field of ['title', 'subtitle', 'excerpt', 'description'] as const) {
      const p = pair(tour[field])
      if (!p) {
        add(`${base}.${field}`, 'not-a-pair', 'not an {en,ru} object')
        continue
      }
      lintPair(`${base}.${field}`, p.en, p.ru)
    }

    for (const field of ['highlights', 'includes', 'excludes'] as const) {
      pairs(tour[field]).forEach((item, i) => {
        if (typeof item?.en !== 'string' || typeof item?.ru !== 'string') {
          add(`${base}.${field}[${i}]`, 'not-a-pair', 'missing en or ru')
          return
        }
        lintPair(`${base}.${field}[${i}]`, item.en, item.ru)
      })
    }

    // Itinerary is optional, but every stop that exists must be bilingual.
    // parseItinerary normalises the two stored shapes (see i18n-fields.ts).
    parseItinerary(tour.itinerary).forEach((stop, i) => {
      lintPair(`${base}.itinerary[${i}].title`, stop.title?.en ?? '', stop.title?.ru ?? '')
      lintPair(`${base}.itinerary[${i}].desc`, stop.desc?.en ?? '', stop.desc?.ru ?? '')
    })
  }

  const reviews = await prisma.review.findMany()
  reviews.forEach((review, i) => {
    const base = `review[${i}] ${review.author}`
    for (const field of ['text', 'tourTitle'] as const) {
      const p = pair(review[field])
      if (!p) {
        add(`${base}.${field}`, 'not-a-pair', 'not an {en,ru} object')
        continue
      }
      lintPair(`${base}.${field}`, p.en, p.ru)
    }
  })

  const places = await prisma.place.findMany({ orderBy: { sortOrder: 'asc' } })
  for (const place of places) {
    // Place has `summary` rather than `excerpt`.
    for (const field of ['title', 'description', 'summary'] as const) {
      const p = pair(place[field])
      if (!p) {
        add(`place ${place.slug}.${field}`, 'not-a-pair', 'not an {en,ru} object')
        continue
      }
      lintPair(`place ${place.slug}.${field}`, p.en, p.ru)
    }
    pairs(place.highlights).forEach((item, i) => {
      if (typeof item?.en !== 'string' || typeof item?.ru !== 'string') {
        add(`place ${place.slug}.highlights[${i}]`, 'not-a-pair', 'missing en or ru')
        return
      }
      lintPair(`place ${place.slug}.highlights[${i}]`, item.en, item.ru)
    })
  }

  // --- Report ----------------------------------------------------------
  console.log(
    `Checked ${tours.length} tours, ${places.length} places, ${reviews.length} reviews.\n`,
  )

  if (issues.length === 0) {
    console.log('No translation issues found.')
    return
  }

  const byKind = new Map<string, Issue[]>()
  for (const issue of issues) {
    const list = byKind.get(issue.kind) ?? []
    list.push(issue)
    byKind.set(issue.kind, list)
  }

  for (const [kind, list] of [...byKind].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n${kind} (${list.length})`)
    for (const issue of list) console.log(`  ${issue.where} — ${issue.detail}`)
  }

  // `untranslated` and `placeholder-mismatch` are real defects; the rest are
  // prompts for a human read-through.
  const blocking = issues.filter(
    (i) =>
      i.kind === 'untranslated' ||
      i.kind === 'placeholder-mismatch' ||
      i.kind === 'not-a-pair',
  )
  console.log(
    `\n${issues.length} issue(s), ${blocking.length} of which need a fix before publishing.`,
  )
  if (blocking.length > 0) process.exit(1)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
