import type { Tour, Place, Review, HeroSlide } from '@/generated/prisma/client'
import {
  parseI18n,
  parseI18nArray,
  parseItinerary,
  parseStringArray,
} from '@/lib/i18n-fields'
import type { TourFormValues } from '../tours/_components/TourForm'
import type { ReviewFormValues } from '../reviews/_components/ReviewForm'

/** Shared shaping for the JSON-backed translatable columns. */
function i18nPair(raw: string) {
  return parseI18nArray(raw).map((i) => ({ en: i.en ?? '', ru: i.ru ?? '' }))
}

/**
 * Turns stored rows into the flat shape the admin forms bind to.
 * Everything is a string so it can go straight into `defaultValue`.
 */
export function tourToFormValues(tour: Tour): TourFormValues {
  return {
    id: tour.id,
    slug: tour.slug,
    titleEn: parseI18n(tour.title, 'en'),
    titleRu: parseI18n(tour.title, 'ru'),
    subtitleEn: parseI18n(tour.subtitle, 'en'),
    subtitleRu: parseI18n(tour.subtitle, 'ru'),
    excerptEn: parseI18n(tour.excerpt, 'en'),
    excerptRu: parseI18n(tour.excerpt, 'ru'),
    descriptionEn: parseI18n(tour.description, 'en'),
    descriptionRu: parseI18n(tour.description, 'ru'),
    highlights: i18nPair(tour.highlights),
    includes: i18nPair(tour.includes),
    excludes: i18nPair(tour.excludes),
    itinerary: parseItinerary(tour.itinerary).map((d) => ({
      day: d.day ?? '',
      title: { en: d.title.en ?? '', ru: d.title.ru ?? '' },
      desc: { en: d.desc.en ?? '', ru: d.desc.ru ?? '' },
      image: d.image ?? '',
    })),
    category: tour.category,
    region: tour.region,
    duration: tour.duration,
    priceFrom: tour.priceFrom === null ? '' : String(tour.priceFrom),
    priceMode: tour.priceMode,
    durationDays: tour.durationDays === null ? '' : String(tour.durationDays),
    coverImage: tour.coverImage,
    images: parseStringArray(tour.images),
    isFeatured: tour.isFeatured,
    isPublished: tour.isPublished,
    sortOrder: String(tour.sortOrder),
  }
}

export type PlaceFormValues = {
  id?: string
  slug: string
  titleEn: string
  titleRu: string
  summaryEn: string
  summaryRu: string
  descriptionEn: string
  descriptionRu: string
  image: string
  images: string[]
  highlights: { en: string; ru: string }[]
  coordinates: string
  distanceKm: string
  bestSeasonEn: string
  bestSeasonRu: string
  isPublished: boolean
  sortOrder: string
}

export function placeToFormValues(place: Place): PlaceFormValues {
  return {
    id: place.id,
    slug: place.slug,
    titleEn: parseI18n(place.title, 'en'),
    titleRu: parseI18n(place.title, 'ru'),
    summaryEn: parseI18n(place.summary, 'en'),
    summaryRu: parseI18n(place.summary, 'ru'),
    descriptionEn: parseI18n(place.description, 'en'),
    descriptionRu: parseI18n(place.description, 'ru'),
    image: place.image,
    images: parseStringArray(place.images),
    highlights: i18nPair(place.highlights),
    coordinates: place.coordinates ?? '',
    distanceKm: place.distanceKm === null ? '' : String(place.distanceKm),
    bestSeasonEn: parseI18n(place.bestSeason, 'en'),
    bestSeasonRu: parseI18n(place.bestSeason, 'ru'),
    isPublished: place.isPublished,
    sortOrder: String(place.sortOrder),
  }
}

export function reviewToFormValues(review: Review): ReviewFormValues {
  return {
    id: review.id,
    author: review.author,
    country: review.country ?? '',
    rating: String(review.rating),
    textEn: parseI18n(review.text, 'en'),
    textRu: parseI18n(review.text, 'ru'),
    tourTitleEn: parseI18n(review.tourTitle, 'en'),
    tourTitleRu: parseI18n(review.tourTitle, 'ru'),
    image: review.image ?? '',
    isApproved: review.isApproved,
    isPublished: review.isPublished,
    sortOrder: String(review.sortOrder),
  }
}

export type SlideFormValues = {
  id?: string
  titleEn: string
  titleRu: string
  subtitleEn: string
  subtitleRu: string
  ctaLabelEn: string
  ctaLabelRu: string
  image: string
  ctaHref: string
  align: string
  isPublished: boolean
  sortOrder: string
}

export function slideToFormValues(slide: HeroSlide): SlideFormValues {
  return {
    id: slide.id,
    titleEn: parseI18n(slide.title, 'en'),
    titleRu: parseI18n(slide.title, 'ru'),
    subtitleEn: parseI18n(slide.subtitle, 'en'),
    subtitleRu: parseI18n(slide.subtitle, 'ru'),
    ctaLabelEn: parseI18n(slide.ctaLabel, 'en'),
    ctaLabelRu: parseI18n(slide.ctaLabel, 'ru'),
    image: slide.image,
    ctaHref: slide.ctaHref,
    align: slide.align,
    isPublished: slide.isPublished,
    sortOrder: String(slide.sortOrder),
  }
}