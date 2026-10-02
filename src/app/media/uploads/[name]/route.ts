import { readFile } from 'node:fs/promises'
import { extname } from 'node:path'
import { NextResponse } from 'next/server'
import { CONTENT_TYPES, resolveUpload } from '@/lib/uploads'

/**
 * Serves admin-uploaded images.
 *
 * These are public by design — they appear on the public site — but they are
 * stored outside `public/`, because Next.js snapshots that folder when it
 * builds and a production server would otherwise 404 on anything uploaded
 * after the build.
 *
 * Reads are restricted to plain image extensions and the name is resolved
 * through `resolveUpload`, which refuses anything that escapes the directory.
 */
export const runtime = 'nodejs'

const ALLOWED_EXT = /\.(jpe?g|png|webp|avif|gif)$/i

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params

  if (!ALLOWED_EXT.test(name)) {
    return new NextResponse('Not found', { status: 404 })
  }

  let file: string
  try {
    file = resolveUpload(decodeURIComponent(name))
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }

  let data: Buffer
  try {
    data = await readFile(file)
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }

  const type = CONTENT_TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream'
  return new NextResponse(new Uint8Array(data), {
    headers: {
      'Content-Type': type,
      'Content-Length': String(data.byteLength),
      // The name is already randomised, so the URL is safe to cache hard.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}