import { getSeoConfig } from "@config/seo";
import {
  getHubSeo,
  normalizeLocale,
} from "@domain/locationSeo/locationSeoService";
import type { LocationSeoResolved } from "@domain/locationSeo/types";
import { toAbsoluteUrl } from "./urlBuilder";

const DEFAULT_AGGREGATE_RATING = {
  ratingValue: "4.9",
  reviewCount: "140",
};

function buildAreaServed(areaNames: string[]) {
  return areaNames.map((name) => ({
    "@type": "AdministrativeArea",
    name,
    addressCountry: "GR",
  }));
}

function buildPickupAddress(seoConfig = getSeoConfig()) {
  return {
    "@type": "PostalAddress",
    streetAddress: seoConfig.contact.address.split(",")[0] || seoConfig.contact.address,
    addressLocality: seoConfig.placeName || "Pefkohori",
    addressRegion: "Halkidiki",
    postalCode: "63085",
    addressCountry: "GR",
  };
}

function buildGeoCoordinates(seoConfig = getSeoConfig()) {
  return {
    "@type": "GeoCoordinates",
    latitude: Number.parseFloat(seoConfig.coordinates.lat),
    longitude: Number.parseFloat(seoConfig.coordinates.lon),
  };
}

export function buildAutoRentalJsonLd(input: {
  localeCandidate: string | undefined | null;
  pagePath: string;
  location: Pick<
    LocationSeoResolved,
    "seoDescription" | "areaServed" | "pickupLocation" | "offerName" | "offerDescription"
  >;
  offerUrlPath?: string;
  company?: object | null;
}) {
  const locale = normalizeLocale(input.localeCandidate);
  const seoConfig = getSeoConfig(input.company || null);
  const pageUrl = toAbsoluteUrl(input.pagePath);
  const offerUrl = toAbsoluteUrl(input.offerUrlPath || input.pagePath);

  return {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    additionalType: "https://schema.org/LocalBusiness",
    name: seoConfig.siteName,
    url: pageUrl,
    description: input.location.seoDescription,
    image: `${seoConfig.baseUrl}/favicon.png`,
    inLanguage: locale,
    areaServed: buildAreaServed(input.location.areaServed),
    pickupLocation: {
      "@type": "Place",
      name: input.location.pickupLocation,
      address: buildPickupAddress(seoConfig),
      geo: buildGeoCoordinates(seoConfig),
    },
    offers: {
      "@type": "Offer",
      name: input.location.offerName,
      description: input.location.offerDescription,
      availability: "https://schema.org/InStock",
      priceCurrency: "EUR",
      url: offerUrl,
      areaServed: buildAreaServed(input.location.areaServed),
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: DEFAULT_AGGREGATE_RATING.ratingValue,
      reviewCount: DEFAULT_AGGREGATE_RATING.reviewCount,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: seoConfig.contact.phone,
      email: seoConfig.contact.email,
      contactType: "customer support",
      areaServed: "GR",
    },
  };
}

