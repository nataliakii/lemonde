/**
 * Persist homepage "The property" gallery on the company document
 * from a round-robin mix of apartment Cloudinary photos.
 *
 * Homepage already prefers a live mix; this keeps assets.galleryImages /
 * ogImage in sync per hotel DB for OG, fallbacks, and seed/admin updates.
 */

import { COMPANY_ID } from "@config/company";
import { Apartment } from "@models/apartment";
import Company from "@models/company";
import { buildApartmentPhotoMix } from "@/domain/branding/buildApartmentPhotoMix";

/**
 * @param {{
 *   companyId?: string,
 *   apartments?: object[],
 *   max?: number,
 *   setOgImage?: boolean,
 * }} [options]
 * @returns {Promise<{ companyId: string, count: number, galleryImages: string[] }>}
 */
export async function syncCompanyGalleryFromApartments(options = {}) {
  const companyId = String(options.companyId || COMPANY_ID || "").trim();
  if (!companyId) {
    throw new Error("companyId is required");
  }

  const max = Math.max(1, Number(options.max) || 36);
  const setOgImage = options.setOgImage !== false;

  const apartments =
    options.apartments ||
    (await Apartment.find({}).select("photoUrl gallery carNumber model sort").lean());

  const galleryImages = buildApartmentPhotoMix(apartments, { max });

  const $set = {
    "assets.galleryImages": galleryImages,
  };
  if (setOgImage && galleryImages[0]) {
    $set["assets.ogImage"] = galleryImages[0];
  }

  await Company.findByIdAndUpdate(companyId, { $set });

  return { companyId, count: galleryImages.length, galleryImages };
}

export default syncCompanyGalleryFromApartments;
