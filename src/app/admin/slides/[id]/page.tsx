import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/admin-auth'
import { deleteSlideAction } from '../../content-actions'
import { slideToFormValues } from '../../_lib/mappers'
import SlideForm from '../_components/SlideForm'
import { DeleteButton, RowSubmit } from '../../_components/ui'

export default async function EditSlidePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireSession()
  const { id } = await params

  const slide = await prisma.heroSlide.findUnique({ where: { id } })
  if (!slide) notFound()

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/slides" className="text-sm text-ink-400 hover:text-white">
            ← Hero slides
          </Link>
          <h1 className="mt-2 font-display text-5xl tracking-wide text-white uppercase">
            Edit slide
          </h1>
        </div>

        <form action={deleteSlideAction}>
          <input type="hidden" name="id" value={slide.id} />
          <DeleteButton confirmText={slide.id} />
        </form>
      </header>

      <SlideForm values={slideToFormValues(slide)} />
    </div>
  )
}