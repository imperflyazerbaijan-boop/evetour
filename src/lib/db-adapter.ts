import path from 'node:path'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

/**
 * Builds a Prisma driver adapter for whichever database DATABASE_URL points at.
 *
 * Prisma 7 has no built-in engine — every connection goes through a driver
 * adapter, so the driver is chosen here rather than in each call site. That
 * single decision point is what lets the same build run on a local SQLite file
 * in development and on Postgres in production.
 *
 * Both adapters are imported statically so this can stay synchronous; a
 * dynamic import() would force every `await prisma.tour…` in the app to become
 * `await (await prisma).tour…`, touching dozens of files for no benefit.
 *
 * @see ./prisma.ts for the shared client.
 */

export type DbDriver = 'sqlite' | 'postgresql'

/** True for a `file:` URL, which is the SQLite form. */
export function isSqliteUrl(url: string): boolean {
  return url.startsWith('file:')
}

export function driverFor(url: string): DbDriver {
  return isSqliteUrl(url) ? 'sqlite' : 'postgresql'
}

/**
 * `prisma db push` creates the SQLite file relative to the project root, so a
 * relative path has to be resolved the same way for the runtime adapter.
 */
export function resolveSqlitePath(url: string): string {
  const file = url.startsWith('file:') ? url.slice('file:'.length) : url
  if (file.startsWith('/') || /^[A-Za-z]:/.test(file)) return file
  return path.join(process.cwd(), file)
}

/**
 * Creates the adapter for the current DATABASE_URL.
 *
 * The return type is deliberately loose: the two adapter classes have different
 * shapes, and a union would only force a cast at the one call site that needs it.
 */
export function createAdapter(url = process.env.DATABASE_URL ?? 'file:./dev.db') {
  if (isSqliteUrl(url)) {
    return new PrismaBetterSqlite3({ url: resolveSqlitePath(url) })
  }
  // PrismaPg takes the pool (or a config, or a connection string) directly.
  // The pool is owned by this adapter, so Prisma closes it on shutdown.
  return new PrismaPg(new Pool({ connectionString: url }))
}
