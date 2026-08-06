import { notFound } from "next/navigation";
import Feed from "@app/components/Feed";
import PrincessSuitePromo from "@app/components/PrincessSuitePromo";
import {
  isSupportedLocale,
  normalizeLocale,
} from "@domain/locationSeo/locationSeoService";
import {
  getPrincessPromoCopy,
  PRINCESS_ROUTE,
} from "@/domain/princessSuite/promoContent";
import { PRODUCTION_BASE_URL } from "@config/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const locale = normalizeLocale(params.locale);
  const copy = getPrincessPromoCopy(locale);
  const path = `/${locale}${PRINCESS_ROUTE}`;
  const url = `${PRODUCTION_BASE_URL}${path}`;

  return {
    title: { absolute: copy.metaTitle },
    description: copy.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: copy.metaTitle,
      description: copy.metaDescription,
      url,
      type: "website",
      images: [
        {
          url: `${PRODUCTION_BASE_URL}/images/Gallery/EXTERNAL/SEA_1.jpg`,
          width: 1024,
          height: 682,
          alt: copy.brand,
        },
      ],
    },
  };
}

export default function PrincessSuitePage({ params }) {
  const locale = normalizeLocale(params.locale);
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return (
    <Feed locale={locale}>
      <PrincessSuitePromo locale={locale} />
    </Feed>
  );
}
