'use client'

import * as React from 'react'

type Labels = {
  name: string
  contact: string
  tour: string
  message: string
  send: string
  sending: string
  sent: string
  error: string
  optional: string
}

export default function ContactForm({
  tourOptions,
  labels,
}: {
  tourOptions: string[]
  labels: Labels
}) {
  const [status, setStatus] = React.useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  )

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())

    setStatus('sending')
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('failed')
      form.reset()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  const field =
    'w-full rounded-2xl border border-ink-700 bg-ink-900 px-5 py-4 text-ink-100 outline-none transition placeholder:text-ink-500 focus:border-flame-500'

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="eyebrow mb-3 block text-ink-400" htmlFor="cf-name">
          {labels.name}
        </label>
        <input id="cf-name" name="name" required className={field} />
      </div>

      <div>
        <label className="eyebrow mb-3 block text-ink-400" htmlFor="cf-contact">
          {labels.contact}
        </label>
        <input id="cf-contact" name="contact" required className={field} />
      </div>

      <div>
        <label className="eyebrow mb-3 block text-ink-400" htmlFor="cf-tour">
          {labels.tour} {labels.optional}
        </label>
        <select id="cf-tour" name="tour" className={field} defaultValue="">
          <option value="">—</option>
          {tourOptions.map((o) => (
            <option key={o} value={o} className="bg-ink-900">
              {o}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="eyebrow mb-3 block text-ink-400" htmlFor="cf-message">
          {labels.message}
        </label>
        <textarea id="cf-message" name="text" required rows={5} className={field} />
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="glow-primary w-full rounded-full bg-flame-500 px-8 py-5 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-flame-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'sending' ? labels.sending : labels.send}
      </button>

      {status === 'sent' ? (
        <p className="rounded-2xl border border-brand-500/40 bg-brand-500/10 px-5 py-4 text-sm text-brand-300">
          {labels.sent}
        </p>
      ) : null}
      {status === 'error' ? (
        <p className="rounded-2xl border border-flame-500/40 bg-flame-500/10 px-5 py-4 text-sm text-flame-400">
          {labels.error}
        </p>
      ) : null}
    </form>
  )
}
