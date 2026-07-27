import {
  INDEXING_MODE,
  getRobotsForPath,
  shouldIndexPath,
} from "../indexingPolicy";
import { SINGLE_PROPERTY_MODE } from "@config/domain";

describe("indexingPolicy", () => {
  test("never indexes legacy location SEO pages on suite site", () => {
    expect(shouldIndexPath("/en/locations/car-rental-thessaloniki")).toBe(
      false
    );
    expect(shouldIndexPath("/ru/locations/arenda-avto-saloniki")).toBe(false);
  });

  test("indexes V Luxury public pages when SINGLE_PROPERTY_MODE", () => {
    if (!SINGLE_PROPERTY_MODE) return;

    expect(INDEXING_MODE).toBe("all");
    expect(shouldIndexPath("/en")).toBe(true);
    expect(shouldIndexPath("/en/apartments")).toBe(true);
    expect(
      shouldIndexPath("/en/apartments/deluxe-double-balcony-sea-view-1")
    ).toBe(true);
    expect(shouldIndexPath("/en/contacts")).toBe(true);
    expect(shouldIndexPath("/en/cookie-policy")).toBe(false);
    expect(getRobotsForPath("/en/apartments")).toEqual({
      index: true,
      follow: true,
    });
  });

  test("applies allowlist mode when not single-property", () => {
    if (SINGLE_PROPERTY_MODE) return;

    const blockedPath = "/en/cars";
    if (INDEXING_MODE === "allowlist") {
      expect(shouldIndexPath(blockedPath)).toBe(false);
      expect(getRobotsForPath(blockedPath)).toEqual({
        index: false,
        follow: true,
      });
    }
  });
});
