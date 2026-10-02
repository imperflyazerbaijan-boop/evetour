'use client'

import * as React from 'react'
import { Card, RowSubmit, SubmitButton } from '../../_components/ui'
import { saveSettingAction, deleteSettingAction } from '../../actions'

/**
 * Editor for one setting row.
 *
 * Settings hold free-form JSON, and some keys (brand, about) are nested
 * objects rather than a flat {en,ru} pair. A flat bilingual form would read
 * those as empty and overwrite the whole document on save, so the value is
 * edited as raw JSON and syntax-checked as you type.
 *
 * `brand` holds the phone, email and social links the header and footer read,
 * so it is shown without a delete control.
 */
export default function JsonSettingForm({
  settingKey,
  value,
}: {
  settingKey: string
  value: string
}) {
  const [error, setError] = React.useState<string | null>(null)
  const [dirty, setDirty] = React.useState(false)

  return (
    <Card title={settingKey}>
      <form action={saveSettingAction} className="space-y-4">
        <input type="hidden" name="key" value={settingKey} />
        <JsonEditor
          name="value"
          defaultValue={pretty(value)}
          onChange={() => setDirty(true)}
          onInvalid={setError}
        />

        {error ? (
          <p className="rounded-xl border border-flame-500/50 bg-flame-500/10 px-4 py-3 text-sm text-flame-300">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton disabled={error !== null}>Save {settingKey}</SubmitButton>
          {dirty && error === null ? (
            <span className="text-xs text-ink-500">Unsaved changes</span>
          ) : null}
        </div>
      </form>

      {settingKey === 'brand' ? (
        <p className="mt-3 text-xs text-ink-500">
          Holds the phone, email and social links used across the site. It
          cannot be deleted, but the values above can be edited.
        </p>
      ) : (
        <form action={deleteSettingAction} className="mt-3">
          <input type="hidden" name="key" value={settingKey} />
          <RowSubmit>Delete {settingKey}</RowSubmit>
        </form>
      )}
    </Card>
  )
}

/** Re-indents stored JSON, falling back to the raw text if it will not parse. */
function pretty(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}

/** A textarea that validates JSON on every keystroke. */
function JsonEditor({
  name,
  defaultValue,
  onChange,
  onInvalid,
}: {
  name: string
  defaultValue: string
  onChange: () => void
  onInvalid: (message: string | null) => void
}) {
  return (
    <textarea
      name={name}
      required
      rows={10}
      spellCheck={false}
      defaultValue={defaultValue}
      onChange={(e) => {
        onChange()
        try {
          JSON.parse(e.currentTarget.value)
          onInvalid(null)
        } catch (err) {
          onInvalid(`Invalid JSON: ${(err as Error).message}`)
        }
      }}
      className="w-full resize-y rounded-xl border border-ink-700 bg-ink-900 px-4 py-3 font-mono text-xs leading-relaxed text-white outline-none focus:border-flame-500"
    />
  )
}