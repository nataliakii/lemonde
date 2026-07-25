/**
 * Seed Le Monde Suites apartments from production listing data.
 *
 * Usage: node scripts/seedLeMondeApartments.js
 */
const mongoose = require("mongoose");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  process.env.MONGO_URI;

const COMPANY_ID =
  process.env.COMPANY_ID || "679903bd10e6c8a8c0f027bc";

function pricesFrom(nightly) {
  const p = Math.round(Number(nightly) || 130);
  return {
    NoSeason: { days: { 4: p, 7: p, 14: Math.round(p * 0.95) } },
    LowSeason: { days: { 4: p, 7: p, 14: Math.round(p * 0.95) } },
    LowUpSeason: { days: { 4: p, 7: p, 14: Math.round(p * 0.95) } },
    MiddleSeason: {
      days: { 4: Math.round(p * 1.05), 7: Math.round(p * 1.05), 14: p },
    },
    HighSeason: {
      days: { 4: Math.round(p * 1.15), 7: Math.round(p * 1.1), 14: Math.round(p * 1.05) },
    },
  };
}

const ADDRESS =
  "Leoforos Nikis, Kato Galini, Nea Kallikratia 630 80, Greece";

const units = [
  {
    carNumber: "LMS-01",
    model: "Le Monde Suites, 1",
    slug: "le-monde-suite-nea-kallikratia",
    class: "studio",
    seats: 2,
    numberOfDoors: 0,
    bathrooms: 1,
    beds: 1,
    sizeSqm: 28,
    floor: 1,
    sort: 1,
    priceFrom: 125,
    description:
      "Compact suite with a double bed — cosy stay for two. Sea-view balcony, Wi‑Fi and air conditioning. No kitchenette.",
    amenities: ["wifi", "air conditioning", "sea view", "balcony"],
    airConditioning: true,
    photoUrl:
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530482/NK-site/listings/apartment-rent/ext-db-64917ca47f3b/jkpbjezq0ujcxpxojfxu.jpg",
    gallery: [
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530481/NK-site/listings/apartment-rent/ext-db-64917ca47f3b/laurom3hdqecvfjxpy2x.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530482/NK-site/listings/apartment-rent/ext-db-64917ca47f3b/jcqvjaheqiltipixypqu.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530482/NK-site/listings/apartment-rent/ext-db-64917ca47f3b/jkpbjezq0ujcxpxojfxu.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530483/NK-site/listings/apartment-rent/ext-db-64917ca47f3b/amqprrsu04vmacwu7dx7.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530484/NK-site/listings/apartment-rent/ext-db-64917ca47f3b/w4klswub7f8mp3w2f39v.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530485/NK-site/listings/apartment-rent/ext-db-64917ca47f3b/mqgkbtz6d3prmwvbf9ry.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530485/NK-site/listings/apartment-rent/ext-db-64917ca47f3b/xzk3xbgge7vk5silypbs.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530486/NK-site/listings/apartment-rent/ext-db-64917ca47f3b/tombq0lhvblmbyucsclz.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530487/NK-site/listings/apartment-rent/ext-db-64917ca47f3b/merwwpxyqpz5hj8hlmzx.jpg",
    ],
  },
  {
    carNumber: "LMS-02",
    model: "Le Monde Suites, 2",
    slug: "le-monde-suites-2",
    class: "one bedroom",
    seats: 3,
    numberOfDoors: 1,
    bathrooms: 1,
    beds: 3,
    sizeSqm: 42,
    floor: 2,
    sort: 2,
    priceFrom: 135,
    description:
      "Larger suite with kitchenette and three beds. Sea view, balcony, Wi‑Fi and air conditioning — ideal for a small family or friends.",
    amenities: [
      "wifi",
      "kitchen",
      "air conditioning",
      "sea view",
      "balcony",
    ],
    airConditioning: true,
    photoUrl:
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530672/NK-site/listings/apartment-rent/ext-db-64cf86a31a59/ikahq6sj7rahxrfr7inu.jpg",
    gallery: [
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530669/NK-site/listings/apartment-rent/ext-db-64cf86a31a59/uwhvwvtbhlujgul2mqut.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530669/NK-site/listings/apartment-rent/ext-db-64cf86a31a59/xn7ghu4yy2gkqmmpa9rb.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530670/NK-site/listings/apartment-rent/ext-db-64cf86a31a59/slz4oiwattp3kjzq3o1q.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530671/NK-site/listings/apartment-rent/ext-db-64cf86a31a59/r67rutedu9hm1upo6gtu.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530672/NK-site/listings/apartment-rent/ext-db-64cf86a31a59/ikahq6sj7rahxrfr7inu.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530673/NK-site/listings/apartment-rent/ext-db-64cf86a31a59/qfmtq5cgdlh6zo4hzdpc.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530675/NK-site/listings/apartment-rent/ext-db-64cf86a31a59/bi1xusr0hesqun95lg2f.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530680/NK-site/listings/apartment-rent/ext-db-64cf86a31a59/muabsopa7nreekityazu.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530681/NK-site/listings/apartment-rent/ext-db-64cf86a31a59/twwqf1mqrglsie486kv4.jpg",
    ],
  },
  {
    carNumber: "LMS-03",
    model: "Le Monde Suites, 3",
    slug: "le-monde-suites-3-nea-kallikratia",
    class: "studio",
    seats: 2,
    numberOfDoors: 0,
    bathrooms: 1,
    beds: 1,
    sizeSqm: 28,
    floor: 2,
    sort: 3,
    priceFrom: 125,
    description:
      "Compact suite with a double bed for two. Bright interiors, Wi‑Fi and air conditioning. No kitchenette.",
    amenities: ["wifi", "air conditioning"],
    airConditioning: true,
    photoUrl:
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530617/NK-site/listings/apartment-rent/le-monde-suites-3-nea-Kallikratia/ka90nj8tpukikfkycbqd.jpg",
    gallery: [
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530615/NK-site/listings/apartment-rent/le-monde-suites-3-nea-Kallikratia/u1h6iuyqxmqkceazdeyu.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530617/NK-site/listings/apartment-rent/le-monde-suites-3-nea-Kallikratia/ka90nj8tpukikfkycbqd.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530618/NK-site/listings/apartment-rent/le-monde-suites-3-nea-Kallikratia/ff5rt2ytztsdkmhdqjvt.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530619/NK-site/listings/apartment-rent/le-monde-suites-3-nea-Kallikratia/duoyfyamikzxhsweulhg.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530625/NK-site/listings/apartment-rent/le-monde-suites-3-nea-Kallikratia/be44jjtqrqoufv5rv1w7.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530627/NK-site/listings/apartment-rent/le-monde-suites-3-nea-Kallikratia/px1vqgfmu50751pivull.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530627/NK-site/listings/apartment-rent/le-monde-suites-3-nea-Kallikratia/wrqll27oxkrqtebyfnbn.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530628/NK-site/listings/apartment-rent/le-monde-suites-3-nea-Kallikratia/tgd5xv5pvdgp6hj5ytzh.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1773530628/NK-site/listings/apartment-rent/le-monde-suites-3-nea-Kallikratia/utdmwqticwnwhomeesgl.jpg",
    ],
  },
  {
    carNumber: "LMS-04",
    model: "Le Monde Suites, 4",
    slug: "le-monde-suites-4",
    class: "one bedroom",
    seats: 3,
    numberOfDoors: 1,
    bathrooms: 1,
    beds: 3,
    sizeSqm: 42,
    floor: 3,
    sort: 4,
    priceFrom: 135,
    description:
      "Comfortable suite with kitchenette and three beds. Wi‑Fi and air conditioning for a relaxed stay for up to three guests.",
    amenities: ["wifi", "kitchen", "air conditioning"],
    airConditioning: true,
    photoUrl:
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1778333777/NK-site/listings/apartment-rent/ext-db-64cf870b1a59/vp5dw5mcahmdluzrmmcx.webp",
    gallery: [
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1778333777/NK-site/listings/apartment-rent/ext-db-64cf870b1a59/vp5dw5mcahmdluzrmmcx.webp",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1778333792/NK-site/listings/apartment-rent/ext-db-64cf870b1a59/jahdk4tqasezpe9podzm.webp",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1778333808/NK-site/listings/apartment-rent/ext-db-64cf870b1a59/obisjrjdtyknibcm3sfm.webp",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1778333819/NK-site/listings/apartment-rent/ext-db-64cf870b1a59/ldxy53tewojao5rbf9j7.webp",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1778333838/NK-site/listings/apartment-rent/ext-db-64cf870b1a59/p7ll06bhtpuspq7ljp28.webp",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1778340850/NK-site/listings/apartment-rent/ext-db-64cf870b1a59/me6s7k32b0mqyrq3ncsm.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1778340855/NK-site/listings/apartment-rent/ext-db-64cf870b1a59/bom3rbydun2mvb2xlhjs.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1778340861/NK-site/listings/apartment-rent/ext-db-64cf870b1a59/di8vwjaeqcs3httzs7ce.jpg",
    ],
  },
  {
    carNumber: "LMS-05",
    model: "Le Monde Suites, 5",
    slug: "le-monde-suites-5",
    class: "suite",
    seats: 4,
    numberOfDoors: 1,
    bathrooms: 1,
    beds: 2,
    sizeSqm: 55,
    floor: 3,
    sort: 5,
    priceFrom: 145,
    description:
      "The largest suite — kitchenette and two king-size double beds for up to four guests. Sea view, Wi‑Fi and air conditioning.",
    amenities: ["wifi", "kitchen", "air conditioning", "sea view"],
    airConditioning: true,
    photoUrl:
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1778342513/NK-site/listings/apartment-rent/ext-db-64abf11051d4/qpjp8p9ag7729rpfraqp.jpg",
    gallery: [
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1778342462/NK-site/listings/apartment-rent/ext-db-64abf11051d4/xpvwu1buexrktjht4it0.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1778342474/NK-site/listings/apartment-rent/ext-db-64abf11051d4/nyiytovsadzngcnsqpnq.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1778342487/NK-site/listings/apartment-rent/ext-db-64abf11051d4/gzufb8mmclpyciwspojg.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1778342496/NK-site/listings/apartment-rent/ext-db-64abf11051d4/gotup85kawvwgtbcwd77.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1778342506/NK-site/listings/apartment-rent/ext-db-64abf11051d4/ks0r84tpxhaigxn1sjdl.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1778342513/NK-site/listings/apartment-rent/ext-db-64abf11051d4/qpjp8p9ag7729rpfraqp.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1778342523/NK-site/listings/apartment-rent/ext-db-64abf11051d4/zhdzjdpolkdqyxbobpzj.jpg",
      "https://res.cloudinary.com/dn513dy1y/image/upload/v1778342530/NK-site/listings/apartment-rent/ext-db-64abf11051d4/fi1jq3becw67lfle4kev.jpg",
    ],
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
  await mongoose.connect(MONGODB_URI, { dbName: "Car" });
  const collectionName = await ensureCollection(mongoose.connection.db);
  const col = mongoose.connection.collection(collectionName);
  console.log(`Using collection: ${collectionName}`);

  // Keep only Le Monde Suites units in this property DB
  const cleared = await col.deleteMany({
    carNumber: { $not: { $regex: /^LMS-/ } },
  });
  if (cleared.deletedCount) {
    console.log(`Removed ${cleared.deletedCount} non-LMS inventory docs.`);
  }

  await col.deleteMany({
    carNumber: { $in: ["LMS-01", "LMS-02", "LMS-03", "LMS-04", "LMS-05", "LMS-06"] },
  });

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
      dateAddCar: new Date(),
      dateLastModified: new Date(),
    };
    // beds is informational only — keep in description; schema may ignore unknown if strict
    // Mongoose collection().updateOne bypasses schema — store beds for reference
    doc.beds = beds;

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

  // Soft-update company contact / address if company doc exists
  try {
    const companies = mongoose.connection.collection("companies");
    await companies.updateOne(
      { _id: new mongoose.Types.ObjectId(COMPANY_ID) },
      {
        $set: {
          name: "Le Monde Suites",
          slogan: "Nea Kallikratia · Halkidiki",
          email: "nataliakireewa@gmail.com",
          address: ADDRESS,
          coords: {
            lat: "40.31059163454398",
            lon: "23.063829408712166",
          },
        },
      }
    );
    console.log("Company profile updated.");
  } catch (e) {
    console.warn("Company update skipped:", e.message);
  }

  await mongoose.disconnect();
  console.log("Done seeding Le Monde Suites apartments (5 units).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
