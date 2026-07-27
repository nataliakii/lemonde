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

  test("softPageBackground uses color-mix with brand tint", () => {
    expect(softPageBackground("#E8D5A3", 14)).toContain("#E8D5A3");
    expect(softPageBackground("#E8D5A3", 14)).toContain("color-mix");
  });

  test("hero/footer gradients use branding tokens", () => {
    const b = {
      primary: "#C9A227",
      primaryLight: "#E8D5A3",
      secondary: "#1A1612",
      secondaryDark: "#0E0C0A",
      secondaryLight: "#3A322A",
    };
    expect(brandHeroGradient(b)).toContain("#1A1612");
    expect(brandHeroGradient(b)).toContain("rgba(201,162,39,0.22)");
    expect(brandFooterGradient(b)).toContain("#0E0C0A");
    expect(brandFooterGradient(b)).toContain("rgba(201,162,39,0.16)");
  });
});
