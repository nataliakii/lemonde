/**
 * Metallic wordmark wash from theme primary (silver for V Luxury).
 * Prefer this over relying only on .brand-wordmark CSS when deploying.
 */

/**
 * @param {import("@mui/material/styles").Theme} theme
 */
export function brandWordmarkSx(theme) {
  const main = theme.palette.primary.main;
  const light = theme.palette.primary.light;
  const dark = theme.palette.primary.dark;
  return {
    fontFamily: "var(--font-display)",
    fontStyle: "italic",
    fontWeight: 500,
    letterSpacing: "0.02em",
    background: `linear-gradient(
      110deg,
      ${dark} 0%,
      ${light} 28%,
      ${main} 48%,
      color-mix(in srgb, ${light} 55%, #ffffff) 62%,
      ${main} 78%,
      ${dark} 100%
    )`,
    backgroundSize: "220% auto",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    animation: "brandShimmer 6s ease-in-out infinite",
  };
}
