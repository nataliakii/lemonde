import "@styles/globals.css";
import "antd/dist/reset.css";
import Providers from "./providers";
import LoaderWrapper from "./components/Loader/LoaderWrapper";
import Script from "next/script";
import { headers } from "next/headers";
import { getSeoConfig } from "@config/seo";
import { getPrimaryKeywords } from "@config/seoKeywords";
import {
  getDefaultLocale,
  normalizeLocale,
  getSupportedLocales,
} from "@domain/locationSeo/locationSeoService";
import { LOCALE_REQUEST_HEADER_NAME } from "@domain/locationSeo/locationSeoKeys";
import { COMPANY_ID } from "@config/company";
import { getCompany } from "@/domain/services";
import { resolveBrandConfig } from "@/domain/branding/resolveBrandConfig";

const supportedLocales = getSupportedLocales();
const defaultLocale = getDefaultLocale();
const multilangKeywords = getPrimaryKeywords(8);
const GA_MEASUREMENT_ID = "G-FY6325TNLP";

function toAbsoluteAssetUrl(baseUrl, assetUrl, fallbackPath) {
  const raw = String(assetUrl || "").trim() || fallbackPath;
  if (/^https?:\/\//i.test(raw)) return raw;
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${baseUrl}${path}`;
}

export async function generateMetadata() {
  let company = null;
  try {
    company = await getCompany(COMPANY_ID);
  } catch {
    company = null;
  }
  const seoConfig = getSeoConfig(company);
  const brand = resolveBrandConfig(company);
  const logoUrl = toAbsoluteAssetUrl(
    seoConfig.baseUrl,
    brand.assets.logoMark,
    "/logo-mark.png"
  );
  const faviconUrl = brand.assets.favicon || "/favicon.png";
  const ogUrl = brand.assets.ogImage
    ? toAbsoluteAssetUrl(seoConfig.baseUrl, brand.assets.ogImage, "/logo-mark.png")
    : logoUrl;

  return {
    metadataBase: new URL(seoConfig.baseUrl),
    title: {
      default: seoConfig.defaultTitle,
      template: seoConfig.titleTemplate,
    },
    description: seoConfig.defaultDescription,
    keywords: multilangKeywords,
    authors: [{ name: seoConfig.siteName }],
    creator: seoConfig.siteName,
    publisher: seoConfig.siteName,
    openGraph: {
      type: "website",
      locale: seoConfig.defaultLocale,
      url: seoConfig.baseUrl,
      siteName: seoConfig.siteName,
      title: seoConfig.defaultTitle,
      description: seoConfig.defaultDescription,
      images: [
        {
          url: ogUrl,
          width: 1024,
          height: 1024,
          alt: seoConfig.siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seoConfig.defaultTitle,
      description: seoConfig.defaultDescription,
      images: [ogUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "google637fd0fc04836d73.html",
    },
    icons: {
      icon: [
        { url: faviconUrl, type: "image/png" },
        { url: logoUrl, type: "image/png", sizes: "192x192" },
      ],
      apple: [{ url: logoUrl, type: "image/png", sizes: "180x180" }],
      shortcut: faviconUrl,
    },
  };
}

export default async function RootLayout({ children }) {
  const requestHeaders = await headers();
  const locale = normalizeLocale(
    requestHeaders.get(LOCALE_REQUEST_HEADER_NAME) || defaultLocale
  );

  let company = null;
  try {
    company = await getCompany(COMPANY_ID);
  } catch {
    company = null;
  }
  const seoConfig = getSeoConfig(company);
  const brand = resolveBrandConfig(company);
  const logoUrl = toAbsoluteAssetUrl(
    seoConfig.baseUrl,
    brand.assets.logoMark,
    "/logo-mark.png"
  );

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: seoConfig.siteName,
    url: seoConfig.baseUrl,
    logo: logoUrl,
    sameAs: [
      seoConfig.social.facebook,
      seoConfig.social.instagram,
      seoConfig.social.linkedin,
    ].filter(Boolean),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: seoConfig.contact.phone,
      contactType: "customer support",
      email: seoConfig.contact.email,
      areaServed: "GR",
      availableLanguage: supportedLocales,
    },
  };

  return (
    <html lang={locale} translate="no">
      <head>
        {process.env.NODE_ENV === "production" && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-tag-gtag" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
        <meta name="prefers-color-scheme" content="light" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-navbutton-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="color-scheme" content="only light" />
        <Script
          id="organization-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body>
        <Providers>
          <LoaderWrapper>{children}</LoaderWrapper>
        </Providers>
      </body>
    </html>
  );
}
