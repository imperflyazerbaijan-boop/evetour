import { PrismaClient } from '@/generated/prisma/client'
import { cache } from 'react'
import { createAdapter } from './db-adapter'

/**
 * Prisma 7 requires a driver adapter; `createAdapter` picks SQLite or Postgres
 * from DATABASE_URL, so this one client serves a local file in development and
 * a managed database in production. It stays synchronous on purpose — see
 * ./db-adapter.ts.
 */
const createClient = () => new PrismaClient({ adapter: createAdapter() })

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createClient>
}

export const prisma = globalForPrisma.prisma ?? createClient()

// Reuse one client across hot reloads, or dev leaks connections.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/** Cached accessor for server components. */
export const getPrisma = cache(() => prisma)

