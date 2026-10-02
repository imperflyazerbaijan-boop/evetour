import { prisma } from '@/lib/prisma'
import { cache } from 'react'

/**
 * Data access layer. Everything is wrapped so pages can call it directly
 * and stay statically renderable (no dynamic APIs, no cookies).
 */

export const getPublishedTours = cache(async () => {
  return prisma.tour.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })
})

export const getFeaturedTours = cache(async (limit = 6) => {
  return prisma.tour.findMany({
    where: { isPublished: true, isFeatured: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: limit,
  })
})

export const getToursByCategory = cache(async (category: string) => {
  return prisma.tour.findMany({
    where: { isPublished: true, category },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })
})

export const getTourBySlug = cache(async (slug: string) => {
  return prisma.tour.findFirst({ where: { slug, isPublished: true } })
})

export const getRelatedTours = cache(async (category: string, excludeId: string) => {
  return prisma.tour.findMany({
    where: { isPublished: true, category, id: { not: excludeId } },
    orderBy: { sortOrder: 'asc' },
    take: 3,
  })
})

export const getAllTourSlugs = cache(async () => {
  return prisma.tour.findMany({
    where: { isPublished: true },
    select: { slug: true },
  })
})

export const getPlaces = cache(async (limit?: number) => {
  return prisma.place.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    ...(limit ? { take: limit } : {}),
  })
})

export const getPlaceBySlug = cache(async (slug: string) => {
  return prisma.place.findFirst({ where: { slug, isPublished: true } })
})

export const getPublishedSlides = cache(async () => {
  return prisma.heroSlide.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: 'asc' },
  })
})

export const getPublishedReviews = cache(async (limit?: number) => {
  return prisma.review.findMany({
    where: { isPublished: true, isApproved: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    ...(limit ? { take: limit } : {}),
  })
})

export const getSetting = cache(async (key: string) => {
  const row = await prisma.setting.findUnique({ where: { key } })
  if (!row) return null
  try {
    return JSON.parse(row.value) as Record<string, string>
  } catch {
    return null
  }
})
