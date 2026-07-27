/**
 * Attach public/images/vluxury/{1..8}/*.jpg to VLS-01..08.
 *
 * Tries Cloudinary upload first; on failure uses local public paths
 * so Vercel can serve /images/vluxury/... from the repo.
 *
 * Usage:
 *   MONGODB_DB_NAME=vluxury npm run seed:vluxury-local-photos
 *   CAR_NUMBER=VLS-01 npm run seed:vluxury-local-photos   # one suite only
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

const ONLY_CAR = String(process.env.CAR_NUMBER || "").trim();
const ROOT = path.join(process.cwd(), "public", "images", "vluxury");

/** Map folder number → carNumber (rooms renumbered 1–8). */
const FOLDER_TO_CAR = {
  1: "VLS-01",
  2: "VLS-02",
  3: "VLS-03",
  4: "VLS-04",
  5: "VLS-05",
  6: "VLS-06",
  7: "VLS-07",
  8: "VLS-08",
};

async function tryCloudinaryUpload(filePath, publicIdBase) {
  try {
    const cloudinary = require("cloudinary").v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const root = String(
      process.env.CLOUDINARY_ROOT_FOLDER || "vluxurysuites"
    ).trim();
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
    return result.secure_url || result.public_id;
  } catch {
    return null;
  }
}

function listImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();
}

async function uploadOrLocal(files, folderNum) {
  const refs = [];
  let viaCloudinary = 0;
  for (const file of files) {
    const abs = path.join(ROOT, String(folderNum), file);
    const base = path.basename(file, path.extname(file)).replace(/\s+/g, "-");
    const publicId = await tryCloudinaryUpload(
      abs,
      `vls-${folderNum}-${base}`
    );
    if (publicId) {
      refs.push(publicId);
      viaCloudinary += 1;
    } else {
      refs.push(`/images/vluxury/${folderNum}/${file}`);
    }
  }
  return { refs, viaCloudinary };
}

async function main() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI required");
  const dbName = process.env.MONGODB_DB_NAME || "vluxury";
  if (dbName === "lemonde") {
    throw new Error("Refusing to run against MONGODB_DB_NAME=lemonde");
  }
  if (!fs.existsSync(ROOT)) {
    throw new Error(`Missing folder: ${ROOT}`);
  }

  const targets = Object.entries(FOLDER_TO_CAR).filter(([, car]) =>
    ONLY_CAR ? car === ONLY_CAR : true
  );
  if (!targets.length) {
    throw new Error(`No targets for CAR_NUMBER=${ONLY_CAR || "(all)"}`);
  }

  console.log(`DB=${dbName} suites=${targets.map(([, c]) => c).join(", ")}`);

  await mongoose.connect(MONGODB_URI, { dbName });
  const apartments = mongoose.connection.db.collection("apartments");
  const companies = mongoose.connection.db.collection("companies");

  const allPropertyRefs = [];
  let totalCloud = 0;
  let totalFiles = 0;

  for (const [folderNum, carNumber] of targets) {
    const dir = path.join(ROOT, String(folderNum));
    const files = listImages(dir);
    if (!files.length) {
      console.warn(`Skip ${carNumber}: no images in ${dir}`);
      continue;
    }
    totalFiles += files.length;
    const { refs, viaCloudinary } = await uploadOrLocal(files, folderNum);
    totalCloud += viaCloudinary;

    const photoUrl = refs[0];
    const gallery = refs.slice(1);
    const result = await apartments.updateOne(
      { carNumber },
      { $set: { photoUrl, gallery, dateLastModified: new Date() } }
    );
    if (result.matchedCount === 0) {
      console.warn(`Apartment ${carNumber} not found — skipped`);
      continue;
    }
    console.log(
      `${carNumber}: cover + ${gallery.length} gallery (${viaCloudinary}/${files.length} cloudinary)`
    );
    allPropertyRefs.push(...refs);
  }

  if (totalCloud === 0 && totalFiles > 0) {
    console.warn(
      "Cloudinary upload failed for all files — using local /images/vluxury paths."
    );
  }

  // Unique mix for company gallery strip (keep order, dedupe).
  // Do NOT write suite photos into assets.heroImages — homepage hero stays
  // branded gradient unless hero is set deliberately in admin/DB.
  const seen = new Set();
  const galleryImages = [];
  for (const ref of allPropertyRefs) {
    if (seen.has(ref)) continue;
    seen.add(ref);
    galleryImages.push(ref);
    if (galleryImages.length >= 36) break;
  }

  // Logo: never invent from /public — assets.logoMark is Mongo/admin only.
  const companySet = {
    "assets.galleryImages": galleryImages,
  };

  await companies.updateOne(
    { _id: new mongoose.Types.ObjectId(COMPANY_ID) },
    { $set: companySet }
  );
  console.log(
    `Company gallery updated: ${galleryImages.length} images (logo/hero left untouched)`
  );

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
