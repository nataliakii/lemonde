/**
 * Build SuitesHero slide list: optional General lead first, then dedicated heroImages.
 * Dedupes while preserving order.
 *
 * @param {{
 *   heroLeadImage?: string | null,
 *   heroImages?: string[] | null,
 * }} input
 * @returns {string[]}
 */
export function buildHomepageHeroSlides(input = {}) {
  const lead = String(input.heroLeadImage || "").trim();
  const rest = Array.isArray(input.heroImages)
    ? input.heroImages.map((u) => String(u || "").trim()).filter(Boolean)
    : [];
  const seen = new Set();
  const out = [];
  for (const url of lead ? [lead, ...rest] : rest) {
    if (seen.has(url)) continue;
    seen.add(url);
    out.push(url);
  }
  return out;
}

export default buildHomepageHeroSlides;
