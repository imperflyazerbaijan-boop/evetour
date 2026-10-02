import Link from 'next/link'
import Image from 'next/image'
import { Link as IntlLink } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { PHONE_DISPLAY, PHONE_RAW, WHATSAPP_URL, INSTAGRAM_URL, EMAIL } from '@/lib/site'
import LocaleSwitcher from './LocaleSwitcher'

export default async function SiteFooter() {
  const [t, tc, tf, ta] = await Promise.all([
    getTranslations('nav'),
    getTranslations('common'),
    getTranslations('footer'),
    getTranslations('a11y'),
  ])

  const year = new Date().getFullYear()
  const links = [
    { key: 'tours', href: '/tours' },
    { key: 'places', href: '/places' },
    { key: 'reviews', href: '/reviews' },
    { key: 'gallery', href: '/gallery' },
    { key: 'contact', href: '/contact' },
  ] as const

  return (
    <footer className="relative border-t border-ink-800 bg-ink-950">
      <div className="mx-auto max-w-[1600px] px-6 py-16 sm:px-10 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/brand/logo-mark.png"
                alt={ta('brandLogo')}
                width={44}
                height={44}
                className="h-11 w-11 rounded-full"
              />
              <span className="flex flex-col leading-none">
                <span className="font-display text-2xl tracking-wider text-white">
                  EVE TOUR
                </span>
                <span className="mt-1 text-[0.6rem] uppercase tracking-[0.28em] text-ink-400">
                  {tc('tagline')}
                </span>
              </span>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink-400">
              {tf('about')}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-ink-700 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink-300 transition hover:border-flame-500 hover:text-white"
              >
                Instagram
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-ink-700 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink-300 transition hover:border-flame-500 hover:text-white"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="eyebrow mb-5 text-brand-300">{tf('explore')}</h3>
            <ul className="space-y-3">
              {links.map((l) => (
                <li key={l.key}>
                  <IntlLink
                    href={l.href}
                    className="text-sm text-ink-300 transition-colors hover:text-white"
                  >
                    {t(l.key)}
                  </IntlLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="eyebrow mb-5 text-brand-300">{tf('company')}</h3>
            <ul className="space-y-3">
              <li>
                <span className="rounded-full bg-ink-800 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-300">
                  {tc('noPrepayment')}
                </span>
              </li>
              <li className="text-sm text-ink-400">{tf('builtWith')}</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="eyebrow mb-5 text-brand-300">{tf('contact')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={`tel:${PHONE_RAW}`}
                  className="text-ink-200 transition-colors hover:text-flame-400"
                >
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="text-ink-300 transition-colors hover:text-white"
                >
                  {EMAIL}
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <LocaleSwitcher />
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-ink-800 pt-8 sm:flex-row">
          <p className="text-xs text-ink-500">
            © {year} EVE TOUR. {tf('rights')}
          </p>
          <Link
            href="/admin"
            className="text-xs text-ink-600 transition-colors hover:text-ink-400"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
