/**
 * Seed V Luxury Suites (Pefkohori, Kassandra) — 9 rooms from Booking.com listing.
 *
 * IMPORTANT: use a separate Mongo DB so Le Monde is never touched:
 *   MONGODB_DB_NAME=vluxury COMPANY_ID=<id> node scripts/seedVLuxuryApartments.js
 *
 * Usage: npm run seed:vluxury-apartments
 */
const mongoose = require("mongoose");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  process.env.MONGO_URI;

/** Dedicated company document for this property (not Le Monde). */
const COMPANY_ID =
  process.env.COMPANY_ID || "686f0a1b2c3d4e5f67890123";

const DEFAULT_DB = "vluxury";

function pricesFrom(nightly) {
  const p = Math.round(Number(nightly) || 160);
  return {
    NoSeason: { days: { 4: p, 7: p, 14: Math.round(p * 0.95) } },
    LowSeason: { days: { 4: p, 7: p, 14: Math.round(p * 0.95) } },
    LowUpSeason: { days: { 4: p, 7: p, 14: Math.round(p * 0.95) } },
    MiddleSeason: {
      days: { 4: Math.round(p * 1.05), 7: Math.round(p * 1.05), 14: p },
    },
    HighSeason: {
      days: {
        4: Math.round(p * 1.15),
        7: Math.round(p * 1.1),
        14: Math.round(p * 1.05),
      },
    },
  };
}

const ADDRESS = "Xoris Odo 0, Pefkochori, Kassandra, Halkidiki, Greece";

/** Shared amenity set from Booking property + room pages */
const BASE_AMENITIES = [
  "wifi",
  "air conditioning",
  "soundproofing",
  "coffee machine",
  "flat-screen TV",
  "private bathroom",
  "refrigerator",
  "hypoallergenic",
];

/**
 * 9 physical units. Types / copy from Booking.com
 * (V Luxury Suites Pefkohori). Photos: upload later via admin.
 */
