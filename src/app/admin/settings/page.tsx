import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/admin-auth'
import {
  createSettingAction,
  deleteSettingAction,
  saveSettingAction,
} from '../actions'
import PasswordForm from './_components/PasswordForm'
import JsonSettingForm from './_components/JsonSettingForm'
import { Card, Field, SubmitButton } from '../_components/ui'
import { EmptyState } from '../_components/fields'

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>
}) {
  await requireSession()
  const { saved, deleted } = await searchParams

  const settings = await prisma.setting.findMany({ orderBy: { key: 'asc' } })

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-5xl tracking-wide text-white uppercase">
          Settings
        </h1>
        <p className="mt-2 text-sm text-ink-400">
          Each key holds a JSON document. Edit it as raw JSON so no field can be
          lost by a shape the form does not recognise.
        </p>
      </header>

      {saved ? (
        <p className="rounded-xl border border-flame-500/40 bg-flame-500/10 px-4 py-3 text-sm text-flame-300">
          Saved “{saved}”.
        </p>
      ) : null}

      {deleted ? (
        <p className="rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm text-ink-300">
          Deleted “{deleted}”.
        </p>
      ) : null}

      {settings.length === 0 ? (
        <EmptyState message="No settings stored yet — use the form below to add one." />
      ) : (
        <div className="space-y-6">
          {settings.map((setting) => (
            <JsonSettingForm key={setting.key} settingKey={setting.key} value={setting.value} />
          ))}
        </div>
      )}

      <Card
        title="Add a setting"
        description='Keys are read from code with getSetting("your-key").'
      >
        <form action={createSettingAction} className="space-y-4">
          <Field label="Key" hint="Lowercase, no spaces — e.g. whatsapp_message">
            <input
              name="key"
              required
              placeholder="whatsapp_message"
              className="w-full rounded-xl border border-ink-700 bg-ink-900 px-4 py-3 font-mono text-sm text-white outline-none placeholder:text-ink-500 focus:border-flame-500"
            />
          </Field>

          <Field
            label="Value (JSON)"
            hint='Must be valid JSON, e.g. {"en":"Hello","ru":"Привет"}'
          >
            <textarea
              name="value"
              required
              rows={4}
              spellCheck={false}
              defaultValue={'{\n  "en": "",\n  "ru": ""\n}'}
              className="w-full resize-y rounded-xl border border-ink-700 bg-ink-900 px-4 py-3 font-mono text-sm text-white outline-none focus:border-flame-500"
            />
          </Field>

          <SubmitButton>Create setting</SubmitButton>
        </form>
      </Card>

      <PasswordForm />
    </div>
  )
}