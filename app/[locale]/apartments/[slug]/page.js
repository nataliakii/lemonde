import { notFound, permanentRedirect } from "next/navigation";
import Feed from "@app/components/Feed";
import SuitePageView from "@app/components/SuitePageView";
import StayDateSearch from "@app/components/StayDateSearch";
import {
  getApartmentPath,
  getSupportedLocales,
  isSupportedLocale,
  normalizeLocale,
} from "@domain/locationSeo/locationSeoService";
import { LOCATION_IDS } from "@domain/locationSeo/locationSeoKeys";
import { getLocationById } from "@domain/locationSeo/locationSeoService";
import { COMPANY_ID } from "@config/company";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@lib/authOptions";
import {
  getCars,
  getCarById,
  getCarBySlug,
  getCompany,
  getActiveOrders,
} from "@/domain/services";
import { buildApartmentMetadata } from "@/services/seo/metadataBuilder";
import { Box } from "@mui/material";

const MONGO_ID_REGEX = /^[0-9a-f]{24}$/i;

function getPublicApartments(cars) {
  return (cars || []).filter(
    (car) =>
      car?.slug &&
      String(car.slug).trim() &&
      car?.isActive !== false &&
      car?.isHidden !== true &&
      !car?.deletedAt
  );
}

export async function generateStaticParams() {
  const cars = await getCars().catch(() => []);
  const publicCars = getPublicApartments(cars);
  const locales = getSupportedLocales();

  return locales.flatMap((locale) =>
    publicCars.map((car) => ({ locale, slug: String(car.slug).trim() }))
  );
}

export async function generateMetadata({ params }) {
  const locale = normalizeLocale(params.locale);
  const car = await getCarBySlug(params.slug).catch(() => null);

  if (!car) {
    return { robots: { index: false, follow: false } };
  }

  const fallbackLocation = getLocationById(locale, LOCATION_IDS.NEA_KALLIKRATIA)
    || getLocationById(locale, LOCATION_IDS.HALKIDIKI);
  const locationName = fallbackLocation?.shortName || "Nea Kallikratia";
  const canonicalSlug = car.slug || params.slug;

  return buildApartmentMetadata({
    localeCandidate: locale,
    apartmentSlug: canonicalSlug,
    apartmentName: car.model || canonicalSlug,
    locationName,
    guests: car.seats ? String(car.seats) : "",
  });
}

export default async function ApartmentDetailPage({ params }) {
  const locale = normalizeLocale(params.locale);
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const session = await getServerSession(authOptions);

  if (MONGO_ID_REGEX.test(params.slug)) {
    const carById = await getCarById(params.slug, { session }).catch(() => null);
    if (carById?.slug) {
      permanentRedirect(getApartmentPath(locale, carById.slug));
    }
    notFound();
  }

  const [allCarsData, ordersData, companyData] = await Promise.all([
    getCars({ session }).catch(() => []),
    getActiveOrders({ session }).catch(() => []),
    getCompany(COMPANY_ID).catch(() => null),
  ]);

  const carFromList = (allCarsData || []).find(
    (c) => c?.slug && c.slug.toLowerCase() === params.slug.toLowerCase()
  );

  let resolvedCar = carFromList;
  if (!resolvedCar) {
    const carDirect = await getCarBySlug(params.slug, { session }).catch(() => null);
    if (!carDirect) notFound();
    resolvedCar = carDirect;
  }

  if (params.slug !== resolvedCar.slug) {
    permanentRedirect(getApartmentPath(locale, resolvedCar.slug));
  }

  const relatedSuites = getPublicApartments(allCarsData)
    .filter((c) => c.slug !== resolvedCar.slug)
    .slice(0, 4)
    .map((c) => ({
      slug: c.slug,
      model: c.model,
      photoUrl: c.photoUrl,
    }));

  return (
    <Feed
      cars={allCarsData}
      orders={ordersData}
      company={companyData}
      locale={locale}
      isMain={false}
    >
      <Box id="stay-date-search">
        <StayDateSearch />
      </Box>
      <SuitePageView
        apartmentSlug={resolvedCar.slug}
        locale={locale}
        relatedSuites={relatedSuites}
      />
    </Feed>
  );
}
