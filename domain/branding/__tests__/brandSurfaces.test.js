import {
  brandFooterGradient,
  brandHeroGradient,
  hexToRgba,
  softPageBackground,
} from "../brandSurfaces";

describe("brandSurfaces", () => {
  test("hexToRgba parses 6-digit hex", () => {
    expect(hexToRgba("#C9A227", 0.16)).toBe("rgba(201,162,39,0.16)");
  });

  test("softPageBackground returns MUI-parseable hex tinted toward white", () => {
    const bg = softPageBackground("#E8D5A3", 14);
    expect(bg).toMatch(/^#[0-9a-f]{6}$/i);
    // 14% tint → closer to white than the source color
    expect(bg.toLowerCase()).not.toBe("#e8d5a3");
    expect(softPageBackground("#E6EEF5", 16)).toMatch(/^#[0-9a-f]{6}$/i);
  });

  test("hero/footer gradients use branding tokens", () => {
    const b = {
      primary: "#9AA3AD",
      primaryLight: "#D0D5DB",
      secondary: "#1B1E24",
      secondaryDark: "#0E1014",
      secondaryLight: "#3A404A",
    };
    expect(brandHeroGradient(b)).toContain("#1B1E24");
    expect(brandHeroGradient(b)).toContain("rgba(208,213,219,0.28)");
    expect(brandFooterGradient(b)).toContain("#0E1014");
    expect(brandFooterGradient(b)).toContain("rgba(208,213,219,0.26)");
  });
});