const units = [
  {
    carNumber: "VLS-01",
    model: "V Luxury Suites, 1",
    slug: "deluxe-double-balcony-sea-view-1",
    class: "studio",
    seats: 2,
    numberOfDoors: 0,
    bathrooms: 1,
    beds: 1,
    sizeSqm: 20,
    floor: 2,
    sort: 1,
    priceFrom: 175,
    description:
      "Deluxe Double Room with Balcony and Sea View (20 m²). Air-conditioned double room with flat-screen TV, private bathroom, and a terrace with sea views. Pool with a view is a highlight. 1 extra-large double bed.",
    amenities: [
      ...BASE_AMENITIES,
      "sea view",
      "balcony",
      "terrace",
      "garden view",
      "pool view",
      "patio",
    ],
    airConditioning: true,
    photoUrl: "",
    gallery: [],
  },
  {
    carNumber: "VLS-02",
    model: "V Luxury Suites, 2",
    slug: "deluxe-double-garden-pool-2",
    class: "studio",
    seats: 2,
    numberOfDoors: 0,
    bathrooms: 1,
    beds: 1,
    sizeSqm: 20,
    floor: 1,
    sort: 2,
    priceFrom: 160,
    description:
      "Deluxe Double Room (20 m²). Air-conditioned double room with flat-screen TV, private bathroom, and a balcony with garden views. Pool with a view is the standout feature. 1 extra-large double bed.",
    amenities: [
      ...BASE_AMENITIES,
      "balcony",
      "garden view",
      "pool view",
      "inner courtyard view",
      "patio",
    ],
    airConditioning: true,
    photoUrl: "",
    gallery: [],
  },
  {
    carNumber: "VLS-03",
    model: "V Luxury Suites, 3",
    slug: "deluxe-king-room-3",
    class: "studio",
    seats: 2,
    numberOfDoors: 0,
    bathrooms: 1,
    beds: 1,
    sizeSqm: 22,
    floor: 2,
    sort: 3,
    priceFrom: 170,
    description:
      "Deluxe King Room. Allergy-free, soundproofed unit with king bed, air conditioning, flat-screen TV with satellite channels, tea/coffee facilities, private bathroom, and balcony or patio. Sea or garden views depending on unit.",
    amenities: [
      ...BASE_AMENITIES,
      "balcony",
      "patio",
      "king bed",
    ],
    airConditioning: true,
    photoUrl: "",
    gallery: [],
  },
  {
    carNumber: "VLS-04",
    model: "V Luxury Suites, 4",
    slug: "superior-queen-room-4",
    class: "studio",
    seats: 2,
    numberOfDoors: 0,
    bathrooms: 1,
    beds: 1,
    sizeSqm: 20,
    floor: 1,
    sort: 4,
    priceFrom: 155,
    description:
      "Superior Queen Room. Comfortable queen-bed room with air conditioning, soundproof windows, flat-screen TV, tea/coffee maker, private bathroom, and outdoor seating area.",
    amenities: [
      ...BASE_AMENITIES,
      "balcony",
      "queen bed",
      "patio",
    ],
    airConditioning: true,
    photoUrl: "",
    gallery: [],
  },
  {
    carNumber: "VLS-05",
    model: "V Luxury Suites, 5",
    slug: "deluxe-quadruple-room-5",
    class: "one bedroom",
    seats: 4,
    numberOfDoors: 1,
    bathrooms: 1,
    beds: 2,
    sizeSqm: 35,
    floor: 2,
    sort: 5,
    priceFrom: 195,
    description:
      "Deluxe Quadruple Room. Spacious family-friendly room for up to 4 guests, air conditioning, soundproofing, flat-screen TV, tea/coffee facilities, private bathroom, and terrace/balcony access.",
    amenities: [
      ...BASE_AMENITIES,
      "balcony",
      "terrace",
      "family room",
      "patio",
    ],
    airConditioning: true,
    photoUrl: "",
    gallery: [],
  },
  {
    carNumber: "VLS-06",
    model: "V Luxury Suites, 6",
    slug: "comfort-quadruple-room-6",
    class: "one bedroom",
    seats: 4,
    numberOfDoors: 1,
    bathrooms: 1,
    beds: 2,
    sizeSqm: 32,
    floor: 1,
    sort: 6,
    priceFrom: 185,
    description:
      "Comfort Quadruple Room. Practical room for up to 4 guests with air conditioning, flat-screen TV, coffee/tea maker, private bathroom, and patio or balcony. Ideal for families.",
    amenities: [
      ...BASE_AMENITIES,
      "balcony",
      "patio",
      "family room",
    ],
    airConditioning: true,
    photoUrl: "",
    gallery: [],
  },
  {
    carNumber: "VLS-07",
    model: "V Luxury Suites, 7",
    slug: "junior-suite-sea-view-7",
    class: "suite",
    seats: 3,
    numberOfDoors: 1,
    bathrooms: 1,
    beds: 2,
    sizeSqm: 40,
    floor: 2,
    sort: 7,
    priceFrom: 210,
    description:
      "Junior Suite with Sea View. Larger suite with sea views, air conditioning, soundproof windows, flat-screen TV, tea/coffee facilities, private bathroom, dressing area, and terrace.",
    amenities: [
      ...BASE_AMENITIES,
      "sea view",
      "terrace",
      "balcony",
      "dressing room",
      "patio",
    ],
    airConditioning: true,
    photoUrl: "",
    gallery: [],
  },
  {
    carNumber: "VLS-08",
    model: "V Luxury Suites, 8",
    slug: "deluxe-double-balcony-sea-view-8",
    class: "studio",
    seats: 2,
    numberOfDoors: 0,
    bathrooms: 1,
    beds: 1,
    sizeSqm: 20,
    floor: 2,
    sort: 8,
    priceFrom: 175,
    description:
      "Deluxe Double Room with Balcony and Sea View (20 m²). Second sea-view double unit: flat-screen TV, private bathroom, terrace with sea views, pool views, and 1 extra-large double bed.",
    amenities: [
      ...BASE_AMENITIES,
      "sea view",
      "balcony",
      "terrace",
      "garden view",
      "pool view",
      "patio",
    ],
    airConditioning: true,
    photoUrl: "",
    gallery: [],
  },
  {
    carNumber: "VLS-09",
    model: "V Luxury Suites, 9",
    slug: "deluxe-king-room-9",
    class: "studio",
    seats: 2,
    numberOfDoors: 0,
    bathrooms: 1,
    beds: 1,
    sizeSqm: 22,
    floor: 1,
    sort: 9,
    priceFrom: 170,
    description:
      "Deluxe King Room. Ninth unit — king bed, air conditioning, soundproofing, flat-screen TV, tea/coffee maker, private bathroom, and outdoor furniture on balcony/patio.",
    amenities: [
      ...BASE_AMENITIES,
      "balcony",
      "patio",
      "king bed",
      "garden view",
    ],
    airConditioning: true,
    photoUrl: "",
    gallery: [],
  },
];

