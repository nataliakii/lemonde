import { notFound } from "next/navigation";
import Feed from "@app/components/Feed";
import SuitesHero from "@app/components/SuitesHero";
import PropertyGallery from "@app/components/PropertyGallery";
import PrincessSuiteTeaser from "@app/components/PrincessSuiteTeaser";
import JsonLdScript from "@app/components/seo/JsonLdScript";
import {
  getLocationById,
  isSupportedLocale,
  normalizeLocale,
} from "@domain/locationSeo/locationSeoService";
import { LOCATION_IDS } from "@domain/locationSeo/locationSeoKeys";
import { COMPANY_ID } from "@config/company";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@lib/authOptions";
import { getCars, getCompany, getActiveOrders } from "@/domain/services";
import { buildHubJsonLd } from "@/services/seo/jsonLdBuilder";
import { buildHubMetadata } from "@/services/seo/metadataBuilder";
import { resolveBrandConfig } from "@/domain/branding/resolveBrandConfig";
import { buildApartmentPhotoMix } from "@/domain/branding/buildApartmentPhotoMix";
import { buildHomepageHeroSlides } from "@/domain/branding/buildHomepageHeroSlides";
import { DEFAULT_PROPERTY_GALLERY } from "@/domain/services/ensureCarsNkCompany";

/** Always render with live Mongo data — avoid baking failed builds into static HTML. */
export const dynamic = "force-dynamic";

const HERO_COPY = {
  en: {
    tagline: "Suites in Pefkohori — infinity pool, sea views, calm Kassandra stays.",
    cta: "View rooms",
  },
  ru: {
    tagline: "Сьюты в Пефкохори — infinity pool, вид на море, спокойный отдых на Кассандре.",
    cta: "Смотреть номера",
  },
  uk: {
    tagline: "Сьюті в Пефкохорі — infinity pool, вид на море, спокійний відпочинок на Кассандрі.",
    cta: "Дивитися номери",
  },
  de: {
    tagline: "Suiten in Pefkohori — Infinity-Pool, Meerblick, ruhige Kassandra-Aufenthalte.",
    cta: "Zimmer ansehen",
  },
  el: {
    tagline: "Suites στο Πευκοχώρι — infinity pool, θέα στη θάλασσα, ήρεμη διαμονή στην Κασσάνδρα.",
    cta: "Δείτε τα δωμάτια",
  },
};

export async function generateMetadata({ params }) {
  const locale = normalizeLocale(params.locale);
  return buildHubMetadata(locale);
}

export default async function LocalizedHomePage({ params }) {
  const locale = normalizeLocale(params.locale);
  if (!isSupportedLocale(locale)) {
    notFound();
  }
  const session = await getServerSession(authOptions);
  const [carsData, ordersData, companyData] = await Promise.all([
    getCars({ session }),
    getActiveOrders({ session }),
    getCompany(COMPANY_ID),
  ]);

  const primaryLocation = getLocationById(locale, LOCATION_IDS.PEFKOHORI)
    || getLocationById(locale, LOCATION_IDS.HALKIDIKI);

  const hubJsonLd = primaryLocation
    ? buildHubJsonLd({
        localeCandidate: locale,
        pagePath: `/${locale}`,
        primaryLocation,
        company: companyData,
      })
    : null;

  const copy = HERO_COPY[locale] || HERO_COPY.en;
  const brand = resolveBrandConfig(companyData, locale);
  // Homepage strip: curated General photos (assets.galleryImages).
  // Fallback to suite mix / defaults only when General is empty.
  const apartmentPhotoMix = buildApartmentPhotoMix(carsData, { max: 36 });
  const galleryImages =
    brand.assets.galleryImages.length > 0
      ? brand.assets.galleryImages
      : apartmentPhotoMix.length > 0
        ? apartmentPhotoMix
        : DEFAULT_PROPERTY_GALLERY;
  // Hero: optional General lead first, then dedicated heroImages.
  const heroImages = buildHomepageHeroSlides({
    heroLeadImage: brand.assets.heroLeadImage,
    heroImages: brand.assets.heroImages,
  });

  return (
    <>
      <JsonLdScript id={`hub-jsonld-${locale}`} data={hubJsonLd} />
      <Feed
        cars={carsData}
        orders={ordersData}
        isMain={true}
        company={companyData}
        locale={locale}
      >
        <SuitesHero
          locale={locale}
          tagline={copy.tagline}
          ctaLabel={copy.cta}
          brandName={brand.name}
          heroImages={heroImages}
        />
        <PropertyGallery
          images={galleryImages}
          title={brand.galleryTitle}
          subtitle={brand.gallerySubtitle}
          brandName={brand.name}
        />
        <PrincessSuiteTeaser locale={locale} />
      </Feed>
    </>
  );
}
