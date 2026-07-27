"use client";

import { MainContextProvider } from "./Context";
import { SnackbarProvider } from "notistack";
import { I18nextProvider } from "react-i18next";
import SessionProviderGate from "@app/components/SessionProviderGate";
import i18n from "../locales/i18n";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import { CookieConsentProvider } from "@app/components/CookieBanner";
import { CookieBanner } from "@app/components/CookieBanner";
import { Analytics } from "@app/components/Analytics";
import WebsiteVisitTracker from "@app/components/WebsiteVisitTracker";
import { useCompanyTheme } from "@/domain/branding/createThemeFromCompany";

export default function Providers({ children, company = null }) {
  const companyTheme = useCompanyTheme(company);
  const p = companyTheme.palette;

  return (
    <SessionProviderGate>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={companyTheme}>
          <CssBaseline />
          <Box
            sx={{
              minHeight: "100%",
              "--color-primary": p.primary.main,
              "--color-primary-light": p.primary.light,
              "--color-primary-dark": p.primary.dark,
              "--color-secondary": p.secondary.main,
              "--color-secondary-light": p.secondary.light,
              "--color-secondary-dark": p.secondary.dark,
              "--color-bg-default": p.background.default,
            }}
          >
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
          </Box>
        </ThemeProvider>
      </I18nextProvider>
    </SessionProviderGate>
  );
}
