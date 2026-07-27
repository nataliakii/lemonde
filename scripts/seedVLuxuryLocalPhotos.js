/**
 * Attach public/images/vluxury/*.jpg to one V Luxury suite.
 *
 * Tries Cloudinary upload first; on 403/failure uses local public paths
 * so the site can show photos without a working upload API key.
 *
 * Usage:
 *   MONGODB_DB_NAME=vluxury npm run seed:vluxury-local-photos
 *   CAR_NUMBER=VLS-01 npm run seed:vluxury-local-photos
 */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  process.env.MONGO_URI;

const COMPANY_ID =
  process.env.COMPANY_ID || "686f0a1b2c3d4e5f67890123";

const CAR_NUMBER = process.env.CAR_NUMBER || "VLS-01";
const DIR = path.join(process.cwd(), "public", "images", "vluxury");

async function tryCloudinaryUpload(filePath, publicIdBase) {
  try {
    const cloudinary = require("cloudinary").v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const root = String(process.env.CLOUDINARY_ROOT_FOLDER || "vluxury").trim();
    const folder = `${root}/apartments`;
    const opts = {
      folder,
      public_id: publicIdBase,
      overwrite: true,
      resource_type: "image",
    };
    const preset = String(process.env.CLOUDINARY_UPLOAD_PRESET || "").trim();
    if (preset) opts.upload_preset = preset;

    const result = await cloudinary.uploader.upload(filePath, opts);
    return result.public_id;
  } catch (e) {
    return null;
  }
}

async function main() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI required");
  const dbName = process.env.MONGODB_DB_NAME || "vluxury";
  if (dbName === "lemonde") {
    throw new Error("Refusing to run against MONGODB_DB_NAME=lemonde");
  }
  if (!fs.existsSync(DIR)) {
    throw new Error(`Missing folder: ${DIR}`);
  }

  const files = fs
    .readdirSync(DIR)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();

  if (!files.length) throw new Error(`No images in ${DIR}`);

  console.log(`DB=${dbName} suite=${CAR_NUMBER} files=${files.length}`);

  const refs = [];
  let viaCloudinary = 0;
  for (const file of files) {
    const abs = path.join(DIR, file);
    const base = path.basename(file, path.extname(file));
    const publicId = await tryCloudinaryUpload(abs, `vls-${base}`);
    if (publicId) {
      refs.push(publicId);
      viaCloudinary += 1;
      console.log("  cloudinary", publicId);
    } else {
      const local = `/images/vluxury/${file}`;
      refs.push(local);
      console.log("  local", local);
    }
  }

  if (viaCloudinary === 0) {
    console.warn(
      "Cloudinary upload failed for all files (likely API key has no Upload permission). Using local /images/vluxury paths."
    );
  } else {
    console.log(`Uploaded ${viaCloudinary}/${files.length} to Cloudinary.`);
  }

  await mongoose.connect(MONGODB_URI, { dbName });
  const apartments = mongoose.connection.db.collection("apartments");
  const companies = mongoose.connection.db.collection("companies");

  const photoUrl = refs[0];
  const gallery = refs.slice(1);

  const result = await apartments.updateOne(
    { carNumber: CAR_NUMBER },
    { $set: { photoUrl, gallery } }
  );

  if (result.matchedCount === 0) {
    throw new Error(`Apartment ${CAR_NUMBER} not found in ${dbName}`);
  }

  console.log(
    `Updated ${CAR_NUMBER}: photoUrl + ${gallery.length} gallery image(s)`
  );

  // Company property gallery from this suite's photos (local paths OK)
  await companies.updateOne(
    { _id: new mongoose.Types.ObjectId(COMPANY_ID) },
    {
      $set: {
        "assets.galleryImages": refs,
        "assets.ogImage": refs[0] || "",
      },
    }
  );
  console.log(`Synced company gallery (${refs.length} images).`);

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
