import { redirect } from 'next/navigation'
import { getSession } from '@/lib/admin-auth'
import LoginForm from './_components/LoginForm'

export default async function AdminLoginPage() {
  if (await getSession()) redirect('/admin')

  return (
    <div className="grid min-h-screen place-items-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <span className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-flame-500 font-display text-3xl text-ink-950">
            E
          </span>
          <h1 className="font-display text-4xl tracking-wide text-white uppercase">
            EVE TOUR
          </h1>
          <p className="mt-2 text-sm text-ink-400">Content management</p>
        </div>

        <div className="rounded-3xl border border-ink-800 bg-ink-900/60 p-7">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-ink-500">
          Sessions last 8 hours. Rotate the credentials before going live.
        </p>
      </div>
    </div>
  )
}