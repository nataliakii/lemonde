/**
 * Build a homepage gallery mix from all apartment Cloudinary photos.
 * Uses cover (photoUrl) + gallery[]; skips placeholders; round-robins units.
 */

import { buildCloudinaryImageUrl } from "@/domain/aggregator/mapCarToAggregatorDto";

const PLACEHOLDER_RE = /NO_PHOTO/i;

function isUsablePhotoRef(value) {
  if (typeof value !== "string") return false;
  const s = value.trim();
  if (!s || PLACEHOLDER_RE.test(s)) return false;
  // Absolute CDN URL, local public path, or Cloudinary public_id
  if (/^https?:\/\//i.test(s)) return true;
  if (s.startsWith("/")) return true;
  return true;
}

function collectApartmentPhotos(apartment) {
  const out = [];
  const seen = new Set();
  const push = (raw) => {
    if (!isUsablePhotoRef(raw)) return;
    const url = buildCloudinaryImageUrl(raw);
    if (!url || PLACEHOLDER_RE.test(url)) return;
    // Absolute URL or local public path
    if (!/^https?:\/\//i.test(url) && !url.startsWith("/")) return;
    if (seen.has(url)) return;
    seen.add(url);
    out.push(url);
  };

  push(apartment?.photoUrl);
  if (Array.isArray(apartment?.gallery)) {
    apartment.gallery.forEach(push);
  }
  return out;
}

/**
 * @param {Array<object>|null|undefined} apartments
 * @param {{ max?: number }} [options]
 * @returns {string[]} absolute Cloudinary image URLs
 */
export function buildApartmentPhotoMix(apartments, options = {}) {
  const max = Math.max(1, Number(options.max) || 36);
  const list = Array.isArray(apartments) ? apartments : [];

  const sorted = [...list].sort((a, b) => {
    const sa = Number(a?.sort);
    const sb = Number(b?.sort);
    if (Number.isFinite(sa) && Number.isFinite(sb) && sa !== sb) return sa - sb;
    return String(a?.carNumber || a?.model || "").localeCompare(
      String(b?.carNumber || b?.model || "")
    );
  });

  const pools = sorted
    .map((apt) => collectApartmentPhotos(apt))
    .filter((photos) => photos.length > 0);

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

export default buildApartmentPhotoMix;
