'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/admin-auth'
import { TOUR_CATEGORIES } from '@/lib/site'
import { toBool, toIntOrNull, toStr } from './_lib/form-helpers'
import {
  i18n,
  i18nList,
  plainList,
  revalidateSite,
  slugify,
} from './_lib/form-helpers'

const CATEGORY_KEYS = TOUR_CATEGORIES.map((c) => c.key)

/* ------------------------------------------------------------------ */
/* Tours                                                               */
/* ------------------------------------------------------------------ */

/**
 * Builds the itinerary JSON from repeating field groups.
 *
 * The form posts indexed names — `itDay0`, `itTitleEn0`, `itDescRu0`,
 * `itImage0` — and this pairs them back into the stored
 * [{day, title:{en,ru}, desc:{en,ru}, image}] shape. A row with no title or
 * description in either language is dropped rather than saved blank.
 *
 * title/desc are written as nested objects, matching what parseItinerary
 * expects on the way back in; the older seeded data stored them as JSON
 * strings, and parseItinerary still reads that shape.
 */
function itineraryFromForm(fd: FormData) {
  const rows: {
    day?: string
    title: { en: string; ru: string }
    desc: { en: string; ru: string }
    image?: string
  }[] = []

  for (const key of fd.keys()) {
    const m = /^itTitleEn(\d+)$/.exec(key)
    if (!m) continue
    const i = m[1]
    const title = {
      en: toStr(fd.get(`itTitleEn${i}`)),
      ru: toStr(fd.get(`itTitleRu${i}`)),
    }
    const desc = {
      en: toStr(fd.get(`itDescEn${i}`)),
      ru: toStr(fd.get(`itDescRu${i}`)),
    }
    if (!title.en && !title.ru && !desc.en && !desc.ru) continue
    rows[Number(i)] = {
      day: toStr(fd.get(`itDay${i}`)) || undefined,
      title,
      desc,
      image: toStr(fd.get(`itImage${i}`)) || undefined,
    }
  }

  return JSON.stringify(rows.filter(Boolean))
}

function tourData(fd: FormData) {
  const category = toStr(fd.get('category'))
  return {
    slug: toStr(fd.get('slug')) || slugify(toStr(fd.get('titleEn'))),
    title: i18n(fd, 'title'),
    subtitle: i18n(fd, 'subtitle'),
    excerpt: i18n(fd, 'excerpt'),
    description: i18n(fd, 'description'),
    highlights: i18nList(fd, 'highlights'),
    includes: i18nList(fd, 'includes'),
    excludes: i18nList(fd, 'excludes'),
    itinerary: itineraryFromForm(fd),
    category: CATEGORY_KEYS.includes(category as never) ? category : 'packages',
    region: toStr(fd.get('region')),
    duration: toStr(fd.get('duration')),
    priceFrom: toIntOrNull(fd.get('priceFrom')),
    priceMode: toStr(fd.get('priceMode')) === 'request' ? 'request' : 'from',
    durationDays: toIntOrNull(fd.get('durationDays')),
    coverImage: toStr(fd.get('coverImage')),
    images: plainList(fd, 'images'),
    isFeatured: toBool(fd.get('isFeatured')),
    isPublished: toBool(fd.get('isPublished')),
    sortOrder: toIntOrNull(fd.get('sortOrder')) ?? 0,
  }
}

export async function saveTourAction(formData: FormData) {
  await requireSession()
  const id = toStr(formData.get('id'))
  const data = tourData(formData)
  if (!data.slug) throw new Error('A slug is required.')

  if (id) {
    await prisma.tour.update({ where: { id }, data })
  } else {
    const clash = await prisma.tour.findUnique({ where: { slug: data.slug } })
    if (clash) throw new Error(`The slug "${data.slug}" is already taken.`)
    await prisma.tour.create({ data })
  }

  revalidateSite()
  redirect('/admin/tours?saved=1')
}

/**
 * Deletions require the operator to type the item's slug (the UI calls this
 * `confirm`), and the action re-checks it. A guard that lived only in the
 * browser would not survive a direct POST.
 */
function requireConfirmation(formData: FormData, expected: string) {
  if (toStr(formData.get('confirm')) !== expected) {
    throw new Error('Confirmation did not match — nothing was deleted.')
  }
}

export async function deleteTourAction(formData: FormData) {
  await requireSession()
  const id = toStr(formData.get('id'))
  const tour = await prisma.tour.findUnique({ where: { id } })
  if (!tour) return
  requireConfirmation(formData, tour.slug)
  await prisma.tour.delete({ where: { id } })
  revalidateSite()
  redirect('/admin/tours?deleted=1')
}

export async function toggleTourAction(formData: FormData) {
  await requireSession()
  const id = toStr(formData.get('id'))
  const tour = await prisma.tour.findUnique({ where: { id } })
  if (!tour) return
  await prisma.tour.update({
    where: { id },
    data: { isPublished: !tour.isPublished },
  })
  revalidateSite()
}

/* ------------------------------------------------------------------ */
/* Places                                                              */
/* ------------------------------------------------------------------ */

