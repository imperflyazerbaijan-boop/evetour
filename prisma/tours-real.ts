/**
 * Real tour content, transcribed from EVE TOUR's published service cards
 * (public/media/services-*.jpg). Every destination, activity and museum
 * below is taken directly from those posters — nothing invented.
 *
 * Bilingual: each translatable value is a JSON {en,ru} pair.
 */
const t = (en: string, ru: string) => JSON.stringify({ en, ru })
const list = (items: { en: string; ru: string }[]) => JSON.stringify(items)
const strs = (items: string[]) => JSON.stringify(items)

export const TOURS = [
  {
    slug: 'baku-city-tour',
    category: 'baku',
    region: t('Baku', 'Баку'),
    title: t('Baku city tour', 'Городской тур по Баку'),
    subtitle: t(
      'Nizami Street, Old Town, Highland Park, Boulevard',
      'Улица Низами, Старый город, Высокий парк, Бульвар',
    ),
    excerpt: t(
      'The full Baku route: Nizami Street, the walled Old Town, Highland Park with Martyrs Alley, the Boulevard and the city museums.',
      'Полный маршрут по Баку: улица Низами, Старый город, Высокий парк с Площадью Победителей, Бульвар и музеи города.',
    ),
    description: t(
      'The classic way to see Baku in one day. We start on Nizami Street — the main place of the city — walk the Old Town with the Maiden Tower, the Palace of the Shirvanshahs and the FlorMonic garden, climb to Highland Park for Martyrs Alley, the Turkish mosque and the panoramic city view, then finish on the Boulevard with Small Venice, the funicular and the carpet museum. Museum visits are arranged on request: Carpet museum, Shirvanshah museum, Ship museum, Genocide Memorial park and the Miniature Book museum.',
      'Классический способ увидеть Баку за один день. Начинаем на улице Низами — главной улице города, проходим Старый город с Девичьей башней, дворцом Ширваншахов и садом Флормони, поднимаемся в Высокий парк — Площадь Победителей, мечеть и панорамный вид на город, затем завершаем на Бульваре — «Малая Венеция», фуникулёр и ковровый музей. По желанию организуем посещение музеев: Ковровый музей, музей Ширваншахов, музей корабля, мемориал «Геноцид» и Музей миниатюрной книги.',
    ),
    highlights: list([
      { en: 'Nizami Street — the main place of the city', ru: 'Улица Низами — главное место города' },
      { en: 'Maiden Tower and Palace of the Shirvanshahs', ru: 'Девичья башня и дворец Ширваншахов' },
      { en: 'FlorMonic garden (optional)', ru: 'Сад Флормони (по желанию)' },
      { en: 'Highland Park: Martyrs Alley, Turkish mosque, city view', ru: 'Высокий парк: Площадь Победителей, мечеть, вид на город' },
      { en: 'Boulevard: Small Venice and the funicular', ru: 'Бульвар: «Малая Венеция» и фуникулёр' },
    ]),
    includes: list([
      { en: 'Private air-conditioned car', ru: 'Частный кондиционированный автомобиль' },
      { en: 'English or Russian speaking guide', ru: 'Гид, говорящий по-английски или по-русски' },
      { en: 'Pickup and drop-off in Baku', ru: 'Встреча и проводка в Баку' },
      { en: 'Bottled water', ru: 'Бутилированная вода' },
    ]),
    excludes: list([
      { en: 'Museum entrance tickets', ru: 'Входные билеты в музеи' },
      { en: 'Lunch', ru: 'Обед' },
    ]),
    itinerary: JSON.stringify([
      {
        day: '1',
        title: t('Nizami Street & Old Town', 'Улица Низами и Старый город'),
        desc: t(
          'Walk the main place of the city, the Maiden Tower, the Palace of the Shirvanshahs and the FlorMonic garden.',
          'Главное место города, Девичья башня, дворец Ширваншахов и сад Флормони.',
        ),
        image: '/media/baku-shirvanshahs.jpg',
      },
      {
        day: '1',
        title: t('Highland Park', 'Высокий парк'),
        desc: t(
          'Martyrs Alley, the area near the Flame Towers, the Turkish mosque and the panoramic city view.',
          'Площадь Победителей, район Фламенных башен, мечеть и панорамный вид на город.',
        ),
        image: '/media/baku-panorama.jpg',
      },
      {
        day: '1',
        title: t('Boulevard & museums', 'Бульвар и музеи'),
        desc: t(
          'Small Venice, the carpet museum, the funicular, plus ship and miniature-book museums on request.',
          '«Малая Венеция», ковровый музей, фуникулёр, а также музей корабля и музей миниатюрной книги по желанию.',
        ),
        image: '/media/baku-flame-towers-boulevard.jpg',
      },
    ]),
    duration: t('1 day', '1 день'),
    durationDays: 1,
    priceFrom: 60,
    priceMode: 'from',
    coverImage: '/media/baku-skyline.jpg',
    images: strs([
      '/media/baku-skyline.jpg',
      '/media/baku-shirvanshahs.jpg',
      '/media/baku-panorama.jpg',
      '/media/baku-flame-towers-boulevard.jpg',
      '/media/baku-night-blue.jpg',
    ]),
    isFeatured: true,
    sortOrder: 0,
  },
  {
    slug: 'gabala-tour',
    category: 'gabala',
    region: t('Gabala', 'Габала'),
    title: t('Gabala tour', 'Тур в Габалу'),
    subtitle: t(
      'Nohur Lake, waterfalls, Tufandag resort',
      'Озеро Нохур, водопады, курорт Туфандаг',
    ),
    excerpt: t(
      'Nohur Lake, the Seven Beauties waterfall, the lavender fields and the Tufandag resort, with skiing in winter and Gabaland for children.',
      'Озеро Нохур, водопад «Семь красот», лавандовые поля и курорт Туфандаг: катание на лыжах зимой и Габаланд для детей.',
    ),
    description: t(
      'Two hours north of Baku, Gabala is the green heart of Azerbaijan. The day takes in Nohur Lake under the forest, the Seven Beauties waterfall, and the Tufandag resort where the cable car climbs above the valley. In summer the lavender fields come into bloom; in winter it is ski season. The Gabaland amusement area keeps the children busy, and quad biking, shooting and horse riding are all available on site.',
      'В двух часах к северу от Баку находится Габала — зелёное сердце Азербайджана. В программе дня — озеро Нохур у подножия леса, водопад «Семь красот» и курорт Туфандаг, откуда канатная дорога поднимается над долиной. Летом зацветают лавандовые поля, зимой — сезон катания на лыжах. Развлекательный комплекс Габаланд развлечёт детей, а квадроциклы, стрельба и верховая езда доступны на месте.',
    ),
    highlights: list([
      { en: 'Nohur Lake', ru: 'Озеро Нохур' },
      { en: 'Seven Beauties waterfall', ru: 'Водопад «Семь красот»' },
      { en: 'Tufandag resort and cable car', ru: 'Курорт Туфандаг и канатная дорога' },
      { en: 'Lavender field (seasonal)', ru: 'Лавандовое поле (сезонно)' },
      { en: 'Gabaland for children', ru: 'Габаланд для детей' },
    ]),
    includes: list([
      { en: 'Private car for the full day', ru: 'Частный автомобиль на весь день' },
      { en: 'English or Russian guide', ru: 'Гид по-английски или по-русски' },
      { en: 'Bottled water', ru: 'Бутилированная вода' },
    ]),
    excludes: list([
      { en: 'Ski pass and equipment', ru: 'Лыжный абонемент и снаряжение' },
      { en: 'Lunch', ru: 'Обед' },
    ]),
    itinerary: JSON.stringify([
      {
        day: '1',
        title: t('Nohur Lake & forest', 'Озеро Нохур и лес'),
        desc: t(
          'Lake views and the surrounding forest breeze.',
          'Виды на озеро и лесной воздух.',
        ),
        image: '/media/quba-mountains.jpg',
      },
      {
        day: '1',
        title: t('Seven Beauties waterfall & Tufandag', 'Водопад «Семь красот» и Туфандаг'),
        desc: t(
          'The waterfall, then the resort and cable car above the valley.',
          'Водопад, затем курорт и канатная дорога над долиной.',
        ),
        image: '/media/quba-shahdag.jpg',
      },
    ]),
    duration: t('1 day', '1 день'),
    durationDays: 1,
    priceFrom: null,
    priceMode: 'request',
    coverImage: '/media/quba-mountains.jpg',
    images: strs(['/media/quba-mountains.jpg', '/media/quba-shahdag.jpg']),
    isFeatured: true,
    sortOrder: 2,
  },
  // __MORE_TOURS__
  {
    slug: 'qusar-shahdag-tour',
    category: 'qusar',
    region: t('Qusar & Shahdag', 'Кусар и Шахдаг'),
    title: t('Qusar & Shahdag tour', 'Тур в Кусар и Шахдаг'),
    subtitle: t(
      'Mountain peak views, cable car, roller coaster',
      'Виды на вершины, канатная дорога, аттракционны',
    ),
    excerpt: t(
      'The Shahdag mountain resort: peak views, the cable car, a roller coaster, a children’s entertainment area and skiing in season.',
      'Горный курорт Шахдаг: виды на вершины, канатная дорога, аттракцион «американские горки», детская развлекательная зона и катание на лыжах.',
    ),
    description: t(
      'Shahdag is the biggest mountain resort in Azerbaijan, on the border with Russia. The cable car takes you up the slope to the viewing platforms over the valley, and in winter the slopes are served by lifts. On site there is a roller coaster and a whole entertainment area for children. We combine Qusar town with the resort in a single day trip from Baku.',
      'Шахдаг — крупнейший горный курорт Азербайджана, на границе с Россией. Канатная дорога поднимает вас по склону к смотровым площадкам над долиной, а зимой склоны обслуживают подъёмники. На территории есть аттракцион «американские горки» и целая развлекательная зона для детей. За один день из Баку мы совмещаем город Кусар с курортом.',
    ),
    highlights: list([
      { en: 'Qusar town', ru: 'Город Кусар' },
      { en: 'Shahdag mountain resort', ru: 'Горный курорт Шахдаг' },
      { en: 'Mountain peak view', ru: 'Вид на горные вершины' },
      { en: 'Cable car and roller coaster', ru: 'Канатная дорога и аттракцион' },
      { en: 'Entertainment area for children', ru: 'Развлекательная зона для детей' },
    ]),
    includes: list([
      { en: 'Private car for the full day', ru: 'Частный автомобиль на весь день' },
      { en: 'English or Russian guide', ru: 'Гид по-английски или по-русски' },
      { en: 'Bottled water', ru: 'Бутилированная вода' },
    ]),
    excludes: list([
      { en: 'Ski pass and equipment', ru: 'Лыжный абонемент и снаряжение' },
      { en: 'Lunch', ru: 'Обед' },
    ]),
    itinerary: JSON.stringify([
      {
        day: '1',
        title: t('Qusar & Shahdag resort', 'Кусар и курорт Шахдаг'),
        desc: t(
          'Drive to Qusar and up to the resort, then the cable car to the peaks.',
          'Дорога в Кусар и на курорт, затем канатная дорога к вершинам.',
        ),
        image: '/media/quba-shahdag.jpg',
      },
    ]),
    duration: t('1 day', '1 день'),
    durationDays: 1,
    priceFrom: null,
    priceMode: 'request',
    coverImage: '/media/quba-shahdag.jpg',
    images: strs(['/media/quba-shahdag.jpg', '/media/quba-mountains.jpg']),
    isFeatured: true,
    sortOrder: 3,
  },
  {
    slug: 'sheki-caravanserai',
    category: 'sheki',
    region: t('Shaki', 'Шеки'),
    title: t('Sheki tour', 'Тур в Шеки'),
    subtitle: t(
      'Khan’s Palace, caravanserais, Kish church',
      'Дворец хана, караван-сараи, церковь в Кише',
    ),
    excerpt: t(
      'Khan’s Palace museum, the caravanserais and the Kish Albanian church, plus the Marxal resort and evening entertainment.',
      'Музей дворца хана, караван-сараи и албанская церковь в Кише, а также курорт Марксал и вечерние развлечения.',
    ),
    description: t(
      'Around 280 km from Baku, Shaki is the best-preserved town in Azerbaijan. We drive up through the foothills of the Greater Caucasus and spend the day inside the old centre: the Palace of the Khans with its stained glass and wall paintings, the caravanserais that once housed silk traders, and the Kish Albanian church. On the way back we can stop at the Marxal resort, and in the evening there is bowling, billiards, hiking or camping at the Khanland entertainment place.',
      'Примерно в 280 км от Баку находится Шеки — лучше всего сохранившийся город Азербайджана. Поднимаемся в предгорья Большого Кавказа и проводим день в старом центре: дворец ханов с витражами и росписями, караван-сараи, где когда-то жили купцы шёлком, и албанская церковь в Кише. По пути можно заехать на курорт Марксал, а вечером — боулинг, бильярд, поход или кемпинг в комплексе Ханланд.',
    ),
    highlights: list([
      { en: 'Khan palace museum', ru: 'Музей дворца хана' },
      { en: 'Caravansarai', ru: 'Караван-сарай' },
      { en: 'Kish Albanian church', ru: 'Албанская церковь в Кише' },
      { en: 'Marxal resort', ru: 'Курорт Марксал' },
      { en: 'Khanland entertainment place', ru: 'Развлекательный комплекс Ханланд' },
    ]),
    includes: list([
      { en: 'Private car with driver', ru: 'Частный автомобиль с водителем' },
      { en: 'Local guide in Shaki', ru: 'Местный гид в Шеки' },
      { en: 'Lunch in a traditional restaurant', ru: 'Обед в традиционном ресторане' },
    ]),
    excludes: list([
      { en: 'Palace and museum tickets', ru: 'Билеты во дворец и музеи' },
      { en: 'Tsum cable car', ru: 'Канатная дорога в Цуме' },
    ]),
    itinerary: JSON.stringify([
      {
        day: '1',
        title: t('Drive Baku → Shaki', 'Дорога Баку → Шеки'),
        desc: t(
          'Leave early, stop at the Ganja corridor viewpoint.',
          'Выехать рано, остановиться на смотровой площадке у Гянджинского коридора.',
        ),
        image: '/media/sheki-to-baku-road.jpg',
      },
      {
        day: '1',
        title: t('Old town of Shaki', 'Старый город Шеки'),
        desc: t(
          'Khan’s Palace, the caravanserais, bazaar and a walk along the Kish road.',
          'Дворец хана, караван-сараи, базар и дорога к Кишу.',
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
      '/media/sheki-to-baku-road.jpg',
    ]),
    isFeatured: true,
    sortOrder: 1,
  },
  {
    slug: 'guba-tour',
    category: 'guba',
    region: t('Quba', 'Куба'),
    title: t('Guba tour', 'Тур в Кубу'),
    subtitle: t(
      'Qecresh forest, Macera lake, Khinalig',
      'Лес Кеджреш, озеро Мацера, Хыналыг',
    ),
    excerpt: t(
      'Apple country: the Qecresh forest, Macera lake and the mountain village of Khinalig, with horse riding and quad biking.',
      'Яблочный край: лес Кеджреш, озеро Мацера и горное село Хыналыг, верховая езда и квадроциклы.',
    ),
    description: t(
      'North of Baku the road climbs from the Caspian plain into Quba, the country’s apple capital. We walk the Qecresh forest on the mountain breeze, rest by Macera lake, and — if you wish — take the road up to Khinalig, the ancient mountain village. On site you can go horse riding or take a quad bike.',
      'Севернее Баку дорога поднимается с каспийской равнины в Кубу — столицу яблок. Мы гуляем в лесу Кеджреш на горном воздухе, отдыхаем у озера Мацера и — по желанию — поднимаемся по дороге в древнее горное село Хыналыг. На месте можно покататься на лошадях или на квадроцикле.',
    ),
    highlights: list([
      { en: 'Qecresh forest', ru: 'Лес Кеджреш' },
      { en: 'Macera lake', ru: 'Озеро Мацера' },
      { en: 'Khinalig village (optional)', ru: 'Село Хыналыг (по желанию)' },
      { en: 'Horse riding and quad biking', ru: 'Верховная езда и квадроциклы' },
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
        title: t('Qecresh forest & Macera lake', 'Лес Кеджреш и озеро Мацера'),
        desc: t(
          'Forest walk on the mountain breeze, then the lake.',
          'Прогулка по лесу на горном воздухе, затем озеро.',
        ),
        image: '/media/quba-shahdag.jpg',
      },
    ]),
    duration: t('1 day', '1 день'),
    durationDays: 1,
    priceFrom: 95,
    priceMode: 'from',
    coverImage: '/media/quba-mountains.jpg',
    images: strs([
      '/media/quba-mountains.jpg',
      '/media/quba-shahdag.jpg',
      '/media/gobustan-mud-volcanoes-2.jpg',
    ]),
    isFeatured: true,
    sortOrder: 4,
  },
  {
    slug: 'baku-absheron-tour',
    category: 'absheron',
    region: t('Baku-Absheron', 'Баку-Абшерон'),
    title: t('Baku–Absheron tour', 'Тур Баку–Абшерон'),
    subtitle: t(
      'Mud volcanoes, Fire temple, Gobustan, Heydar Aliyev Center',
      'Грязевые вулканы, Храм огня, Гобустан, Центр Гейдара Алиева',
    ),
    excerpt: t(
      'Mud volcanoes, the Zoroastrian Fire temple, the Gobustan petroglyphs and Zaha Hadid’s Heydar Aliyev Center.',
      'Грязевые вулканы, зороастрийский Храм огня, петроглифы Гобустана и Центр Гейдара Алиева Захи Хадид.',
    ),
    description: t(
      'The volcanic mud also offers health benefits; bathing in cool natural pools can alleviate symptoms associated with musculoskeletal and cardiovascular diseases. The Fire temple has its roots in the centuries when Zoroastrianism was a ruling religion — traders told of the strange sight of flames on the ground. At Gobustan, determining the first footprints of human civilisation is an incredibly difficult mission, and the rock carvings say so. The Fire mountain blazes with natural gas, with a museum inside. The day closes at the Heydar Aliyev Center, a 57,500 m² complex by Zaha Hadid noted for its flowing, curved style that eschews sharp angles.',
      'Грязевая вулканическая глина также обладает целебными свойствами: купание в прохладных природных источниках снимает симптомы заболеваний опорно-двигательного аппарата и сердечно-сосудистой системы. Храм огня восходит к векам, когда зороастризм был господствующей религией, — купцы рассказывали о необычайном зрелище пламени на земле. В Гобустане определить первые следы развития человечества невероятно трудно, и об этом говорят наскальные рисунки. Гора Янардаг горит природным газом, внутри — музей. День завершается в Центре Гейдара Алиева — комплексе площадью 57 500 м² от Захи Хадид, известном плавными изогнутыми формами без острых углов.',
    ),
    highlights: list([
      { en: 'Mud volcano and therapeutic pools', ru: 'Грязевой вулкан и лечебные источники' },
      { en: 'Fire temple (Zoroastrian)', ru: 'Храм огня (зороастрийский)' },
      { en: 'Gobustan petroglyphs', ru: 'Петроглифы Гобустана' },
      { en: 'Fire mountain (Yanar Dag) with museum', ru: 'Гора Янардаг с музеем' },
      { en: 'Heydar Aliyev Center by Zaha Hadid', ru: 'Центр Гейдара Алиева (Захи Хадид)' },
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
        title: t('Mud volcanoes', 'Грязевые вулканы'),
        desc: t(
          'Active mud vents and the therapeutic pools.',
          'Действующие грязевые источники и лечебные бассейны.',
        ),
        image: '/media/gobustan-mud-volcanoes-2.jpg',
      },
      {
        day: '1',
        title: t('Fire temple & Fire mountain', 'Храм огня и гора Янардаг'),
        desc: t(
          'The Zoroastrian temple, then the naturally burning mountain with its museum.',
          'Зороастрийский храм, затем горящая гора с музеем.',
        ),
        image: '/media/gobustan-mud-volcanoes.jpg',
      },
      {
        day: '1',
        title: t('Gobustan petroglyphs', 'Петроглифы Гобустана'),
        desc: t(
          'Climb the plateau trail between the cliffs.',
          'Подъём по тропе между скалами.',
        ),
        image: '/media/gobustan-mud-volcanoes.jpg',
      },
      {
        day: '1',
        title: t('Heydar Aliyev Center', 'Центр Гейдара Алиева'),
        desc: t(
          'Zaha Hadid’s 57,500 m² complex of flowing curves.',
          'Комплекс Захи Хадид на 57 500 м² с плавными линиями.',
        ),
        image: '/media/absheron-caspian.jpg',
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
      '/media/baku-flame-towers-boulevard.jpg',
    ]),
    isFeatured: true,
    sortOrder: 5,
  },
]