export function buildCarProductJsonLd(input: {
  localeCandidate: string | undefined | null;
  pagePath: string;
  car: {
    model: string;
    transmission?: string;
    fueltype?: string;
    seats?: number;
    airConditioning?: boolean;
    engine?: string;
    enginePower?: number;
    numberOfDoors?: number;
    registration?: number;
    photoUrl?: string;
    /** Lowest daily price for Offer schema (e.g. from pricingTiers) */
    priceFrom?: number;
  };
  locationName: string;
}) {
  const seoConfig = getSeoConfig();
  const pageUrl = toAbsoluteUrl(input.pagePath);
  const photoUrl = input.car.photoUrl
    ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "carsnk"}/image/upload/${input.car.photoUrl}`
    : `${seoConfig.baseUrl}/favicon.png`;

  const capitalize = (s?: string) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${input.car.model} — Car Rental`,
    description: `Rent ${input.car.model} in ${input.locationName}. ${capitalize(input.car.transmission)} transmission, ${input.car.fueltype || "petrol"} fuel, ${input.car.seats || 5} seats.`,
    image: photoUrl,
    url: pageUrl,
    brand: {
      "@type": "Brand",
      name: seoConfig.siteName,
    },
    ...(input.car.transmission && { vehicleTransmission: capitalize(input.car.transmission) }),
    ...(input.car.fueltype && { fuelType: capitalize(input.car.fueltype) }),
    ...(input.car.seats && { seatingCapacity: input.car.seats }),
    ...(input.car.numberOfDoors && { numberOfDoors: input.car.numberOfDoors }),
    ...(input.car.registration && { vehicleModelDate: String(input.car.registration) }),
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      ...(typeof input.car.priceFrom === "number" && input.car.priceFrom > 0 && { price: String(input.car.priceFrom) }),
      availability: "https://schema.org/InStock",
      url: pageUrl,
      seller: {
        "@type": "Organization",
        name: seoConfig.siteName,
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: DEFAULT_AGGREGATE_RATING.ratingValue,
      reviewCount: DEFAULT_AGGREGATE_RATING.reviewCount,
    },
  };
}

export function buildFaqJsonLd(faqItems: { question: string; answer: string }[]) {
  if (!faqItems || faqItems.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  if (!items || items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** HowTo — for step-by-step flows (e.g. airport rental process); supports rich results guidelines */
export function buildHowToJsonLd(input: {
  name: string;
  steps: string[];
  locale: string;
  /** Canonical page URL (optional); use with #fragment to match on-page block */
  pageUrl?: string;
  description?: string;
}) {
  if (!input.steps || input.steps.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    inLanguage: input.locale,
    ...(input.pageUrl ? { url: input.pageUrl } : {}),
    step: input.steps.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: text,
      text,
    })),
  };
}

/** ItemList — for on-page bullet lists (e.g. “why choose us” benefits) */
export function buildItemListJsonLd(input: {
  name: string;
  items: string[];
  locale: string;
  pageUrl?: string;
}) {
  if (!input.items || input.items.length === 0) return null;

  const cleaned = input.items.map((raw) =>
    String(raw)
      .replace(/^\s*(?:[✔✓]|\u2714)\s*/, "")
      .trim()
  );

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.name,
    inLanguage: input.locale,
    ...(input.pageUrl ? { url: input.pageUrl } : {}),
    numberOfItems: cleaned.length,
    itemListElement: cleaned.map((text, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: text,
    })),
  };
}

export function buildHubJsonLd(input: {
  localeCandidate: string | undefined | null;
  pagePath: string;
  primaryLocation: Pick<
    LocationSeoResolved,
    "seoDescription" | "areaServed" | "pickupLocation" | "offerName" | "offerDescription"
  >;
  company?: object | null;
}) {
  const locale = normalizeLocale(input.localeCandidate);
  const hubSeo = getHubSeo(locale, input.company || null);
  const seoConfig = getSeoConfig(input.company || null);

  return {
    ...buildAutoRentalJsonLd({
      localeCandidate: locale,
      pagePath: input.pagePath,
      location: {
        ...input.primaryLocation,
        seoDescription: hubSeo.seoDescription,
      },
      company: input.company || null,
    }),
    description: hubSeo.seoDescription,
    name: seoConfig.siteName,
  };
}

function resolveMediaUrl(
  src: string | null | undefined,
  baseUrl: string
): string | null {
  const raw = String(src || "").trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/")) return `${baseUrl}${raw}`;
  const cloud =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    "dn513dy1y";
  return `https://res.cloudinary.com/${cloud}/image/upload/${raw}`;
}

/**
 * Per-suite JSON-LD (HotelRoom) for V Luxury / apartment detail pages.
 */
