/**
 * SEO Configuration — Le Monde Suites
 * Centralized SEO constants to avoid duplication
 * Can accept companyData from DB or fallback to config
 */

import { getBaseUrl } from "@config/domain";

const fallbackCompanyData = {
  name: "Le Monde Suites",
  tel: "+30 000 000 0000",
  tel2: "",
  email: "stay@lemondesuites.com",
  address: "Greece",
  coords: { lat: "40.311273589340836", lon: "23.06426516796098" },
};

/** Single source of truth for production base URL. */
export const PRODUCTION_BASE_URL = getBaseUrl();

export const multilingualDescriptions = {
  en: "Le Monde Suites — refined apartment stays with calm interiors and attentive hospitality. Book your suite online.",
  ru: "Le Monde Suites — апартаменты с изысканным интерьером и внимательным сервисом. Бронируйте сьют онлайн.",
  uk: "Le Monde Suites — апартаменти з вишуканим інтер'єром та уважним сервісом. Бронюйте сьют онлайн.",
  de: "Le Monde Suites — elegante Apartments mit ruhigem Interieur und aufmerksamer Gastfreundschaft. Suite online buchen.",
  sr: "Le Monde Suites — elegantni apartmani sa smirenim enterijerom i pažljivim gostoprimstvom. Rezervišite suite online.",
  ro: "Le Monde Suites — apartamente rafinate cu interior calm și ospitalitate atentă. Rezervați suite-ul online.",
  bg: "Le Monde Suites — изискани апартаменти със спокоен интериор и внимателно гостоприемство. Резервирайте онлайн.",
  el: "Le Monde Suites — εκλεπτυσμένα διαμερίσματα με ήρεμους εσωτερικούς χώρους και προσεκτική φιλοξενία. Κλείστε online.",
  pl: "Le Monde Suites — wyrafinowane apartamenty ze spokojnym wnętrzem i uważną gościnnością. Zarezerwuj online.",
};

export const multilingualTitles = {
  en: "Le Monde Suites — Apartment Stays",
  ru: "Le Monde Suites — Апартаменты",
  uk: "Le Monde Suites — Апартаменти",
  de: "Le Monde Suites — Apartments",
  sr: "Le Monde Suites — Apartmani",
  ro: "Le Monde Suites — Apartamente",
  bg: "Le Monde Suites — Апартаменти",
  el: "Le Monde Suites — Διαμερίσματα",
  pl: "Le Monde Suites — Apartamenty",
};

/**
 * Get SEO configuration
 * @param {Object} [dbCompanyData] - Company data from database (optional)
 * @returns {Object} SEO configuration object
 */
export function getSeoConfig(dbCompanyData = null) {
  const companyData = dbCompanyData || fallbackCompanyData;
  const siteName = companyData?.name || fallbackCompanyData.name || "Le Monde Suites";

  return {
    siteName,
    baseUrl: getBaseUrl(),
    defaultLocale: "en",
    supportedLocales: ["en", "ru", "uk", "de", "sr", "ro", "bg", "el", "pl"],
    primaryLocation: "Greece",
    titleTemplate: `%s | ${siteName}`,
    defaultTitle: `${siteName} — Apartment Stays`,
    defaultDescription: multilingualDescriptions.en,
    descriptions: multilingualDescriptions,
    titles: multilingualTitles,
    social: {
      facebook: "",
      instagram: "",
      linkedin: "",
    },
    contact: {
      email: companyData?.email || fallbackCompanyData.email || "stay@lemondesuites.com",
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
        "40.311273589340836",
      lon:
        companyData?.coords?.lon ||
        fallbackCompanyData.coords?.lon ||
        "23.06426516796098",
    },
    heroImageUrl: process.env.NEXT_PUBLIC_HERO_IMAGE_URL || null,
    heroImages: getHeroImages(),
  };
}

function getHeroImages() {
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
