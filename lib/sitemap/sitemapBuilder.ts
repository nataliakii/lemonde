import { MetadataRoute } from "next";
import {
  getAllLocationsForLocale,
  getApartmentAlternates,
  getApartmentPath,
  getCarAlternates,
  getCarPath,
  getDefaultLocale,
  getHubAlternates,
  getLocationAlternatesById,
  getLocationPathFromLocation,
  getLocationSeoSlug,
  getStaticPagePath,
  getSupportedLocales,
} from "@domain/locationSeo/locationSeoService";
import {
  SITEMAP_STATIC_PAGES,
  isNoindexLocation,
} from "@config/sitemapConfig";
import { SINGLE_PROPERTY_MODE } from "@config/domain";
import {
  APARTMENTS_ROUTE_SEGMENT,
  LOCATION_IDS,
  type LocationId,
  type StaticPageKey,
} from "@domain/locationSeo/locationSeoKeys";
import { buildHreflangAlternates } from "@/services/seo/hreflangBuilder";
import { toAbsoluteUrl } from "@/services/seo/urlBuilder";
import {
  getAllSeoPageSlugs,
  getSeoPageAlternatesForCategoryLocation,
  getSeoPagePath,
  buildProgrammaticSlug,
  buildAllProgrammaticSlugs,
  buildAllBrandPageSlugs,
  getBrandPageAlternates,
  getCategoryById,
  filterCarsByCategory,
  filterCarsByBrand,
} from "@domain/seoPages/seoPageRegistry";
import { shouldIndexPath } from "@/services/seo/indexingPolicy";

type SitemapCar = {
  slug?: string;
  isActive?: boolean;
  isHidden?: boolean;
  deletedAt?: string | Date | null;
  updatedAt?: string | Date;
  dateLastModified?: string | Date;
  dateAddCar?: string | Date;
};

function getLastModifiedDate(car: SitemapCar): string {
  const value =
    car.updatedAt ||
    car.dateLastModified ||
    car.dateAddCar ||
    new Date().toISOString();
  return new Date(value).toISOString();
}

function isPublicCar(car: SitemapCar): boolean {
  return Boolean(
    car?.slug &&
      String(car.slug).trim() &&
      car.isActive !== false &&
      car.isHidden !== true &&
      !car.deletedAt
  );
}

function buildLocaleStaticAlternates(
  pageKey: StaticPageKey
): Record<string, string> {
  const alternatesByLocale = Object.fromEntries(
    getSupportedLocales().map((locale) => [
      locale,
      getStaticPagePath(locale, pageKey),
    ])
  );
  return buildHreflangAlternates(alternatesByLocale);
}

function getLocationPriority(
  locationId: string,
  _locale: string,
  defaultLocale: string
): number {
  if (locationId === LOCATION_IDS.THESSALONIKI_AIRPORT) {
    return 1;
  }
  return _locale === defaultLocale ? 0.85 : 0.8;
}

export function validateSitemapEntries(entries: MetadataRoute.Sitemap) {
  const duplicateUrls: string[] = [];
  const urlSet = new Set<string>();
  const missingXDefault: string[] = [];

  for (const entry of entries) {
    if (urlSet.has(entry.url)) {
      duplicateUrls.push(entry.url);
    }
    urlSet.add(entry.url);

    const alternates = entry.alternates?.languages || {};
    if (!alternates["x-default"]) {
      missingXDefault.push(entry.url);
    }
  }

  return {
    duplicateUrls,
    missingXDefault,
  };
}

function getLatestDateForCars(
  candidateCars: SitemapCar[],
  fallbackIso: string
): string {
  if (!candidateCars || candidateCars.length === 0) return fallbackIso;
  let latest = "1970-01-01T00:00:00.000Z";
  for (const car of candidateCars) {
    const d = getLastModifiedDate(car);
    if (d > latest) latest = d;
  }
  return latest === "1970-01-01T00:00:00.000Z" ? fallbackIso : latest;
}

/**
 * V Luxury / single-property sitemap — only this site's public pages.
 * Base URL comes from getBaseUrl() (vluxury.kalikratia.com).
 */
