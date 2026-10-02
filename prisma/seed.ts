/**
 * Seeds the database with the site's content.
 *
 * Content mirrors what EVE TOUR publishes on Instagram (@evetour.az):
 * private tours, activity tours, the regions they cover (Shaki, Quba,
 * Baku-Absheron, Baku, Cars, Packages, Summer, Winter, Museums) and the
 * "No prepayment" positioning.
 *
 * NOTE ON REVIEWS: none are seeded on purpose. Inventing customer reviews
 * would be dishonest. Add the real ones from the admin panel
 * (Admin â†’ Reviews), pasting the text from your Instagram review posts.
 *
 * Run: npx tsx prisma/seed.ts
 */
import 'dotenv/config'
import path from 'node:path'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma/client'
import bcrypt from 'bcryptjs'
import { TOURS as REAL_TOURS } from './tours-real'

/** Same path resolution as src/lib/prisma.ts */
const dbUrl = process.env.DATABASE_URL ?? 'file:./dev.db'
const dbFile = dbUrl.startsWith('file:') ? dbUrl.slice('file:'.length) : dbUrl
const dbPath =
  dbFile.startsWith('/') || /^[A-Za-z]:/.test(dbFile)
    ? dbFile
    : path.join(process.cwd(), dbFile)

const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

const t = (en: string, ru: string) => JSON.stringify({ en, ru })
const list = (items: { en: string; ru: string }[]) =>
  JSON.stringify(items.map((i) => ({ en: i.en, ru: i.ru })))
const strs = (items: string[]) => JSON.stringify(items)

/* ------------------------------------------------------------------ */
/* Hero slides                                                         */
/* ------------------------------------------------------------------ */
const SLIDES = [
  {
    image: '/media/baku-flame-towers-night.jpg',
    title: t('Baku', 'Баку'),
    subtitle: t(
      'The Flame Towers, the old walled city and the Caspian waterfront â€” start where the country starts.',
      'Пламенные башни, старый город и набережная Каспия — начало начинается здесь.',
    ),
    ctaLabel: t('Explore Baku', 'Смотреть Баку'),
    ctaHref: '/tours?cat=baku',
    sortOrder: 0,
  },
  {
    image: '/media/sheki-old-town.jpg',
    title: t('Shaki', 'Шеки'),
    subtitle: t(
      'Silk-road caravanserais, hand-painted ceilings and Khanâ€™s Palace under the Greater Caucasus.',
      'Караван-сараи Шеки, расписные потолки и дворец хана под Кавказом.',
    ),
    ctaLabel: t('Explore Shaki', 'Смотреть Шеки'),
    ctaHref: '/tours?cat=sheki',
    sortOrder: 1,
  },
  {
    image: '/media/gobustan-mud-volcanoes.jpg',
    title: t('Gobustan', 'Гобустан'),
    subtitle: t(
      'Ancient rock carvings and volcanoes that still bubble. Nothing like this within a day of Baku.',
      'Древние наскальные рисунки и вулканы, которые до сих пор булькают.',
    ),
    ctaLabel: t('Explore Absheron', 'Смотреть Абшерон'),
    ctaHref: '/tours?cat=absheron',
    sortOrder: 2,
  },
  {
    image: '/media/quba-mountains.jpg',
    title: t('Quba & Shahdag', 'Куба и Шахдаг'),
    subtitle: t(
      'Apple orchards climbing the foothills, then snow in the mountains. Two Azerbaijan in one day.',
      'Яблочные сады у подножия и снег в горах. Два Азербайджана за один день.',
    ),
    ctaLabel: t('Explore Quba', 'Смотреть Кубу'),
    ctaHref: '/tours?cat=guba',
    sortOrder: 3,
  },
  {
    image: '/media/paragliding.jpg',
    title: t('Adventures', 'Приключения'),
    subtitle: t(
      'Paragliding, rafting, skiing, kayaking. For people who do not want to sit in a minibus all day.',
      'Параплантинг, рафтинг, лыжи, каяки. Для тех, кому не хочется весь день сидеть в минибусе.',
    ),
    ctaLabel: t('See activities', 'Смотреть активности'),
    ctaHref: '/tours?cat=adventure',
    sortOrder: 4,
  },
]
/* ------------------------------------------------------------------ */
/* Tours                                                               */
/* ------------------------------------------------------------------ */
/* Superseded tours (Baku, Shaki, Gobustan, Quba) now live in tours-real.ts
   with content transcribed from the real service posters. */
