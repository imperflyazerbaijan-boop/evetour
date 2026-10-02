'use client'

import { useActionState } from 'react'
import { changePasswordAction, type PasswordState } from '../../actions'
import { Card, Field, SubmitButton, TextInput } from '../../_components/ui'

export default function PasswordForm() {
  const [state, formAction] = useActionState<PasswordState | null, FormData>(
    changePasswordAction,
    null,
  )

  return (
    <Card
      title="Password"
      description="Used to sign in to this panel. Rotate it before going live."
    >
      <form action={formAction} className="max-w-md space-y-5">
        <Field label="Current password">
          <TextInput name="current" type="password" autoComplete="current-password" required />
        </Field>

        <Field label="New password" hint="At least 10 characters.">
          <TextInput name="next" type="password" autoComplete="new-password" required minLength={10} />
        </Field>

        {state?.error ? (
          <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {state.error}
          </p>
        ) : null}
        {state?.ok ? (
          <p className="rounded-xl border border-flame-500/40 bg-flame-500/10 px-4 py-3 text-sm text-flame-300">
            Password updated.
          </p>
        ) : null}

        <SubmitButton>Update password</SubmitButton>
      </form>
    </Card>
  )
}