import path from 'node:path'

/**
 * Where admin-uploaded images live.
 *
 * Deliberately outside `public/`: Next.js snapshots the public folder when it
 * builds, so a production server (`next start`) never picks up files added
 * afterwards — an image uploaded through the admin would 404 until the app was
 * rebuilt. Serving them from a route handler instead means an upload is live
 * immediately.
 *
 * The public URL is still `/media/uploads/<name>`, so content fields keep
 * storing a plain path string and nothing else in the app changes.
 */
export const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

/** The URL path an uploaded file is stored and served under. */
export function publicPathFor(filename: string): string {
  return `/media/uploads/${filename}`
}

/**
 * Resolves a filename inside the upload directory, refusing anything that
 * would escape it (`..`, absolute paths, nested separators).
 */
export function resolveUpload(filename: string): string {
  const base = path.resolve(UPLOAD_DIR)
  const resolved = path.resolve(base, path.basename(filename))
  if (!resolved.startsWith(base + path.sep)) {
    throw new Error('Refusing to write outside the upload directory.')
  }
  return resolved
}

/** Content types for the formats the upload endpoint accepts. */
export const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
}