/**
 * SEO Configuration — per-property via company (Mongo) + env base URL.
 * Templates use {siteName} and {placeName}; filled in getSeoConfig(company).
 */

import { getBaseUrl } from "@config/domain";

const fallbackCompanyData = {
  name: "V Luxury Suites",
  tel: "+353 85 270 96 05",
  tel2: "",
  email: "admin@bbqr.site",
  address: "Xoris Odo 0, Pefkochori, Kassandra, Halkidiki, Greece",
  slogan: "Suites · Pefkohori · Kassandra · Halkidiki",
  coords: { lat: "39.982398", lon: "23.635154" },
  locations: [
    { name: "Pefkohori", coords: { lat: "39.982398", lon: "23.635154" } },
  ],
};

/** Single source of truth for production base URL. */
export const PRODUCTION_BASE_URL = getBaseUrl();

const titleTemplates = {
  en: "{siteName} — {placeName}, Kassandra, Halkidiki",
  ru: "{siteName} — {placeName}, Кассандра, Халкидики",
  uk: "{siteName} — {placeName}, Кассандра, Халкідіки",
  de: "{siteName} — {placeName}, Kassandra, Chalkidiki",
  sr: "{siteName} — {placeName}, Kasandra, Halkidiki",
  ro: "{siteName} — {placeName}, Kassandra, Halkidiki",
  bg: "{siteName} — {placeName}, Касандра, Халкидики",
  el: "{siteName} — {placeName}, Κασσάνδρα, Χαλκιδική",
  pl: "{siteName} — {placeName}, Kassandra, Chalkidiki",
};

const descriptionTemplates = {
  en: "{siteName} — stylish suites in {placeName}, Kassandra, Halkidiki. Infinity pool, sea-view terraces, free parking and Wi‑Fi. Book online.",
  ru: "{siteName} — стильные сьюты в {placeName}, Кассандра, Халкидики. Infinity pool, террасы с видом на море, бесплатная парковка и Wi‑Fi. Бронируйте онлайн.",
  uk: "{siteName} — стильні сьюті в {placeName}, Кассандра, Халкідіки. Infinity pool, тераси з видом на море, безкоштовна парковка та Wi‑Fi. Бронюйте онлайн.",
  de: "{siteName} — stilvolle Suiten in {placeName}, Kassandra, Chalkidiki. Infinity-Pool, Meerblick-Terrassen, kostenlose Parkplätze und WLAN. Online buchen.",
  sr: "{siteName} — elegantni apartmani u {placeName}, Kasandra, Halkidiki. Infinity pool, terase sa pogledom na more, besplatan parking i Wi‑Fi. Rezervišite online.",
  ro: "{siteName} — suite elegante în {placeName}, Kassandra, Halkidiki. Piscină infinity, terase cu vedere la mare, parcare gratuită și Wi‑Fi. Rezervați online.",
  bg: "{siteName} — стилни апартаменти в {placeName}, Касандра, Халкидики. Infinity pool, тераси с морска гледка, безплатен паркинг и Wi‑Fi. Резервирайте онлайн.",
  el: "{siteName} — κομψά suites στο {placeName}, Κασσάνδρα, Χαλκιδική. Infinity pool, βεράντες με θέα στη θάλασσα, δωρεάν πάρκινγκ και Wi‑Fi. Κλείστε online.",
  pl: "{siteName} — stylowe apartamenty w {placeName}, Kassandra, Chalkidiki. Infinity pool, tarasy z widokiem na morze, darmowy parking i Wi‑Fi. Rezerwuj online.",
};

function fillTemplate(template, vars) {
  return String(template || "").replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] != null ? String(vars[key]) : ""
  );
}

function mapTemplates(templates, vars) {
  return Object.fromEntries(
    Object.entries(templates).map(([locale, template]) => [
      locale,
      fillTemplate(template, vars),
    ])
  );
}

/**
 * Primary town / resort for this property (SEO + booking defaults).
 * Order: env → company.seo.placeName → company.locations[0] → slogan middle token → Pefkohori.
 */
export function resolvePlaceName(companyData = null) {
  const fromEnv = String(process.env.SEO_PLACE_NAME || "").trim();
  if (fromEnv) return fromEnv;
  const fromSeo = String(companyData?.seo?.placeName || "").trim();
  if (fromSeo) return fromSeo;
  const fromLoc = String(companyData?.locations?.[0]?.name || "").trim();
  if (fromLoc) return fromLoc;
  const slogan = String(companyData?.slogan || "");
  const parts = slogan
    .split(/[·|,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length >= 2 && !/suites|apartments|stays/i.test(parts[1])) {
    return parts[1];
  }
  if (parts.length >= 2) return parts[1];
  return "Pefkohori";
}

/**
 * Get SEO configuration
 * @param {Object} [dbCompanyData] - Company data from database (optional)
 * @returns {Object} SEO configuration object
 */
export function getSeoConfig(dbCompanyData = null) {
  const companyData = dbCompanyData || fallbackCompanyData;
  const siteName =
    companyData?.name || fallbackCompanyData.name || "V Luxury Suites";
  const placeName = resolvePlaceName(companyData);
  const vars = { siteName, placeName };

  const dbTitles =
    companyData?.seo?.titles && typeof companyData.seo.titles === "object"
      ? companyData.seo.titles
      : null;
  const dbDescriptions =
    companyData?.seo?.descriptions &&
    typeof companyData.seo.descriptions === "object"
      ? companyData.seo.descriptions
      : null;

  const titles = dbTitles
    ? { ...mapTemplates(titleTemplates, vars), ...dbTitles }
    : mapTemplates(titleTemplates, vars);
  const descriptions = dbDescriptions
    ? { ...mapTemplates(descriptionTemplates, vars), ...dbDescriptions }
    : mapTemplates(descriptionTemplates, vars);

  return {
    siteName,
    placeName,
    baseUrl: getBaseUrl(),
    defaultLocale: "en",
    supportedLocales: ["en", "ru", "uk", "de", "sr", "ro", "bg", "el", "pl"],
    primaryLocation: "Greece",
    titleTemplate: `%s | ${siteName}`,
    defaultTitle: titles.en,
    defaultDescription: descriptions.en,
    descriptions,
    titles,
    social: {
      facebook: companyData?.seo?.social?.facebook || "",
      instagram: companyData?.seo?.social?.instagram || "",
      linkedin: companyData?.seo?.social?.linkedin || "",
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
    ogImage: companyData?.assets?.ogImage || "",
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
