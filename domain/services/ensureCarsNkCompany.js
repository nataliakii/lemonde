import { COMPANY_ID } from "@config/company";
import { seasons } from "@utils/companyData";
import mongoose from "mongoose";

/** Curated property gallery (Cloudinary URLs) — home page carousel. */
export const DEFAULT_PROPERTY_GALLERY = [
  "https://res.cloudinary.com/dn513dy1y/image/upload/v1778342496/NK-site/listings/apartment-rent/ext-db-64abf11051d4/gotup85kawvwgtbcwd77.jpg",
  "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530482/NK-site/listings/apartment-rent/ext-db-64917ca47f3b/jkpbjezq0ujcxpxojfxu.jpg",
  "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530481/NK-site/listings/apartment-rent/ext-db-64917ca47f3b/laurom3hdqecvfjxpy2x.jpg",
  "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530486/NK-site/listings/apartment-rent/ext-db-64917ca47f3b/tombq0lhvblmbyucsclz.jpg",
  "https://res.cloudinary.com/dn513dy1y/image/upload/v1778342506/NK-site/listings/apartment-rent/ext-db-64abf11051d4/ks0r84tpxhaigxn1sjdl.jpg",
  "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530484/NK-site/listings/apartment-rent/ext-db-64917ca47f3b/w4klswub7f8mp3w2f39v.jpg",
  "https://res.cloudinary.com/dn513dy1y/image/upload/v1778342513/NK-site/listings/apartment-rent/ext-db-64abf11051d4/qpjp8p9ag7729rpfraqp.jpg",
  "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530487/NK-site/listings/apartment-rent/ext-db-64917ca47f3b/merwwpxyqpz5hj8hlmzx.jpg",
];

/**
 * Default company document for empty / new databases.
 * Uses fixed COMPANY_ID so config stays stable (override via env COMPANY_ID).
 */
export function getCarsNkCompanyDefaults() {
  return {
    name: "Le Monde Suites",
    tel: "+380 68 100 3771",
    tel2: "+353 85 270 96 05",
    email: "nataliakireewa@gmail.com",
    address: "Leoforos Nikis, Kato Galini, Nea Kallikratia 630 80, Greece",
    slogan: "Apartment stays · Nea Kallikratia · Halkidiki",
    coords: { lat: "40.31059163454398", lon: "23.063829408712166" },
    hoursDiffForStart: 1,
    hoursDiffForEnd: -1,
    bufferTime: 2,
    defaultStart: "15:00",
    defaultEnd: "11:00",
    seasons,
    useSeasons: true,
    langAdmin: "en",
    langSuperadmin: "en",
    useEmail: true,
    locations: [
      { name: "Nea Kallikratia", coords: { lat: "40.31", lon: "23.06" } },
    ],
    notSendIP1: "",
    notSendIP2: "",
    notSendIP3: "",
    notSendIP4: "",
    minRentalDuration: 1,
    workingHours: { start: "08:00", end: "22:00" },
    deliveryPricePerKm: 1,
    branding: {
      primary: "#C9A227",
      primaryLight: "#E8D5A3",
      primaryDark: "#9A7B2E",
      secondary: "#1A1612",
      secondaryLight: "#3A322A",
      secondaryDark: "#0E0C0A",
      accent: "#B85C38",
      ink: "#2A2520",
    },
    assets: {
      logoMark: "/logo-mark.png",
      logoWordmark: "",
      favicon: "/favicon.ico",
      ogImage: "",
      heroImages: [],
      galleryImages: DEFAULT_PROPERTY_GALLERY,
    },
    cloudinary: {
      rootFolder: "lemondesuites",
      apartmentsFolder: "apartments",
      ordersFolder: "orders",
      // Keep existing CarsNK placeholder until a Le Monde asset is uploaded
      placeholderPublicId: "carsnk/NO_PHOTO",
    },
    galleryTitle: {
      en: "The property",
      ru: "Отель",
      el: "Το κατάλυμα",
    },
    gallerySubtitle: {
      en: "Spaces designed for calm Mediterranean stays.",
      ru: "Пространства для спокойного средиземноморского отдыха.",
      el: "Χώροι σχεδιασμένοι για ήρεμη μεσογειακή διαμονή.",
    },
  };
}

/**
 * Ensure company with COMPANY_ID exists. Creates it if missing.
 * @param {import("mongoose").Model} CompanyModel
 * @returns {Promise<object>} lean company document
 */
export async function ensureCarsNkCompany(CompanyModel) {
  const existing = await CompanyModel.findById(COMPANY_ID).lean();
  if (existing) return existing;

  const defaults = getCarsNkCompanyDefaults();
  const created = await CompanyModel.create({
    _id: new mongoose.Types.ObjectId(COMPANY_ID),
    ...defaults,
  });
  return created.toObject ? created.toObject() : created;
}

export default ensureCarsNkCompany;
