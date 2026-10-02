import { setRequestLocale, getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import Reveal from '@/components/Reveal'
import ContactForm from '@/components/ContactForm'
import { parseI18n } from '@/lib/i18n-fields'
import { PHONE_DISPLAY, PHONE_RAW, WHATSAPP_URL, INSTAGRAM_URL, EMAIL } from '@/lib/site'

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: 'en' | 'ru' }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, tc] = await Promise.all([
    getTranslations('contact'),
    getTranslations('common'),
  ])

  const tours = await prisma.tour.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: 'asc' },
    select: { title: true },
  })

  return (
    <>
      <section className="relative pt-40 pb-16 sm:pt-48">
        <div className="mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16">
          <Reveal>
            <p className="eyebrow mb-5 text-brand-300">{t('infoTitle')}</p>
            <h1 className="display-xl max-w-5xl text-white">{t('title')}</h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300">{t('sub')}</p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 pb-24 sm:px-10 lg:px-16 lg:pb-32">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_1fr]">
          <Reveal>
            <ContactForm
              tourOptions={tours.map((tour) => parseI18n(tour.title, locale))}
              labels={{
                name: t('name'),
                contact: t('contactLabel'),
                tour: t('tourLabel'),
                message: t('message'),
                send: t('send'),
                sending: t('sending'),
                sent: t('sent'),
                error: t('error'),
                optional: '—',
              }}
            />
          </Reveal>

          <aside className="space-y-6">
            <Reveal>
              <div className="rounded-3xl border border-ink-800 bg-ink-900/70 p-7">
                <h2 className="eyebrow mb-6 text-brand-300">{t('infoTitle')}</h2>
                <ul className="space-y-5 text-sm">
                  <li>
                    <p className="text-ink-500">{t('phoneLabel')}</p>
                    <a
                      href={`tel:${PHONE_RAW}`}
                      className="mt-1 block text-lg text-white transition-colors hover:text-flame-400"
                    >
                      {PHONE_DISPLAY}
                    </a>
                  </li>
                  <li>
                    <p className="text-ink-500">{t('emailLabel')}</p>
                    <a
                      href={`mailto:${EMAIL}`}
                      className="mt-1 block text-lg text-white transition-colors hover:text-flame-400"
                    >
                      {EMAIL}
                    </a>
                  </li>
                </ul>

                <div className="mt-7 space-y-3 border-t border-ink-800 pt-6">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-full bg-flame-500 px-6 py-4 text-center text-sm font-bold uppercase tracking-widest text-white transition hover:bg-flame-400"
                  >
                    {t('orWhatsapp')}
                  </a>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-full border border-ink-700 px-6 py-4 text-center text-sm font-bold uppercase tracking-widest text-ink-200 transition hover:border-white hover:text-white"
                  >
                    {t('followUs')}
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="rounded-3xl border border-brand-500/30 bg-brand-500/10 p-7">
                <p className="eyebrow text-brand-300">{tc('brandName')}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-200">
                  {tc('noPrepayment')}. {tc('tagline')}
                </p>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  )
}
