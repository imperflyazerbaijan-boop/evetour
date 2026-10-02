import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const Schema = z.object({
  name: z.string().trim().min(2).max(120),
  contact: z.string().trim().min(3).max(200),
  tour: z.string().trim().max(200).optional(),
  text: z.string().trim().min(5).max(4000),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
  }

  try {
    await prisma.message.create({ data: parsed.data })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to save message:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
