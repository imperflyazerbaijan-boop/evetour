'use client'

import { useActionState } from 'react'
import { loginAction } from '../../actions'
import { Field, SubmitButton, TextInput } from '../../_components/ui'

export default function LoginForm() {
  const [state, formAction] = useActionState(loginAction, null)

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Email">
        <TextInput
          name="email"
          type="email"
          autoComplete="username"
          required
          placeholder="admin@evetour.az"
        />
      </Field>

      <Field label="Password">
        <TextInput
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••••"
        />
      </Field>

      {state?.error ? (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}

      <SubmitButton>Sign in</SubmitButton>
    </form>
  )
}