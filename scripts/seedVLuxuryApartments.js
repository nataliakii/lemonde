/**
 * Seed V Luxury Suites (Pefkohori, Kassandra) — 8 rooms.
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
 * 8 physical units. Types / copy from Booking.com
 * (V Luxury Suites Pefkohori). Photos: upload later via admin.
 * Note: rooms renumbered 1–8 in sequence (old #6 removed; former 7–9 → 6–8).
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
    transferPrice: 160,
    description:
      "Wake to the Aegean. This sea-view double opens onto a private balcony above the infinity pool — cool marble bath, crisp linens, and that slow Kassandra light pouring in.",
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
    transferPrice: 160,
    description:
      "Garden hush, pool glint. A refined double with balcony seating — airy, soundproofed, and made for long breakfasts before you slip down to the water.",
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
    transferPrice: 160,
    description:
      "King-bed calm with a boutique edge — hypoallergenic comfort, satellite TV, tea on the balcony, and night air that still smells faintly of pine and sea.",
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
    transferPrice: 160,
    description:
      "A superior queen room that feels quietly expensive: soft light, outdoor seating, soundproof windows, and everything you need for an unhurried Pefkohori stay.",
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
    transferPrice: 160,
    description:
      "Space to sprawl. This deluxe quadruple is built for families and friends — room to breathe, a private terrace, and the same silver-calm finish as the rest of the house.",
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
    slug: "junior-suite-sea-view-6",
    class: "suite",
    seats: 3,
    numberOfDoors: 1,
    bathrooms: 1,
    beds: 2,
    sizeSqm: 40,
    floor: 2,
    sort: 6,
    priceFrom: 210,
    transferPrice: 160,
    description:
      "The signature junior suite — sea on the horizon, a dressing area to unpack properly, and a wide terrace for golden-hour wine above Kassandra.",
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
    carNumber: "VLS-07",
    model: "V Luxury Suites, 7",
    slug: "deluxe-double-balcony-sea-view-7",
    class: "studio",
    seats: 2,
    numberOfDoors: 0,
    bathrooms: 1,
    beds: 1,
    sizeSqm: 20,
    floor: 2,
    sort: 7,
    priceFrom: 175,
    transferPrice: 160,
    description:
      "Another sea-view double with balcony drama — pool below, Aegean beyond, and a room that stays cool and quiet even when the village wakes up.",
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
    carNumber: "VLS-08",
    model: "V Luxury Suites, 8",
    slug: "deluxe-king-room-8",
    class: "studio",
    seats: 2,
    numberOfDoors: 0,
    bathrooms: 1,
    beds: 1,
    sizeSqm: 22,
    floor: 1,
    sort: 8,
    priceFrom: 170,
    transferPrice: 160,
    description:
      "King comfort with a garden-facing patio — polished, soundproofed, and ready for late swims and early espresso under Halkidiki skies.",
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

  // One-time renumber after removing invalid #6: 7→6, 8→7, 9→8.
  // Two-phase to avoid unique index collisions on carNumber.
  // Skip if already renumbered (no VLS-09 / old slugs left).
  const needsRenumber =
    (await col.countDocuments({
      $or: [
        { carNumber: "VLS-09" },
        { slug: "junior-suite-sea-view-7" },
        { slug: "deluxe-king-room-9" },
      ],
    })) > 0;

  if (needsRenumber) {
    const renumberFinal = [
      {
        fromCar: "VLS-07",
        toCar: "VLS-06",
        fromSlug: "junior-suite-sea-view-7",
        toSlug: "junior-suite-sea-view-6",
        model: "V Luxury Suites, 6",
        sort: 6,
      },
      {
        fromCar: "VLS-08",
        toCar: "VLS-07",
        fromSlug: "deluxe-double-balcony-sea-view-8",
        toSlug: "deluxe-double-balcony-sea-view-7",
        model: "V Luxury Suites, 7",
        sort: 7,
      },
      {
        fromCar: "VLS-09",
        toCar: "VLS-08",
        fromSlug: "deluxe-king-room-9",
        toSlug: "deluxe-king-room-8",
        model: "V Luxury Suites, 8",
        sort: 8,
      },
    ];
    for (const step of renumberFinal) {
      const tmpCar = `${step.fromCar}-TMP`;
      const parked = await col.updateOne(
        { carNumber: step.fromCar },
        { $set: { carNumber: tmpCar, regNumber: tmpCar } }
      );
      if (parked.modifiedCount) {
        console.log(`Parked ${step.fromCar} → ${tmpCar}`);
      }
    }
    for (const step of renumberFinal) {
      const tmpCar = `${step.fromCar}-TMP`;
      const res = await col.updateOne(
        { carNumber: tmpCar },
        {
          $set: {
            carNumber: step.toCar,
            regNumber: step.toCar,
            slug: step.toSlug,
            model: step.model,
            sort: step.sort,
            dateLastModified: new Date(),
          },
        }
      );
      if (res.modifiedCount) {
        console.log(`Renumbered ${tmpCar} → ${step.toCar}`);
      } else {
        const bySlug = await col.updateOne(
          { slug: step.fromSlug },
          {
            $set: {
              carNumber: step.toCar,
              regNumber: step.toCar,
              slug: step.toSlug,
              model: step.model,
              sort: step.sort,
              dateLastModified: new Date(),
            },
          }
        );
        if (bySlug.modifiedCount) {
          console.log(`Renumbered by slug ${step.fromSlug} → ${step.toCar}`);
        }
      }
    }
  }

  const cleared = await col.deleteMany({
    carNumber: { $not: { $regex: /^VLS-/ } },
  });
  if (cleared.deletedCount) {
    console.log(`Removed ${cleared.deletedCount} non-VLS inventory docs.`);
  }

  const keepNumbers = units.map((u) => u.carNumber);
  const removedStale = await col.deleteMany({
    carNumber: { $nin: keepNumbers },
  });
  if (removedStale.deletedCount) {
    console.log(
      `Removed ${removedStale.deletedCount} stale VLS units (not in seed list).`
    );
  }

  for (const unit of units) {
    // Never overwrite media / orders on re-seed — photos come from
    // seed:vluxury-local-photos or admin uploads.
    const { priceFrom, beds, photoUrl, gallery, ...rest } = unit;
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
      beds,
      dateLastModified: new Date(),
    };

    const result = await col.updateOne(
      { slug: unit.slug },
      {
        $set: doc,
        $setOnInsert: {
          photoUrl: typeof photoUrl === "string" ? photoUrl : "",
          gallery: Array.isArray(gallery) ? gallery : [],
          orders: [],
          dateAddCar: new Date(),
        },
      },
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
    // Never overwrite media from DB (logo/gallery/hero) — those come from
    // seed:vluxury-local-photos / admin uploads. Only set assets on first insert.
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
          seo: {
            placeName: "Pefkohori",
          },
        },
        $setOnInsert: {
          assets: {
            logoMark: "",
            logoWordmark: "",
            favicon: "/favicon.ico",
            ogImage: "",
            heroImages: [],
            galleryImages: [],
          },
        },
      },
      { upsert: true }
    );
    console.log("Company brand updated (assets preserved if already set).");
  } catch (e) {
    console.warn("Company update skipped:", e.message);
  }

  await mongoose.disconnect();
  console.log("Done seeding V Luxury Suites (8 units).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
