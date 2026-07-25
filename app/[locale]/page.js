import { notFound } from "next/navigation";
import Feed from "@app/components/Feed";
import SuitesHero from "@app/components/SuitesHero";
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

const HERO_COPY = {
  en: {
    tagline: "Refined apartment stays — calm interiors, attentive hospitality.",
    cta: "View apartments",
  },
  ru: {
    tagline: "Изысканные апартаменты — спокойный интерьер и внимательный сервис.",
    cta: "Смотреть апартаменты",
  },
  uk: {
    tagline: "Вишукані апартаменти — спокійний інтер'єр та уважний сервіс.",
    cta: "Дивитися апартаменти",
  },
  de: {
    tagline: "Elegante Apartments — ruhige Interieurs, aufmerksame Gastfreundschaft.",
    cta: "Apartments ansehen",
  },
  el: {
    tagline: "Εκλεπτυσμένα διαμερίσματα — ήρεμοι χώροι, προσεκτική φιλοξενία.",
    cta: "Δείτε τα διαμερίσματα",
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

  const primaryLocation = getLocationById(locale, LOCATION_IDS.HALKIDIKI);

  const hubJsonLd = primaryLocation
    ? buildHubJsonLd({
        localeCandidate: locale,
        pagePath: `/${locale}`,
        primaryLocation,
      })
    : null;

  const copy = HERO_COPY[locale] || HERO_COPY.en;

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
        />
      </Feed>
    </>
  );
}
