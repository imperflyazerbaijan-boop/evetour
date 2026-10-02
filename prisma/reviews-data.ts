/**
 * Real reviews, transcribed from the customer's own screenshots and from
 * the public Google listings for EVE TOUR.
 *
 * SOURCES
 *  - Instagram "Reviews" highlight → source-assets/review-screenshots/*.jpg
 *  - Google listings → `sourceImage` carries the screenshot of the listing
 *    page the guest's words were taken from.
 *
 * The screenshots live in `source-assets/`, NOT in `public/`: they are chat
 * and listing captures, not site content, and they look poor on the public
 * site. `sourceImage` is kept here purely as provenance so any wording can
 * be re-checked against the original. It is deliberately not written to the
 * `image` column, which would render it in the public review carousel.
 *
 * `en` is the guest's own wording, lightly cleaned of chat shorthand.
 * `ru` is a faithful Russian translation for the RU site.
 *
 * To re-import after editing:  npx tsx prisma/seed-reviews.ts
 */

type Review = {
  author: string
  country?: string | null
  rating: number
  en: string
  ru: string
  tourEn: string
  tourRu: string
  /** Provenance only — the original screenshot, never shown on the site. */
  sourceImage?: string | null
}

// prettier-ignore
const REVIEWS: Review[] = [
  {
    author: 'Vee Ae',
    country: 'United Arab Emirates',
    rating: 5,
    en:
      'I booked Emil tour services prior to even booking my return ticket and leave application! My tour programs were created based off of my interests and with genuine inputs from him as a local. It went very well. On my last day of the trip, he managed the last minute activity arrangement ensuring that I get the most out of my stay. The energy he had all throughout the tour was excellently infectious. He even helped me pick out gifts for my friends back in UAE. That is a ringing 5 stars for extra service! I came to Azerbaijan as a solo traveller and left Azerbaijan with a local friend. You will definitely be in good hands trusting him with your travel plans in Azerbaijan. Thank you, Emil!',
    ru:
      'Я забронировала услуги Эмиля ещё до того, как купила обратный билет и подала заявление на визу. Программа тура была составлена исходя из моих интересов и с его настоящими советами как местного жителя. Всё прошло прекрасно. В последний день поездки он сумел организовать активность в последний момент, чтобы я получила максимум от пребывания. Его энергия была заразительна на протяжении всей поездки. Он даже помог мне выбрать подарки для друзей в ОАЭ. Это, безусловно, 5 звёзд за дополнительный сервис. Я приехала в Азербайджан как соло-путешественница, а уехала с местным другом. Смело доверяйте ему свои планы по Азербайджану. Спасибо, Эмиль.',
    tourEn: 'Private tour — full itinerary',
    tourRu: 'Индивидуальный тур — полная программа',
    sourceImage: 'source-assets/review-screenshots/vee-ae.jpg',
  },
  {
    author: 'Fatima Ayoub',
    country: 'United Kingdom',
    rating: 5,
    en:
      'Thank you for making our time in Azerbaijan so enjoyable. From the moment of inquiry, you were very responsive, respectful, and forthcoming with all the information we needed to plan our trip. During the tour itself, we truly appreciated your warm approach, your knowledge of the places we visited, and the way you showcased your country with pride. We also felt very safe and well looked after throughout, and it was great that you accommodated our preferences and gave us helpful suggestions for places to eat. As a small suggestion for the future, it would be really helpful if the tours came with a clear itemised breakdown from the start, especially in terms of entrance fees for each site. This would make it easier for travellers to budget everything from the outset. Overall, we had a wonderful experience and are grateful for your guidance. If you ever visit the UK, it would be a pleasure to show you around, and if you ever need anything from the UK, it would be an honour to help in any way I can. May Allah bless you with continued success, good health, and barakah in all your efforts. Ameen.',
    ru:
      'Спасибо, что вы сделали наше время в Азербайджане таким приятным. С самого момента обращения вы были отзывчивы, уважительны и щедро делились всей информацией, необходимой нам для планирования поездки. Во время тура мы по достоинству оценили тёплое отношение, ваши знания о посещённых местах и то, с какой гордостью вы показывали свою страну. Мы чувствовали себя в безопасности и под надёжной заботой, и было замечательно, что вы учитывали наши пожелания и подсказывали, где вкусно поесть. Небольшое предложение на будущее: было бы полезно, если бы в начале тура предоставлялся подробный расчёт стоимости, особенно в части входных билетов на каждый объект. Так путешественникам было бы проще спланировать бюджет. В целом впечатления были прекрасными, и мы благодарны вам за заботу и guidance. Если вы посетите Великобританию, нам было бы приятно показать вам город, а если вам понадобится что-то из Великобритании, для нас будет честью помочь всем, чем сможем. Пусть Аллах благословит вас успехом, здоровьем и баракатом во всех ваших начинаниях. Аминь.',
    tourEn: 'Azerbaijan in five days',
    tourRu: 'Азербайджан за пять дней',
    sourceImage: 'source-assets/review-screenshots/fatima-ayoub.jpg',
  },
  {
    author: 'Zara',
    country: null,
    rating: 5,
    en: 'Emil is excellent guide, very friendly, knows everywhere and professional tour guide. You will never feel boring with him.',
    ru: 'Эмиль — отличный гид, очень дружелюбный, знает всё и везде и является профессиональным гидом. С ним никогда не бывает скучно.',
    tourEn: 'Private tours in Azerbaijan',
    tourRu: 'Индивидуальные туры по Азербайджану',
    sourceImage: 'source-assets/review-screenshots/google-reviews-1.jpg',
  },
  {
    author: 'Ian',
    country: null,
    rating: 5,
    en: 'Very positive excellent guide. Great on timing and arranging. So professional and precise about his job. Highly recommended.',
    ru: 'Очень позитивный, превосходный гид. Отлично чувствует тайминг и организацию. Предельно профессионален и точен в своей работе. Очень рекомендую.',
    tourEn: 'Private tours in Azerbaijan',
    tourRu: 'Индивидуальные туры по Азербайджану',
    sourceImage: null,
  },
  {
    author: 'Rabiqa',
    country: null,
    rating: 5,
    en: 'Emil is very nice and friendly person. Very knowledgeable and professional guide. Highly recommended!',
    ru: 'Эмиль — очень приятный и дружелюбный человек. Очень знающий и профессиональный гид. Настоятельно рекомендую.',
    tourEn: 'Private tours in Azerbaijan',
    tourRu: 'Индивидуальные туры по Азербайджану',
    sourceImage: null,
  },
  {
    author: 'Malik Hassan',
    country: null,
    rating: 5,
    en: 'Emil is a great guy, he was always there to help me and responded to all my questions and queries.',
    ru: 'Эмиль — отличный парень, он всегда был рядом, когда мне нужна была помощь, и отвечал на все мои вопросы.',
    tourEn: 'Private tours in Azerbaijan',
    tourRu: 'Индивидуальные туры по Азербайджану',
    sourceImage: null,
  },
  {
    author: 'Benny',
    country: null,
    rating: 5,
    en: 'Emil is the excellent guide, he is combine between planner and executor. My time on Baku could be utilized on maximal so that I did visited other region with short time manner! He is decent guy and really caring. Thanks Emil, for being nice guide and nice friend. Will come back to you soon. Cheers.',
    ru: 'Эмиль — превосходный гид, он совмещает в себе планировщика и исполнителя. Моё время в Баку было использовано максимально, и я успел посетить и другие регионы за короткий срок! Он порядочный и по-настоящему заботливый человек. Спасибо, Эмиль, за то, что ты хороший гид и хороший друг. Скоро вернусь к тебе. С уважением.',
    tourEn: 'Baku & Absheron Peninsula',
    tourRu: 'Баку и Абшеронский полуостров',
    sourceImage: null,
  },
  {
    author: 'Gunel',
    country: null,
    rating: 5,
    en: 'This is a friendly review about Emil. He is well equipped with the information needed for the guiding, you may become his guest with no hesitation. Have a great tour!',
    ru: 'Это доброжелательный отзыв об Эмиле. Он прекрасно влает всей информацией, необходимой для экскурсий, вы можете смело довериться ему как своему гостю. Прекрасного путешествия!',
    tourEn: 'Private tours in Azerbaijan',
    tourRu: 'Индивидуальные туры по Азербайджану',
    sourceImage: 'source-assets/review-screenshots/google-reviews-2.jpg',
  },
  {
    author: 'Asif',
    country: null,
    rating: 5,
    en: 'Wonderful friend disguised in a tour guide.',
    ru: 'Прекрасный друг, замаскированный под гида.',
    tourEn: 'Private tours in Azerbaijan',
    tourRu: 'Индивидуальные туры по Азербайджану',
    sourceImage: null,
  },
  {
    author: 'Ayshan',
    country: null,
    rating: 5,
    en: 'Emil is so friendly, positive and best local tour guide.',
    ru: 'Эмиль очень дружелюбный, позитивный и лучший местный гид.',
    tourEn: 'Private tours in Azerbaijan',
    tourRu: 'Индивидуальные туры по Азербайджану',
    sourceImage: null,
  },
  {
    author: 'Munir',
    country: null,
    rating: 5,
    en: 'Emil an excellent human being.',
    ru: 'Эмиль — прекрасный человек.',
    tourEn: 'Private tours in Azerbaijan',
    tourRu: 'Индивидуальные туры по Азербайджану',
    sourceImage: null,
  },
  {
    author: 'Aisha',
    country: null,
    rating: 5,
    en: 'As a local guide Emil is a good guide.',
    ru: 'Как местный гид, Эмиль — хороший гид.',
    tourEn: 'Private tours in Azerbaijan',
    tourRu: 'Индивидуальные туры по Азербайджану',
    sourceImage: null,
  },
  {
    author: 'Rita',
    country: null,
    rating: 5,
    en: 'Emil is a very friendly person, I really enjoyed my time with him!',
    ru: 'Эмиль — очень дружелюбный человек, мне действительно очень понравилось проводить с ним время!',
    tourEn: 'Private tours in Azerbaijan',
    tourRu: 'Индивидуальные туры по Азербайджану',
    sourceImage: 'source-assets/review-screenshots/google-reviews-3.jpg',
  },
  {
    author: 'TaRiq',
    country: null,
    rating: 4,
    en: 'Had a wonderful time with Emil as he had to work hard to arrange for our tour in a short notice and during Eid holiday when most places are closed. Thank you Emil.',
    ru: 'Прекрасно провели время с Эмилем: ему пришлось приложить много усилий, чтобы организовать наш тур в короткий срок и во время праздника Ид, когда большинство мест было закрыто. Спасибо, Эмиль.',
    tourEn: 'Baku & Absheron Peninsula',
    tourRu: 'Баку и Абшеронский полуостров',
    sourceImage: null,
  },
  {
    author: 'Muthusam',
    country: null,
    rating: 5,
    en: 'Response rate is excellent and the prices was very reasonable among all the agency have met. Have some misunderstanding between us since he was not in town and a different driver came. But was sorted out. Over all it was very good.',
    ru: 'Скорость ответа отличная, а цены весьма разумны по сравнению со всеми агентствами, с которыми я сталкивался. Было некоторое недопонимание, так как его не было в городе и приехал другой водитель. Но всё уладилось. В целом всё было очень хорошо.',
    tourEn: 'Private tours in Azerbaijan',
    tourRu: 'Индивидуальные туры по Азербайджану',
    sourceImage: null,
  },
  {
    author: 'Fahad',
    country: null,
    rating: 5,
    en: 'Emil got our respect and love in a very short time. We spent quality time together. We did the things we did not plan beforehand, but he made our day unforgettable. He is really a trustworthy smart guy. We wanted to see some extra ordinary places and he surprised us every time. We saw every single part of Azerbaijan including the local lifestyle. I recommend Emil to everyone who wants to experience his tour in a different and unforgettable way. I believe that if we come here again he will surprise us with his creativeness again. Thumbs up. Highly recommended to everyone.',
    ru: 'Эмиль за очень короткое время заслужил наше уважение и любовь. Мы провели вместе качественное время. Мы делали то, чего не планировали заранее, но он сделал наш день незабываемым. Он действительно надёжный и умный человек. Мы хотели увидеть необычные места, и он каждый раз нас удивлял. Мы увидели буквально все части Азербайджана, включая местный образ жизни. Рекомендую Эмиля всем, кто хочет пережить его тур по-особенному и незабываемо. Уверен, что если мы приедем снова, он снова нас удивит своей креативностью. Рекомендую всем.',
    tourEn: 'Azerbaijan full tour',
    tourRu: 'Полный тур по Азербайджану',
    sourceImage: 'source-assets/review-screenshots/fahad.jpg',
  },
  {
    author: 'Zaur',
    country: null,
    rating: 5,
    en: 'Amazing people, amazing service. Highly recommended. I have already told two of my friends to explore Baku with them, and I am also planning a next visit to Azerbaijan with them too. Zaur is really a sweet person, helping and accommodating his clients.',
    ru: 'Потрясающие люди, потрясающий сервис. Настоятельно рекомендую. Я уже рассказала двум своим подругам, чтобы они поехали исследовать Баку вместе с нами, и я тоже планирую следующий визит в Азербайджан с ними. Заур — действительно прекрасный, отзывчивый человек, который помогает и идёт навстречу своим клиентам.',
    tourEn: 'Baku city tour',
    tourRu: 'Обзорный тур по Баку',
    sourceImage: 'source-assets/review-screenshots/umm-nabeeha-comment.jpg',
  },
  {
    author: 'Ahmed',
    country: null,
    rating: 5,
    en: 'They have thoroughly enjoyed the trip over the past few days. They have told us nothing but only good things about your services so far. Even on the first day itself they called us and told us that they were very satisfied with the service. We owe you a lot!',
    ru: 'Они полностью насладились поездкой за последние несколько дней. Пока что они говорили нам только хорошее о вашем сервисе. Уже в первый день они позвонили нам и сказали, что полностью довольны обслуживанием. Мы вам очень благодарны!',
    tourEn: 'Azerbaijan in five days',
    tourRu: 'Азербайджан за пять дней',
    sourceImage: 'source-assets/review-screenshots/ahmed-oct-2024.jpg',
  },
  {
    author: 'Yousaf',
    country: null,
    rating: 5,
    en: 'Hi Emil. Thank you for reaching out. I got home at 5.30 AM safely. And I had a wonderful time in Azerbaijan. Please let me know how and where should I post a review to help you?',
    ru: 'Привет, Эмиль. Спасибо, что связался со мной. Я благополучно добрался домой в 5:30 утра. И я провёл великолепное время в Азербайджане. Пожалуйста, подскажи, как и где мне оставить отзыв, чтобы он тебе помог?',
    tourEn: 'Shaki & Quba region',
    tourRu: 'Регион Шеки и Куба',
    sourceImage: 'source-assets/review-screenshots/yousaf.jpg',
  },
  {
    author: 'Victor Bekink',
    country: null,
    rating: 5,
    en: 'Thanks to everyone for the great tours and transport.',
    ru: 'Спасибо всем за отличные туры и транспорт.',
    tourEn: 'Group tours in Azerbaijan',
    tourRu: 'Групповые туры по Азербайджану',
    sourceImage: 'source-assets/review-screenshots/victor-bekink.jpg',
  },
  {
    author: 'Pranay',
    country: null,
    rating: 5,
    en: 'Yesterday after airport transfer we handed over the payment to Mubariz. Thank you for the arrangements and making our trip memorable.',
    ru: 'Вчера после трансфера из аэропорта мы передали оплату Мубаризу. Спасибо за организацию и за то, что вы сделали нашу поездку незабываемой.',
    tourEn: 'Private tour — full itinerary',
    tourRu: 'Индивидуальный тур — полная программа',
    sourceImage: 'source-assets/review-screenshots/pranay-dec-2024.jpg',
  },
  {
    author: 'Sheki guests',
    country: null,
    rating: 5,
    en: 'Awesome. I hope you enjoyed Sheki. We had a great time here. Thanks to you guys.',
    ru: 'Отлично. Надеюсь, вам понравился Шеки. Нам здесь было очень хорошо. Спасибо вам, ребята.',
    tourEn: 'Sheki & Karavanserais',
    tourRu: 'Шеки и караван-сараи',
    sourceImage: 'source-assets/review-screenshots/sheki-dec-2024.jpg',
  },
  {
    author: 'Guest family',
    country: null,
    rating: 5,
    en: 'No complaints about it. They are happy, my parents are happy and left happily, and wanted to stay for a few more days because of the hospitality you guys provided. A big thank you to you as well for going out of the way and making this tour a wonderful memory. Great job. Now it is our turn to visit Baku, and for sure we will contact you once we decide the dates.',
    ru: 'Никаких нареканий. Они счастливы, мои родители счастливы и уехали довольными, и хотели остаться ещё на несколько дней из-за гостеприимства, которое вы им предложили. Большое вам спасибо за то, что вы приложили все усилия и сделали этот тур прекрасным воспоминанием. Отличная работа. Теперь наша очередь посетить Баку, и мы обязательно свяжемся с вами, как только определимся с датами.',
    tourEn: 'Baku & Absheron Peninsula',
    tourRu: 'Баку и Абшеронский полуостров',
    sourceImage: 'source-assets/review-screenshots/guest-family-baku.jpg',
  },
  {
    author: 'T Shafique',
    country: null,
    rating: 5,
    en: 'All the guys I met here are wonderful and friendly. Really, I am serious. I would love to be here more, but time passed and I have to fly tomorrow. I hope I will come back soon. Thanks for everything.',
    ru: 'Все ребята, которых я здесь встретил, — чудесные и дружелюбные. Я серьёзно: я бы с удовольствием провёл здесь больше времени, но время ушло, и завтра мне нужно лететь. Надеюсь, скоро вернусь. Спасибо за всё.',
    tourEn: 'Baku & Absheron Peninsula',
    tourRu: 'Баку и Абшеронский полуостров',
    sourceImage: 'source-assets/review-screenshots/shafique.jpg',
  },
  {
    author: 'Azerbaijan flag family',
    country: null,
    rating: 5,
    en: 'Best trip ever with the Azerbaijan flag on their T-shirt.',
    ru: 'Лучшая поездка в моей жизни: флаг Азербайджана у них на футболке.',
    tourEn: 'Quba & Shahdag',
    tourRu: 'Куба и Шагдаг',
    sourceImage: 'source-assets/review-screenshots/azerbaijan-flag-tshirt.jpg',
  },
  {
    author: 'Superb tour guests',
    country: null,
    rating: 5,
    en: 'I cannot thank you enough for the superb tour. Your passion for the subject matter was inspiring! The tour was an enlightening experience. Thank you for making it so special!',
    ru: 'Не могу достаточно поблагодарить вас за великолепный тур. Ваша страсть к своему делу вдохновляет! Этот тур стал для меня настоящим открытием. Спасибо, что сделали его таким особенным!',
    tourEn: 'Private tour — full itinerary',
    tourRu: 'Индивидуальный тур — полная программа',
    sourceImage: 'source-assets/review-screenshots/superb-tour-aug-2024.jpg',
  },
  {
    author: 'Emil’s brother',
    country: null,
    rating: 5,
    en: 'Salam alikom, how are you? We are in the airport. Thank you sooo much for your service and everything. Really, really, you are a great man. Thank you for everything. See you next time, inshallah.',
    ru: 'Салам алейкум, как дела? Мы в аэропорту. Большое вам спасибо за сервис и за всё. Вы — замечательный человек. Спасибо за всё. Увидимся в следующий раз, иншааллах.',
    tourEn: 'Airport transfer & Baku tour',
    tourRu: 'Трансфер из аэропорта и тур по Баку',
    sourceImage: 'source-assets/review-screenshots/brother-airport-aug-2024.jpg',
  },
  {
    author: 'Grateful guests',
    country: null,
    rating: 5,
    en: 'Thank you so much for all the arrangements, and it was a lovely tour. May Allah give you much more success in the coming future. Ameen. Please do share your Instagram page, I will like it and share with friends. Cheers.',
    ru: 'Большое спасибо за все приготовления, тур получился прекрасным. Пусть Аллах даст тебе ещё большего успеха в будущем. Аминь. Пожалуйста, поделись своей страницей в Instagram — я поставлю лайк и расскажу друзьям. С уважением.',
    tourEn: 'Caspian coast & Baku',
    tourRu: 'Каспийское побережье и Баку',
    sourceImage: 'source-assets/review-screenshots/lovely-tour-aug-2025.jpg',
  },
  {
    author: 'Shahdag guests',
    country: null,
    rating: 5,
    en: 'The trip was really nice. We did not manage to see a lot of places, but it was good. We spent most of the time in Shahdag, I think.',
    ru: 'Поездка была очень классной. Мы не успели осмотреть много мест, но в целом всё понравилось. Кажется, большую часть времени мы провели в Шагдаге.',
    tourEn: 'Quba & Shahdag',
    tourRu: 'Куба и Шагдаг',
    sourceImage: 'source-assets/review-screenshots/shahdag-oct-2025.jpg',
  },
  {
    author: 'Shahdaq guests',
    country: null,
    rating: 5,
    en: 'Shahdag was an amazing trip. The experience of that place elevated my overall Azerbaijan experience. Even while I was on the way to Baku, I made multiple calls to my friends on why they must come here. For giving me such an amazing experience, I wish you huge success and happiness this year.',
    ru: 'Шагдаг — это была потрясающая поездка. Впечатления от этого места подняли общее впечатление от Азербайджана. Ещё по пути в Баку я несколько раз позвонила друзьям и рассказала, почему им обязательно нужно сюда приехать. За такое потрясающее впечатление желаю тебе огромного успеха и счастья в этом году.',
    tourEn: 'Quba & Shahdag',
    tourRu: 'Куба и Шагдаг',
    sourceImage: 'source-assets/review-screenshots/shahdaq-feedback.jpg',
  },
  {
    author: 'Winter day guests',
    country: null,
    rating: 5,
    en: 'It was really good. Thank you so much. Really the best day in Azerbaijan for us.',
    ru: 'Было очень хорошо. Большое вам спасибо. Это действительно лучший день в Азербайджане для нас.',
    tourEn: 'Baku & Absheron Peninsula',
    tourRu: 'Баку и Абшеронский полуостров',
    sourceImage: 'source-assets/review-screenshots/best-day-dec-2025.jpg',
  },
  {
    author: 'Souvenir guest',
    country: null,
    rating: 5,
    en: '10/10. A little souvenir of the day! Thank you!',
    ru: '10 из 10. Небольшой сувенир на память! Спасибо!',
    tourEn: 'Baku & Absheron Peninsula',
    tourRu: 'Баку и Абшеронский полуостров',
    sourceImage: 'source-assets/review-screenshots/souvenir-10of10.jpg',
  },
]

export { REVIEWS }