function placeData(fd: FormData) {
  return {
    slug: toStr(fd.get('slug')) || slugify(toStr(fd.get('titleEn'))),
    title: i18n(fd, 'title'),
    summary: i18n(fd, 'summary'),
    description: i18n(fd, 'description'),
    image: toStr(fd.get('image')),
    images: plainList(fd, 'images'),
    highlights: i18nList(fd, 'highlights'),
    coordinates: toStr(fd.get('coordinates')) || null,
    distanceKm: toIntOrNull(fd.get('distanceKm')),
    bestSeason: i18n(fd, 'bestSeason'),
    isPublished: toBool(fd.get('isPublished')),
    sortOrder: toIntOrNull(fd.get('sortOrder')) ?? 0,
  }
}

export async function savePlaceAction(formData: FormData) {
  await requireSession()
  const id = toStr(formData.get('id'))
  const data = placeData(formData)
  if (!data.slug) throw new Error('A slug is required.')

  if (id) {
    await prisma.place.update({ where: { id }, data })
  } else {
    const clash = await prisma.place.findUnique({ where: { slug: data.slug } })
    if (clash) throw new Error(`The slug "${data.slug}" is already taken.`)
    await prisma.place.create({ data })
  }

  revalidateSite()
  redirect('/admin/places?saved=1')
}

export async function deletePlaceAction(formData: FormData) {
  await requireSession()
  const id = toStr(formData.get('id'))
  const place = await prisma.place.findUnique({ where: { id } })
  if (!place) return
  requireConfirmation(formData, place.slug)
  await prisma.place.delete({ where: { id } })
  revalidateSite()
  redirect('/admin/places?deleted=1')
}

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

export async function saveReviewAction(formData: FormData) {
  await requireSession()
  const id = toStr(formData.get('id'))
  const rating = toIntOrNull(formData.get('rating')) ?? 5
  const data = {
    author: toStr(formData.get('author')) || 'Guest',
    country: toStr(formData.get('country')) || null,
    rating: Math.min(5, Math.max(1, rating)),
    text: i18n(formData, 'text'),
    tourTitle: i18n(formData, 'tourTitle'),
    image: toStr(formData.get('image')) || null,
    isApproved: toBool(formData.get('isApproved')),
    isPublished: toBool(formData.get('isPublished')),
    sortOrder: toIntOrNull(formData.get('sortOrder')) ?? 0,
  }

  if (id) {
    await prisma.review.update({ where: { id }, data })
  } else {
    await prisma.review.create({ data })
  }

  revalidateSite()
  redirect('/admin/reviews?saved=1')
}

export async function deleteReviewAction(formData: FormData) {
  await requireSession()
  const id = toStr(formData.get('id'))
  const review = await prisma.review.findUnique({ where: { id } })
  if (!review) return
  requireConfirmation(formData, review.author)
  await prisma.review.delete({ where: { id } })
  revalidateSite()
  redirect('/admin/reviews?deleted=1')
}

export async function toggleReviewAction(formData: FormData) {
  await requireSession()
  const id = toStr(formData.get('id'))
  const review = await prisma.review.findUnique({ where: { id } })
  if (!review) return
  await prisma.review.update({
    where: { id },
    data: { isPublished: !review.isPublished },
  })
  revalidateSite()
}

export async function approveReviewAction(formData: FormData) {
  await requireSession()
  await prisma.review.update({
    where: { id: toStr(formData.get('id')) },
    data: { isApproved: true },
  })
  revalidateSite()
}

/* ------------------------------------------------------------------ */
/* Hero slides                                                         */
/* ------------------------------------------------------------------ */

export async function saveSlideAction(formData: FormData) {
  await requireSession()
  const id = toStr(formData.get('id'))
  const data = {
    title: i18n(formData, 'title'),
    subtitle: i18n(formData, 'subtitle'),
    ctaLabel: i18n(formData, 'ctaLabel'),
    image: toStr(formData.get('image')),
    ctaHref: toStr(formData.get('ctaHref')) || '/tours',
    align: toStr(formData.get('align')) === 'left' ? 'left' : 'center',
    isPublished: toBool(formData.get('isPublished')),
    sortOrder: toIntOrNull(formData.get('sortOrder')) ?? 0,
  }
  if (!data.image) throw new Error('A slide needs a background image.')

  if (id) {
    await prisma.heroSlide.update({ where: { id }, data })
  } else {
    await prisma.heroSlide.create({ data })
  }

  revalidateSite()
  redirect('/admin/slides?saved=1')
}

export async function deleteSlideAction(formData: FormData) {
  await requireSession()
  const id = toStr(formData.get('id'))
  const slide = await prisma.heroSlide.findUnique({ where: { id } })
  if (!slide) return
  requireConfirmation(formData, slide.id)
  await prisma.heroSlide.delete({ where: { id } })
  revalidateSite()
  redirect('/admin/slides?deleted=1')
}

export async function toggleSlideAction(formData: FormData) {
  await requireSession()
  const id = toStr(formData.get('id'))
  const slide = await prisma.heroSlide.findUnique({ where: { id } })
  if (!slide) return
  await prisma.heroSlide.update({
    where: { id },
    data: { isPublished: !slide.isPublished },
  })
  revalidateSite()
}
export async function togglePlaceAction(formData: FormData) {
  await requireSession()
  const id = toStr(formData.get('id'))
  const place = await prisma.place.findUnique({ where: { id } })
  if (!place) return
  await prisma.place.update({
    where: { id },
    data: { isPublished: !place.isPublished },
  })
  revalidateSite()
}