/**
 * Sync company.assets.galleryImages (+ ogImage) from apartment photos
 * in the current Mongo DB (MONGODB_DB_NAME + COMPANY_ID).
 *
 * Usage:
 *   npm run sync:property-gallery
 *   MONGODB_DB_NAME=lemonde npm run sync:property-gallery
 *   MONGODB_DB_NAME=vluxury npm run sync:property-gallery
 */
const mongoose = require("mongoose");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  process.env.MONGO_URI;

const COMPANY_ID = process.env.COMPANY_ID;
const CLOUD =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME ||
  "";

const PLACEHOLDER_RE = /NO_PHOTO/i;

function toImageUrl(raw) {
  if (typeof raw !== "string") return "";
  const s = raw.trim();
  if (!s || PLACEHOLDER_RE.test(s)) return "";
  if (/^https?:\/\//i.test(s)) {
    return /cloudinary\.com/i.test(s) ? s : "";
  }
  if (!CLOUD) return "";
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${s}`;
}

function collectPhotos(apartment) {
  const out = [];
  const seen = new Set();
  const push = (raw) => {
    const url = toImageUrl(raw);
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push(url);
  };
  push(apartment?.photoUrl);
  if (Array.isArray(apartment?.gallery)) apartment.gallery.forEach(push);
  return out;
}

function buildMix(apartments, max = 36) {
  const sorted = [...apartments].sort((a, b) => {
    const sa = Number(a?.sort);
    const sb = Number(b?.sort);
    if (Number.isFinite(sa) && Number.isFinite(sb) && sa !== sb) return sa - sb;
    return String(a?.carNumber || a?.model || "").localeCompare(
      String(b?.carNumber || b?.model || "")
    );
  });
  const pools = sorted.map(collectPhotos).filter((p) => p.length > 0);
  if (!pools.length) return [];
  const mix = [];
  const cursors = pools.map(() => 0);
  let added = true;
  while (mix.length < max && added) {
    added = false;
    for (let i = 0; i < pools.length && mix.length < max; i += 1) {
      const idx = cursors[i];
      if (idx < pools[i].length) {
        mix.push(pools[i][idx]);
        cursors[i] = idx + 1;
        added = true;
      }
    }
  }
  return mix;
}

async function main() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }
  if (!COMPANY_ID) {
    throw new Error("COMPANY_ID is required");
  }

  const dbName = process.env.MONGODB_DB_NAME || "test";
  console.log(`DB=${dbName} COMPANY_ID=${COMPANY_ID}`);

  await mongoose.connect(MONGODB_URI, { dbName });
  const apartments = await mongoose.connection.db
    .collection("apartments")
    .find({})
    .project({ photoUrl: 1, gallery: 1, carNumber: 1, model: 1, sort: 1 })
    .toArray();

  const galleryImages = buildMix(apartments, 36);
  const $set = { "assets.galleryImages": galleryImages };
  if (galleryImages[0]) $set["assets.ogImage"] = galleryImages[0];

  const result = await mongoose.connection.db.collection("companies").updateOne(
    { _id: new mongoose.Types.ObjectId(COMPANY_ID) },
    { $set }
  );

  console.log(
    `Synced ${galleryImages.length} gallery image(s). matched=${result.matchedCount} modified=${result.modifiedCount}`
  );
  if (!galleryImages.length) {
    console.log(
      "No apartment photos yet — upload suite photos in admin, then re-run this script."
    );
  } else {
    console.log("First:", galleryImages[0]);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
