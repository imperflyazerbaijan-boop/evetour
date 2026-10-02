'use client'

import * as React from 'react'
import { Field, TextInput, TextArea } from './ui'
/**
 * Slug input that pre-fills from the EN title until the author edits it
 * by hand — afterwards it is left alone.
 */
export function SlugField({
  titleEnName = 'titleEn',
  formId = 'tour-form',
  defaultValue = '',
}: {
  titleEnName?: string
  formId?: string
  defaultValue?: string
}) {
  const [slug, setSlug] = React.useState(defaultValue)
  const [touched, setTouched] = React.useState(Boolean(defaultValue))

  // Look up the surrounding <form> by id so the sibling title input can
  // drive this field without prop-drilling a ref through the form tree.
  React.useEffect(() => {
    if (touched) return
    const title = document
      .querySelector<HTMLFormElement>(`#${formId}`)
      ?.querySelector<HTMLInputElement>(`[name="${titleEnName}"]`)
    if (!title) return

    const apply = () => {
      const next = slugifyLocal(title.value)
      setSlug((current) => (current === next ? current : next))
    }
    apply()
    title.addEventListener('input', apply)
    return () => title.removeEventListener('input', apply)
  }, [touched, titleEnName, formId])

  return (
    <Field
      label="Slug"
      hint={
        touched
          ? 'URL segment. Lowercase letters, digits and dashes only.'
          : 'Generated from the English title until you edit it.'
      }
    >
      <TextInput
        name="slug"
        value={slug}
        onChange={(e) => {
          setTouched(true)
          setSlug(e.target.value)
        }}
      />
    </Field>
  )
}

