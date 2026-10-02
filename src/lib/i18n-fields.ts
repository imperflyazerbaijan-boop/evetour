import type { Locale } from '@/i18n/routing'

/**
 * Translatable fields are stored as JSON strings shaped like {"en":"...","ru":"..."}.
 * These helpers read/write that shape safely and never throw on malformed data,
 * so a bad row can never take down a whole page.
 */

export type I18nText = Partial<Record<Locale, string>>

export function parseI18n(
  raw: string | I18nText | null | undefined,
  locale: Locale,
): string {
  if (!raw) return ''
  if (typeof raw === 'object') {
    return raw[locale] ?? raw.en ?? raw.ru ?? ''
  }
  try {
    const parsed = JSON.parse(raw) as I18nText
    return parsed[locale] ?? parsed.en ?? parsed.ru ?? ''
  } catch {
    return raw
  }
}

export function parseI18nArray(raw: string | null | undefined): I18nText[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as I18nText[]) : []
  } catch {
    return []
  }
}

export function parseI18nStrings(
  raw: string | null | undefined,
  locale: Locale = 'en',
): string[] {
  return parseI18nArray(raw)
    .map((item) => item[locale] ?? item.en ?? item.ru ?? '')
    .filter((s) => s.trim().length > 0)
}

export function parseStringArray(raw: string | null | undefined): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

export type ItineraryDay = {
  day?: string
  title: I18nText
  desc: I18nText
  image?: string
}

/**
 * Normalises one itinerary entry's translatable field.
 *
 * The stored data has used two shapes: the seed writes `{"en":"…","ru":"…"}`
 * as a JSON *string*, while the admin form writes it as a nested *object*.
 * Both have to read back, or the editor shows empty rows and a save would
 * overwrite real content with blanks.
 */
function normalizeI18n(value: unknown): I18nText {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (parsed && typeof parsed === 'object') return parsed as I18nText
    } catch {
      // Not JSON — treat the whole string as English-only content.
      return { en: value }
    }
    return { en: value }
  }
  if (value && typeof value === 'object') return value as I18nText
  return {}
}

export function parseItinerary(raw: string | null | undefined): ItineraryDay[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((entry) => {
      const day = (entry ?? {}) as Record<string, unknown>
      return {
        day: typeof day.day === 'string' ? day.day : undefined,
        title: normalizeI18n(day.title),
        desc: normalizeI18n(day.desc),
        image: typeof day.image === 'string' && day.image ? day.image : undefined,
      }
    })
  } catch {
    return []
  }
}

/** Build the JSON string for a translatable field from a form input map. */
export function buildI18nText(value: { en?: string; ru?: string } | string): string {
  if (typeof value === 'string') {
    return JSON.stringify({ en: value })
  }
  const clean: I18nText = {}
  if (value.en?.trim()) clean.en = value.en.trim()
  if (value.ru?.trim()) clean.ru = value.ru.trim()
  return JSON.stringify(clean)
}

export function buildI18nArray(
  value: { en?: string; ru?: string }[],
): string {
  return JSON.stringify(
    value
      .map((item) => {
        const clean: I18nText = {}
        if (item.en?.trim()) clean.en = item.en.trim()
        if (item.ru?.trim()) clean.ru = item.ru.trim()
        return clean
      })
      .filter((item) => Object.keys(item).length > 0),
  )
}
