import createProxy from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createProxy(routing)

export const config = {
  // Skip API routes, admin, uploads and any path containing a dot
  matcher: '/((?!api|admin|uploads|_next|_vercel|.*\\..*).*)',
}
