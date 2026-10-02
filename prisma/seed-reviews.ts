/**
 * Writes the reviews from prisma/reviews-data.ts into the database.
 * Safe to re-run: it clears existing reviews and re-inserts them.
 *
 * Run:  npx tsx prisma/seed-reviews.ts
 */
import 'dotenv/config'
import path from 'node:path'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma/client'
import { REVIEWS } from './reviews-data'

const url = process.env.DATABASE_URL ?? 'file:./dev.db'
const file = url.replace('file:', '')
const dbPath =
  file.startsWith('/') || /^[A-Za-z]:/.test(file)
    ? file
    : path.join(process.cwd(), file)

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: dbPath }),
})

async function main() {
  if (REVIEWS.length === 0) {
    console.log('No reviews to insert.')
    console.log('Add them to prisma/reviews-data.ts, then run this again.')
    return
  }

  await prisma.review.deleteMany()

  for (const [i, r] of REVIEWS.entries()) {
    await prisma.review.create({
      data: {
        author: r.author,
        country: r.country ?? null,
        rating: Math.min(5, Math.max(1, r.rating)),
        text: JSON.stringify({ en: r.en, ru: r.ru }),
        tourTitle: JSON.stringify({ en: r.tourEn, ru: r.tourRu }),
        // `image` is left null on purpose. The screenshots in
        // source-assets/ are the source the wording came from, not site
        // content — rendering them in the public carousel looks bad.
        // If the client later supplies a real guest photo, an admin can set
        // the image field on the review form.
        image: null,
        isApproved: true,
        isPublished: true,
        sortOrder: i,
      },
    })
  }

  console.log(`Inserted ${REVIEWS.length} reviews.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