async function ensureCollection(db) {
  const names = (await db.listCollections().toArray()).map((c) => c.name);
  if (names.includes("apartments")) return "apartments";
  if (names.includes("cars")) return "cars";
  return "apartments";
}

async function main() {
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }

  const dbName = String(process.env.MONGODB_DB_NAME || "").trim() || DEFAULT_DB;
  if (dbName === "lemonde") {
    console.error(
      "Refusing to seed into MONGODB_DB_NAME=lemonde. Use vluxury (or another dedicated DB)."
    );
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI, { dbName });
  const collectionName = await ensureCollection(mongoose.connection.db);
  const col = mongoose.connection.collection(collectionName);
  console.log(`DB=${dbName} collection=${collectionName} COMPANY_ID=${COMPANY_ID}`);

  const cleared = await col.deleteMany({
    carNumber: { $not: { $regex: /^VLS-/ } },
  });
  if (cleared.deletedCount) {
    console.log(`Removed ${cleared.deletedCount} non-VLS inventory docs.`);
  }

  for (const unit of units) {
    const { priceFrom, beds, ...rest } = unit;
    const doc = {
      ...rest,
      transmission: "automatic",
      fueltype: "electric",
      enginePower: 0,
      engine: "0",
      color: "white",
      registration: new Date().getFullYear(),
      regNumber: unit.carNumber,
      deposit: 0,
      franchise: 0,
      PriceChildSeats: 0,
      PriceKacko: 0,
      pricingTiers: pricesFrom(priceFrom),
      testingCar: false,
      ownerId: new mongoose.Types.ObjectId(COMPANY_ID),
      orders: [],
      beds,
      dateAddCar: new Date(),
      dateLastModified: new Date(),
    };

    const result = await col.updateOne(
      { slug: unit.slug },
      { $set: doc },
      { upsert: true }
    );
    console.log(
      unit.carNumber,
      unit.model,
      result.upsertedCount ? "inserted" : "updated"
    );
  }

  try {
    const companies = mongoose.connection.collection("companies");
    await companies.updateOne(
      { _id: new mongoose.Types.ObjectId(COMPANY_ID) },
      {
        $set: {
          name: "V Luxury Suites",
          slogan: "Suites · Pefkohori · Kassandra · Halkidiki",
          email: "nataliakireewa@gmail.com",
          address: ADDRESS,
          coords: {
            lat: "39.982398",
            lon: "23.635154",
          },
          defaultStart: "15:00",
          defaultEnd: "10:00",
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
            logoMark: "/logo-mark.png",
            logoWordmark: "",
            favicon: "/favicon.ico",
            ogImage: "",
            heroImages: [],
            galleryImages: [],
          },
          cloudinary: {
            rootFolder: process.env.CLOUDINARY_ROOT_FOLDER || "vluxurysuites",
            apartmentsFolder: "apartments",
            ordersFolder: "orders",
            placeholderPublicId:
              process.env.CLOUDINARY_PLACEHOLDER_PUBLIC_ID || "carsnk/NO_PHOTO",
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
        },
      },
      { upsert: true }
    );
    console.log("Company brand updated.");
  } catch (e) {
    console.warn("Company update skipped:", e.message);
  }

  await mongoose.disconnect();
  console.log("Done seeding V Luxury Suites (9 units).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