const TOURS_BASE = [
  {
    slug: 'baku-classic',
    category: 'baku',
    region: t('Baku', 'Баку'),
    title: t('Baku in a day', 'Баку за один день'),
    subtitle: t('The essential first-timer route', 'Маршрут для первого знакомства'),
    excerpt: t(
      'Old City, Shirvanshahs Palace, Highland Park and the Flame Towers â€” the Baku everyone should see at least once.',
      'Старый город, дворец Ширваншахов, Парк высоких пейзажей и Пламенные башни — Баку, который нужно увидеть.',
    ),
    description: t(
      'A full day in Baku with a private car and a local guide. We walk the walled Old City in the morning when it is still quiet, see the Palace of the Shirvanshahs before the crowds, then climb to Highland Park for the view back over the skyline. In the evening we end at the Flame Towers and the waterfront, where the Caspian turns pink at sunset.',
      'Полный день в Баку с частным автомобилем и местным гидом. Утром идём по старому городу, пока он тих, видим дворец Ширваншахов до толпы, затем поднимаемся в Парк высоких пейзажей. Вечером заканчиваем у Пламенных башен и набережной, где Каспий становится розовым на закате.',
    ),
    highlights: list([
      { en: 'Palace of the Shirvanshahs', ru: 'Дворец Ширваншахов' },
      { en: 'Walled Old City with a local guide', ru: 'Старый город с местным гидом' },
      { en: 'Highland Park panorama', ru: 'Панорама из Парка высоких пейзажей' },
      { en: 'Flame Towers and Caspian waterfront', ru: 'Пламенные башни и набережная Каспия' },
    ]),
    includes: list([
      { en: 'Private air-conditioned car', ru: 'Частный кондиционированный автомобиль' },
      { en: 'English or Russian speaking guide', ru: 'Гид, говорящий по-английски или по-русски' },
      { en: 'Pickup and drop-off in Baku', ru: 'Встреча и высадка в Баку' },
      { en: 'Bottled water', ru: 'Бутилированная вода' },
    ]),
    excludes: list([
      { en: 'Museum entrance tickets', ru: 'Входные билеты в музеи' },
      { en: 'Lunch', ru: 'Обед' },
    ]),
    itinerary: JSON.stringify([
      {
        day: '1',
        title: t('Old City & Shirvanshahs', 'Старый город и Ширваншахи'),
        desc: t(
          'Morning walk inside the walled city, the palace complex and the local bazaar.',
          'Утренняя прогулка по старому городу, дворец и местный базар.',
        ),
        image: '/media/baku-shirvanshahs.jpg',
      },
      {
        day: '1',
        title: t('Highland Park & Flame Towers', 'Парк и Пламенные башни'),
        desc: t(
          'The classic viewpoint over the bay, then the towers at night.',
          'Классический вид на залив, затем башни вечером.',
        ),
        image: '/media/baku-flame-towers-boulevard.jpg',
      },
    ]),
    duration: t('1 day', '1 день'),
    durationDays: 1,
    priceFrom: 60,
    priceMode: 'from',
    coverImage: '/media/baku-shirvanshahs.jpg',
    images: strs([
      '/media/baku-panorama.jpg',
      '/media/baku-shirvanshahs.jpg',
      '/media/baku-flame-towers-boulevard.jpg',
      '/media/baku-night-blue.jpg',
    ]),
    isFeatured: true,
    sortOrder: 0,
  },
  {
    slug: 'sheki-caravanserai',
    category: 'sheki',
    region: t('Shaki', 'Шеки'),
    title: t('Shaki: the silk road city', 'Шеки: город Шёлкового пути'),
    subtitle: t('Shaki highlights in one day', 'Главное за один день'),
    excerpt: t(
      "Khanâ€™s Palace, the Upper and Lower Caravanserais and the old bazaar â€” the town UNESCO put on its list.",
      'Дворец хана, Верхний и Нижний караван-сараи и старый базар — город из списка ЮНЕСКО.',
    ),
    description: t(
      'Around 280 km from Baku, Shaki is the best-preserved town in Azerbaijan. We drive up through the foothills of the Greater Caucasus and spend the day inside the old centre: the Palace of the Shirvanshahs with its stained glass and wall paintings, the two caravanserais that once housed silk traders, and the bazaar. If you have energy left, we add Tsum National Park or a wine cellar in the hills.',
      'В 280 км от Баку Шеки — лучше всего сохранившийся город Азербайджана. Мы поднимаемся в предгорья Большого Кавказа и проводим день в старом центре: дворец Ширваншахов с витражами, два караван-сарая, где когда-то торговали шёлком, и базар. При наличии сил добавим парк Тсум или винодельню в холмах.',
    ),
    highlights: list([
      { en: "Khan’s Palace (UNESCO)", ru: 'Дворец хана (ЮНЕСКО)' },
      { en: 'Upper and Lower Caravanserais', ru: 'Верхний и Нижний караван-сараи' },
      { en: 'Shaki bazaar', ru: 'Базар Шеки' },
      { en: 'Optional Tsum National Park', ru: 'По желанию — парк Тсум' },
    ]),
    includes: list([
      { en: 'Private car with driver', ru: 'Частный автомобиль с водителем' },
      { en: 'Local guide in Shaki', ru: 'Местный гид в Шеки' },
      { en: 'Lunch in a traditional restaurant', ru: 'Обед в традиционном ресторане' },
    ]),
    excludes: list([
      { en: 'Palace and museum tickets', ru: 'Билеты во дворец и музеи' },
      { en: 'Tsum cable car', ru: 'Канатная дорога в Тсуме' },
    ]),
    itinerary: JSON.stringify([
      {
        day: '1',
        title: t('Drive Baku → Shaki', 'Дорога Баку → Шеки'),
        desc: t(
          'Leave early, stop at the Ganja corridor viewpoint.',
          'Выезжаем рано, останавливаемся на смотровой площадке.',
        ),
        image: '/media/sheki-to-baku-road.jpg',
      },
      {
        day: '1',
        title: t('Old town of Shaki', 'Старый город Шеки'),
        desc: t(
          'Palace, caravanserais, bazaar and a walk along the Kish road.',
          'Дворец, караван-сараи, базар и дорога к деревне Киш.',
        ),
        image: '/media/sheki-old-town-2.jpg',
      },
    ]),
    duration: t('1 day', '1 день'),
    durationDays: 1,
    priceFrom: 90,
    priceMode: 'from',
    coverImage: '/media/sheki-old-town.jpg',
    images: strs([
      '/media/sheki-old-town.jpg',
      '/media/sheki-old-town-2.jpg',
      '/media/drive-to-baku.jpg',
    ]),
    isFeatured: true,
    sortOrder: 1,
  },
  {
    slug: 'gobustan-absheron',
    category: 'absheron',
    region: t('Baku-Absheron', 'Баку-Абшерон'),
    title: t('Gobustan & the Absheron coast', 'Гобустан и побережье Абшерона'),
    subtitle: t('Rock carvings, volcanoes, sea', 'Наскальные рисунки, вулканы, море'),
    excerpt: t(
      'A 1,000-year-old archaeological site with active mud volcanoes, ending on the Caspian shore.',
      'Археологический объект тысячелетней давности с действующими грязевыми вулканами и берег Каспия.',
    ),
    description: t(
      'Gobustan means "land of ravines" â€” a protected site of rock carvings going back a millennium, where petroglyphs of hunters, boats and dancing figures are still visible on the limestone. Right next to it, more than twenty mud volcanoes are still active: cold, grey, smelling of sulfur. We finish the day on the Absheron coast with the sea and a late lunch.',
      'Гобустан значит «страна ущелий» — охраняемый объект с наскальными рисунками тысячелетней давности: охотники, лодки и танцующие фигуры на известняке. Рядом работают более двадцати грязевых вулканов: холодная серая грязь с запахом серы. Заканчиваем день на побережье Абшерона, у моря.',
    ),
    highlights: list([
      { en: 'Gobustan rock art site', ru: 'Наскальные рисунки Гобустана' },
      { en: 'Active mud volcanoes', ru: 'Действующие грязевые вулканы' },
      { en: 'Caspian coastal stop', ru: 'Остановка на берегу Каспия' },
    ]),
    includes: list([
      { en: 'Private car and driver', ru: 'Частный автомобиль и водитель' },
      { en: 'Entry tickets to Gobustan', ru: 'Входные билеты в Гобустан' },
      { en: 'English or Russian guide', ru: 'Гид по-английски или по-русски' },
    ]),
    excludes: list([{ en: 'Lunch', ru: 'Обед' }]),
    itinerary: JSON.stringify([
      {
        day: '1',
        title: t('Gobustan petroglyphs', 'Рисунки Гобустана'),
        desc: t('Climb the plateau trail between the cliffs.', 'Подъём по тропе между скалами.'),
        image: '/media/gobustan-mud-volcanoes.jpg',
      },
      {
        day: '1',
        title: t('Mud volcanoes & Caspian', 'Грязевые вулканы и Каспий'),
        desc: t('Watch the vents bubble, then drive to the coast.', 'Смотрим, как бурлят жерла, затем едем к морю.'),
        image: '/media/gobustan-mud-volcanoes-2.jpg',
      },
    ]),
    duration: t('1 day', '1 день'),
    durationDays: 1,
    priceFrom: 75,
    priceMode: 'from',
    coverImage: '/media/gobustan-mud-volcanoes.jpg',
    images: strs([
      '/media/gobustan-mud-volcanoes.jpg',
      '/media/gobustan-mud-volcanoes-2.jpg',
      '/media/absheron-caspian.jpg',
    ]),
    isFeatured: true,
    sortOrder: 2,
  },
  {
    slug: 'quba-shahdag-day',
    category: 'guba',
    region: t('Quba', 'Куба'),
    title: t('Quba & Shahdag mountains', 'Куба и горы Шахдаг'),
    subtitle: t('Orchards to snow line', 'От садов до снеговой линии'),
    excerpt: t(
      'Apple country in the morning, Greater Caucasus peaks in the afternoon. Quba in a single day.',
      'Утром яблочный край, днём вершины Большого Кавказа. Куба за один день.',
    ),
    description: t(
      'North of Baku the road climbs from the Caspian plain into Quba, the countryâ€™s apple capital, and on to Shahdag where the peaks still hold snow well into spring. We stop in the orchards, try local apple juice and cheese, and if the season and the cable car agree, ride up into the mountains.',
      'Севернее Баку дорога поднимается с каспийской равнины в Кубу — столицу яблок — и дальше к Шахдагу, где на вершинах снег лежит до весны. Останавливаемся в садах, пробуем яблочный сок и сыр, и если сезон и погода позволяют, поднимаемся в горы.',
    ),
    highlights: list([
      { en: 'Quba bazaar and orchards', ru: 'Базар и сады Кубы' },
      { en: 'Shahdag mountain cable car', ru: 'Канатная дорога Шахдаг' },
      { en: 'Local apple products', ru: 'Местные яблочные продукты' },
      { en: 'Khinalug village option', ru: 'По желанию — деревня Хиналуг' },
    ]),
    includes: list([
      { en: 'Private car for the full day', ru: 'Частный автомобиль на весь день' },
      { en: 'English or Russian guide', ru: 'Гид по-английски или по-русски' },
      { en: 'Tasting of local produce', ru: 'Дегустация местных продуктов' },
    ]),
    excludes: list([
      { en: 'Cable car tickets', ru: 'Билеты на канатную дорогу' },
      { en: 'Lunch', ru: 'Обед' },
    ]),
    itinerary: JSON.stringify([
      {
        day: '1',
        title: t('Quba town & bazaar', 'Город Куба и базар'),
        desc: t('Local market, orchards and jam tasting.', 'Местный базар, сады и дегустация варенья.'),
        image: '/media/quba-mountains.jpg',
      },
      {
        day: '1',
        title: t('Shahdag mountains', 'Горы Шахдаг'),
        desc: t('Cable car up to the viewing platforms.', 'Подъём на канатной дороге к смотровым площадкам.'),
        image: '/media/quba-shahdag.jpg',
      },
    ]),
    duration: t('1 day', '1 день'),
    durationDays: 1,
    priceFrom: 95,
    priceMode: 'from',
    coverImage: '/media/quba-mountains.jpg',
    images: strs(['/media/quba-mountains.jpg', '/media/quba-shahdag.jpg']),
    isFeatured: true,
    sortOrder: 3,
  },
  {
    slug: 'paragliding-baku',
    category: 'adventure',
    region: t('Adventure', 'Приключения'),
    title: t('Paragliding over the Caspian', 'Параплантинг над Каспием'),
    subtitle: t('Fly above the coast', 'Полёт над побережьем'),
    excerpt: t(
      'Tandem flight from the hills above the coast â€” no experience needed, just nerves and a good view.',
      'Тандемный полёт с холмов над побережьем — опыт не нужен, только смелость и вид.',
    ),
    description: t(
      'A tandem flight with a certified pilot, launching from the hills and landing near the water. The flight itself is short, but the view of the Caspian, the city and the coastline stays with you. We pick you up, take you to the launch site and bring you back after.',
      'Тандемный полёт с сертифицированным пилотом: взлёт с холмов и посадка рядом с водой. Сам полёт короткий, но вид на Каспий, город и берег остаётся надолго. Встречаем, везём на площадку и возвращаем обратно.',
    ),
    highlights: list([
      { en: 'Certified tandem pilot', ru: 'Сертифицированный пилот' },
      { en: 'Hotel or Baku pickup', ru: 'Встрета в отеле или Баку' },
      { en: 'GoPro photo of the flight', ru: 'Фото полёта на GoPro' },
    ]),
    includes: list([
      { en: 'Tandem flight', ru: 'Тандемный полёт' },
      { en: 'Transport to launch site', ru: 'Транспорт до площадки' },
      { en: 'Safety equipment', ru: 'Снаряжение безопасности' },
    ]),
    excludes: list([
      { en: 'Photos and videos (paid on site)', ru: 'Фото и видео (оплата на месте)' },
    ]),
    itinerary: strs([]),
    duration: t('2–3 hours', '2–3 часа'),
    durationDays: 1,
    priceFrom: 120,
    priceMode: 'from',
    coverImage: '/media/paragliding.jpg',
    images: strs(['/media/paragliding.jpg', '/media/absheron-caspian.jpg']),
    isFeatured: true,
    sortOrder: 4,
  },
  {
    slug: 'azerbaijan-week',
    category: 'packages',
    region: t('Packages', 'Пакеты'),
    title: t('Azerbaijan in five days', 'Азербайджан за пять дней'),
    subtitle: t('The full private route', 'Полный частный маршрут'),
    excerpt: t(
      'Baku, Gobustan, Shaki and Quba in one trip â€” the route most guests ask for, built around you.',
      'Баку, Гобустан, Шеки и Куба за одну поездку — маршрут, который просят чаще всего.',
    ),
    description: t(
      'The classic five-day loop. Baku and the Old City, the mud volcanoes of Gobustan, the mountain road to Shaki and its caravanserais, then north to the apple country of Quba. Private car throughout, a guide who stays with you, and the schedule bent around what you actually want to see.',
      'Классическая петля на пять дней: Баку и старый город, грязевые вулканы Гобустана, горная дорога в Шеки с караван-сараями, затем на север, в яблочный край Кубы. Частный автомобиль всё время, гид рядом, график подстраивается под вас.',
    ),
    highlights: list([
      { en: 'Baku Old City and Shirvanshahs Palace', ru: 'Старый город и дворец Ширваншахов' },
      { en: 'Gobustan and mud volcanoes', ru: 'Гобустан и грязевые вулканы' },
      { en: 'Shaki palace and caravanserais', ru: 'Дворец и караван-сараи Шеки' },
      { en: 'Quba orchards and Shahdag', ru: 'Сады Кубы и Шахдаг' },
      { en: 'Caspian coast at sunset', ru: 'Закат на берегу Каспия' },
    ]),
    includes: list([
      { en: 'Private car and driver for 5 days', ru: 'Частный автомобиль и водитель на 5 дней' },
      { en: 'Guide throughout the trip', ru: 'Гид на протяжении всей поездки' },
      { en: '4 nights accommodation', ru: 'Проживание 4 ночи' },
      { en: 'Breakfast each morning', ru: 'Завтрак каждое утро' },
      { en: 'All entrance tickets listed', ru: 'Все перечисленные входные билеты' },
    ]),
    excludes: list([
      { en: 'Lunches and dinners', ru: 'Обеды и ужины' },
      { en: 'Flights to and from Baku', ru: 'Перелёт в Баку и обратно' },
    ]),
    itinerary: JSON.stringify([
      {
        day: '1',
        title: t('Baku', 'Баку'),
        desc: t('Old City, Shirvanshahs, Flame Towers.', 'Старый город, Ширваншахи, Пламенные башни.'),
        image: '/media/baku-panorama.jpg',
      },
      {
        day: '2',
        title: t('Gobustan & Absheron', 'Гобустан и Абшерон'),
        desc: t('Rock art, mud volcanoes, Caspian coast.', 'Наскальные рисунки, вулканы, Каспий.'),
        image: '/media/gobustan-mud-volcanoes-2.jpg',
      },
      {
        day: '3',
        title: t('Shaki', 'Шеки'),
        desc: t('Palace, caravanserais, bazaar.', 'Дворец, караван-сараи, базар.'),
        image: '/media/sheki-old-town.jpg',
      },
      {
        day: '4',
        title: t('Quba & Shahdag', 'Куба и Шахдаг'),
        desc: t('Apples, mountains, cable car.', 'Яблоки, горы, канатная дорога.'),
        image: '/media/quba-shahdag.jpg',
      },
      {
        day: '5',
        title: t('Back to Baku', 'Возвращение в Баку'),
        desc: t('Drive back, stop on the coast.', 'Обратная дорога, остановка у моря.'),
        image: '/media/drive-to-baku.jpg',
      },
    ]),
    duration: t('5 days / 4 nights', '5 дней / 4 ночи'),
    durationDays: 5,
    priceFrom: 420,
    priceMode: 'from',
    coverImage: '/media/baku-skyline.jpg',
    images: strs([
      '/media/baku-skyline.jpg',
      '/media/gobustan-mud-volcanoes.jpg',
      '/media/sheki-old-town.jpg',
      '/media/quba-mountains.jpg',
      '/media/absheron-caspian.jpg',
    ]),
    isFeatured: true,
    sortOrder: 5,
  },
  {
    slug: 'car-with-driver',
    category: 'cars',
    region: t('Cars', 'Транспорт'),
    title: t('Car with driver, by the day', 'Машина с водителем на день'),
    subtitle: t('No tour, just the car', 'Без тура, просто машина'),
    excerpt: t(
      'A comfortable car and an experienced driver for the day â€” you decide where to go.',
      'Комфортный автомобиль и опытный водитель на день — вы решаете, куда ехать.',
    ),
    description: t(
      'Sometimes you do not need a guide, just a car and someone who knows the roads. We hire out a vehicle with driver by the day, airport to hotel, or for a weekend of wherever you want to be. Clean cars, English-speaking drivers, and no prepayment â€” you pay when the day is done.',
      'Иногда не нужен гид, нужна просто машина и человек, который знает дороги. Сдаём автомобиль с водителем на день, из аэропорта в отель или на выходные — куда захотите. Чистые машины, водители со знанием английского, и никакой предоплаты — платите в конце дня.',
    ),
    highlights: list([
      { en: 'Comfortable air-conditioned car', ru: 'Комфортный автомобиль с кондиционером' },
      { en: 'Experienced, English-speaking driver', ru: 'Опытный водитель, говорящий по-английски' },
      { en: 'Airport transfers', ru: 'Трансферы из аэропорта' },
      { en: 'Pay after the trip', ru: 'Оплата после поездки' },
    ]),
    includes: list([
      { en: 'Fuel', ru: 'Топливо' },
      { en: 'Road tolls', ru: 'Платные дороги' },
      { en: 'Parking', ru: 'Парковка' },
    ]),
    excludes: list([
      { en: 'Guide service (available on request)', ru: 'Услуги гида (по запросу)' },
    ]),
    itinerary: strs([]),
    duration: t('By the day', 'На день'),
    durationDays: 1,
    priceFrom: 50,
    priceMode: 'from',
    coverImage: '/media/drive-to-baku.jpg',
    images: strs(['/media/drive-to-baku.jpg', '/media/sheki-to-baku-road.jpg']),
    isFeatured: false,
    sortOrder: 6,
  },
  {
    slug: 'summer-winter-azerbaijan',
    category: 'packages',
    region: t('Summer / Winter', 'Лето / Зима'),
    title: t('Summer & winter packages', 'Летние и зимние пакеты'),
    subtitle: t('Seasonal routes', 'Сезонные маршруты'),
    excerpt: t(
      'Caspian beaches in summer, snow in Shahdag in winter â€” the same country, two completely different trips.',
      'Пляжи Каспия летом и снег в Шахдаге зимой — одна страна, два совершенно разных путешествия.',
    ),
    description: t(
      'In summer we work the Caspian coast, the beaches north of Baku and the cooler mountain villages. In winter the whole country changes: skiing in Shahdag and Quba, snow in Lahic, and quiet old towns without the summer crowds. Tell us which season you are in and we will build the route around it.',
      'Летом мы работаем с побережьем Каспия, пляжами севернее Баку и прохладными горными сёлами. Зимой страна меняется: катание на лыжах в Шахдаге и Кубе, снег в Лахиче и тихие старые города без летней толпы. Скажите, в какой сезон вы едете, и мы построим маршрут.',
    ),
    highlights: list([
      { en: 'Caspian beach days in summer', ru: 'Дни на пляжах Каспия летом' },
      { en: 'Ski season in Shahdag', ru: 'Лыжный сезон в Шахдаге' },
      { en: 'Snow village of Lahic', ru: 'Снежная деревня Лахич' },
    ]),
    includes: list([
      { en: 'Private car and driver', ru: 'Частный автомобиль и водитель' },
      { en: 'Flexible daily schedule', ru: 'Гибкий график по дням' },
      { en: 'No prepayment', ru: 'Без предоплаты' },
    ]),
    excludes: list([
      { en: 'Ski equipment rental', ru: 'Прокат лыжного снаряжения' },
      { en: 'Accommodation', ru: 'Проживание' },
    ]),
    itinerary: strs([]),
    duration: t('1–3 days', '1–3 дня'),
    durationDays: 1,
    priceFrom: null,
    priceMode: 'request',
    coverImage: '/media/absheron-caspian.jpg',
    images: strs(['/media/absheron-caspian.jpg', '/media/quba-shahdag.jpg']),
    isFeatured: false,
    sortOrder: 7,
  },
]
/* ------------------------------------------------------------------ */
/* Places to visit                                                     */
/* ------------------------------------------------------------------ */
const PLACES = [
  {
    slug: 'flame-towers',
    title: t('Flame Towers', 'Пламенные башни'),
    summary: t('The symbol of modern Baku', 'Символ современного Баку'),
    description: t(
      'Three glass towers crowned with fire-shaped roofs, built on a hill in the early 2000s. They glow at night and are visible from almost anywhere in the city â€” the easiest landmark to orient yourself by.',
      'Три стеклянные башни с огненными крышами, построенные на холме в начале 2000-х. Ночью они светятся и видны почти отовсюду — самый простой ориентир в городе.',
    ),
    image: '/media/baku-flame-towers-night.jpg',
    images: strs([
      '/media/baku-flame-towers-night.jpg',
      '/media/baku-night-blue.jpg',
      '/media/baku-flame-towers-boulevard.jpg',
    ]),
    highlights: list([
      { en: 'Best at night', ru: 'Лучше всего ночью' },
      { en: 'Panoramic lift', ru: 'Панорамный лифт' },
    ]),
    coordinates: '40.3593, 49.8260',
    distanceKm: 0,
    bestSeason: t('Year round', 'Круглый год'),
    sortOrder: 0,
  },
  {
    slug: 'old-city-baku',
    title: t('Walled City of Baku', 'Старый город Баку'),
    summary: t('A UNESCO-listed maze of lanes', 'Лабиринт улиц из списка ЮНЕСКО'),
    description: t(
      'Inside the old stone walls, narrow streets wind past caravanserais, small squares and 19th-century balconies. Declared a UNESCO World Heritage site in 2000, it is best walked slowly in the early morning before the shops open.',
      'За каменными стенами узкие улочки ведут мимо караван-сараев, маленьких площадей и балконов XIX века. Объект ЮНЕСКО с 2000 года; лучше гулять рано утром, пока магазины закрыты.',
    ),
    image: '/media/baku-panorama.jpg',
    images: strs(['/media/baku-panorama.jpg', '/media/baku-shirvanshahs.jpg']),
    highlights: list([
      { en: 'Maiden Tower', ru: 'Башня Мамед' },
      { en: 'Old-city caravanserais', ru: 'Караван-сараи старого города' },
      { en: 'Covered bazaar', ru: 'Крытый базар' },
    ]),
    coordinates: '40.3663, 49.8380',
    distanceKm: 0,
    bestSeason: t('Spring, autumn', 'Весна, осень'),
    sortOrder: 1,
  },
  {
    slug: 'shirvanshahs-palace',
    title: t('Palace of the Shirvanshahs', 'Дворец Ширваншахов'),
    summary: t('15th-century royal complex', 'Королевский комплекс XV века'),
    description: t(
      'The seat of the Shirvanshah dynasty: domed tombs, a stunning fluted mosque and stone carving that has survived five centuries. The mausoleum of Turan Shah and the eastern portal are the parts worth slowing down for.',
      'Резиденция династии Ширваншахов: купольные мавзолеи, ребристая мечеть и резьба, пережившая пять веков. Особенно стоит задержаться у мавзолея Туран-шаха и восточных ворот.',
    ),
    image: '/media/baku-shirvanshahs.jpg',
    images: strs(['/media/baku-shirvanshahs.jpg']),
    highlights: list([
      { en: 'Mausoleum of Turan Shah', ru: 'Мавзолей Туран-шаха' },
      { en: 'Divankhana mosque', ru: 'Мечеть Диванхана' },
    ]),
    coordinates: '40.3669, 49.8347',
    distanceKm: 0,
    bestSeason: t('Year round', 'Круглый год'),
    sortOrder: 2,
  },
  {
    slug: 'gobustan',
    title: t('Gobustan rock carvings', 'Наскальные рисунки Гобустана'),
    summary: t('Petroglyphs from a thousand years back', 'Петроглифы тысячелетней давности'),
    description: t(
      'More than a thousand engravings on limestone cliffs: hunting scenes, boats, human figures and dancing women. Right beside them, mud volcanoes that are still erupting cold, grey mud â€” one of the strangest landscapes you will ever stand in.',
      'Более тысячи изображений на известняковых скалах: охота, лодки, фигуры людей и танцующие женщины. Рядом — грязевые вулканы, которые до сих пор выбрасывают холодную серую грязь.',
    ),
    image: '/media/gobustan-mud-volcanoes.jpg',
    images: strs([
      '/media/gobustan-mud-volcanoes.jpg',
      '/media/gobustan-mud-volcanoes-2.jpg',
    ]),
    highlights: list([
      { en: 'UNESCO World Heritage', ru: 'Объект ЮНЕСКО' },
      { en: 'Active mud volcanoes', ru: 'Действующие грязевые вулканы' },
    ]),
    coordinates: '40.4100, 49.9500',
    distanceKm: 64,
    bestSeason: t('Spring, autumn', 'Весна, осень'),
    sortOrder: 3,
  },
  {
    slug: 'sheki-old-town',
    title: t('Shaki old town', 'Старый город Шеки'),
    summary: t('The best-preserved town in the country', 'Лучше всего сохранившийся город страны'),
    description: t(
      'Along the Shaki-Kishchay river, the old town keeps its caravanserais, tiled roofs and the palace with its stained glass. The whole historic centre is on the UNESCO list. Go to the upper part of town for the best view of the roofs and the mountains behind.',
      'Вдоль реки Шеки-Кишчай старый город сохранил караван-сараи, черепичные крыши и дворец с витражами. Весь исторический центр — в списке ЮНЕСКО. За лучшим видом на крыши и горы поднимайтесь в верхнюю часть города.',
    ),
    image: '/media/sheki-old-town.jpg',
    images: strs(['/media/sheki-old-town.jpg', '/media/sheki-old-town-2.jpg']),
    highlights: list([
      { en: "Khan's Palace", ru: 'Дворец хана' },
      { en: 'Upper & Lower Caravanserais', ru: 'Верхний и Нижний караван-сараи' },
      { en: 'Tsum National Park nearby', ru: 'Рядом парк Тсум' },
    ]),
    coordinates: '41.1919, 47.1706',
    distanceKm: 280,
    bestSeason: t('April–October', 'Апрель–октябрь'),
    sortOrder: 4,
  },
  {
    slug: 'quba-shahdag',
    title: t('Quba & Shahdag', 'Куба и Шахдаг'),
    summary: t('Apple orchards and snow mountains', 'Яблочные сады и снежные горы'),
    description: t(
      'Quba is the apple capital of Azerbaijan, and beyond it the road climbs to Shahdag, where the cable car lifts you to viewpoints over the Greater Caucasus. The village of Qusar and the road to Khinalug â€” Europeâ€™s highest village â€” are on the way if you have time.',
      'Куба — яблочная столица Азербайджана, а дальше дорога поднимается к Шахдагу, откуда канатная дорога ведёт к смотровым площадкам Большого Кавказа. Деревня Кусар и дорога к Хиналугу — самой высокогорной деревне Европы — по пути, если есть время.',
    ),
    image: '/media/quba-mountains.jpg',
    images: strs(['/media/quba-mountains.jpg', '/media/quba-shahdag.jpg']),
    highlights: list([
      { en: 'Quba bazaar', ru: 'Базар Кубы' },
      { en: 'Shahdag cable car', ru: 'Канатная дорога Шахдаг' },
      { en: 'Road to Khinalug village', ru: 'Дорога к деревне Хиналуг' },
    ]),
    coordinates: '41.5820, 47.3800',
    distanceKm: 220,
    bestSeason: t('June–September, winter for snow', 'Июнь–сентябрь, зимой — снег'),
    sortOrder: 5,
  },
  {
    slug: 'caspian-coast',
    title: t('Caspian coast', 'Каспийское побережье'),
    summary: t('Beaches, sunsets, absolute calm', 'Пляжи, закаты, полный покой'),
    description: t(
      'The longest natural coastline in the world, and 200 km of it is an hour from Baku. Pebble beaches, wooden piers, grilled fish and the calmest water you will find in the Caucasus. The drive along the coast road is worth doing even without stopping.',
      'Самый длинный естественный берег в мире, и 200 км его — в часе езды от Баку. Галечные пляжи, деревянные пирсы, жареная рыба и самый спокойный водоём на Кавказе. Дорога вдоль берега стоит того, даже если нигде не останавливаться.',
    ),
    image: '/media/absheron-caspian.jpg',
    images: strs(['/media/absheron-caspian.jpg']),
    highlights: list([
      { en: 'Peayk beach', ru: 'Пляж Пеяк' },
      { en: 'Sunset over the sea', ru: 'Закат над морем' },
      { en: 'Fresh fish grills', ru: 'Свежая рыба на гриле' },
    ]),
    coordinates: '40.4200, 50.3000',
    distanceKm: 40,
    bestSeason: t('May–September', 'Май–сентябрь'),
    sortOrder: 6,
  },
]

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */
async function main() {
  console.log('Seeding EVE TOURâ€¦')

  // Admin user â€” change the password before deploying anywhere public.
  // Admin user. There is deliberately no default: falling back to a known
  // password is how "admin@evetour.az / eve-tour-2026" ended up in a
  // production-shaped database in the first place. Refuse to guess.
  const password = process.env.ADMIN_PASSWORD
  if (!password || password.trim().length < 12) {
    throw new Error(
      'ADMIN_PASSWORD is not set, or is shorter than 12 characters.\n' +
        'Set it in .env (see .env.example) and re-run the seed.\n' +
        'Generate one with:\n' +
        '  node -e "console.log(require(\'crypto\').randomBytes(24).toString(\'base64url\'))"',
    )
  }
  const hash = await bcrypt.hash(password, 12)
  await prisma.adminUser.upsert({
    where: { email: 'admin@evetour.az' },
    update: { passwordHash: hash },
    create: { email: 'admin@evetour.az', name: 'EVE TOUR', passwordHash: hash },
  })
  // The password itself is not echoed — the hash in the database is enough,
  // and a deploy log is not the place for a credential.
  console.log('  admin: admin@evetour.az (password read from ADMIN_PASSWORD)')

  // Hero slides
  await prisma.heroSlide.deleteMany()
  for (const s of SLIDES) await prisma.heroSlide.create({ data: s })
  console.log(`  slides: ${SLIDES.length}`)

  // Tours. The six poster-based tours from tours-real.ts win over the
  // earlier hand-written ones; the rest (adventure, packages, cars) stay.
  const REAL_SLUGS = new Set(REAL_TOURS.map((x) => x.slug))
  const TOURS = [...TOURS_BASE.filter((x) => !REAL_SLUGS.has(x.slug)), ...REAL_TOURS]
  for (const tour of TOURS) {
    const { slug, ...rest } = tour
    await prisma.tour.upsert({ where: { slug }, update: rest, create: { slug, ...rest } })
  }
  console.log(`  tours: ${TOURS.length}`)

  // Places
  for (const place of PLACES) {
    const { slug, ...rest } = place
    await prisma.place.upsert({ where: { slug }, update: rest, create: { slug, ...rest } })
  }
  console.log(`  places: ${PLACES.length}`)

  // Reviews are intentionally NOT seeded. Real reviews go in from the admin
  // panel, copied verbatim from the Instagram review posts.
  const reviewCount = await prisma.review.count()
  console.log(`  reviews: ${reviewCount} (none seeded â€” add your real ones in admin)`)

  // Brand settings
  await prisma.setting.upsert({
    where: { key: 'brand' },
    update: {},
    create: {
      key: 'brand',
      value: JSON.stringify({
        primary: '#e31b3d',
        accent: '#d4a24c',
        phone: '+994 51 628 35 87',
        whatsapp: '+994516283587',
        email: 'info@evetour.az',
        instagram: 'https://www.instagram.com/evetour.az/',
      }),
    },
  })

  // About text, taken from the "About us" service card (Emil Valiyev).
  await prisma.setting.upsert({
    where: { key: 'about' },
    update: {},
    create: {
      key: 'about',
      value: JSON.stringify({
        author: { en: 'Emil Valiyev', ru: 'Эмиль Валиев' },
        body: {
          en: 'More than 8 years of experience is enough to gather nice and sophisticated people and professionals around us. Now, as EVE TOUR, we are like family. During a tour we face different requests depending on our guests, but providing any request in time has become easy for us.',
          ru: 'Более 8 лет опыта достаточно, чтобы собрать вокруг нас приятных и впечатляющих людей и профессионалов. Сейчас, в EVE TOUR, мы — как семья. Во время тура мы сталкиваемся с разными пожеланиями наших гостей, но выполнить любой запрос вовремя стало для нас простым делом.',
        },
        phone: { en: '+994 55 645 83 69', ru: '+994 55 645 83 69' },
        phone2: { en: '+994 51 628 35 87', ru: '+994 51 628 35 87' },
        site: { en: 'evetour.az', ru: 'evetour.az' },
      }),
    },
  })

  console.log('\nDone. Run `npm run dev` and open http://localhost:3000')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
