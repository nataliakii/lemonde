import { COMPANY_ID } from "@config/company";
import { seasons } from "@utils/companyData";
import mongoose from "mongoose";

/** Property gallery — upload V Luxury photos via admin; empty until then. */
export const DEFAULT_PROPERTY_GALLERY = [];

/**
 * Default company document for empty / new databases.
 * Uses fixed COMPANY_ID so config stays stable (override via env COMPANY_ID).
 */
export function getCarsNkCompanyDefaults() {
  return {
    name: "V Luxury Suites",
    tel: "+380 68 100 3771",
    tel2: "+353 85 270 96 05",
    email: "nataliakireewa@gmail.com",
    address: "Xoris Odo 0, Pefkochori, Kassandra, Halkidiki, Greece",
    slogan: "Suites · Pefkohori · Kassandra · Halkidiki",
    coords: { lat: "39.982398", lon: "23.635154" },
    hoursDiffForStart: 1,
    hoursDiffForEnd: -1,
    bufferTime: 2,
    defaultStart: "15:00",
    defaultEnd: "10:00",
    seasons,
    useSeasons: true,
    langAdmin: "en",
    langSuperadmin: "en",
    useEmail: true,
    locations: [
      { name: "Pefkohori", coords: { lat: "39.982398", lon: "23.635154" } },
    ],
    notSendIP1: "",
    notSendIP2: "",
    notSendIP3: "",
    notSendIP4: "",
    minRentalDuration: 1,
    workingHours: { start: "08:00", end: "22:00" },
    deliveryPricePerKm: 1,
    branding: {
      primary: "#9AA3AD",
      primaryLight: "#D0D5DB",
      primaryDark: "#6B737C",
      secondary: "#1B1E24",
      secondaryLight: "#3A404A",
      secondaryDark: "#0E1014",
      accent: "#7A8B9A",
      ink: "#2C3138",
    },
    assets: {
      logoMark: "",
      logoWordmark: "",
      favicon: "/favicon.ico",
      ogImage: "",
      heroImages: [],
      galleryImages: DEFAULT_PROPERTY_GALLERY,
    },
    cloudinary: {
      rootFolder: "vluxurysuites",
      apartmentsFolder: "apartments",
      ordersFolder: "orders",
      placeholderPublicId: "carsnk/NO_PHOTO",
    },
    galleryTitle: {
      en: "The property",
      ru: "Отель",
      el: "Το κατάλυμα",
    },
    gallerySubtitle: {
      en: "Infinity pool, sea-view terraces, and calm stays in Pefkohori.",
      ru: "Infinity pool, террасы с видом на море и спокойный отдых в Пефкохори.",
      el: "Infinity pool, βεράντες με θέα στη θάλασσα και ήρεμη διαμονή στο Πευκοχώρι.",
    },
    seo: {
      placeName: "Pefkohori",
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
