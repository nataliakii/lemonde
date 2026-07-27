"use client";
import React, { useEffect, Suspense, useMemo } from "react";
import { ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { I18nextProvider } from "react-i18next";

import Loading from "@app/loading";
import { Box } from "@mui/material";

import i from "@locales/i18n";
import { MainContextProvider } from "../Context";
import { useCompanyTheme } from "@/domain/branding/createThemeFromCompany";

import dynamic from "next/dynamic";
import ScrollButton from "@/app/components/ui/buttons/ScrollButton";

import Navbar from "@app/components/Navbar";

// Lazy load Footer (below fold, can load after initial render)
const Footer = dynamic(() => import("@app/components/Footer"), {
  ssr: true, // Safe for SEO - footer content should be indexed
});

function Feed({ children, ...props }) {
  // unstable_noStore() не нужен в клиентском компоненте

  const shouldShowFooter = !props.isAdmin; // Скрываем Footer, если isAdmin === true

  // Public AppBar is fixed at 60px — keep content flush (no light gap under header).
  const mainPt = useMemo(
    () =>
      props.isAdmin
        ? { xs: "60px", md: "60px" }
        : { xs: "60px", md: "60px" },
    [props.isAdmin]
  );

  // Keep i18n language and locale cookie aligned with URL locale prefix.
  useEffect(() => {
    const locale = typeof props.locale === "string" ? props.locale.toLowerCase() : null;
    if (!locale) return;

    const supported = Array.isArray(i?.options?.supportedLngs)
      ? i.options.supportedLngs
      : [];

    if (supported.includes(locale)) {
      i.changeLanguage(locale).catch(() => {});
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("selectedLanguage", locale);
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    }
  }, [props.locale]);

  // Мемоизируем пропсы для Context, чтобы предотвратить ненужные ре-рендеры
  const carsLength = props.cars?.length;
  const firstCarId = props.cars?.[0]?._id;
  const ordersLength = props.orders?.length;
  const firstOrderId = props.orders?.[0]?._id;
  const companyId = props.company?._id;
  const brandPrimary = props.company?.branding?.primary;
  const brandSecondary = props.company?.branding?.secondary;
  const brandPrimaryLight = props.company?.branding?.primaryLight;
  
  const contextProps = useMemo(
    () => ({
      carsData: props.cars,
      ordersData: props.orders,
      companyData: props.company,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      carsLength,
      firstCarId,
      ordersLength,
      firstOrderId,
      companyId,
      brandPrimary,
      brandSecondary,
      brandPrimaryLight,
    ]
  );

  const companyTheme = useCompanyTheme(props.company);

  return (
    <Suspense fallback={<Loading />}>
      <ThemeProvider theme={companyTheme}>
        <CssBaseline />
        <I18nextProvider i18n={i}>
          <MainContextProvider
            carsData={contextProps.carsData}
            ordersData={contextProps.ordersData}
            companyData={contextProps.companyData}
          >
            <Box
              sx={{
                bgcolor: "background.default",
                minHeight: "100vh",
                "--color-primary": companyTheme.palette.primary.main,
                "--color-primary-light": companyTheme.palette.primary.light,
                "--color-primary-dark": companyTheme.palette.primary.dark,
                "--color-secondary": companyTheme.palette.secondary.main,
                "--color-secondary-light": companyTheme.palette.secondary.light,
                "--color-secondary-dark": companyTheme.palette.secondary.dark,
                "--color-bg-default": companyTheme.palette.background.default,
              }}
            >
              <Navbar isMain={props.isMain} isAdmin={props.isAdmin} />
              {/* main paddingTop keeps content below fixed Navbar + filters; responsive values */}
              <Box component="main" sx={{ pt: mainPt }}>
                {children}
              </Box>
              {shouldShowFooter && <Footer />}
              <ScrollButton />
            </Box>
          </MainContextProvider>
        </I18nextProvider>
      </ThemeProvider>
    </Suspense>
  );
}

export default Feed;
