/**
 * Cross-promo: S Luxury Princess Suite (Nea Kallikratia)
 * sister property of V Luxury Suites (Pefkohori).
 * Source site: https://s-luxury-princess-suite.bbqr.site
 */

export const PRINCESS_SITE_ORIGIN = "https://s-luxury-princess-suite.bbqr.site";

export const PRINCESS_ROUTE = "/princess-suite";

const IMG = "/images/Gallery/EXTERNAL";

export const PRINCESS_HERO_IMAGES = [
  `${IMG}/SEA_1.jpg`,
  `${IMG}/POOL_1.jpg`,
  `${IMG}/HOTEL_1.jpg`,
  `${IMG}/PAN_1.jpg`,
];

export const PRINCESS_GALLERY_IMAGES = [
  `${IMG}/SEA_1.jpg`,
  `${IMG}/POOL_SIDE_1.jpg`,
  `${IMG}/POOL_2.jpg`,
  `${IMG}/HOTEL_2.jpg`,
  `${IMG}/GARDEN_1.jpg`,
  `${IMG}/GARDEN_2.jpg`,
  `${IMG}/PAN_2.jpg`,
  `${IMG}/PAN_3.jpg`,
  `${IMG}/AREA_1.jpg`,
  `${IMG}/BALC_1.jpg`,
];

export const PRINCESS_ROOMS = [
  { id: "apollonas", name: "Apollonas", sizeM2: 12, guests: 2, kind: "Deluxe Suite" },
  { id: "salomi", name: "Salomi", sizeM2: 35, guests: 4, kind: "Deluxe Suite · Sea View" },
  { id: "victoria", name: "Victoria", sizeM2: 28, guests: 2, kind: "Deluxe Queen Suite" },
  { id: "alexander", name: "Alexander", sizeM2: 25, guests: 2, kind: "Junior Suite · Balcony" },
  { id: "nefeli", name: "Nefeli", sizeM2: 30, guests: 2, kind: "Junior Suite · Terrace" },
  { id: "areti", name: "Areti", sizeM2: 20, guests: 2, kind: "Deluxe Triple" },
  { id: "erato", name: "Erato", sizeM2: 20, guests: 2, kind: "Deluxe Double" },
  { id: "ariadni", name: "Ariadni", sizeM2: 12, guests: 2, kind: "Deluxe Double" },
  { id: "afroditi", name: "Afroditi", sizeM2: 12, guests: 2, kind: "Deluxe Double" },
];

export const PRINCESS_CONTACT = {
  phones: ["+306998469136", "+306975661980"],
  emails: ["luxurysuites2@gmail.com", "princess@bbqr.site"],
  address: "Katsirma 7, Nea Kallikratia 630 80, Chalkidiki, Greece",
};

/** Locales supported on the Princess booking site. */
const PRINCESS_SITE_LOCALES = new Set(["en", "ru", "uk", "de", "el"]);

export function princessBookingUrl(locale = "en") {
  const loc = PRINCESS_SITE_LOCALES.has(locale) ? locale : "en";
  return `${PRINCESS_SITE_ORIGIN}/${loc}/`;
}

