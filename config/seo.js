/**
 * SEO Configuration — V Luxury Suites (Pefkohori)
 * Centralized SEO constants to avoid duplication
 * Can accept companyData from DB or fallback to config
 */

import { getBaseUrl } from "@config/domain";

const fallbackCompanyData = {
  name: "V Luxury Suites",
  tel: "+30 000 000 0000",
  tel2: "",
  email: "admin@bbqr.site",
  address: "Xoris Odo 0, Pefkochori, Kassandra, Halkidiki, Greece",
  coords: { lat: "39.982398", lon: "23.635154" },
};

/** Single source of truth for production base URL. */
export const PRODUCTION_BASE_URL = getBaseUrl();

export const multilingualDescriptions = {
  en: "V Luxury Suites — stylish suites in Pefkohori, Kassandra, Halkidiki. Infinity pool, sea-view terraces, free parking and Wi‑Fi. Book online.",
  ru: "V Luxury Suites — стильные сьюты в Пефкохори, Кассандра, Халкидики. Infinity pool, террасы с видом на море, бесплатная парковка и Wi‑Fi. Бронируйте онлайн.",
  uk: "V Luxury Suites — стильні сьюті в Пефкохорі, Кассандра, Халкідіки. Infinity pool, тераси з видом на море, безкоштовна парковка та Wi‑Fi. Бронюйте онлайн.",
  de: "V Luxury Suites — stilvolle Suiten in Pefkohori, Kassandra, Chalkidiki. Infinity-Pool, Meerblick-Terrassen, kostenlose Parkplätze und WLAN. Online buchen.",
  sr: "V Luxury Suites — elegantni apartmani u Pefkohoriju, Kasandra, Halkidiki. Infinity pool, terase sa pogledom na more, besplatan parking i Wi‑Fi. Rezervišite online.",
  ro: "V Luxury Suites — suite elegante în Pefkohori, Kassandra, Halkidiki. Piscină infinity, terase cu vedere la mare, parcare gratuită și Wi‑Fi. Rezervați online.",
  bg: "V Luxury Suites — стилни апартаменти в Пефкохори, Касандра, Халкидики. Infinity pool, тераси с морска гледка, безплатен паркинг и Wi‑Fi. Резервирайте онлайн.",
  el: "V Luxury Suites — κομψά suites στο Πευκοχώρι, Κασσάνδρα, Χαλκιδική. Infinity pool, βεράντες με θέα στη θάλασσα, δωρεάν πάρκινγκ και Wi‑Fi. Κλείστε online.",
  pl: "V Luxury Suites — stylowe apartamenty w Pefkohori, Kassandra, Chalkidiki. Infinity pool, tarasy z widokiem na morze, darmowy parking i Wi‑Fi. Rezerwuj online.",
};

export const multilingualTitles = {
  en: "V Luxury Suites — Pefkohori, Kassandra, Halkidiki",
  ru: "V Luxury Suites — Пефкохори, Кассандра, Халкидики",
  uk: "V Luxury Suites — Пефкохорі, Кассандра, Халкідіки",
  de: "V Luxury Suites — Pefkohori, Kassandra, Chalkidiki",
  sr: "V Luxury Suites — Pefkohori, Kasandra, Halkidiki",
  ro: "V Luxury Suites — Pefkohori, Kassandra, Halkidiki",
  bg: "V Luxury Suites — Пефкохори, Касандра, Халкидики",
  el: "V Luxury Suites — Πευκοχώρι, Κασσάνδρα, Χαλκιδική",
  pl: "V Luxury Suites — Pefkohori, Kassandra, Chalkidiki",
};

/**
 * Get SEO configuration
 * @param {Object} [dbCompanyData] - Company data from database (optional)
 * @returns {Object} SEO configuration object
 */
export function getSeoConfig(dbCompanyData = null) {
  const companyData = dbCompanyData || fallbackCompanyData;
  const siteName =
    companyData?.name || fallbackCompanyData.name || "V Luxury Suites";

  return {
    siteName,
    baseUrl: getBaseUrl(),
    defaultLocale: "en",
    supportedLocales: ["en", "ru", "uk", "de", "sr", "ro", "bg", "el", "pl"],
    primaryLocation: "Greece",
    titleTemplate: `%s | ${siteName}`,
    defaultTitle: multilingualTitles.en,
    defaultDescription: multilingualDescriptions.en,
    descriptions: multilingualDescriptions,
    titles: multilingualTitles,
    social: {
      facebook: "",
      instagram: "",
      linkedin: "",
    },
    contact: {
      email: companyData?.email || fallbackCompanyData.email || "admin@bbqr.site",
      phone: companyData?.tel || fallbackCompanyData.tel || "",
      address:
        companyData?.address ||
        fallbackCompanyData.address ||
        "Greece",
    },
    coordinates: {
      lat:
        companyData?.coords?.lat ||
        fallbackCompanyData.coords?.lat ||
        "39.982398",
      lon:
        companyData?.coords?.lon ||
        fallbackCompanyData.coords?.lon ||
        "23.635154",
    },
    heroImageUrl:
      (Array.isArray(companyData?.assets?.heroImages) &&
        companyData.assets.heroImages[0]) ||
      companyData?.assets?.ogImage ||
      process.env.NEXT_PUBLIC_HERO_IMAGE_URL ||
      null,
    heroImages: getHeroImages(companyData),
  };
}

function getHeroImages(dbCompanyData = null) {
  const fromDb = Array.isArray(dbCompanyData?.assets?.heroImages)
    ? dbCompanyData.assets.heroImages.filter(
        (item) => typeof item === "string" && item.trim().length > 0
      )
    : [];
  if (fromDb.length) return fromDb;

  const raw =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_HERO_IMAGES) || "";
  if (!raw || typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => typeof item === "string" && item.trim().length > 0
    );
  } catch {
    return [];
  }
}

export const seoConfig = getSeoConfig();

export default getSeoConfig;
