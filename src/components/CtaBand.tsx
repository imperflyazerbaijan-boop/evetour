'use client'

import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import * as React from 'react'
import SplitText from './SplitText'
import { PHONE_DISPLAY, WHATSAPP_URL } from '@/lib/site'

type Props = {
  title: string
  subtitle: string
  buttonLabel: string
  phone: string
  whatsappUrl: string
}

/**
 * Closing call-to-action. The background photo drifts slower than the page
 * (parallax), which separates the band from the content around it.
 */
export default function CtaBand({
  title,
  subtitle,
  buttonLabel,
  phone,
  whatsappUrl,
}: Props) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%'])

  return (
    <section ref={ref} className="relative overflow-hidden">
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y }}>
        <Image
          src="/media/baku-flame-towers-night.jpg"
          alt=""
          fill
          sizes="100vw"
          className="scale-110 object-cover"
        />
      </motion.div>

      <div className="absolute inset-0 bg-ink-950/88" />
      <div className="absolute inset-0 bg-gradient-to-r from-flame-600/20 via-transparent to-caspian-600/15" />

      <div className="relative mx-auto max-w-[1600px] px-6 py-28 text-center sm:px-10 lg:px-16 lg:py-40">
        <SplitText
          as="h2"
          text={title}
          className="display-lg mx-auto block max-w-4xl text-white"
        />

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-ink-300"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, delay: 0.42 }}
          className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="hover"
            className="glow-primary group inline-flex items-center gap-4 rounded-full bg-flame-500 px-9 py-5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-transform duration-500 hover:scale-[1.03] hover:bg-flame-400"
          >
            {buttonLabel}
            <span className="transition-transform duration-500 group-hover:translate-x-1.5">
              →
            </span>
          </a>
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            data-cursor="hover"
            className="inline-flex items-center gap-3 rounded-full border border-ink-600 px-9 py-5 text-xs font-bold uppercase tracking-[0.2em] text-ink-200 transition-colors duration-500 hover:border-white hover:text-white"
          >
            {phone}
          </a>
        </motion.div>
      </div>
    </section>
  )
}
