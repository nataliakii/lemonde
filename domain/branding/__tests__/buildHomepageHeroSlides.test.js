import { buildHomepageHeroSlides } from "../buildHomepageHeroSlides";

describe("buildHomepageHeroSlides", () => {
  test("returns heroImages when no lead", () => {
    expect(
      buildHomepageHeroSlides({
        heroImages: ["a.jpg", "b.jpg"],
      })
    ).toEqual(["a.jpg", "b.jpg"]);
  });

  test("prepends lead and dedupes", () => {
    expect(
      buildHomepageHeroSlides({
        heroLeadImage: "lead.jpg",
        heroImages: ["lead.jpg", "b.jpg"],
      })
    ).toEqual(["lead.jpg", "b.jpg"]);
  });

  test("lead alone when heroImages empty", () => {
    expect(
      buildHomepageHeroSlides({
        heroLeadImage: "lead.jpg",
        heroImages: [],
      })
    ).toEqual(["lead.jpg"]);
  });

  test("ignores blank strings", () => {
    expect(
      buildHomepageHeroSlides({
        heroLeadImage: "  ",
        heroImages: ["", "a.jpg", null],
      })
    ).toEqual(["a.jpg"]);
  });
});
