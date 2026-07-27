"use client";

import { MainContextProvider } from "./Context";
import { SnackbarProvider } from "notistack";
import { I18nextProvider } from "react-i18next";
import SessionProviderGate from "@app/components/SessionProviderGate";
import i18n from "../locales/i18n";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CookieConsentProvider } from "@app/components/CookieBanner";
import { CookieBanner } from "@app/components/CookieBanner";
import { Analytics } from "@app/components/Analytics";
import WebsiteVisitTracker from "@app/components/WebsiteVisitTracker";
import { useCompanyTheme } from "@/domain/branding/createThemeFromCompany";

export default function Providers({ children, company = null }) {
  const companyTheme = useCompanyTheme(company);

  return (
    <SessionProviderGate>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={companyTheme}>
          <CssBaseline />
          <CookieConsentProvider>
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              autoHideDuration={3000}
            >
              <MainContextProvider companyData={company}>
                {children}
              </MainContextProvider>
            </SnackbarProvider>
            <CookieBanner />
            <WebsiteVisitTracker />
            <Analytics />
          </CookieConsentProvider>
        </ThemeProvider>
      </I18nextProvider>
    </SessionProviderGate>
  );
}
