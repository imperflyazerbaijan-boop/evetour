'use client'

import * as React from 'react'
import Image from 'next/image'
import { Link, usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react'
import { PHONE_RAW, WHATSAPP_URL } from '@/lib/site'
import LocaleSwitcher from './LocaleSwitcher'

const LINKS = [
  { key: 'home', href: '/' },
  { key: 'tours', href: '/tours' },
  { key: 'places', href: '/places' },
  { key: 'reviews', href: '/reviews' },
  { key: 'gallery', href: '/gallery' },
  { key: 'contact', href: '/contact' },
] as const

export default function SiteHeader() {
  const t = useTranslations('nav')
  const tc = useTranslations('common')
  const ta = useTranslations('a11y')
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  // Scroll progress, smoothed, drawn as a hairline under the header
  const { scrollYProgress } = useScroll()
  const scrollProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  })

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the drawer whenever the route changes
  React.useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Lock body scroll while the drawer is open
  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass border-b border-ink-700/70 py-3' : 'py-6'
        }`}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 sm:px-10 lg:px-16">
          <Link href="/" className="group flex items-center gap-3" aria-label={ta('homeLink')}>
            <Image
              src="/brand/logo-mark.png"
              alt=""
              width={44}
              height={44}
              priority
              className="h-11 w-11 rounded-full transition-transform duration-500 group-hover:scale-105"
            />
            <span className="flex flex-col leading-none">
              <span className="font-display text-2xl tracking-wider text-white">
                EVE TOUR
              </span>
              <span className="mt-0.5 text-[0.6rem] uppercase tracking-[0.28em] text-ink-400">
                {tc('tagline')}
              </span>
            </span>
          </Link>

          {/* Desktop nav — minimal, with an animated underline */}
          <nav className="hidden items-center lg:flex">
            {LINKS.map((l) => {
              const active =
                l.href === '/' ? pathname === '/' : pathname.startsWith(l.href)
              return (
                <Link
                  key={l.key}
                  href={l.href}
                  className="group relative px-5 py-2"
                >
                  <span
                    className={`relative z-10 text-[0.72rem] font-medium uppercase tracking-[0.18em] transition-colors duration-300 ${
                      active ? 'text-white' : 'text-ink-400 group-hover:text-white'
                    }`}
                  >
                    {t(l.key)}
                  </span>
                  {/* Line grows from the centre on hover */}
                  <span
                    className={`absolute inset-x-5 bottom-0 h-px origin-center bg-flame-500 transition-transform duration-500 ${
                      active
                        ? 'scale-x-100'
                        : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </Link>
              )
            })}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <LocaleSwitcher />
            </div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-full bg-flame-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-flame-400 sm:block"
            >
              {tc('bookNow')}
            </a>

            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? t('closeMenu') : t('openMenu')}
              aria-expanded={open}
              className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-xl border border-ink-700 bg-ink-900/60 lg:hidden"
            >
              <span
                className={`h-0.5 w-5 bg-white transition-transform duration-300 ${
                  open ? 'translate-y-[3px] rotate-45' : ''
                }`}
              />
              <span
                className={`h-0.5 w-5 bg-white transition-transform duration-300 ${
                  open ? '-translate-y-[3px] -rotate-45' : ''
                }`}
              />
            </button>
          </div>
          {/* Progress hairline that tracks page scroll */}
          <motion.div
            className="absolute inset-x-0 bottom-0 h-px origin-left bg-flame-500"
            style={{ scaleX: scrollProgress }}
          />
        </div>
      </header>
      {/* Mobile drawer */}
      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-ink-950/80 backdrop-blur-sm lg:hidden"
            />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 34 }}
              className="fixed inset-y-0 right-0 z-40 flex w-[85vw] max-w-sm flex-col gap-1 border-l border-ink-700 bg-ink-900 px-6 py-28 lg:hidden"
            >
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.key}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.05 }}
                >
                  <Link
                    href={l.href}
                    className="block border-b border-ink-800 py-4 font-display text-3xl uppercase text-ink-100 transition-colors hover:text-flame-400"
                  >
                    {t(l.key)}
                  </Link>
                </motion.div>
              ))}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 rounded-full bg-flame-500 px-6 py-4 text-center font-semibold text-white"
              >
                {tc('bookNow')} · {PHONE_RAW}
              </a>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>
    </>
  )
}