function buildApartmentPropertySitemap(
  apartments: SitemapCar[] = []
): MetadataRoute.Sitemap {
  const nowIso = new Date().toISOString();
  const defaultLocale = getDefaultLocale();
  const supportedLocales = getSupportedLocales();
  const publicApartments = (apartments || []).filter(isPublicCar);
  const lastMod = getLatestDateForCars(publicApartments, nowIso);
  const entries: MetadataRoute.Sitemap = [];

  const hubAlternates = buildHreflangAlternates(getHubAlternates());
  for (const locale of supportedLocales) {
    entries.push({
      url: toAbsoluteUrl(`/${locale}`),
      lastModified: lastMod,
      changeFrequency: "daily",
      priority: locale === defaultLocale ? 1 : 0.9,
      alternates: { languages: hubAlternates },
    });
  }

  const apartmentsIndexAlternates = buildHreflangAlternates(
    Object.fromEntries(
      supportedLocales.map((locale) => [
        locale,
        `/${locale}/${APARTMENTS_ROUTE_SEGMENT}`,
      ])
    )
  );
  for (const locale of supportedLocales) {
    entries.push({
      url: toAbsoluteUrl(`/${locale}/${APARTMENTS_ROUTE_SEGMENT}`),
      lastModified: lastMod,
      changeFrequency: "weekly",
      priority: locale === defaultLocale ? 0.95 : 0.9,
      alternates: { languages: apartmentsIndexAlternates },
    });
  }

  for (const pageKey of SITEMAP_STATIC_PAGES) {
    const alternates = buildLocaleStaticAlternates(pageKey);
    for (const locale of supportedLocales) {
      entries.push({
        url: toAbsoluteUrl(getStaticPagePath(locale, pageKey)),
        lastModified: nowIso,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: { languages: alternates },
      });
    }
  }

  for (const apartment of publicApartments) {
    const slug = String(apartment.slug).trim();
    const alternates = buildHreflangAlternates(getApartmentAlternates(slug));
    const apartmentLastModified = getLastModifiedDate(apartment);

    for (const locale of supportedLocales) {
      entries.push({
        url: toAbsoluteUrl(getApartmentPath(locale, slug)),
        lastModified: apartmentLastModified,
        changeFrequency: "weekly",
        priority: locale === defaultLocale ? 0.85 : 0.8,
        alternates: { languages: alternates },
      });
    }
  }

  const filteredEntries = entries.filter((entry) =>
    shouldIndexPath(new URL(entry.url).pathname)
  );

  const validation = validateSitemapEntries(filteredEntries);
  if (validation.duplicateUrls.length > 0) {
    throw new Error(
      `[sitemapBuilder] Duplicate sitemap URLs found: ${validation.duplicateUrls.join(", ")}`
    );
  }

  return filteredEntries;
}

