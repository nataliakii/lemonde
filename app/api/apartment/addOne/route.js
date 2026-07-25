import { NextResponse } from "next/server";

import { Apartment } from "@models/apartment";
import { connectToDB } from "@lib/database";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import cloudinary, {
  ensureCloudinaryConfigured,
} from "@utils/cloudinary";
import {
  getCloudinaryCarsFolder,
  getCloudinaryPlaceholderPublicId,
} from "@config/cloudinary";
import { revalidatePath, revalidateTag } from "next/cache";
import { generateSlugBase, ensureUniqueSlug } from "@utils/slugCar";
import { requireAdmin } from "@lib/adminAuth";
import { resolveOwnerIdForCreate } from "@/domain/owners/ownerScope";

dayjs.extend(isBetween);

// Main handler function
export async function POST(req) {
  try {
    const { session, errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const cfg = ensureCloudinaryConfigured();
    if (!cfg.ok) {
      return NextResponse.json(
        { success: false, message: cfg.message },
        { status: 500 }
      );
    }

    // Ensure DB connection for all operations
    await connectToDB();

    const formData = await req.formData();
    const apartmentData = extractApartmentData(formData);
    const requestedOwnerId = formData.get("ownerId");
    apartmentData.ownerId = resolveOwnerIdForCreate(
      session.user,
      requestedOwnerId
    );

    // Generate carNumber by fetching the highest current car number and incrementing it
    apartmentData.carNumber = await generateCarNumber();

    await validateRequiredFields(apartmentData);

    if (apartmentData.file) {
      apartmentData.photoUrl = await handleImageUpload(apartmentData.file);
    } else {
      apartmentData.photoUrl = getCloudinaryPlaceholderPublicId();
    }

    apartmentData.dateAddCar = dayjs().toDate();

    // Auto-generate SEO slug from model + transmission
    const slugBase = generateSlugBase(apartmentData);
    apartmentData.slug = await ensureUniqueSlug(slugBase, async (slug) => {
      const existing = await Apartment.findOne({ slug: slug.trim().toLowerCase() }).lean();
      return !!existing;
    });

    // Create and save the car
    const newCar = new Apartment(apartmentData);

    await newCar.save();

    // Инвалидируем кеш по машинам после добавления
    revalidateTag("cars");
    revalidatePath("/api/apartment/all");
    revalidatePath("/api/apartment/models");

    return NextResponse.json(
      {
        success: true,
        message: `Машина ${newCar.model} добавлена`,
        data: newCar,
        status: 200,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

async function generateCarNumber() {
  // Fetch all car numbers and map them to integers
  const cars = await Apartment.find().select("carNumber");
  const carNumbers = cars
    .map((car) => parseInt(car.carNumber, 10))
    .filter((num) => !isNaN(num));

  // Find the highest car number
  const maxCarNumber = carNumbers.length > 0 ? Math.max(...carNumbers) : 0;
  const newCarNumber = maxCarNumber + 1;

  // Return as a zero-padded string (e.g., four digits)
  return newCarNumber.toString().padStart(4, "0");
}
// Function to extract data from the form
function extractApartmentData(formData) {
  console.log("[addOne] Incoming formData keys:", Array.from(formData.keys()));
  const file = formData.get("image");

  // Normalize and coerce types from FormData (string | Blob) to schema types
  const toNumber = (val, fallback = undefined) => {
    if (val === null || val === undefined || val === "") return fallback;
    const n = Number(val);
    return Number.isNaN(n) ? fallback : n;
  };
  const toBoolean = (val, fallback = false) => {
    if (typeof val === "boolean") return val;
    if (val === null || val === undefined) return fallback;
    const s = String(val).trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(s)) return true;
    if (["false", "0", "no", "off"].includes(s)) return false;
    return fallback;
  };

  return {
    file,
    model: formData.get("model"),
    class: formData.get("class"),
    transmission: formData.get("transmission") || "automatic",
    seats: toNumber(formData.get("seats"), 2),
    numberOfDoors: toNumber(formData.get("numberOfDoors"), 1),
    airConditioning: toBoolean(formData.get("airConditioning"), true),
    enginePower: toNumber(formData.get("enginePower"), 0),
    pricingTiers: parsePricingTiers(formData.get("pricingTiers")),
    regNumber: formData.get("regNumber") || formData.get("model") || "UNIT",
    color: formData.get("color") || "white",
    engine: String(formData.get("engine") || "0"),
    fueltype: formData.get("fueltype") || "electric",
    registration: toNumber(formData.get("registration"), new Date().getFullYear()),
    deposit: toNumber(formData.get("deposit"), 0),
    PriceChildSeats: toNumber(formData.get("PriceChildSeats"), 0),
    PriceKacko: toNumber(formData.get("PriceKacko"), 0),
    franchise: toNumber(formData.get("franchise"), 0),
    bathrooms: toNumber(formData.get("bathrooms"), 1),
    sizeSqm: toNumber(formData.get("sizeSqm"), null),
    floor: toNumber(formData.get("floor"), null),
    description: String(formData.get("description") || ""),
    amenities: parseAmenities(formData.get("amenities")),
  };
}

function parseAmenities(raw) {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((a) => String(a).trim()).filter(Boolean);
  } catch {
    return String(raw)
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
  }
}

// Function to validate required fields
function validateRequiredFields(apartmentData) {
  const requiredFields = ["carNumber", "model", "class", "seats", "pricingTiers"];
  for (const field of requiredFields) {
    if (
      apartmentData[field] === undefined ||
      apartmentData[field] === null ||
      apartmentData[field] === ""
    ) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  validatePricingTiers(apartmentData.pricingTiers);
  validateBedrooms(apartmentData.numberOfDoors);
}

// Function to parse and validate pricing tiers
function parsePricingTiers(pricingTiersString) {
  try {
    return pricingTiersString
      ? JSON.parse(pricingTiersString)
      : createEmptyPricingTiers();
  } catch (error) {
    throw new Error("Invalid pricing tiers format");
  }
}

function createEmptyPricingTiers() {
  return {
    NoSeason: { days: {} },
    LowSeason: { days: {} },
    LowUpSeason: { days: {} },
    MiddleSeason: { days: {} },
    HighSeason: { days: {} },
  };
}

function validatePricingTiers(pricingTiers) {
  const seasons = [
    "NoSeason",
    "LowSeason",
    "LowUpSeason",
    "MiddleSeason",
    "HighSeason",
  ];
  for (const season of seasons) {
    if (
      !pricingTiers[season]?.days ||
      Object.keys(pricingTiers[season].days).length === 0
    ) {
      throw new Error(`Missing pricing information for ${season}`);
    }
  }
}

/** Bedrooms (legacy field numberOfDoors) for apartments: 0–10 */
function validateBedrooms(numberOfDoors) {
  if (numberOfDoors == null) return;
  if (numberOfDoors < 0 || numberOfDoors > 10) {
    throw new Error("Bedrooms must be between 0 and 10");
  }
}

// Function to handle image upload
async function handleImageUpload(file) {
  const allowedMimeTypes = ["image/jpeg", "image/png"];
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only JPEG and PNG are allowed");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadToCloudinary = () =>
    new Promise((resolve, reject) => {
      const stream = require("stream");
      const passthrough = new stream.PassThrough();
      passthrough.end(buffer);

      cloudinary.uploader
        .upload_stream(
          {
            folder: getCloudinaryCarsFolder(),
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(new Error("Failed to upload image to Cloudinary"));
            } else {
              resolve(result.public_id);
            }
          }
        )
        .end(passthrough.read());
    });

  return await uploadToCloudinary();
}

// Error handling function
function handleError(error) {
  console.error("Error:", error);
  const status = error.code === 11000 ? 409 : 500;
  const message =
    error.code === 11000
      ? "A car with this car number already exists"
      : "Failed to add car";
  return NextResponse.json(
    { success: false, message, details: error.message },
    { status }
  );
}
