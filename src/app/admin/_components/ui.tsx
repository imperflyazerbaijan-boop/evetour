'use client'

import * as React from 'react'
import { useFormStatus } from 'react-dom'

/* ------------------------------------------------------------------ */
/* Primitives shared by every admin form                               */
/* ------------------------------------------------------------------ */

const base =
  'w-full rounded-xl border border-ink-700 bg-ink-900 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-ink-500 focus:border-flame-500'

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-ink-300">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs text-ink-500">{hint}</span> : null}
    </label>
  )
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${base} ${props.className ?? ''}`} />
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${base} min-h-28 resize-y ${props.className ?? ''}`} />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${base} ${props.className ?? ''}`} />
}

/** Side-by-side EN / RU inputs for a translatable field. */
export function I18nField({
  label,
  hint,
  nameEn,
  nameRu,
  en,
  ru,
  multiline,
  rows = 4,
}: {
  label: string
  hint?: string
  nameEn: string
  nameRu: string
  en?: string
  ru?: string
  multiline?: boolean
  rows?: number
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-ink-300">
        {label}
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <span className="mb-1.5 block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-brand-300">
            EN
          </span>
          {multiline ? (
            <TextArea name={nameEn} defaultValue={en} rows={rows} />
          ) : (
            <TextInput name={nameEn} defaultValue={en} />
          )}
        </div>
        <div>
          <span className="mb-1.5 block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-brand-300">
            RU
          </span>
          {multiline ? (
            <TextArea name={nameRu} defaultValue={ru} rows={rows} />
          ) : (
            <TextInput name={nameRu} defaultValue={ru} />
          )}
        </div>
      </div>
      {hint ? <p className="mt-1.5 text-xs text-ink-500">{hint}</p> : null}
    </div>
  )
}

/** Repeater: one item per line, parsed into the JSON array fields. */
export function ListField({
  label,
  hint,
  nameEn,
  nameRu,
  en,
  ru,
  rows = 5,
}: {
  label: string
  hint?: string
  nameEn: string
  nameRu: string
  en?: string[]
  ru?: string[]
  rows?: number
}) {
  return (
    <I18nField
      label={label}
      hint={hint}
      nameEn={nameEn}
      nameRu={nameRu}
      en={(en ?? []).join('\n')}
      ru={(ru ?? []).join('\n')}
      multiline
      rows={rows}
    />
  )
}

export function Toggle({
  name,
  defaultChecked,
  label,
}: {
  name: string
  defaultChecked?: boolean
  label: string
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        name={name}
        value="1"
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="relative h-6 w-11 rounded-full bg-ink-700 transition-colors peer-checked:bg-flame-500">
        <span className="absolute top-1 left-1 size-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
      </span>
      <span className="text-sm text-ink-200">{label}</span>
    </label>
  )
}

/* ------------------------------------------------------------------ */
/* Buttons + cards                                                     */
/* ------------------------------------------------------------------ */

export function SubmitButton({
  children = 'Save',
  variant = 'primary',
  disabled,
}: {
  children?: React.ReactNode
  variant?: 'primary' | 'ghost' | 'danger'
  /** Set while the surrounding form is knowingly invalid. */
  disabled?: boolean
}) {
  const { pending } = useFormStatus()
  const styles = {
    primary: 'bg-flame-500 text-ink-950 hover:bg-flame-400',
    ghost: 'border border-ink-700 text-ink-200 hover:border-ink-600 hover:text-white',
    danger: 'border border-red-500/40 text-red-300 hover:bg-red-500/10',
  }[variant]

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-colors disabled:opacity-50 ${styles}`}
    >
      {pending ? 'Saving…' : children}
    </button>
  )
}

/** Submit button for the small inline forms inside list rows. */
export function RowSubmit({ children = 'Save' }: { children?: React.ReactNode }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-ink-700 px-3 py-1.5 text-xs font-semibold text-ink-200 transition-colors hover:border-flame-500 hover:text-white disabled:opacity-50"
    >
      {pending ? '…' : children}
    </button>
  )
}

/**
 * Destructive submit that requires typing the item's name.
 *
 * The confirmation is not just a JS `confirm()` — the name is posted and the
 * server action checks it, so the guard still holds if JavaScript is off or
 * the form is submitted directly.
 */
export function DeleteButton({
  name,
  confirmText,
  children = 'Delete',
}: {
  /** The exact word the user must type to confirm. */
  confirmText: string
  name?: string
  children?: React.ReactNode
}) {
  const { pending } = useFormStatus()
  const [open, setOpen] = React.useState(false)
  const [typed, setTyped] = React.useState('')
  const matches = typed.trim() === confirmText

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
      >
        {children}
      </button>
    )
  }

  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-ink-400">Type “{confirmText}” to confirm:</span>
      <input
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        autoFocus
        aria-label={`Type ${confirmText} to confirm`}
        className="w-28 rounded-lg border border-ink-700 bg-ink-900 px-2 py-1.5 font-mono text-xs text-white outline-none focus:border-flame-500"
      />
      <button
        type="submit"
        name={name}
        value={confirmText}
        disabled={pending || !matches}
        className="rounded-lg border border-red-500/50 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-40"
      >
        {pending ? '…' : 'Confirm'}
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false)
          setTyped('')
        }}
        className="rounded-lg border border-ink-700 px-3 py-1.5 text-xs font-semibold text-ink-300 transition-colors hover:border-ink-600"
      >
        Cancel
      </button>
    </span>
  )
}

export function Card({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-ink-800 bg-ink-900/60 p-6 sm:p-8">
      <h2 className="font-display text-2xl tracking-wide text-white uppercase">{title}</h2>
      {description ? <p className="mt-2 text-sm text-ink-400">{description}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Helpers used by the server action form parsers live in               */
/* ../_lib/form-helpers.ts — server code cannot call this client file. */
/* ------------------------------------------------------------------ */

/* An unticked checkbox is omitted from the payload, so a hidden 0 is
   rendered first and the server action always sees a value. */
export function ToggleField({
  name,
  defaultChecked,
  label,
}: {
  name: string
  defaultChecked?: boolean
  label: string
}) {
  return (
    <>
      <input type="hidden" name={name} value="0" />
      <Toggle name={name} defaultChecked={defaultChecked} label={label} />
    </>
  )
}