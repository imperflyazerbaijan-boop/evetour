/**
 * Downloads openly-licensed photos from Wikimedia Commons into /public/media.
 * Run with: npx tsx scripts/fetch-images.ts
 *
 * These are free-to-use images (CC / public domain) used as placeholders and
 * stand-ins for the client's own photography. Replace any file in
 * /public/media with a real photo of the same name at any time.
 */
import { mkdir, writeFile, access } from 'node:fs/promises'
import path from 'node:path'

const OUT = path.join(process.cwd(), 'public', 'media')

type Wanted = {
  file: string
  /** Commons file title, used to resolve a download URL. */
  title: string
}

const WANTED: Wanted[] = [
  { file: 'baku-flame-towers-night.jpg', title: 'File:BAKU AT NIGHT .RED TOWERS.באקו בלילה מגדלים באדום.jpg' },
  { file: 'baku-flame-towers-boulevard.jpg', title: 'File:Flame towers from Baku boulevard.JPG' },
  { file: 'baku-skyline.jpg', title: 'File:Baku Skyline (221090125).jpeg' },
  { file: 'baku-panorama.jpg', title: 'File:Baku 1.JPG' },
  { file: 'baku-shirvanshahs.jpg', title: 'File:Shirvanshahs Palace Mosque 01.jpg' },
  { file: 'baku-night-blue.jpg', title: 'File:BAKU AT NIGHT IN BLUE.באקו בלליה.מגדלי להבה בכחול.jpg' },
  { file: 'baku-botanical-garden.jpg', title: 'File:Baku Botanical Garden 13.jpg' },
  { file: 'gobustan-mud-volcanoes.jpg', title: 'File:Gobustan mud volcanoes 02.jpg' },
  { file: 'gobustan-mud-volcanoes-2.jpg', title: 'File:Gobustan mud volcanoes 06.jpg' },
  { file: 'sheki-old-town.jpg', title: 'File:Old Town Street Scene - Sheki - Azerbaijan - 01 (18079265449).jpg' },
  { file: 'sheki-old-town-2.jpg', title: 'File:Old Town Street Scene - Sheki - Azerbaijan - 02 (17642832214).jpg' },
  { file: 'quba-mountains.jpg', title: 'File:Qusar, Azerbaijan (2).jpg' },
  { file: 'quba-shahdag.jpg', title: 'File:Avaz & Selcan best friends, Quba- Shahdag (Az e-citizen).JPG' },
  { file: 'absheron-caspian.jpg', title: 'File:Baku, Absheron Peninsula, Caspian Sea, Azerbaijan - June 15th, 2019 (48125098627) (cropped to Boyuk Zira to Qum Island).jpg' },
  { file: 'drive-to-baku.jpg', title: 'File:Drive to Baku (3847042590).jpg' },
  { file: 'sheki-to-baku-road.jpg', title: 'File:View somewhere between Sheki and Baku, Azerbaijan.jpg' },
  { file: 'paragliding.jpg', title: 'File:Parapente - 166.jpg' },
]

const UA = { 'User-Agent': 'EVE-TOUR-site-builder/1.0 (site build script)' }
const TARGET_W = 1920

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

type ImageInfo = { url: string; thumburl?: string; width: number; height: number }

/**
 * Wikimedia rejects a thumbnail request wider than the original, and its
 * thumb path is not always `<dir>/<w>px-<name>`. Saf thumbs are therefore
 * unreliable here. We ask the API for a real thumburl at the exact width we
 * want, retrying with backoff when we get rate limited.
 */
async function resolve(title: string, width: number): Promise<string | null> {
  const api =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2' +
    `&titles=${encodeURIComponent(title)}` +
    `&prop=imageinfo&iiprop=url|size&iiurlwidth=${width}`

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(api, { headers: UA })
      if (res.status === 429) {
        const wait = attempt * 2000
        console.log(`      rate limited, waiting ${wait}ms…`)
        await sleep(wait)
        continue
      }
      if (!res.ok) return null
      const json = (await res.json()) as {
        query?: {
          pages?: {
            imageinfo?: { thumburl?: string; url: string; width: number }[]
          }[]
        }
      }
      const info = json.query?.pages?.[0]?.imageinfo?.[0]
      if (!info) return null
      // Prefer the API-generated thumbnail; fall back to the original.
      return info.thumburl ?? info.url
    } catch {
      await sleep(attempt * 1000)
    }
  }
  return null
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const credits: Record<string, string> = {}
  let ok = 0

  for (const item of WANTED) {
    const dest = path.join(OUT, item.file)
    // Skip if already downloaded
    try {
      await access(dest)
      console.log(`skip  ${item.file}`)
      ok++
      continue
    } catch {
      /* not downloaded yet */
    }

    const downloadUrl = await resolve(item.title, TARGET_W)
    if (!downloadUrl) {
      console.log(`MISS  ${item.file} — could not resolve`)
      continue
    }

    try {
      const res = await fetch(downloadUrl, { headers: UA })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 10_000) throw new Error('suspiciously small response')
      await writeFile(dest, buf)
      credits[item.file] = item.title.replace(/^File:/, '')
      console.log(
        `ok    ${item.file}  (${Math.round(buf.length / 1024)} KB)`,
      )
      ok++
    } catch (err) {
      console.log(`FAIL  ${item.file} — ${(err as Error).message}`)
    }

    await sleep(600)
  }

  await writeFile(
    path.join(OUT, 'CREDITS.md'),
    '# Image credits\n\n' +
      'All images are free-license photographs from Wikimedia Commons,\n' +
      'used as placeholders. Replace them with your own photos at any time —\n' +
      'just overwrite the file in `public/media` keeping the same name.\n\n' +
      Object.entries(credits)
        .map(([file, url]) => `- \`${file}\` — ${url}`)
        .join('\n') +
      '\n',
    'utf8',
  )

  console.log(`\nDone: ${ok}/${WANTED.length} images in public/media`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
