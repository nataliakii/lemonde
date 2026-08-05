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
      heroLeadImage: "",
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
 * Ensure company with COMPANY_ID exists and has required operational fields.
 * Creates if missing; backfills seasons / hoursDiff / bufferTime if incomplete.
 * @param {import("mongoose").Model} CompanyModel
 * @returns {Promise<object>} lean company document
 */
export async function ensureCarsNkCompany(CompanyModel) {
  const existing = await CompanyModel.findById(COMPANY_ID).lean();
  const defaults = getCarsNkCompanyDefaults();
  const id = new mongoose.Types.ObjectId(COMPANY_ID);

  if (!existing) {
    const created = await CompanyModel.create({
      _id: id,
      ...defaults,
    });
    return created.toObject ? created.toObject() : created;
  }

  const patch = {};
  if (existing.hoursDiffForStart == null) {
    patch.hoursDiffForStart = defaults.hoursDiffForStart;
  }
  if (existing.hoursDiffForEnd == null) {
    patch.hoursDiffForEnd = defaults.hoursDiffForEnd;
  }
  if (existing.bufferTime == null) {
    patch.bufferTime = defaults.bufferTime;
  }
  if (!existing.defaultStart) patch.defaultStart = defaults.defaultStart;
  if (!existing.defaultEnd) patch.defaultEnd = defaults.defaultEnd;
  if (!existing.seasons?.HighSeason || !existing.seasons?.NoSeason) {
    patch.seasons = defaults.seasons;
  }
  if (existing.useSeasons == null) patch.useSeasons = defaults.useSeasons;
  if (existing.useEmail == null) patch.useEmail = defaults.useEmail;
  if (!existing.tel) patch.tel = defaults.tel;
  if (!Array.isArray(existing.locations) || !existing.locations.length) {
    patch.locations = defaults.locations;
  }

  if (Object.keys(patch).length) {
    await CompanyModel.updateOne({ _id: id }, { $set: patch });
    return CompanyModel.findById(COMPANY_ID).lean();
  }

  return existing;
}

export default ensureCarsNkCompany;
