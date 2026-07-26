/**
 * Copy MongoDB database Car → lemonde (or custom names via env).
 *
 * Usage:
 *   node scripts/copyDbCarToLemonde.js
 *   MONGODB_DB_NAME_FROM=Car MONGODB_DB_NAME_TO=lemonde node scripts/copyDbCarToLemonde.js
 *
 * Safe to re-run: drops each target collection before copy.
 * Does NOT delete the source DB.
 */
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

const MONGODB_URI = String(process.env.MONGODB_URI || "").trim();
const FROM_DB = String(process.env.MONGODB_DB_NAME_FROM || "Car").trim();
const TO_DB = String(
  process.env.MONGODB_DB_NAME_TO || process.env.MONGODB_DB_NAME || "lemonde"
).trim();

async function copyCollection(fromDb, toDb, name) {
  const source = fromDb.collection(name);
  const target = toDb.collection(name);

  await target.drop().catch(() => {});

  const indexes = await source.indexes();
  const count = await source.countDocuments();

  if (count > 0) {
    const cursor = source.find({});
    const batch = [];
    const BATCH = 500;
    while (await cursor.hasNext()) {
      batch.push(await cursor.next());
      if (batch.length >= BATCH) {
        await target.insertMany(batch, { ordered: false });
        batch.length = 0;
      }
    }
    if (batch.length) {
      await target.insertMany(batch, { ordered: false });
    }
  }

  for (const idx of indexes) {
    if (idx.name === "_id_") continue;
    const keys = idx.key;
    const opts = {
      name: idx.name,
      unique: Boolean(idx.unique),
      sparse: Boolean(idx.sparse),
      background: true,
    };
    if (idx.expireAfterSeconds != null) {
      opts.expireAfterSeconds = idx.expireAfterSeconds;
    }
    if (idx.partialFilterExpression) {
      opts.partialFilterExpression = idx.partialFilterExpression;
    }
    try {
      await target.createIndex(keys, opts);
    } catch (err) {
      console.warn(`  index skip ${name}.${idx.name}: ${err.message}`);
    }
  }

  const copied = await target.countDocuments();
  console.log(`  ${name}: ${copied}/${count} docs`);
}

async function main() {
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }
  if (FROM_DB === TO_DB) {
    console.error("Source and target DB names must differ");
    process.exit(1);
  }

  console.log(`Copying database "${FROM_DB}" → "${TO_DB}" …`);
  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  try {
    const fromDb = client.db(FROM_DB);
    const toDb = client.db(TO_DB);
    const collections = await fromDb.listCollections().toArray();
    const names = collections.map((c) => c.name).sort();

    if (!names.length) {
      console.error(`Source DB "${FROM_DB}" has no collections`);
      process.exit(1);
    }

    console.log(`Collections (${names.length}): ${names.join(", ")}`);
    for (const name of names) {
      await copyCollection(fromDb, toDb, name);
    }

    console.log("\nDone.");
    console.log(`Set MONGODB_DB_NAME=${TO_DB} in .env and restart the app.`);
    console.log(`Source DB "${FROM_DB}" was NOT deleted.`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
