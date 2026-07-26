import type { Metadata } from "next";
import { getSeoConfig } from "@config/seo";
import {
  buildCarSeoText,
  getApartmentAlternates,
  getApartmentPath,
  getCarAlternates,
  getCarPath,
  getHubAlternates,
  getHubSeo,
  getLocationAlternatesById,
  getLocationPathFromLocation,
  getLocaleRootPath,
  getSupportedLocales,
  getStaticPagePath,
  getStaticPageSeo,
  normalizeLocale,
} from "@domain/locationSeo/locationSeoService";
import { type StaticPageKey } from "@domain/locationSeo/locationSeoKeys";
import {
  NOINDEX_STATIC_PAGES,
  isNoindexLocation,
} from "@config/sitemapConfig";
import type { LocationSeoResolved } from "@domain/locationSeo/types";
import { getAirportPrioritySeo, isPriorityAirportLocation } from "./airportPrioritySeo";
import { buildHreflangAlternates } from "./hreflangBuilder";
import { getRobotsForPath } from "./indexingPolicy";
import { toAbsoluteUrl } from "./urlBuilder";
import { SINGLE_PROPERTY_MODE } from "@config/domain";

const OG_LOCALE_MAP: Record<string, string> = {
  en: "en_US",
  ru: "ru_RU",
  uk: "uk_UA",
  el: "el_GR",
  de: "de_DE",
  bg: "bg_BG",
  ro: "ro_RO",
  sr: "sr_RS",
};

function getOpenGraphLocale(locale: string): string {
  return OG_LOCALE_MAP[locale] || OG_LOCALE_MAP.en;
}

function isRobotsIndexable(robots: Metadata["robots"]): boolean {
  if (typeof robots === "string") {
    return !robots.toLowerCase().includes("noindex");
  }
  return robots?.index !== false;
}

function buildBaseMetadata(input: {
  title: string;
  description: string;
  canonicalPath: string;
  alternatePathsByLocale: Record<string, string>;
  locale: string;
  /** When true, set robots to noindex,follow (for legal/technical pages). */
  noindex?: boolean;
}): Metadata {
  const seoConfig = getSeoConfig();
  const robots = getRobotsForPath(input.canonicalPath, Boolean(input.noindex));
  const isIndexable = isRobotsIndexable(robots);
  const hreflangAlternates = isIndexable
    ? buildHreflangAlternates(input.alternatePathsByLocale)
    : ({} as Record<string, string>);
  const canonicalUrl = toAbsoluteUrl(input.canonicalPath);

  const alternates: Metadata["alternates"] = {
    canonical: canonicalUrl,
  };
  if (isIndexable && Object.keys(hreflangAlternates).length > 0) {
    alternates.languages = hreflangAlternates;
  }

  return {
    title: input.title,
    description: input.description,
    alternates,
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonicalUrl,
      locale: getOpenGraphLocale(input.locale),
      type: "website",
      siteName: seoConfig.siteName,
      images: [
        {
          url: `${seoConfig.baseUrl}/logo-mark.png`,
          width: 1024,
          height: 1024,
          alt: seoConfig.siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [`${seoConfig.baseUrl}/logo-mark.png`],
    },
    robots,
  };
}

export function buildHubMetadata(localeCandidate: string | undefined | null): Metadata {
  const locale = normalizeLocale(localeCandidate);
  const hubSeo = getHubSeo(locale);
  const canonicalPath = getLocaleRootPath(locale);

  return buildBaseMetadata({
    title: hubSeo.seoTitle,
    description: hubSeo.seoDescription,
    canonicalPath,
    alternatePathsByLocale: getHubAlternates(),
    locale,
  });
}

export function buildLocationsIndexMetadata(
  localeCandidate: string | undefined | null
): Metadata {
  const locale = normalizeLocale(localeCandidate);
  const hubSeo = getHubSeo(locale);
  const canonicalPath = `/${locale}/locations`;
  const alternatePathsByLocale = Object.fromEntries(
    getSupportedLocales().map((supportedLocale) => [
      supportedLocale,
      `/${supportedLocale}/locations`,
    ])
  );

  return buildBaseMetadata({
    title: hubSeo.seoTitle,
    description: hubSeo.seoDescription,
    canonicalPath,
    alternatePathsByLocale,
    locale,
  });
}

export function buildLocationMetadata(location: LocationSeoResolved): Metadata {
  const canonicalPath = getLocationPathFromLocation(location.locale, location);
  const prioritySeo = isPriorityAirportLocation(location)
    ? getAirportPrioritySeo(location.locale)
    : null;
  const title = prioritySeo?.seoTitle || location.seoTitle;
  const description = prioritySeo?.seoDescription || location.seoDescription;

  return buildBaseMetadata({
    title,
    description,
    canonicalPath,
    alternatePathsByLocale: getLocationAlternatesById(location.id),
    locale: location.locale,
    noindex: isNoindexLocation(location.id),
  });
}

export function buildCarMetadata(input: {
  localeCandidate: string | undefined | null;
  carSlug: string;
  carModel: string;
  locationName: string;
  transmission?: string;
  fuelType?: string;
  seats?: string;
}): Metadata {
  const locale = normalizeLocale(input.localeCandidate);
  if (SINGLE_PROPERTY_MODE) {
    return buildApartmentMetadata({
      localeCandidate: locale,
      apartmentSlug: input.carSlug,
      apartmentName: input.carModel,
      locationName: input.locationName,
      guests: input.seats,
    });
  }
  const canonicalPath = getCarPath(locale, input.carSlug);
  const carSeo = buildCarSeoText(locale, {
    carModel: input.carModel,
    locationName: input.locationName,
    transmission: input.transmission,
    fuelType: input.fuelType,
    seats: input.seats,
  });

  return buildBaseMetadata({
    title: carSeo.seoTitle,
    description: carSeo.seoDescription,
    canonicalPath,
    alternatePathsByLocale: getCarAlternates(input.carSlug),
    locale,
  });
}

export function buildApartmentMetadata(input: {
  localeCandidate: string | undefined | null;
  apartmentSlug: string;
  apartmentName: string;
  locationName: string;
  guests?: string;
}): Metadata {
  const locale = normalizeLocale(input.localeCandidate);
  const name = input.apartmentName || input.apartmentSlug;
  const locationName = input.locationName || "Nea Kallikratia";
  const guestsPart = input.guests ? ` · up to ${input.guests} guests` : "";
  const title = name;
  const description = `${name} at Le Monde Suites in ${locationName}${guestsPart}. Browse photos and request your stay.`;
  const canonicalPath = getApartmentPath(locale, input.apartmentSlug);

  return buildBaseMetadata({
    title,
    description,
    canonicalPath,
    alternatePathsByLocale: getApartmentAlternates(input.apartmentSlug),
    locale,
  });
}

export function buildStaticPageMetadata(
  localeCandidate: string | undefined | null,
  pageKey: StaticPageKey
): Metadata {
  const locale = normalizeLocale(localeCandidate);
  const pageSeo = getStaticPageSeo(locale, pageKey);

  const alternatesByLocale = Object.fromEntries(
    Object.keys(getHubAlternates()).map((supportedLocale) => [
      supportedLocale,
      getStaticPagePath(supportedLocale, pageKey),
    ])
  );

  return buildBaseMetadata({
    title: pageSeo.seoTitle,
    description: pageSeo.seoDescription,
    canonicalPath: getStaticPagePath(locale, pageKey),
    alternatePathsByLocale: alternatesByLocale,
    locale,
    noindex: NOINDEX_STATIC_PAGES.has(pageKey),
  });
}
