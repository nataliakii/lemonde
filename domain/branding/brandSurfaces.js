/**
 * Derive page / hero / footer surfaces from company.branding (Mongo).
 */

/**
 * @param {string} hex
 * @param {number} alpha 0..1
 */
export function hexToRgba(hex, alpha = 1) {
  const raw = String(hex || "")
    .replace("#", "")
    .trim();
  if (raw.length !== 3 && raw.length !== 6) {
    return `rgba(0,0,0,${alpha})`;
  }
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  const n = Number.parseInt(full, 16);
  if (!Number.isFinite(n)) return `rgba(0,0,0,${alpha})`;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Soft page canvas: brand light tint on white (Le Monde warm / V Luxury cool). */
export function softPageBackground(primaryLight, amountPercent = 14) {
  const tint = String(primaryLight || "#D0D5DB").trim() || "#D0D5DB";
  const pct = Math.min(40, Math.max(4, Number(amountPercent) || 14));
  return `color-mix(in srgb, ${tint} ${pct}%, #ffffff)`;
}

/**
 * @param {{
 *   primary: string,
 *   primaryLight: string,
 *   secondary: string,
 *   secondaryDark: string,
 *   secondaryLight: string,
 * }} b
 */
export function brandHeroGradient(b) {
  return [
    `radial-gradient(ellipse 80% 60% at 70% 20%, ${hexToRgba(b.primary, 0.22)} 0%, transparent 55%)`,
    `radial-gradient(ellipse 60% 50% at 15% 80%, ${hexToRgba(b.primaryLight, 0.12)} 0%, transparent 50%)`,
    `linear-gradient(165deg, ${b.secondaryDark} 0%, ${b.secondary} 45%, ${b.secondaryLight} 100%)`,
  ].join(", ");
}

/**
 * @param {{ primary: string, secondary: string, secondaryDark: string }} b
 */
export function brandFooterGradient(b) {
  return [
    `radial-gradient(ellipse 70% 50% at 50% 0%, ${hexToRgba(b.primary, 0.16)} 0%, transparent 55%)`,
    `linear-gradient(180deg, ${b.secondary} 0%, ${b.secondaryDark} 100%)`,
  ].join(", ");
}

/**
 * @param {{ primary: string, primaryLight: string }} b
 */
export function brandAccentRule(b) {
  return `linear-gradient(90deg, transparent, ${b.primary} 20%, ${b.primaryLight} 50%, ${b.primary} 80%, transparent)`;
}

/**
 * Overlay when a hero photo is set.
 * @param {{ secondary: string, secondaryDark: string }} b
 */
export function brandHeroImageOverlay(b) {
  return `linear-gradient(165deg, ${hexToRgba(b.secondaryDark, 0.72)} 0%, ${hexToRgba(b.secondary, 0.55)} 50%, ${hexToRgba(b.secondaryDark, 0.78)} 100%)`;
}

/**
 * Dark strip → page canvas (property gallery band).
 * @param {{ secondary: string, secondaryDark: string }} b
 * @param {string} pageBg
 */
export function brandGalleryBand(b, pageBg) {
  const top = b.secondary || "#1B1E24";
  const mid = b.secondaryDark || "#0E1014";
  const bottom = pageBg || softPageBackground(b.primaryLight);
  return `linear-gradient(180deg, ${top} 0%, ${mid} 56px, ${bottom} 56px, ${bottom} 100%)`;
}

/**
 * Alternating apartment-row panels.
 * @param {{ primaryLight: string, secondary: string, secondaryLight: string }} b
 * @param {boolean} light
 */
export function brandApartmentPanelGradient(b, light) {
  if (light) {
    return `linear-gradient(160deg, ${softPageBackground(b.primaryLight, 8)} 0%, ${softPageBackground(b.primaryLight, 22)} 100%)`;
  }
  return `linear-gradient(200deg, ${b.secondary} 0%, ${b.secondaryLight} 100%)`;
}
