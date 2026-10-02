import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const COOKIE = 'eve_admin_session'
const MAX_AGE = 60 * 60 * 8 // 8 hours

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET
  if (!value) {
    throw new Error('AUTH_SECRET is not set — add it to .env before using /admin')
  }
  return new TextEncoder().encode(value)
}

export type AdminSession = { email: string; name: string | null }

/** Issues a signed session token after verifying the credentials. */
export async function login(
  email: string,
  password: string,
): Promise<AdminSession | null> {
  const user = await prisma.adminUser.findUnique({
    where: { email: email.trim().toLowerCase() },
  })
  // Always run a compare so a missing user and a wrong password take the
  // same time, and never reveal which one it was.
  const hash = user?.passwordHash ?? '$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv'
  const ok = await bcrypt.compare(password, hash)
  if (!user || !ok) return null

  const session: AdminSession = { email: user.email, name: user.name }
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret())

  const jar = await cookies()
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  })
  return session
}

export async function logout() {
  const jar = await cookies()
  jar.delete(COOKIE)
}

/** Returns the session, or null. Never throws. */
export async function getSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret())
    if (typeof payload.email !== 'string') return null
    return { email: payload.email, name: (payload.name as string) ?? null }
  } catch {
    return null
  }
}

/** Server-action guard: bounces to the login page when signed out. */
export async function requireSession(): Promise<AdminSession> {
  const session = await getSession()
  if (!session) redirect('/admin/login')
  return session
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10)
}