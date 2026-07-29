/**
 * Metallic wordmark wash from theme primary (cool steel for V Luxury).
 * Biased toward primaryLight so it stays readable on dark heroes.
 */

/**
 * @param {import("@mui/material/styles").Theme} theme
 */
export function brandWordmarkSx(theme) {
  const main = theme.palette.primary.main;
  const light = theme.palette.primary.light;
  const dark = theme.palette.primary.dark;
  return {
    display: "inline-block",
    fontFamily: "var(--font-display)",
    fontStyle: "italic",
    fontWeight: 500,
    letterSpacing: "0.02em",
    // Italic descenders (y/g/p) clip with background-clip + tight line-box
    lineHeight: 1.2,
    padding: "0.06em 0.04em 0.16em",
    overflow: "visible",
    background: `linear-gradient(
      110deg,
      ${main} 0%,
      ${light} 22%,
      color-mix(in srgb, ${light} 65%, #ffffff) 42%,
      ${light} 58%,
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