/** Mirrors the server-side slugify in admin/actions.ts. */
function slugifyLocal(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/**
 * Image picker with an inline uploader.
 *
 * Three ways to set a path, because admin work needs all of them:
 *  1. upload a file (the usual case)
 *  2. pick something already in the library
 *  3. type a path (for files added by other means)
 *
 * The chosen path goes into a real named input, so the surrounding server
 * action receives it exactly like the old text box did.
 */

export type MediaFile = { name: string; path: string; size: number; mtime: number }

/** The photos shipped in public/media, listed separately from uploads. */
export const BUILT_IN = [
  '/media/baku-skyline.jpg',
  '/media/baku-panorama.jpg',
  '/media/baku-shirvanshahs.jpg',
  '/media/baku-flame-towers-night.jpg',
  '/media/baku-flame-towers-boulevard.jpg',
  '/media/baku-night-blue.jpg',
  '/media/baku-botanical-garden.jpg',
  '/media/sheki-old-town.jpg',
  '/media/sheki-old-town-2.jpg',
  '/media/sheki-to-baku-road.jpg',
  '/media/quba-mountains.jpg',
  '/media/quba-shahdag.jpg',
  '/media/gobustan-mud-volcanoes.jpg',
  '/media/gobustan-mud-volcanoes-2.jpg',
  '/media/absheron-caspian.jpg',
  '/media/drive-to-baku.jpg',
  '/media/paragliding.jpg',
]

/** Loads the admin's own uploads. A failure must not block editing. */
export function useUploads(open: boolean) {
  const [uploads, setUploads] = React.useState<MediaFile[]>([])

  React.useEffect(() => {
    if (!open) return
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/api/admin/media')
        if (!res.ok || cancelled) return
        const data = (await res.json()) as { files?: MediaFile[] }
        if (!cancelled) setUploads(data.files ?? [])
      } catch {
        // Optional convenience — ignore.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open])

  return uploads
}

/** Sends one file to the upload endpoint; returns the stored public path. */
async function sendFile(file: File): Promise<{ path?: string; error?: string }> {
  const body = new FormData()
  body.append('file', file)
  const res = await fetch('/api/admin/media', { method: 'POST', body })
  return (await res.json()) as { path?: string; error?: string }
}

/** Shared upload button with a busy state and inline error text. */
export function UploadButton({
  multiple = false,
  onFiles,
}: {
  multiple?: boolean
  onFiles: (paths: string[]) => void
}) {
  const ref = React.useRef<HTMLInputElement>(null)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  return (
    <>
      <label
        className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-flame-500 px-4 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-flame-400 ${
          busy ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        <input
          ref={ref}
          type="file"
          multiple={multiple}
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          className="sr-only"
          disabled={busy}
          onChange={async (e) => {
            const files = Array.from(e.currentTarget.files ?? [])
            if (files.length === 0) return
            setBusy(true)
            setError(null)
            try {
              const results = await Promise.all(files.map(sendFile))
              const failed = results.find((r) => !r.path)
              if (failed?.error) {
                setError(failed.error)
              } else {
                const ok = results.map((r) => r.path!).filter(Boolean)
                if (ok.length > 0) onFiles(ok)
              }
            } catch {
              setError('The upload failed. Check your connection and try again.')
            } finally {
              setBusy(false)
              if (ref.current) ref.current.value = ''
            }
          }}
        />
        {busy ? 'Uploading…' : multiple ? 'Upload images' : 'Upload image'}
      </label>
      {error ? (
        <p className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {error}
        </p>
      ) : null}
    </>
  )
}

/** Thumbnail grid of selectable paths. */
function ThumbGrid({
  paths,
  selected,
  onPick,
}: {
  paths: string[]
  selected?: string[]
  onPick: (p: string) => void
}) {
  if (paths.length === 0) return null
  return (
    <div className="grid max-h-56 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-5">
      {paths.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPick(p)}
          className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
            selected?.includes(p) ? 'border-flame-500' : 'border-transparent hover:border-ink-500'
          }`}
          title={p.split('/').pop() ?? p}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p} alt="" className="h-full w-full object-cover" />
        </button>
      ))}
    </div>
  )
}

/** "Pick from library" toggle plus the two thumbnail grids. */
function LibraryPicker({
  onPick,
  selected,
  allowMultiple = false,
}: {
  onPick: (p: string) => void
  selected?: string[]
  allowMultiple?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const uploads = useUploads(open)
  const pick = (p: string) => {
    onPick(p)
    if (!allowMultiple) setOpen(false)
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-xl border border-ink-700 px-4 py-2.5 text-sm font-semibold text-ink-200 transition-colors hover:border-ink-500 hover:text-white"
      >
        {open ? 'Hide library' : 'Choose from library'}
      </button>

      {open ? (
        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-ink-400">
              Your uploads
            </p>
            {uploads.length === 0 ? (
              <p className="text-xs text-ink-500">Nothing uploaded yet.</p>
            ) : (
              <ThumbGrid paths={uploads.map((f) => f.path)} selected={selected} onPick={pick} />
            )}
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-ink-400">
              Bundled photos
            </p>
            <ThumbGrid paths={BUILT_IN} selected={selected} onPick={pick} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

/** Single-image field: upload, choose, or type a path. */
export function ImagePicker({
  name,
  defaultValue = '',
  label = 'Image',
  hint,
}: {
  name: string
  defaultValue?: string
  label?: string
  hint?: string
}) {
  const [value, setValue] = React.useState(defaultValue)

  return (
    <Field label={label} hint={hint ?? 'Upload a file, pick one from the library, or type a path.'}>
      <input type="hidden" name={name} value={value} />

      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="mb-3 h-40 w-full rounded-xl border border-ink-700 object-cover"
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <UploadButton onFiles={(paths) => setValue(paths[0])} />
        <LibraryPicker onPick={setValue} selected={[value]} />
        {value ? (
          <button
            type="button"
            onClick={() => setValue('')}
            className="rounded-xl border border-ink-700 px-4 py-2.5 text-sm font-semibold text-ink-300 transition-colors hover:border-red-500/50 hover:text-white"
          >
            Clear
          </button>
        ) : null}
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-xs text-ink-500 hover:text-ink-300">
          Type a path instead
        </summary>
        <TextInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="/media/uploads/example.jpg"
          className="mt-2 font-mono text-xs"
        />
      </details>
    </Field>
  )
}

/**
 * Multi-image field for galleries. Each image is one line of a hidden
 * textarea, which is exactly what the server action already reads, so no
 * action-side change was needed.
 */
export function GalleryPicker({
  name,
  defaultValue = [],
}: {
  name: string
  defaultValue?: string[]
}) {
  const [items, setItems] = React.useState<string[]>(
    defaultValue.filter((p) => p && p.trim()),
  )

  const add = (paths: string[]) =>
    setItems((current) => {
      const next = [...current]
      for (const p of paths) if (p && !next.includes(p)) next.push(p)
      return next
    })

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-ink-300">
        Gallery images
      </p>
      <p className="mb-3 text-xs text-ink-500">
        These appear on the tour page and in the gallery.
      </p>

      {/* The server action reads one path per line. */}
      <textarea name={name} readOnly value={items.join('\n')} className="hidden" />

      {items.length > 0 ? (
        <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {items.map((p) => (
            <div key={p} className="group relative aspect-square overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setItems((c) => c.filter((x) => x !== p))}
                className="absolute inset-0 grid place-items-center bg-ink-950/70 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <UploadButton multiple onFiles={add} />
        <LibraryPicker onPick={(p) => add([p])} selected={items} allowMultiple />
      </div>
    </div>
  )
}

/** Renders a compact row of actions; kept here so pages stay readable. */
export function ActionsRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>
}

export function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-ink-700 px-6 py-10 text-center text-sm text-ink-400">
      {message}
    </p>
  )
}

export { TextArea }