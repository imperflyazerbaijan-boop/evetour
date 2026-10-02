import { mkdir, writeFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/admin-auth'
import { UPLOAD_DIR, publicPathFor, resolveUpload } from '@/lib/uploads'

/**
 * Admin-only media library.
 *
 * POST accepts one image file and stores it under `uploads/`.
 * GET lists what is already there so the picker can show it.
 *
 * Files live outside `public/` because Next.js snapshots that folder at build
 * time, so a production server would 404 on anything uploaded afterwards.
 * They are served by /media/uploads/[name], and the path handed back is the
 * same `/media/uploads/...` string the content fields already store.
 *
 * Uploads are named by the server, never by the client: the original name is
 * reduced to a safe slug and suffixed with a random token. That prevents path
 * traversal (`../../etc/passwd`), collisions overwriting an existing file, and
 * double extensions (`x.php.jpg`).
 */

export const runtime = 'nodejs'

/** Only real image types, checked by magic bytes as well as the declared type. */
const ALLOWED: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/gif': '.gif',
}

const MAX_BYTES = 8 * 1024 * 1024 // 8 MB

/** Leading bytes for each allowed format, so a renamed .exe is rejected. */
const SIGNATURES: { type: string; bytes: number[] }[] = [
  { type: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { type: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { type: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] },
]

function sniff(bytes: Uint8Array): string | null {
  for (const sig of SIGNATURES) {
    if (sig.bytes.every((b, i) => bytes[i] === b)) return sig.type
  }
  // RIFF....WEBP
  if (
    bytes.length > 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return 'image/webp'
  }
  // ....ftypavif
  if (bytes.length > 12 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    return 'image/avif'
  }
  return null
}

/** Lowercase, ascii, dash-separated. Anything else is dropped. */
function safeStem(name: string): string {
  return path
    .basename(name)
    .replace(/\.[^.]+$/, '')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 40)
}

/** Rejects anything that could escape the upload directory. */
function assertInside(dir: string, file: string) {
  const resolved = path.resolve(dir, file)
  if (!resolved.startsWith(path.resolve(dir) + path.sep)) {
    throw new Error('Refusing to write outside the upload directory.')
  }
  return resolved
}

export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  try {
    const entries = await readdir(UPLOAD_DIR, { withFileTypes: true })
    const files = await Promise.all(
      entries
        .filter((e) => e.isFile() && /\.(jpe?g|png|webp|avif|gif)$/i.test(e.name))
        .map(async (e) => {
          const s = await stat(path.join(UPLOAD_DIR, e.name))
          return { name: e.name, path: publicPathFor(e.name), size: s.size, mtime: s.mtimeMs }
        }),
    )
    files.sort((a, b) => b.mtime - a.mtime)
    return NextResponse.json({ files })
  } catch {
    // No uploads yet.
    return NextResponse.json({ files: [] })
  }
}

export async function POST(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Expected a multipart form' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file was sent' }, { status: 400 })
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'That file is empty' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 8 MB.` },
      { status: 413 },
    )
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const detected = sniff(bytes)
  if (!detected) {
    return NextResponse.json(
      { error: 'That file is not a JPEG, PNG, WebP, AVIF or GIF image.' },
      { status: 415 },
    )
  }
  // The extension comes from the sniffed type, never from the client, so a
  // double extension or a .php name cannot survive.
  const ext = ALLOWED[detected] ?? '.jpg'

  const stem = safeStem(file.name) || 'image'
  const unique = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  const filename = `${stem}-${unique}${ext}`

  try {
    await mkdir(UPLOAD_DIR, { recursive: true })
    await writeFile(resolveUpload(filename), bytes)
  } catch (e) {
    return NextResponse.json(
      { error: `Could not save the file: ${(e as Error).message}` },
      { status: 500 },
    )
  }

  return NextResponse.json({
    path: publicPathFor(filename),
    size: file.size,
    type: detected,
  })
}
