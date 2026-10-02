import { revalidatePath } from 'next/cache'

/**
 * Form-parsing helpers shared by the server actions.
 *
 * This is deliberately a plain server module (not 'use client'), so the
 * action handlers can call these synchronously.
 */

/** Trims a form value to a string. */
export function toStr(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : ''
}

/** Splits a textarea into non-empty lines. */
export function toLines(value: FormDataEntryValue | null): string[] {
  if (typeof value !== 'string') return []
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

/** Parses an integer input, returning null when blank or unparseable. */
export function toIntOrNull(value: FormDataEntryValue | null): number | null {
  const raw = toStr(value)
  if (!raw) return null
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) ? n : null
}

/** Reads the paired hidden-input + checkbox convention used by ToggleField. */
export function toBool(value: FormDataEntryValue | null): boolean {
  return toStr(value) === '1'
}

/** Builds the {"en":…,"ru":…} JSON blob from paired form fields. */
export function i18n(fd: FormData, base: string) {
  const en = toStr(fd.get(`${base}En`))
  const ru = toStr(fd.get(`${base}Ru`))
  return JSON.stringify({ en, ru })
}

/** Builds a JSON array of {en,ru} from two line-per-item textareas. */
export function i18nList(fd: FormData, base: string) {
  const en = toLines(fd.get(`${base}En`))
  const ru = toLines(fd.get(`${base}Ru`))
  const length = Math.max(en.length, ru.length)
  return JSON.stringify(
    Array.from({ length }, (_, i) => ({
      en: en[i] ?? en[en.length - 1] ?? '',
      ru: ru[i] ?? ru[ru.length - 1] ?? '',
    })).filter((item) => item.en || item.ru),
  )
}

export function plainList(fd: FormData, base: string) {
  return JSON.stringify(toLines(fd.get(base)))
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** Every content mutation refreshes the whole site — pages are cached. */
export function revalidateSite() {
  revalidatePath('/', 'layout')
}