export function buildApartmentJsonLd(input: {
  localeCandidate: string | undefined | null;
  pagePath: string;
  apartment: {
    model?: string;
    name?: string;
    description?: string;
    photoUrl?: string;
    gallery?: string[];
    seats?: number;
    beds?: number;
    bathrooms?: number;
    sizeSqm?: number;
    floor?: number;
    amenities?: string[];
    transferPrice?: number;
    priceFrom?: number | null;
  };
  locationName?: string;
  company?: object | null;
}) {
  const locale = normalizeLocale(input.localeCandidate);
  const seoConfig = getSeoConfig(input.company || null);
  const pageUrl = toAbsoluteUrl(input.pagePath);
  const apt = input.apartment || {};
  const name =
    String(apt.model || apt.name || "Suite").trim() || "Suite";
  const place = input.locationName || seoConfig.placeName || "Pefkohori";
  const transfer = Math.max(0, Number(apt.transferPrice) || 0);
  const priceFrom =
    typeof apt.priceFrom === "number" && apt.priceFrom > 0
      ? apt.priceFrom
      : null;

  const description =
    String(apt.description || "").trim() ||
    `${name} at ${seoConfig.siteName} in ${place}. Request your stay online.`;

  const images = [
    resolveMediaUrl(apt.photoUrl, seoConfig.baseUrl),
    ...(Array.isArray(apt.gallery)
      ? apt.gallery.map((g) => resolveMediaUrl(g, seoConfig.baseUrl))
      : []),
  ].filter(Boolean) as string[];
  const uniqueImages = Array.from(new Set(images));

  const amenityFeature = (Array.isArray(apt.amenities) ? apt.amenities : [])
    .map((a) => String(a || "").trim())
    .filter(Boolean)
    .map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a,
      value: true,
    }));

  return {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    name,
    description,
    url: pageUrl,
    inLanguage: locale,
    ...(uniqueImages.length === 1
      ? { image: uniqueImages[0] }
      : uniqueImages.length > 1
        ? { image: uniqueImages }
        : {}),
    ...(apt.seats
      ? {
          occupancy: {
            "@type": "QuantitativeValue",
            maxValue: Number(apt.seats),
            unitText: "guests",
          },
        }
      : {}),
    ...(apt.beds
      ? {
          bed: {
            "@type": "BedDetails",
            numberOfBeds: Number(apt.beds),
          },
        }
      : {}),
    ...(apt.sizeSqm
      ? {
          floorSize: {
            "@type": "QuantitativeValue",
            value: Number(apt.sizeSqm),
            unitCode: "MTK",
          },
        }
      : {}),
    ...(typeof apt.floor === "number"
      ? { floorLevel: String(apt.floor) }
      : {}),
    ...(amenityFeature.length ? { amenityFeature } : {}),
    containedInPlace: {
      "@type": "LodgingBusiness",
      name: seoConfig.siteName,
      address: {
        "@type": "PostalAddress",
        streetAddress:
          seoConfig.contact.address.split(",")[0] || seoConfig.contact.address,
        addressLocality: place,
        addressRegion: "Halkidiki",
        addressCountry: "GR",
      },
      url: seoConfig.baseUrl,
    },
    offers: {
      "@type": "Offer",
      url: pageUrl,
      priceCurrency: "EUR",
      ...(priceFrom != null ? { price: String(priceFrom) } : {}),
      availability: "https://schema.org/InStock",
      category: "Nightly stay",
      seller: {
        "@type": "Organization",
        name: seoConfig.siteName,
      },
      ...(transfer > 0
        ? {
            eligibleTransactionVolume: {
              "@type": "PriceSpecification",
              name: "Airport transfer",
              price: String(transfer),
              priceCurrency: "EUR",
              description: `Optional airport transfer — €${transfer} flat.`,
            },
          }
        : {}),
    },
    ...(transfer > 0
      ? {
          additionalProperty: [
            {
              "@type": "PropertyValue",
              name: "Airport transfer",
              value: transfer,
              unitText: "EUR",
              description: `Flat airport transfer fee — €${transfer}.`,
            },
          ],
        }
      : {}),
  };
}