const COPY = {
  en: {
    brand: "S Luxury Princess Suite",
    place: "Nea Kallikratia · Chalkidiki",
    headline: "Seafront suites, twenty metres from the Aegean",
    tagline:
      "A sister stay to V Luxury — calm waterfront apartments in Nea Kallikratia.",
    cta: "Book on Princess Suite",
    ctaSecondary: "View apartments",
    roomsTitle: "Nine apartments",
    roomsSubtitle: "From compact doubles to a sea-view suite for four.",
    locationTitle: "Prime waterfront",
    locationBody:
      "Just 20 metres from the Aegean in Nea Kallikratia. Beach mornings, long sunsets, and the quiet rhythm of the Kassandra coast.",
    galleryTitle: "The property",
    teaserEyebrow: "Also in Nea Kallikratia",
    teaserTitle: "S Luxury Princess Suite",
    teaserBody: "Seafront apartments twenty metres from the beach — our sister property.",
    teaserCta: "Discover Princess Suite",
    guestsLabel: (n) => (n === 1 ? "1 guest" : `Up to ${n} guests`),
    sizeLabel: (m) => `${m} m²`,
    metaTitle: "S Luxury Princess Suite · Nea Kallikratia | V Luxury Suites",
    metaDescription:
      "Discover S Luxury Princess Suite in Nea Kallikratia — seafront apartments 20 m from the Aegean. Sister property of V Luxury Suites in Pefkohori.",
  },
  ru: {
    brand: "S Luxury Princess Suite",
    place: "Неа Каликратия · Халкидики",
    headline: "Сьюты у моря — 20 метров до Эгейского моря",
    tagline:
      "Сестринский объект V Luxury — спокойные апартаменты на первой линии в Неа Каликратии.",
    cta: "Бронировать на Princess Suite",
    ctaSecondary: "Смотреть апартаменты",
    roomsTitle: "Девять апартаментов",
    roomsSubtitle: "От компактных double до сьюта с видом на море для четверых.",
    locationTitle: "Первая линия",
    locationBody:
      "Всего 20 метров до Эгейского моря в Неа Каликратии. Утро на пляже, закаты и спокойный ритм побережья Кассандры.",
    galleryTitle: "Объект",
    teaserEyebrow: "Также в Неа Каликратии",
    teaserTitle: "S Luxury Princess Suite",
    teaserBody: "Апартаменты у моря, 20 метров до пляжа — наш сестринский объект.",
    teaserCta: "Открыть Princess Suite",
    guestsLabel: (n) => (n === 1 ? "1 гость" : `До ${n} гостей`),
    sizeLabel: (m) => `${m} м²`,
    metaTitle: "S Luxury Princess Suite · Неа Каликратия | V Luxury Suites",
    metaDescription:
      "S Luxury Princess Suite в Неа Каликратии — апартаменты у моря, 20 м до Эгейского. Сестринский объект V Luxury Suites в Пефкохори.",
  },
  uk: {
    brand: "S Luxury Princess Suite",
    place: "Неа Калікратія · Халкідіки",
    headline: "Сьюті біля моря — 20 метрів до Егейського моря",
    tagline:
      "Сестринський об'єкт V Luxury — спокійні апартаменти на першій лінії в Неа Калікратії.",
    cta: "Бронювати на Princess Suite",
    ctaSecondary: "Дивитися апартаменти",
    roomsTitle: "Дев'ять апартаментів",
    roomsSubtitle: "Від компактних double до сьютів з видом на море для чотирьох.",
    locationTitle: "Перша лінія",
    locationBody:
      "Лише 20 метрів до Егейського моря в Неа Калікратії. Ранок на пляжі, заходи сонця і спокійний ритм узбережжя Кассандри.",
    galleryTitle: "Об'єкт",
    teaserEyebrow: "Також у Неа Калікратії",
    teaserTitle: "S Luxury Princess Suite",
    teaserBody: "Апартаменти біля моря, 20 метрів до пляжу — наш сестринський об'єкт.",
    teaserCta: "Відкрити Princess Suite",
    guestsLabel: (n) => (n === 1 ? "1 гість" : `До ${n} гостей`),
    sizeLabel: (m) => `${m} м²`,
    metaTitle: "S Luxury Princess Suite · Неа Калікратія | V Luxury Suites",
    metaDescription:
      "S Luxury Princess Suite у Неа Калікратії — апартаменти біля моря, 20 м до Егейського. Сестринський об'єкт V Luxury Suites у Пефкохорі.",
  },
  de: {
    brand: "S Luxury Princess Suite",
    place: "Nea Kallikratia · Chalkidiki",
    headline: "Suiten am Meer — zwanzig Meter bis zur Ägäis",
    tagline:
      "Schwesterobjekt von V Luxury — ruhige Wasserfront-Apartments in Nea Kallikratia.",
    cta: "Auf Princess Suite buchen",
    ctaSecondary: "Apartments ansehen",
    roomsTitle: "Neun Apartments",
    roomsSubtitle: "Von kompakten Doubles bis zur Meerblicksuite für vier.",
    locationTitle: "Erste Meereslinie",
    locationBody:
      "Nur 20 Meter zur Ägäis in Nea Kallikratia. Strandmorgen, lange Sonnenuntergänge und der ruhige Rhythmus der Kassandra-Küste.",
    galleryTitle: "Die Anlage",
    teaserEyebrow: "Auch in Nea Kallikratia",
    teaserTitle: "S Luxury Princess Suite",
    teaserBody: "Apartments am Meer, zwanzig Meter zum Strand — unser Schwesterobjekt.",
    teaserCta: "Princess Suite entdecken",
    guestsLabel: (n) => (n === 1 ? "1 Gast" : `Bis ${n} Gäste`),
    sizeLabel: (m) => `${m} m²`,
    metaTitle: "S Luxury Princess Suite · Nea Kallikratia | V Luxury Suites",
    metaDescription:
      "S Luxury Princess Suite in Nea Kallikratia — Apartments am Meer, 20 m zur Ägäis. Schwesterobjekt von V Luxury Suites in Pefkohori.",
  },
  el: {
    brand: "S Luxury Princess Suite",
    place: "Νέα Καλλικράτεια · Χαλκιδική",
    headline: "Σουίτες δίπλα στη θάλασσα — 20 μέτρα από το Αιγαίο",
    tagline:
      "Αδελφό κατάλυμα του V Luxury — ήρεμα διαμερίσματα στην πρώτη γραμμή στη Νέα Καλλικράτεια.",
    cta: "Κράτηση στο Princess Suite",
    ctaSecondary: "Δείτε τα διαμερίσματα",
    roomsTitle: "Εννέα διαμερίσματα",
    roomsSubtitle: "Από compact doubles έως σουίτα με θέα στη θάλασσα για τέσσερις.",
    locationTitle: "Πρώτη γραμμή",
    locationBody:
      "Μόλις 20 μέτρα από το Αιγαίο στη Νέα Καλλικράτεια. Πρωινά στην παραλία, ηλιοβασιλέματα και ήρεμος ρυθμός στην ακτή της Κασσάνδρας.",
    galleryTitle: "Το κατάλυμα",
    teaserEyebrow: "Επίσης στη Νέα Καλλικράτεια",
    teaserTitle: "S Luxury Princess Suite",
    teaserBody: "Διαμερίσματα δίπλα στη θάλασσα, 20 μέτρα από την παραλία — το αδελφό μας κατάλυμα.",
    teaserCta: "Ανακαλύψτε το Princess Suite",
    guestsLabel: (n) => (n === 1 ? "1 επισκέπτης" : `Έως ${n} επισκέπτες`),
    sizeLabel: (m) => `${m} m²`,
    metaTitle: "S Luxury Princess Suite · Νέα Καλλικράτεια | V Luxury Suites",
    metaDescription:
      "S Luxury Princess Suite στη Νέα Καλλικράτεια — διαμερίσματα δίπλα στη θάλασσα, 20 μ. από το Αιγαίο. Αδελφό κατάλυμα του V Luxury Suites στο Πευκοχώρι.",
  },
};

export function getPrincessPromoCopy(locale = "en") {
  return COPY[locale] || COPY.en;
}
