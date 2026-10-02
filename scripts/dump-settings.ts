/**
 * Prints the raw settings rows so the admin settings editor can be checked
 * against what the seed actually wrote. Settings store arbitrary JSON, and a
 * nested shape (as `about` uses) is not what a flat {en,ru} form expects.
 */
import 'dotenv/config'
import path from 'node:path'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma/client'

const url = process.env.DATABASE_URL ?? 'file:./dev.db'
const file = url.replace('file:', '')
const dbPath =
  file.startsWith('/') || /^[A-Za-z]:/.test(file) ? file : path.join(process.cwd(), file)

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: dbPath }) })

async function main() {
  const settings = await prisma.setting.findMany({ orderBy: { key: 'asc' } })
  for (const s of settings) {
    console.log(`\n=== ${s.key} ===`)
    try {
      const parsed = JSON.parse(s.value)
      // Nested documents are expected: the admin settings editor works on raw
      // JSON, so a nested shape is editable and round-trips intact.
      const nested = typeof parsed === 'object' && parsed !== null
      const flat = typeof parsed?.en === 'string' && typeof parsed?.ru === 'string'
      console.log(
        `shape: ${flat ? 'flat {en,ru}' : nested ? 'nested object' : typeof parsed}` +
          ' (editable as raw JSON)',
      )
      console.log(s.value.slice(0, 200))
    } catch {
      console.log('shape: not JSON')
      console.log(s.value.slice(0, 200))
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())