function buildCarRentalSitemap(cars: SitemapCar[] = []): MetadataRoute.Sitemap {
  const nowIso = new Date().toISOString();
  const defaultLocale = getDefaultLocale();
  const entries: MetadataRoute.Sitemap = [];
  const supportedLocales = getSupportedLocales();

  const publicCars = (cars || []).filter(isPublicCar);
  const globalCarsLastModified = getLatestDateForCars(publicCars, nowIso);

  const hubAlternates = buildHreflangAlternates(getHubAlternates());
  for (const locale of supportedLocales) {
    const localePath = `/${locale}`;
    entries.push({
      url: toAbsoluteUrl(localePath),
      lastModified: globalCarsLastModified,
      changeFrequency: "daily",
      priority: locale === defaultLocale ? 1 : 0.9,
      alternates: {
        languages: hubAlternates,
      },
    });
  }

  const locationsIndexAlternates = buildHreflangAlternates(
    Object.fromEntries(supportedLocales.map((l) => [l, `/${l}/locations`]))
  );
  for (const locale of supportedLocales) {
    entries.push({
      url: toAbsoluteUrl(`/${locale}/locations`),
      lastModified: globalCarsLastModified,
      changeFrequency: "weekly",
      priority: locale === defaultLocale ? 0.85 : 0.8,
      alternates: { languages: locationsIndexAlternates },
    });
  }

  const carsIndexAlternates = buildHreflangAlternates(
    Object.fromEntries(supportedLocales.map((l) => [l, `/${l}/cars`]))
  );
  for (const locale of supportedLocales) {
    entries.push({
      url: toAbsoluteUrl(`/${locale}/cars`),
      lastModified: globalCarsLastModified,
      changeFrequency: "weekly",
      priority: locale === defaultLocale ? 0.9 : 0.85,
      alternates: { languages: carsIndexAlternates },
    });
  }

  for (const pageKey of SITEMAP_STATIC_PAGES) {
    const alternates = buildLocaleStaticAlternates(pageKey);
    for (const locale of supportedLocales) {
      entries.push({
        url: toAbsoluteUrl(getStaticPagePath(locale, pageKey)),
        lastModified: nowIso,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: {
          languages: alternates,
        },
      });
    }
  }

  const defaultLocations = getAllLocationsForLocale(defaultLocale);
  for (const location of defaultLocations) {
    if (isNoindexLocation(location.id)) continue;

    const alternates = buildHreflangAlternates(
      getLocationAlternatesById(location.id)
    );
    for (const locale of supportedLocales) {
      const localizedLocation = getAllLocationsForLocale(locale).find(
        (item) => item.id === location.id
      );

      if (!localizedLocation) continue;

      const locationPath = getLocationPathFromLocation(
        locale,
        localizedLocation
      );
      entries.push({
        url: toAbsoluteUrl(locationPath),
        lastModified: globalCarsLastModified,
        changeFrequency: "weekly",
        priority: getLocationPriority(location.id, locale, defaultLocale),
        alternates: {
          languages: alternates,
        },
      });
    }
  }

  for (const car of publicCars) {
    const slug = String(car.slug).trim();
    const alternates = buildHreflangAlternates(getCarAlternates(slug));
    const carLastModified = getLastModifiedDate(car);

    for (const locale of supportedLocales) {
      entries.push({
        url: toAbsoluteUrl(getCarPath(locale, slug)),
        lastModified: carLastModified,
        changeFrequency: "weekly",
        priority: locale === defaultLocale ? 0.75 : 0.7,
        alternates: {
          languages: alternates,
        },
      });
    }
  }

  for (const locale of supportedLocales) {
    const seoPageSlugs = getAllSeoPageSlugs(locale);
    for (const seoPage of seoPageSlugs) {
      const alternates = buildHreflangAlternates(
        getSeoPageAlternatesForCategoryLocation(
          seoPage.categoryId,
          seoPage.locationId
        )
      );
      const category = getCategoryById(seoPage.categoryId);
      const categoryCars =
        category && category.filter
          ? filterCarsByCategory(publicCars, category.filter)
          : [];
      const categoryLastModified = getLatestDateForCars(
        categoryCars,
        globalCarsLastModified
      );
      entries.push({
        url: toAbsoluteUrl(getSeoPagePath(locale, seoPage.seoSlug)),
        lastModified: categoryLastModified,
        changeFrequency: "weekly",
        priority: locale === defaultLocale ? 0.85 : 0.8,
        alternates: { languages: alternates },
      });
    }
  }

  for (const locale of supportedLocales) {
    const brandPages = buildAllBrandPageSlugs(publicCars, locale);
    for (const brandPage of brandPages) {
      const brandAlternates = buildHreflangAlternates(
        getBrandPageAlternates(brandPage.brandSlug, brandPage.locationId)
      );
      const brandCars = filterCarsByBrand(publicCars, brandPage.brand);
      const brandLastModified = getLatestDateForCars(
        brandCars,
        globalCarsLastModified
      );
      entries.push({
        url: toAbsoluteUrl(getSeoPagePath(locale, brandPage.seoSlug)),
        lastModified: brandLastModified,
        changeFrequency: "weekly",
        priority: locale === defaultLocale ? 0.8 : 0.75,
        alternates: { languages: brandAlternates },
      });
    }
  }

  for (const locale of supportedLocales) {
    const progSlugs = buildAllProgrammaticSlugs(
      publicCars.map((c) => String(c.slug).trim()),
      locale
    );
    for (const prog of progSlugs) {
      const progAlternates: Record<string, string> = {};
      for (const loc of supportedLocales) {
        const slug = buildProgrammaticSlug(
          prog.carSlug,
          getLocationSeoSlug(prog.locationId as LocationId, loc)
        );
        progAlternates[loc] = getSeoPagePath(loc, slug);
      }
      const car = publicCars.find((c) => String(c.slug).trim() === prog.carSlug);
      entries.push({
        url: toAbsoluteUrl(getSeoPagePath(locale, prog.seoSlug)),
        lastModified: car
          ? getLastModifiedDate(car)
          : globalCarsLastModified,
        changeFrequency: "weekly",
        priority: locale === defaultLocale ? 0.7 : 0.65,
        alternates: {
          languages: buildHreflangAlternates(progAlternates),
        },
      });
    }
  }

  const filteredEntries = entries.filter((entry) =>
    shouldIndexPath(new URL(entry.url).pathname)
  );

  const validation = validateSitemapEntries(filteredEntries);
  if (validation.duplicateUrls.length > 0) {
    throw new Error(
      `[sitemapBuilder] Duplicate sitemap URLs found: ${validation.duplicateUrls.join(", ")}`
    );
  }

  return filteredEntries;
}

export function buildLocalizedSitemap(
  cars: SitemapCar[] = []
): MetadataRoute.Sitemap {
  if (SINGLE_PROPERTY_MODE) {
    return buildApartmentPropertySitemap(cars);
  }
  return buildCarRentalSitemap(cars);
}
