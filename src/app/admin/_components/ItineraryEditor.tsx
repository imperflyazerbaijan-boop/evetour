'use client'

import * as React from 'react'
import { Card } from './ui'

export type ItineraryRow = {
  day?: string
  title: { en: string; ru: string }
  desc: { en: string; ru: string }
  image?: string
}

export const blankItineraryRow = (): ItineraryRow => ({
  day: '',
  title: { en: '', ru: '' },
  desc: { en: '', ru: '' },
  image: '',
})

const inputCls =
  'w-full rounded-xl border border-ink-700 bg-ink-900 px-3 py-2.5 text-sm text-white outline-none focus:border-flame-500'
const labelCls = 'mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-ink-300'

/** One editable stop. `pos` is its position, which is what names the fields. */
function StopRow({
  pos,
  row,
  onChange,
  onRemove,
  onMove,
  isFirst,
  isLast,
  isOnly,
}: {
  pos: number
  row: ItineraryRow
  onChange: (patch: Partial<ItineraryRow>) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
  isFirst: boolean
  isLast: boolean
  isOnly: boolean
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-ink-800 bg-ink-950/40 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-400">
          Stop {pos + 1}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={isFirst}
            aria-label="Move up"
            className="rounded-lg border border-ink-700 px-2.5 py-1 text-xs text-ink-300 disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={isLast}
            aria-label="Move down"
            className="rounded-lg border border-ink-700 px-2.5 py-1 text-xs text-ink-300 disabled:opacity-30"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={isOnly}
            className="rounded-lg border border-red-500/40 px-2.5 py-1 text-xs text-red-300 disabled:opacity-30"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[90px_1fr]">
        <div>
          <label className={labelCls} htmlFor={`itDay${pos}`}>
            Day
          </label>
          <input
            id={`itDay${pos}`}
            name={`itDay${pos}`}
            defaultValue={row.day ?? ''}
            placeholder="1"
            className={inputCls}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor={`itTitleEn${pos}`}>
              Title EN
            </label>
            <input
              id={`itTitleEn${pos}`}
              name={`itTitleEn${pos}`}
              defaultValue={row.title.en}
              onChange={(e) => onChange({ title: { ...row.title, en: e.target.value } })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor={`itTitleRu${pos}`}>
              Title RU
            </label>
            <input
              id={`itTitleRu${pos}`}
              name={`itTitleRu${pos}`}
              defaultValue={row.title.ru}
              onChange={(e) => onChange({ title: { ...row.title, ru: e.target.value } })}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor={`itDescEn${pos}`}>
            Description EN
          </label>
          <textarea
            id={`itDescEn${pos}`}
            name={`itDescEn${pos}`}
            defaultValue={row.desc.en}
            rows={3}
            onChange={(e) => onChange({ desc: { ...row.desc, en: e.target.value } })}
            className={`${inputCls} resize-y`}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor={`itDescRu${pos}`}>
            Description RU
          </label>
          <textarea
            id={`itDescRu${pos}`}
            name={`itDescRu${pos}`}
            defaultValue={row.desc.ru}
            rows={3}
            onChange={(e) => onChange({ desc: { ...row.desc, ru: e.target.value } })}
            className={`${inputCls} resize-y`}
          />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor={`itImage${pos}`}>
          Photo path
        </label>
        <input
          id={`itImage${pos}`}
          name={`itImage${pos}`}
          defaultValue={row.image ?? ''}
          placeholder="/media/quba-mountains.jpg"
          onChange={(e) => onChange({ image: e.target.value })}
          className={`${inputCls} font-mono text-xs`}
        />
      </div>
    </div>
  )
}

/**
 * Repeating-row editor for a tour's day-by-day plan.
 *
 * Each row posts indexed field names (`itTitleEn0`, `itDescRu1`, …) which
 * content-actions.ts pairs back into the stored JSON array. Rows carry a
 * client-side id rather than using their index as the React key, so removing
 * a middle row does not shuffle the values of the rows below it.
 */
export default function ItineraryEditor({ rows }: { rows: ItineraryRow[] }) {
  const [items, setItems] = React.useState<ItineraryRow[]>(() =>
    rows.length > 0 ? rows : [blankItineraryRow()],
  )
  const [ids, setIds] = React.useState<number[]>(() => rows.map((_, i) => i))
  const nextId = React.useRef(rows.length)

  const update = (pos: number, patch: Partial<ItineraryRow>) =>
    setItems((current) =>
      current.map((row, i) => (i === pos ? { ...row, ...patch } : row)),
    )

  const add = () => {
    setItems((c) => [...c, blankItineraryRow()])
    setIds((c) => [...c, nextId.current++])
  }

  const remove = (pos: number) => {
    setItems((c) => c.filter((_, i) => i !== pos))
    setIds((c) => c.filter((_, i) => i !== pos))
  }

  const move = (pos: number, dir: -1 | 1) => {
    const to = pos + dir
    if (to < 0 || to >= items.length) return
    const swap = <T,>(a: T[], x: number, y: number) => {
      const next = [...a]
      const tmp = next[x]
      next[x] = next[y]
      next[y] = tmp
      return next
    }
    setItems((c) => swap(c, pos, to))
    setIds((c) => swap(c, pos, to))
  }

  return (
    <Card
      title="Day-by-day plan"
      description='Shown on the tour page under "Itinerary". An empty row is skipped.'
    >
      <div className="space-y-6">
        {items.map((row, i) => (
          <StopRow
            key={ids[i]}
            pos={i}
            row={row}
            onChange={(patch) => update(i, patch)}
            onRemove={() => remove(i)}
            onMove={(dir) => move(i, dir)}
            isFirst={i === 0}
            isLast={i === items.length - 1}
            isOnly={items.length === 1}
          />
        ))}

        <button
          type="button"
          onClick={add}
          className="rounded-xl border border-dashed border-ink-600 px-4 py-3 text-sm font-semibold text-ink-300 transition-colors hover:border-flame-500 hover:text-white"
        >
          + Add a stop
        </button>
      </div>
    </Card>
  )
}
