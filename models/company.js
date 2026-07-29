// import mongoose from "mongoose";
import { Schema, model, models } from "mongoose";

const SeasonSchema = new Schema({
  start: { type: String, required: true }, // Use MM/DD format
  end: { type: String, required: true }, // Use MM/DD format
});

const CoordsSchema = new Schema({
  lat: { type: String, required: true },
  lon: { type: String, required: true },
});

const locationsSchema = new Schema({
  name: { type: String },
  coords: CoordsSchema,
});
const WorkingHoursSchema = new Schema({
  start: { type: String, default: "08:00" }, // HH:mm format
  end: { type: String, default: "22:00" }, // HH:mm format
});

const CompanySchema = new Schema({
  name: { type: String, required: true },
  tel: { type: String, required: true },
  tel2: { type: String },
  email: { type: String, required: true },
  email2: { type: String },
  address: { type: String, required: true },
  slogan: { type: String },
  coords: { type: CoordsSchema, required: true },
  hoursDiffForStart: { type: Number, required: true },
  hoursDiffForEnd: { type: Number, required: true },
  bufferTime: { type: Number, required: true, default: 2 }, // Buffer hours between orders
  defaultStart: { type: String, required: true }, // Use HH:mm format
  defaultEnd: { type: String, required: true }, // Use HH:mm format
  seasons: {
    NoSeason: { type: SeasonSchema, required: true },
    LowSeason: { type: SeasonSchema, required: true },
    LowUpSeason: { type: SeasonSchema, required: true },
    MiddleSeason: { type: SeasonSchema, required: true },
    HighSeason: { type: SeasonSchema, required: true },
  },
  /** Включить учёт сезонов (ценовые периоды и т.п.). При false в UI/API можно отключать сезонную логику. */
  useSeasons: { type: Boolean, default: true },
  /** Язык текста уведомлений (email) админу компании: en, ru, uk, … */
  langAdmin: { type: String, default: "en", trim: true },
  /** Язык текста уведомлений суперадмину (Telegram + email на DEVELOPER_EMAIL) */
  langSuperadmin: { type: String, default: "en", trim: true },
  useEmail: { type: Boolean, default: false, required: true },
  locations: [locationsSchema],
  notSendIP1: { type: String, trim: true, default: "" },
  notSendIP2: { type: String, trim: true, default: "" },
  notSendIP3: { type: String, trim: true, default: "" },
  notSendIP4: { type: String, trim: true, default: "" },
  
  // Booking rules (moved from config/bookingRules.js)
  minRentalDuration: { type: Number, default: 1 }, // Minimum rental duration in hours
  workingHours: { type: WorkingHoursSchema, default: () => ({ start: "08:00", end: "22:00" }) },

  // Delivery pricing
  deliveryPricePerKm: { type: Number, default: 1, min: 0 },

  /**
   * Brand theme — per-property colors for UI (MUI palette overrides).
   * Secrets stay in env; visual identity lives here so deploys can copy with a new company doc.
   */
  branding: {
    primary: { type: String, default: "#AEC0D0" },
    primaryLight: { type: String, default: "#E6EEF5" },
    primaryDark: { type: String, default: "#6F8496" },
    secondary: { type: String, default: "#0B1218" },
    secondaryLight: { type: String, default: "#243040" },
    secondaryDark: { type: String, default: "#05080C" },
    accent: { type: String, default: "#5A7D9A" },
    ink: { type: String, default: "#15202B" },
  },

  /**
   * Public media — absolute Cloudinary/CDN URLs preferred (set in Mongo).
   * Empty logoMark → UI shows wordmark only (no local /public fallback).
   */
  assets: {
    logoMark: { type: String, default: "" },
    logoWordmark: { type: String, default: "" },
    favicon: { type: String, default: "/favicon.ico" },
    ogImage: { type: String, default: "" },
    heroImages: { type: [String], default: [] },
    galleryImages: { type: [String], default: [] },
  },

  /**
   * Cloudinary folder layout for this property.
   * Cloud name / API secrets remain in env (account-level).
   * Override root via CLOUDINARY_ROOT_FOLDER env if needed.
   */
  cloudinary: {
    rootFolder: { type: String, default: "lemondesuites" },
    apartmentsFolder: { type: String, default: "apartments" },
    ordersFolder: { type: String, default: "orders" },
    placeholderPublicId: { type: String, default: "carsnk/NO_PHOTO" },
  },

  /** Optional home-page gallery section titles (locale → string) */
  galleryTitle: {
    en: { type: String, default: "The property" },
    ru: { type: String, default: "Отель" },
    el: { type: String, default: "Το κατάλυμα" },
  },
  gallerySubtitle: {
    en: { type: String, default: "Spaces designed for calm Mediterranean stays." },
    ru: { type: String, default: "Пространства для спокойного средиземноморского отдыха." },
    el: { type: String, default: "Χώροι σχεδιασμένοι για ήρεμη μεσογειακή διαμονή." },
  },

  /**
   * Optional SEO overrides (titles/descriptions per locale, placeName, social).
   * When empty, config/seo.js builds from name + locations[0]/slogan.
   */
  seo: {
    placeName: { type: String, default: "" },
    titles: { type: Schema.Types.Mixed, default: undefined },
    descriptions: { type: Schema.Types.Mixed, default: undefined },
    social: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
  },
});

// В клиентском бандле mongoose.models может быть undefined — не обращаться без проверки
const Company =
  (typeof models !== "undefined" && models.Company) ||
  model("Company", CompanySchema);

export default Company;
