import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { getSession } from '@/lib/admin-auth'
import AdminShell from './_components/AdminShell'
import '../globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'EVE TOUR — Admin',
  robots: { index: false, follow: false },
}

/**
 * The admin lives outside [locale], so it carries its own root layout.
 * Signed-out visitors still get the shell-less layout; the login page
 * renders on its own.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-ink-950 text-ink-100">
        {session ? (
          <AdminShell email={session.email}>{children}</AdminShell>
        ) : (
          <>{children}</>
        )}
      </body>
    </html>
  )
}