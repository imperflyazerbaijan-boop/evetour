/**
 * Quick check that the seeded admin user can actually authenticate.
 * Run: npx tsx scripts/check-admin.ts
 */
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma/client'

const url = process.env.DATABASE_URL ?? 'file:./dev.db'
const file = url.startsWith('file:') ? url.slice(5) : url
const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: file }),
})

async function main() {
  // No default: a fallback here would make this check pass against a password
  // nobody chose deliberately.
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    console.log('ADMIN_PASSWORD is not set — cannot verify the admin login.')
    process.exit(1)
  }
  const user = await prisma.adminUser.findUnique({
    where: { email: 'admin@evetour.az' },
  })

  if (!user) {
    console.log('NO USER — run: npm run db:seed')
    return
  }

  const ok = await bcrypt.compare(expected, user.passwordHash)
  const bad = await bcrypt.compare('wrong-password', user.passwordHash)
  console.log(`user: ${user.email}`)
  console.log(`correct password accepted: ${ok}`)
  console.log(`wrong password rejected:   ${!bad}`)

  const [reviews, liveReviews, tours, places, slides] = await Promise.all([
    prisma.review.count(),
    prisma.review.count({ where: { isPublished: true, isApproved: true } }),
    prisma.tour.count(),
    prisma.place.count(),
    prisma.heroSlide.count(),
  ])
  console.log(
    `\ncontent: ${tours} tours, ${places} places, ${slides} slides, ` +
      `${reviews} reviews (${liveReviews} live)`,
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())