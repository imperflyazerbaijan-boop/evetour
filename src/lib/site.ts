export const PHONE_RAW = '+994516283587'
export const PHONE_DISPLAY = '+994 51 628 35 87'
export const WHATSAPP_URL = `https://wa.me/${PHONE_RAW}`
export const INSTAGRAM_URL = 'https://www.instagram.com/evetour.az/'
export const EMAIL = 'info@evetour.az'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

/** Ordered list of tour categories with their i18n message keys. */
export const TOUR_CATEGORIES = [
  { key: 'baku', labelKey: 'catBaku' },
  { key: 'sheki', labelKey: 'catSheki' },
  { key: 'guba', labelKey: 'catGuba' },
  { key: 'gabala', labelKey: 'catGabala' },
  { key: 'qusar', labelKey: 'catQusar' },
  { key: 'absheron', labelKey: 'catAbsheron' },
  { key: 'cars', labelKey: 'catCars' },
  { key: 'adventure', labelKey: 'catAdventure' },
  { key: 'packages', labelKey: 'catPackages' },
] as const

export type TourCategory = (typeof TOUR_CATEGORIES)[number]['key']
