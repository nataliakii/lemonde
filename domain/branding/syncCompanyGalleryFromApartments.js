/**
 * Persist homepage "The property" gallery on the company document
 * from a round-robin mix of apartment Cloudinary photos.
 *
 * Only fills assets.galleryImages when empty so admin-managed General photos
 * are not overwritten. Can still set ogImage when unset.
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
 * @returns {Promise<{ companyId: string, count: number, galleryImages: string[], skippedGallery?: boolean }>}
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

  const mix = buildApartmentPhotoMix(apartments, { max });

  const existing = await Company.findById(companyId)
    .select("assets.galleryImages assets.ogImage")
    .lean();
  if (!existing) {
    throw new Error(`Company not found: ${companyId}`);
  }

  const currentGallery = Array.isArray(existing.assets?.galleryImages)
    ? existing.assets.galleryImages.filter(
        (u) => typeof u === "string" && u.trim()
      )
    : [];
  const galleryEmpty = currentGallery.length === 0;
  const ogEmpty = !String(existing.assets?.ogImage || "").trim();

  const $set = {};
  if (galleryEmpty && mix.length) {
    $set["assets.galleryImages"] = mix;
  }
  if (setOgImage && ogEmpty) {
    const ogCandidate = (galleryEmpty ? mix[0] : currentGallery[0]) || mix[0];
    if (ogCandidate) $set["assets.ogImage"] = ogCandidate;
  }

  if (Object.keys($set).length) {
    await Company.findByIdAndUpdate(companyId, { $set });
  }

  const galleryImages = galleryEmpty
    ? mix
    : currentGallery;

  return {
    companyId,
    count: galleryImages.length,
    galleryImages,
    skippedGallery: !galleryEmpty,
  };
}

export default syncCompanyGalleryFromApartments;
