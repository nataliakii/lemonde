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
