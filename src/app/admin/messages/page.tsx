import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/admin-auth'
import { deleteMessageAction, readMessageAction } from '../actions'
import { DeleteButton, RowSubmit } from '../_components/ui'
import { EmptyState } from '../_components/fields'

export default async function AdminMessagesPage() {
  await requireSession()

  const messages = await prisma.message.findMany({
    orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
  })

  const unread = messages.filter((m) => !m.isRead).length

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-5xl tracking-wide text-white uppercase">
          Messages
        </h1>
        <p className="mt-2 text-sm text-ink-400">
          {messages.length} total{unread ? ` · ${unread} unread` : ''} — from the contact form.
        </p>
      </header>

      {messages.length === 0 ? (
        <EmptyState message="No messages yet." />
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`rounded-2xl border bg-ink-900/60 p-5 ${
                m.isRead ? 'border-ink-800' : 'border-flame-500/40'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-white">
                    {m.name}
                    {!m.isRead ? (
                      <span className="ml-2 rounded-full bg-flame-500 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-ink-950">
                        New
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-sm text-brand-300">{m.contact}</p>
                  {m.tour ? (
                    <p className="mt-0.5 text-xs text-ink-400">Tour: {m.tour}</p>
                  ) : null}
                </div>

                <time className="text-xs text-ink-500">
                  {m.createdAt.toLocaleString('en-GB')}
                </time>
              </div>

              <p className="mt-4 text-ink-200">{m.text}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <form action={readMessageAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="isRead" value={m.isRead ? '0' : '1'} />
                  <RowSubmit>{m.isRead ? 'Mark unread' : 'Mark read'}</RowSubmit>
                </form>
                <form action={deleteMessageAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <DeleteButton confirmText={m.name} />
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}