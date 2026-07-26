/**
 * Resolve per-property brand config: Company (DB) → env → code defaults.
 *
 * Copy a deploy: set COMPANY_ID + Mongo company doc (+ Cloudinary/SMTP secrets in env).
 * Do not put API secrets in the company document.
 */

/** Defaults mirror theme.js Le Monde palette (keep in sync). */
const DEFAULT_BRANDING = {
  primary: "#C9A227",
  primaryLight: "#E8D5A3",
  primaryDark: "#9A7B2E",
  secondary: "#1A1612",
  secondaryLight: "#3A322A",
  secondaryDark: "#0E0C0A",
  accent: "#B85C38",
  ink: "#2A2520",
};

const DEFAULT_ASSETS = {
  logoMark: "/logo-mark.png",
  logoWordmark: "",
  favicon: "/favicon.ico",
  ogImage: "",
  heroImages: [],
  galleryImages: [],
};

const DEFAULT_CLOUDINARY = {
  rootFolder: "vluxurysuites",
  apartmentsFolder: "apartments",
  ordersFolder: "orders",
  placeholderPublicId: "carsnk/NO_PHOTO",
};

const DEFAULT_GALLERY_COPY = {
  title: {
    en: "The property",
    ru: "Отель",
    el: "Το κατάλυμα",
  },
  subtitle: {
    en: "Spaces designed for calm Mediterranean stays.",
    ru: "Пространства для спокойного средиземноморского отдыха.",
    el: "Χώροι σχεδιασμένοι για ήρεμη μεσογειακή διαμονή.",
  },
};

function pickString(value, fallback = "") {
  const s = typeof value === "string" ? value.trim() : "";
  return s || fallback;
}

function pickStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

/**
 * @param {object|null|undefined} company - lean company from Mongo
 * @returns {{
 *   name: string,
 *   slogan: string,
 *   branding: typeof DEFAULT_BRANDING,
 *   assets: typeof DEFAULT_ASSETS,
 *   cloudinary: typeof DEFAULT_CLOUDINARY,
 *   galleryTitle: string,
 *   gallerySubtitle: string,
 * }}
 */
export function resolveBrandConfig(company, locale = "en") {
  const branding = {
    ...DEFAULT_BRANDING,
    ...(company?.branding && typeof company.branding === "object"
      ? Object.fromEntries(
          Object.entries(company.branding).filter(
            ([, v]) => typeof v === "string" && v.trim()
          )
        )
      : {}),
  };

  const assets = {
    ...DEFAULT_ASSETS,
    logoMark: pickString(company?.assets?.logoMark, DEFAULT_ASSETS.logoMark),
    logoWordmark: pickString(company?.assets?.logoWordmark, ""),
    favicon: pickString(company?.assets?.favicon, DEFAULT_ASSETS.favicon),
    ogImage: pickString(company?.assets?.ogImage, ""),
    heroImages: pickStringArray(company?.assets?.heroImages),
    galleryImages: pickStringArray(company?.assets?.galleryImages),
  };

  // Env overrides for Cloudinary root (deploy-level), then company, then default
  const envRoot = pickString(process.env.CLOUDINARY_ROOT_FOLDER, "");
  const envPlaceholder = pickString(
    process.env.CLOUDINARY_PLACEHOLDER_PUBLIC_ID,
    ""
  );

  const cloudinary = {
    rootFolder:
      envRoot ||
      pickString(company?.cloudinary?.rootFolder, DEFAULT_CLOUDINARY.rootFolder),
    apartmentsFolder: pickString(
      company?.cloudinary?.apartmentsFolder,
      DEFAULT_CLOUDINARY.apartmentsFolder
    ),
    ordersFolder: pickString(
      company?.cloudinary?.ordersFolder,
      DEFAULT_CLOUDINARY.ordersFolder
    ),
    placeholderPublicId:
      envPlaceholder ||
      pickString(
        company?.cloudinary?.placeholderPublicId,
        DEFAULT_CLOUDINARY.placeholderPublicId
      ),
  };

  const loc = String(locale || "en").toLowerCase();
  const titleMap = company?.galleryTitle || DEFAULT_GALLERY_COPY.title;
  const subtitleMap = company?.gallerySubtitle || DEFAULT_GALLERY_COPY.subtitle;

  return {
    name: pickString(company?.name, "V Luxury Suites"),
    slogan: pickString(company?.slogan, ""),
    branding,
    assets,
    cloudinary,
    galleryTitle:
      pickString(titleMap?.[loc], "") ||
      pickString(titleMap?.en, DEFAULT_GALLERY_COPY.title.en),
    gallerySubtitle:
      pickString(subtitleMap?.[loc], "") ||
      pickString(subtitleMap?.en, DEFAULT_GALLERY_COPY.subtitle.en),
  };
}

export {
  DEFAULT_BRANDING,
  DEFAULT_ASSETS,
  DEFAULT_CLOUDINARY,
  DEFAULT_GALLERY_COPY,
};
