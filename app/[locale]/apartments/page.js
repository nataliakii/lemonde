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

const APARTMENTS_ALTERNATES = Object.fromEntries(
  getSupportedLocales().map((l) => [l, `/${l}/apartments`])
);

export async function generateMetadata({ params }) {
  const locale = normalizeLocale(params.locale);
  const title = "Apartments | Le Monde Suites";
  const description =
    "Browse our suites and apartments. Choose dates and request your stay with Le Monde Suites.";
  const path = `/${locale}/apartments`;
  return {
    title,
    description,
    alternates: {
      canonical: toAbsoluteUrl(path),
      languages: buildHreflangAlternates(APARTMENTS_ALTERNATES),
    },
    openGraph: { title, description },
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
      <Box sx={{ px: { xs: 2, md: 4 }, pt: 2, pb: 1, textAlign: "left" }}>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: { xs: "2rem", md: "2.75rem" },
            color: "secondary.main",
            mb: 0.5,
          }}
        >
          Apartments
        </Typography>
        <Typography
          sx={{
            color: "text.secondary",
            maxWidth: 520,
            fontSize: "1.05rem",
            mb: 2,
          }}
        >
          Choose a suite and request your stay. We confirm every booking personally.
        </Typography>
      </Box>
      <CarGrid />
    </Feed>
  );
}
