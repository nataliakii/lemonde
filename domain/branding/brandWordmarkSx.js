/**
 * Metallic wordmark wash from theme primary (cool steel for V Luxury).
 * @param {import("@mui/material/styles").Theme} theme
 * @param {{ bright?: boolean }} [opts] — brighter white-forward wash for photo heroes
 */
export function brandWordmarkSx(theme, opts = {}) {
  const main = theme.palette.primary.main;
  const light = theme.palette.primary.light;
  const dark = theme.palette.primary.dark;
  const bright = Boolean(opts.bright);
  const background = bright
    ? `linear-gradient(
      110deg,
      #F0F4F8 0%,
      #FFFFFF 28%,
      #FFFFFF 48%,
      #F7FAFC 62%,
      #E8EEF4 82%,
      #D8E2EC 100%
    )`
    : `linear-gradient(
      110deg,
      ${main} 0%,
      ${light} 22%,
      color-mix(in srgb, ${light} 65%, #ffffff) 42%,
      ${light} 58%,
      ${main} 78%,
      ${dark} 100%
    )`;
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
    background,
    backgroundSize: "220% auto",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    animation: "brandShimmer 6s ease-in-out infinite",
    ...(bright
      ? {
          filter: "drop-shadow(0 2px 18px rgba(0,0,0,0.35))",
        }
      : null),
  };
}
