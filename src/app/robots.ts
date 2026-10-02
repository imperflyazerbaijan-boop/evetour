import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

/**
 * robots.txt
 *
 * `/admin` is disallowed because it is a private panel — there is nothing in it
 * for a crawler and the login page should stay out of the index. `/api` is
 * disallowed because it only answers POST; crawling it produces nothing but
 * errors.
 *
 * The sitemap is emitted from SITE_URL so it can never drift from the canonical
 * URLs in the metadata.
 */
export default function robots(): MetadataRoute.Robots {
  const base = SITE_URL.replace(/\/+$/, '')

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
