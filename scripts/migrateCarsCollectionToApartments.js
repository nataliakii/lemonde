/**
 * Rename MongoDB collection `cars` → `apartments`.
 *
 * Usage:
 *   node scripts/migrateCarsCollectionToApartments.js
 */
const mongoose = require("mongoose");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  process.env.MONGO_URI;

async function main() {
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }
  const dbName = String(process.env.MONGODB_DB_NAME || "").trim() || "lemonde";
  await mongoose.connect(MONGODB_URI, { dbName });
  const db = mongoose.connection.db;
  const cols = await db.listCollections().toArray();
  const names = new Set(cols.map((c) => c.name));

  const hasCars = names.has("cars");
  const hasApartments = names.has("apartments");

  if (!hasCars && hasApartments) {
    console.log("Already migrated: collection `apartments` exists, `cars` gone.");
    await mongoose.disconnect();
    return;
  }

  if (!hasCars && !hasApartments) {
    console.log("Neither `cars` nor `apartments` found — nothing to migrate.");
    await mongoose.disconnect();
    return;
  }

  if (hasCars && !hasApartments) {
    await db.collection("cars").rename("apartments");
    console.log("Renamed collection cars → apartments.");
    await mongoose.disconnect();
    return;
  }

  // both exist
  const carsCount = await db.collection("cars").countDocuments();
  const aptCount = await db.collection("apartments").countDocuments();
  console.log(`Both collections exist (cars=${carsCount}, apartments=${aptCount}).`);

  if (carsCount === 0) {
    await db.collection("cars").drop();
    console.log("Dropped empty `cars` collection.");
  } else if (aptCount === 0) {
    await db.collection("apartments").drop();
    await db.collection("cars").rename("apartments");
    console.log("Replaced empty apartments with cars → apartments.");
  } else {
    console.error(
      "Both collections have documents. Merge manually, then drop `cars`."
    );
    process.exitCode = 1;
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
