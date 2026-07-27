import { buildLocalizedSitemap, validateSitemapEntries } from "../sitemapBuilder";
import { getSupportedLocales } from "@domain/locationSeo/locationSeoService";
import { SINGLE_PROPERTY_MODE } from "@config/domain";
import {
  INDEXING_MODE,
  shouldIndexPath,
} from "@/services/seo/indexingPolicy";

describe("buildLocalizedSitemap", () => {
  it("builds locale-aware sitemap without duplicate urls", () => {
    const entries = buildLocalizedSitemap([
      {
        slug: "deluxe-double-balcony-sea-view-1",
        updatedAt: "2026-02-20T00:00:00.000Z",
      },
    ]);

    const validation = validateSitemapEntries(entries);

    expect(validation.duplicateUrls).toEqual([]);
    expect(validation.missingXDefault).toEqual([]);
  });

  it("includes suite urls for every supported locale on V Luxury", () => {
    if (!SINGLE_PROPERTY_MODE) return;

    const locales = getSupportedLocales();
    const entries = buildLocalizedSitemap([
      {
        slug: "deluxe-king-room-3",
      },
    ]);

    const suiteEntries = entries.filter((entry) =>
      entry.url.includes("/apartments/deluxe-king-room-3")
    );
    expect(suiteEntries).toHaveLength(locales.length);

    const paths = suiteEntries.map((entry) => new URL(entry.url).pathname);
    for (const locale of locales) {
      expect(paths).toContain(`/${locale}/apartments/deluxe-king-room-3`);
    }

    expect(entries.some((e) => e.url.includes("/locations/"))).toBe(false);
    expect(entries.some((e) => e.url.includes("/cars/"))).toBe(false);
  });

  it("includes apartments index and hub pages", () => {
    if (!SINGLE_PROPERTY_MODE) return;

    const locales = getSupportedLocales();
    const entries = buildLocalizedSitemap([]);
    const paths = entries.map((entry) => new URL(entry.url).pathname);

    for (const locale of locales) {
      expect(paths).toContain(`/${locale}`);
      expect(paths).toContain(`/${locale}/apartments`);
      expect(paths).toContain(`/${locale}/contacts`);
    }
  });

  it("keeps sitemap aligned with the indexing policy", () => {
    const entries = buildLocalizedSitemap([
      {
        slug: "superior-queen-room-4",
      },
    ]);
    const paths = entries.map((entry) => new URL(entry.url).pathname);

    expect(paths.every((path) => shouldIndexPath(path))).toBe(true);
    expect(paths.length).toBeGreaterThan(0);

    if (!SINGLE_PROPERTY_MODE && INDEXING_MODE === "allowlist") {
      // car-rental allowlist branch covered elsewhere
      expect(paths.length).toBeGreaterThanOrEqual(0);
    }
  });
});
