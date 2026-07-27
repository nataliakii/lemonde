/**
 * Shared helpers for apartment / gallery image refs:
 * - Cloudinary public_id
 * - absolute https URL
 * - local public path (/images/...)
 */

export function isHttpUrl(src) {
  return typeof src === "string" && /^https?:\/\//i.test(src.trim());
}

/** Local Next.js public asset path (not a Cloudinary public_id). */
export function isLocalPublicPath(src) {
  return typeof src === "string" && src.trim().startsWith("/");
}

/** Render with next/image instead of CldImage. */
export function isDirectImageSrc(src) {
  return isHttpUrl(src) || isLocalPublicPath(src);
}
