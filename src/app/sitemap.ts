import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { routing } from '@/i18n/routing'
import { SITE_URL } from '@/lib/site'

/**
 * Every public URL, for both locales.
 *
 * next-intl prefixes each path with the locale (`localePrefix: 'always'`), so a
 * tour is reachable at /en/tours/<slug> and /ru/tours/<slug>. Both are listed:
 * search engines need to see the hreflang pairs, and the layout already emits
 * the matching `alternates.languages` tags.
 *
 * Only published rows appear. An unpublished tour is a draft — indexing it
 * would leak work that is not ready, and a slug that 404s in production costs
 * crawl budget.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/+$/, '')

  const [tours, places] = await Promise.all([
    prisma.tour.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.place.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  /** Static pages, relative to a locale. Home is the most linked, so it wins. */
  const staticPages = [
    { path: '', priority: 1, changeFrequency: 'weekly' as const },
    { path: '/tours', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/places', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/gallery', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/reviews', priority: 0.6, changeFrequency: 'weekly' as const },
    { path: '/contact', priority: 0.7, changeFrequency: 'yearly' as const },
  ]

  const entries: MetadataRoute.Sitemap = []

  for (const locale of routing.locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${base}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${base}/${l}${page.path}`]),
          ),
        },
      })
    }

    for (const tour of tours) {
      const path = `/tours/${tour.slug}`
      entries.push({
        url: `${base}/${locale}${path}`,
        lastModified: tour.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${base}/${l}${path}`]),
          ),
        },
      })
    }

    for (const place of places) {
      const path = `/places/${place.slug}`
      entries.push({
        url: `${base}/${locale}${path}`,
        lastModified: place.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${base}/${l}${path}`]),
          ),
        },
      })
    }
  }

  return entries
}
