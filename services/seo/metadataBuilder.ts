import type { Metadata } from "next";
import { getSeoConfig } from "@config/seo";
import { COMPANY_ID } from "@config/company";
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

function toAbsoluteAssetUrl(
  baseUrl: string,
  assetUrl: string | null | undefined,
  fallbackPath: string
): string {
  const raw = String(assetUrl || "").trim() || fallbackPath;
  if (/^https?:\/\//i.test(raw)) return raw;
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${baseUrl}${path}`;
}

async function loadCompanyForSeo(): Promise<object | null> {
  try {
    const { getCompany } = await import("@/domain/services");
    return await getCompany(COMPANY_ID);
  } catch {
    return null;
  }
}

function buildBaseMetadata(input: {
  title: string;
  description: string;
  canonicalPath: string;
  alternatePathsByLocale: Record<string, string>;
  locale: string;
  /** When true, set robots to noindex,follow (for legal/technical pages). */
  noindex?: boolean;
  seoConfig?: ReturnType<typeof getSeoConfig>;
  ogImageUrl?: string | null;
}): Metadata {
  const seoConfig = input.seoConfig || getSeoConfig();
  const robots = getRobotsForPath(input.canonicalPath, Boolean(input.noindex));
  const isIndexable = isRobotsIndexable(robots);
  const hreflangAlternates = isIndexable
    ? buildHreflangAlternates(input.alternatePathsByLocale)
    : ({} as Record<string, string>);
  const canonicalUrl = toAbsoluteUrl(input.canonicalPath);
  const ogImage =
    input.ogImageUrl ||
    toAbsoluteAssetUrl(
      seoConfig.baseUrl,
      seoConfig.ogImage || seoConfig.heroImageUrl,
      "/logo-mark.png"
    );

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
          url: ogImage,
          width: 1200,
          height: 630,
          alt: seoConfig.siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [ogImage],
    },
    robots,
  };
}

export async function buildHubMetadata(
  localeCandidate: string | undefined | null
): Promise<Metadata> {
  const locale = normalizeLocale(localeCandidate);
  const company = await loadCompanyForSeo();
  const seoConfig = getSeoConfig(company);
  const hubSeo = getHubSeo(locale, company);
  const canonicalPath = getLocaleRootPath(locale);
  const ogImageUrl = toAbsoluteAssetUrl(
    seoConfig.baseUrl,
    seoConfig.ogImage || seoConfig.heroImageUrl,
    "/logo-mark.png"
  );

  return buildBaseMetadata({
    title: hubSeo.seoTitle,
    description: hubSeo.seoDescription,
    canonicalPath,
    alternatePathsByLocale: getHubAlternates(),
    locale,
    seoConfig,
    ogImageUrl,
  });
}

export async function buildLocationsIndexMetadata(
  localeCandidate: string | undefined | null
): Promise<Metadata> {
  const locale = normalizeLocale(localeCandidate);
  const company = await loadCompanyForSeo();
  const seoConfig = getSeoConfig(company);
  const hubSeo = getHubSeo(locale, company);
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
    seoConfig,
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
}): Metadata | Promise<Metadata> {
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

export async function buildApartmentMetadata(input: {
  localeCandidate: string | undefined | null;
  apartmentSlug: string;
  apartmentName: string;
  locationName?: string;
  guests?: string;
}): Promise<Metadata> {
  const locale = normalizeLocale(input.localeCandidate);
  const company = await loadCompanyForSeo();
  const seoConfig = getSeoConfig(company);
  const name = input.apartmentName || input.apartmentSlug;
  const locationName =
    input.locationName || seoConfig.placeName || "Pefkohori";
  const guestsPart = input.guests ? ` · up to ${input.guests} guests` : "";
  const title = `${name} | ${seoConfig.siteName}`;
  const description = `${name} at ${seoConfig.siteName} in ${locationName}${guestsPart}. Browse photos and request your stay.`;
  const canonicalPath = getApartmentPath(locale, input.apartmentSlug);
  const ogImageUrl = toAbsoluteAssetUrl(
    seoConfig.baseUrl,
    seoConfig.ogImage || seoConfig.heroImageUrl,
    "/logo-mark.png"
  );

  return buildBaseMetadata({
    title,
    description,
    canonicalPath,
    alternatePathsByLocale: getApartmentAlternates(input.apartmentSlug),
    locale,
    seoConfig,
    ogImageUrl,
  });
}

export async function buildStaticPageMetadata(
  localeCandidate: string | undefined | null,
  pageKey: StaticPageKey
): Promise<Metadata> {
  const locale = normalizeLocale(localeCandidate);
  const company = await loadCompanyForSeo();
  const seoConfig = getSeoConfig(company);
  const pageSeo = getStaticPageSeo(locale, pageKey, company);

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
    seoConfig,
  });
}
