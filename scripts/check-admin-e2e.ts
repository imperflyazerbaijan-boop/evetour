/**
 * End-to-end check of the admin panel against a running dev server.
 * Logs in, walks every admin route, then creates + deletes a review.
 *
 * Run:  npx tsx scripts/check-admin-e2e.ts
 */
import 'dotenv/config'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma/client'
import { parseItinerary } from '../src/lib/i18n-fields'
import { repairJson } from '../src/lib/mojibake'

const BASE = process.env.ADMIN_TEST_BASE ?? 'http://localhost:3000'
const EMAIL = 'admin@evetour.az'
const PASSWORD = process.env.ADMIN_PASSWORD ?? ''

const url = process.env.DATABASE_URL ?? 'file:./dev.db'
const file = url.startsWith('file:') ? url.slice(5) : url
const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: file }),
})

let cookie = ''
let failures = 0

function check(label: string, ok: boolean, extra = '') {
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${extra ? ` — ${extra}` : ''}`)
}

/** Keeps hold of the session cookie between requests. */
function captureCookie(res: Response) {
  const cookies = res.headers.getSetCookie?.() ?? []
  for (const raw of cookies) {
    if (raw.startsWith('eve_admin_session=')) {
      cookie = raw.split(';')[0]
    }
  }
}

async function get(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    redirect: 'manual',
    headers: cookie ? { cookie } : {},
  })
  captureCookie(res)
  const body = res.headers.get('content-type')?.includes('text')
    ? await res.text()
    : ''
  return { status: res.status, location: res.headers.get('location'), body }
}

/**
 * Pulls the hidden server-action fields for one form out of rendered HTML.
 * React emits either `$ACTION_REF_n` or `$ACTION_ID_<hash>`, and neither
 * carries a value attribute, so the value is optional. Each form on a page has
 * its own fields, so the caller must scope the HTML to a single <form> block.
 */
function actionFields(html: string) {
  const fields: Record<string, string> = {}
  const re = /<input[^>]*name="(\$ACTION[^"]*)"[^>]*>/g
  for (const m of html.matchAll(re)) {
    const tag = m[0]
    const value = /value="([^"]*)"/.exec(tag)?.[1] ?? ''
    fields[m[1]] = value
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&amp;/g, '&')
  }
  return fields
}

/**
 * Returns the action fields of the form that carries `marker` (e.g. the
 * hidden input `value="about"`), so a page with one form per setting posts
 * the right action rather than the first one on the page.
 */
function actionFieldsForForm(html: string, marker: string) {
  const forms = html.split('<form').slice(1)
  for (const form of forms) {
    if (form.includes(marker)) return actionFields(form)
  }
  return {}
}

/**
 * Pulls every named <input>/<textarea> value out of the form carrying
 * `marker`, so a save posts the real content (slug, titles, …) alongside the
 * action fields. Without this the server action sees empty required fields
 * and rejects the save.
 */
function formInputs(html: string, marker: string) {
  const out: Record<string, string> = {}
  for (const form of html.split('<form').slice(1)) {
    if (!form.includes(marker)) continue
    const scope = form.split('</form>')[0]
    for (const m of scope.matchAll(/<(?:input|textarea)[^>]*>/g)) {
      const tag = m[0]
      const name = /\bname="([^"]+)"/.exec(tag)?.[1]
      if (!name) continue
      const value = /\bvalue="([^"]*)"/.exec(tag)?.[1] ?? ''
      out[name] = value
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
    }
    break
  }
  return out
}

async function postForm(path: string, data: Record<string, string>) {
  const body = new FormData()
  for (const [k, v] of Object.entries(data)) body.append(k, v)

  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    redirect: 'manual',
    headers: cookie ? { cookie } : {},
    body,
  })
  const text = await res.text()
  captureCookie(res)

  if (process.env.ADMIN_TEST_DEBUG) {
    console.log(`\nPOST ${path} → ${res.status}`)
    console.log('  set-cookie:', JSON.stringify(res.headers.getSetCookie?.() ?? null))
  }
  return { status: res.status, location: res.headers.get('location'), text }
}

async function main() {
  if (!PASSWORD) {
    console.error(
      'ADMIN_PASSWORD is not set.\n' +
        'The e2e check needs it to sign in. Set it in .env — it must match the\n' +
        'password in the database (run `npm run db:seed` after changing it).',
    )
    process.exit(1)
  }
  console.log(`Testing ${BASE}\n`)

  // 1. Guarded while signed out
  const anon = await get('/admin')
  check(
    '/admin redirects when signed out',
    anon.status === 307 && Boolean(anon.location?.includes('/admin/login')),
    `${anon.status} → ${anon.location}`,
  )

  // 2. Log in
  const loginPage = await get('/admin/login')
  const fields = actionFields(loginPage.body)
  if (process.env.ADMIN_TEST_DEBUG) {
    console.log('extracted fields:', JSON.stringify(fields, null, 2))
  }
  const login = await postForm('/admin/login', {
    ...fields,
    email: EMAIL,
    password: PASSWORD,
  })
  check(
    'login succeeds and redirects',
    login.status === 303 && login.location === '/admin',
    `${login.status} → ${login.location}`,
  )
  check('session cookie issued', cookie.includes('eve_admin_session'), cookie)

  // 3. Every admin route renders
  const routes = [
    '/admin',
    '/admin/tours',
    '/admin/tours/new',
    '/admin/places',
    '/admin/places/new',
    '/admin/reviews',
    '/admin/reviews/new',
    '/admin/slides',
    '/admin/slides/new',
    '/admin/messages',
    '/admin/settings',
  ]
  for (const route of routes) {
    const res = await get(route)
    check(`GET ${route}`, res.status === 200, `status ${res.status}`)
  }

  // 4. Edit pages for real rows
  const [tour, place, review, slide] = await Promise.all([
    prisma.tour.findFirst(),
    prisma.place.findFirst(),
    prisma.review.findFirst(),
    prisma.heroSlide.findFirst(),
  ])
  for (const [name, row] of [
    ['tour', tour],
    ['place', place],
    ['review', review],
    ['slide', slide],
  ] as const) {
    if (!row) {
      check(`${name} edit page`, false, 'no seeded row found')
      continue
    }
    const res = await get(`/admin/${name}s/${row.id}`)
    check(`/admin/${name}s/[id]`, res.status === 200, `status ${res.status}`)
  }

  // 5. Create a review through the real server action
  const newPage = await get('/admin/reviews/new')
  const reviewFields = actionFields(newPage.body)
  const created = await postForm('/admin/reviews/new', {
    ...reviewFields,
    author: 'Automated check',
    country: '',
    rating: '5',
    textEn: 'Temporary review created by the end-to-end check.',
    textRu: 'Временный отзыв, созданный автоматической проверкой.',
    tourTitleEn: 'Check',
    tourTitleRu: 'Проверка',
    image: '',
    isApproved: '1',
    isPublished: '1',
    sortOrder: '999',
  })
  check(
    'create review redirects',
    created.status === 303,
    `${created.status} → ${created.location}`,
  )

  const made = await prisma.review.findFirst({
    where: { author: 'Automated check' },
  })
  check('review row written', Boolean(made))
  if (made) {
    const text = JSON.parse(made.text) as { en: string; ru: string }
    check('EN text stored', text.en.includes('end-to-end check'))
    check('RU text stored', text.ru.includes('автоматической проверкой'))
    check('isApproved default', made.isApproved && made.isPublished)

    await prisma.review.delete({ where: { id: made.id } })
    const gone = await prisma.review.findUnique({ where: { id: made.id } })
    check('review cleaned up', gone === null)
  }

  // 6. Settings round-trip. `about` and `brand` hold nested JSON, so a
  //    flat bilingual form would read them as empty and wipe them on save.
  //    Post the stored value back verbatim and confirm nothing is lost.
  const before = await prisma.setting.findUnique({ where: { key: 'about' } })
  check('about setting exists before save', before !== null)

  const settingsPage = await get('/admin/settings')
  // A <textarea> carries its value as a child node, not a value attribute,
  // and React only serialises it after hydration — so assert on the form
  // structure and the key, and prove the round-trip by posting the stored
  // value back and reading the database.
  check(
    'settings page renders a JSON editor per key',
    settingsPage.status === 200 &&
      settingsPage.body.includes('name="value"') &&
      settingsPage.body.includes('value="about"'),
    `status ${settingsPage.status}`,
  )

  if (before) {
    const parsed = JSON.parse(before.value)
    const edited = JSON.stringify({ ...parsed, probe: 'e2e' })
    // Scope to the form whose hidden key is "about" — the page also holds a
    // "brand" form and a delete form, and posting the wrong one would not save.
    const fields2 = actionFieldsForForm(settingsPage.body, 'value="about"')
    check('found the about form action', Object.keys(fields2).length > 0)
    const saved = await postForm('/admin/settings', {
      ...fields2,
      key: 'about',
      value: edited,
    })
    check('about save redirects', saved.status === 303, `${saved.status} → ${saved.location}`)

    const after2 = await prisma.setting.findUnique({ where: { key: 'about' } })
    const round = after2 ? (JSON.parse(after2.value) as Record<string, unknown>) : {}
    check('nested fields survive the save', round.author !== undefined && round.body !== undefined)
    check('saved probe is present', round.probe === 'e2e')

    // Restore exactly what was there before the check.
    await prisma.setting.update({ where: { key: 'about' }, data: { value: before.value } })
    const restored = await prisma.setting.findUnique({ where: { key: 'about' } })
    check(
      'about restored to original',
      restored?.value === before.value,
    )
  }

  // 7. Invalid JSON must be rejected, not stored.
  const fields3 = actionFieldsForForm(settingsPage.body, 'value="about"')
  const bad = await postForm('/admin/settings', {
    ...fields3,
    key: 'about',
    value: '{ not valid json',
  })
  const afterBad = await prisma.setting.findUnique({ where: { key: 'about' } })
  check(
    'invalid JSON is rejected',
    bad.status !== 303 || (afterBad?.value !== '{ not valid json'),
    `status ${bad.status}`,
  )
  if (before) {
    check('about untouched after invalid JSON', afterBad?.value === before.value)
  }

  // 9. Media upload. The endpoint must reject a non-image, and must store a
  //    real one under a sanitised, non-colliding name.
  const pngBytes = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  )

  const form = new FormData()
  form.append('file', new Blob([pngBytes], { type: 'image/png' }), 'My Holiday.PNG')
  const uploaded = await fetch(`${BASE}/api/admin/media`, {
    method: 'POST',
    headers: cookie ? { cookie } : {},
    body: form,
  })
  const uploadJson = (await uploaded.json()) as { path?: string; error?: string }
  check('upload accepts a real PNG', uploaded.status === 200 && Boolean(uploadJson.path), JSON.stringify(uploadJson))
  check(
    'uploaded name is sanitised',
    typeof uploadJson.path === 'string' &&
      uploadJson.path.startsWith('/media/uploads/') &&
      uploadJson.path.endsWith('.png') &&
      !uploadJson.path.includes('My Holiday'),
    uploadJson.path ?? 'none',
  )

  if (uploadJson.path) {
    const served = await fetch(`${BASE}${uploadJson.path}`)
    check('uploaded file is served', served.status === 200, `status ${served.status}`)

    const listing = await fetch(`${BASE}/api/admin/media`, {
      headers: cookie ? { cookie } : {},
    })
    const listJson = (await listing.json()) as { files?: { path: string }[] }
    check(
      'upload appears in the library',
      (listJson.files ?? []).some((f) => f.path === uploadJson.path),
    )

    // Uploads live outside public/ (see src/lib/uploads.ts), so clean up there.
    await rm(join(process.cwd(), 'uploads', uploadJson.path.split('/').pop()!), {
      force: true,
    })
  }

  // A renamed script must not be stored.
  const fakeForm = new FormData()
  fakeForm.append(
    'file',
    new Blob([Buffer.from('<?php echo "x"; ?>')], { type: 'image/png' }),
    'evil.php.png',
  )
  const fake = await fetch(`${BASE}/api/admin/media`, {
    method: 'POST',
    headers: cookie ? { cookie } : {},
    body: fakeForm,
  })
  check('non-image upload is rejected', fake.status === 415, `status ${fake.status}`)

  // Unauthenticated uploads must be refused.
  const savedForAnon = cookie
  cookie = ''
  const anonForm = new FormData()
  anonForm.append('file', new Blob([pngBytes], { type: 'image/png' }), 'anon.png')
  const anonUpload = await fetch(`${BASE}/api/admin/media`, { method: 'POST', body: anonForm })
  check('unauthenticated upload is refused', anonUpload.status === 401, `status ${anonUpload.status}`)
  const anonList = await fetch(`${BASE}/api/admin/media`)
  check('unauthenticated listing is refused', anonList.status === 401, `status ${anonList.status}`)
  cookie = savedForAnon

  // 10. Deleting requires a matching confirmation.
  const throwaway = await prisma.review.create({
    data: {
      author: 'Delete Guard Check',
      rating: 5,
      text: '{}',
      tourTitle: '{}',
      isApproved: true,
      isPublished: true,
    },
  })
  const reviewsList = await get('/admin/reviews')
  const delFields = actionFieldsForForm(
    reviewsList.body,
    `value="${throwaway.id}"`,
  )
  const noConfirm = await postForm('/admin/reviews', {
    ...delFields,
    id: throwaway.id,
  })
  const stillThere = await prisma.review.findUnique({ where: { id: throwaway.id } })
  check('delete without confirmation is refused', stillThere !== null, `status ${noConfirm.status}`)

  const wrongConfirm = await postForm('/admin/reviews', {
    ...delFields,
    id: throwaway.id,
    confirm: 'something-else',
  })
  const stillThere2 = await prisma.review.findUnique({ where: { id: throwaway.id } })
  check('delete with wrong confirmation is refused', stillThere2 !== null, `status ${wrongConfirm.status}`)

  await prisma.review.delete({ where: { id: throwaway.id } }).catch(() => {})
  const gone2 = await prisma.review.findUnique({ where: { id: throwaway.id } })
  check('guard test row cleaned up', gone2 === null)

  // 11. Pagination: page 1 and page 2 must show different reviews, and an
  //     out-of-range page must clamp rather than come back empty.
  const p1 = await get('/admin/reviews')
  const p2 = await get('/admin/reviews?page=2')
  const idsOf = (html: string) =>
    new Set([...html.matchAll(/name="id" value="([a-z0-9]+)"/g)].map((m) => m[1]))
  const ids1 = idsOf(p1.body)
  const ids2 = idsOf(p2.body)
  check('page 1 shows reviews', ids1.size > 0, `${ids1.size} ids`)
  check('page 2 shows reviews', ids2.size > 0, `${ids2.size} ids`)
  check(
    'pages do not overlap',
    [...ids1].every((id) => !ids2.has(id)),
  )
  check('page 2 is labelled', p2.body.includes('page 2 of'), 'no page label')

  const p999 = await get('/admin/reviews?page=999')
  check('out-of-range page clamps', p999.status === 200, `status ${p999.status}`)
  const clamped = idsOf(p999.body)
  check(
    'clamped page is not empty',
    clamped.size > 0,
    `${clamped.size} ids on ?page=999`,
  )

  // 12. Itinerary round-trip. The seeded rows store title/desc as JSON strings
  //     while the form writes objects; both must survive a save, or opening
  //     the editor would blank the content and a save would erase it.
  const itinTour = await prisma.tour.findFirst({
    where: { slug: 'baku-classic' },
    select: { id: true, slug: true, itinerary: true },
  })
  const seededStops = itinTour?.itinerary ? parseItinerary(itinTour.itinerary) : []
  check('seeded itinerary parses', seededStops.length > 0, `${seededStops.length} stops`)
  check(
    'seeded itinerary titles are populated',
    seededStops.length > 0 && Boolean(seededStops[0].title?.en && seededStops[0].title?.ru),
    seededStops[0]?.title ? 'blank title' : 'no stops',
  )
  check(
    'seeded itinerary has no mojibake',
    repairJson(itinTour?.itinerary ?? '') === (itinTour?.itinerary ?? ''),
  )

  // Use the tour that actually has an itinerary, not the first in the list.
  const tourId = itinTour?.id
  if (!tourId) {
    check('found a tour with an itinerary', false, 'baku-classic is missing')
  } else {
    const editPage = await get(`/admin/tours/${tourId}`)
    check('tour edit page loads', editPage.status === 200, `status ${editPage.status}`)
    check(
      'itinerary field is rendered',
      editPage.body.includes('name="itTitleEn0"'),
      'no itTitleEn0 input',
    )
    check(
      'itinerary values reach the form',
      editPage.body.includes('value="Old City'),
      'seeded English title missing from the form',
    )
  check('tour edit page loads', editPage.status === 200, `status ${editPage.status}`)
  check(
    'itinerary field is rendered',
    editPage.body.includes('name="itTitleEn0"'),
    'no itTitleEn0 input',
  )
  check(
    'itinerary values reach the form',
    editPage.body.includes('value="Old City'),
    'seeded English title missing from the form',
  )

    // Saving must not lose the Russian text. Post every field the form holds so
    // the columns the test does not mention are not blanked by the save.
    const stopsBefore = JSON.parse(
      (await prisma.tour.findUniqueOrThrow({ where: { id: tourId } })).itinerary,
    ) as unknown[]
    const rowBefore = await prisma.tour.findUniqueOrThrow({ where: { id: tourId } })
    // Textareas render their content as the element body, not a value="…"
    // attribute, so they are read separately.
    const textareaValues = (marker: string) => {
      const at = editPage.body.indexOf(`name="${marker}"`)
      if (at < 0) return ''
      const close = editPage.body.indexOf('>', at)
      const end = editPage.body.indexOf('</textarea>', close)
      return editPage.body.slice(close + 1, end)
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
    }
    void rowBefore

    const current = seededStops[0]
    const save = await postForm(`/admin/tours/${tourId}`, {
      ...formInputs(editPage.body, 'name="itTitleEn0"'),
      ...actionFieldsForForm(editPage.body, 'name="itTitleEn0"'),
      // Restore the long-form fields a partial post would otherwise empty.
      descriptionEn: textareaValues('descriptionEn'),
      descriptionRu: textareaValues('descriptionRu'),
      subtitleEn: textareaValues('subtitleEn'),
      subtitleRu: textareaValues('subtitleRu'),
      excerptEn: textareaValues('excerptEn'),
      excerptRu: textareaValues('excerptRu'),
      highlightsEn: textareaValues('highlightsEn'),
      highlightsRu: textareaValues('highlightsRu'),
      includesEn: textareaValues('includesEn'),
      includesRu: textareaValues('includesRu'),
      excludesEn: textareaValues('excludesEn'),
      excludesRu: textareaValues('excludesRu'),
      itDay0: '1',
      itTitleEn0: current.title.en ?? '',
      itTitleRu0: current.title.ru ?? '',
      itDescEn0: current.desc.en ?? '',
      itDescRu0: current.desc.ru ?? '',
      itImage0: current.image ?? '',
      id: tourId,
    })
    // 303 = the redirect to ?saved=1 that a successful server action issues.
    check('itinerary save succeeds', save.status === 303, `status ${save.status}`)

  const stopsAfter = JSON.parse(
    (await prisma.tour.findUniqueOrThrow({ where: { id: tourId } })).itinerary,
  ) as unknown[]
  const afterStop = parseItinerary(JSON.stringify(stopsAfter))[0]
  check(
    'itinerary survives a save',
    afterStop?.title?.en === current.title?.en && afterStop?.title?.ru === current.title?.ru,
    `got ${JSON.stringify(afterStop?.title)}`,
  )
  check(
    'itinerary stop count preserved',
    stopsBefore.length === stopsAfter.length,
    `${stopsBefore.length} → ${stopsAfter.length}`,
  )

  // Put the row back exactly as it was, so repeated test runs are safe and
  // check:tours still sees the full content afterwards.
  await prisma.tour.update({
    where: { id: tourId },
    data: {
      subtitle: rowBefore.subtitle,
      excerpt: rowBefore.excerpt,
      description: rowBefore.description,
      highlights: rowBefore.highlights,
      includes: rowBefore.includes,
      excludes: rowBefore.excludes,
      itinerary: rowBefore.itinerary,
    },
  })
  const restored = await prisma.tour.findUniqueOrThrow({ where: { id: tourId } })
  check(
    'tour content restored after the test',
    restored.description === rowBefore.description &&
      restored.itinerary === rowBefore.itinerary,
  )
  }

  // 13. No mojibake anywhere in the stored content. The test is whether
  //     repairMojibake actually changes the value, so legitimate Latin-1
  //     characters (curly quotes, dashes) are not false positives.
  const allTours = await prisma.tour.findMany()
  const damaged = allTours.filter((t) =>
    [t.title, t.subtitle, t.excerpt, t.description, t.highlights, t.includes, t.excludes, t.itinerary]
      .filter(Boolean)
      .some((v) => repairJson(v) !== v),
  )
  check('no mojibake in tour content', damaged.length === 0, damaged.map((t) => t.slug).join(', '))

  // 14. Signed-out again after clearing the cookie
  const savedCookie2 = cookie
  cookie = ''
  const afterFinal = await get('/admin/settings')
  check(
    'settings guarded when signed out',
    afterFinal.status === 307,
    `status ${afterFinal.status}`,
  )
  cookie = savedCookie2

  console.log(`\n${failures === 0 ? 'All checks passed.' : `${failures} check(s) failed.`}`)
}

main()
  .catch((e) => {
    console.error(e)
    failures++
  })
  .finally(() => prisma.$disconnect())
  .then(() => process.exit(failures === 0 ? 0 : 1))