import { notFound } from "next/navigation";
import Feed from "@app/components/Feed";
import CarGrid from "@app/components/CarGrid";
import {
  getSupportedLocales,
  isSupportedLocale,
  normalizeLocale,
} from "@domain/locationSeo/locationSeoService";
import { COMPANY_ID } from "@config/company";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@lib/authOptions";
import { getCars, getCompany, getActiveOrders } from "@/domain/services";
import { buildHreflangAlternates } from "@/services/seo/hreflangBuilder";
import { getRobotsForPath } from "@/services/seo/indexingPolicy";
import { toAbsoluteUrl } from "@/services/seo/urlBuilder";
import { Box, Typography } from "@mui/material";
import StayDateSearch from "@app/components/StayDateSearch";

export const dynamic = "force-dynamic";

const APARTMENTS_ALTERNATES = Object.fromEntries(
  getSupportedLocales().map((l) => [l, `/${l}/apartments`])
);

export async function generateMetadata({ params }) {
  const locale = normalizeLocale(params.locale);
  const company = await getCompany(COMPANY_ID).catch(() => null);
  const { getSeoConfig } = await import("@config/seo");
  const seo = getSeoConfig(company);
  const site = seo.siteName;
  const place = seo.placeName || "Pefkohori";
  const title = `Rooms | ${site}`;
  const description = `Browse our suites and rooms in ${place}. Choose dates and request your stay with ${site}.`;
  const path = `/${locale}/apartments`;
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: toAbsoluteUrl(path),
      languages: buildHreflangAlternates(APARTMENTS_ALTERNATES),
    },
    openGraph: { title, description, siteName: site },
    robots: getRobotsForPath(path),
  };
}

export default async function ApartmentsIndexPage({ params }) {
  const locale = normalizeLocale(params.locale);
  if (!isSupportedLocale(locale)) notFound();
  const session = await getServerSession(authOptions);
  const [allCarsData, ordersData, companyData] = await Promise.all([
    getCars({ session }).catch(() => []),
    getActiveOrders({ session }).catch(() => []),
    getCompany(COMPANY_ID).catch(() => null),
  ]);

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
      <Box sx={{ px: { xs: 2, md: 4 }, pt: { xs: 2, md: 3 }, pb: 1, textAlign: "center" }}>
        <Typography
          sx={{
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "primary.dark",
            mb: 1,
          }}
        >
          Nine rooms
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: { xs: "2.35rem", md: "3.25rem" },
            color: "secondary.main",
            mb: 1,
            lineHeight: 1.1,
          }}
        >
          Our apartments
        </Typography>
        <Typography
          sx={{
            color: "text.secondary",
            maxWidth: 480,
            mx: "auto",
            fontSize: "1.05rem",
            mb: 1,
            lineHeight: 1.55,
          }}
        >
          Each suite has its own light and view. Choose dates, then request the stay that fits you.
        </Typography>
      </Box>
      <CarGrid />
    </Feed>
  );
}
