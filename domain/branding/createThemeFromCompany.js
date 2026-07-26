"use client";

import { useMemo } from "react";
import { createTheme } from "@mui/material/styles";
import { lightTheme } from "@theme";
import { resolveBrandConfig } from "./resolveBrandConfig";

/**
 * Build MUI theme with company branding overrides (primary/secondary/accent).
 * Falls back to site lightTheme when branding is empty.
 */
export function createThemeFromCompany(company) {
  const { branding } = resolveBrandConfig(company);
  if (!branding?.primary && !branding?.secondary) {
    return lightTheme;
  }

  return createTheme(lightTheme, {
    palette: {
      primary: {
        main: branding.primary,
        light: branding.primaryLight,
        dark: branding.primaryDark,
        contrastText: branding.secondary,
      },
      secondary: {
        main: branding.secondary,
        light: branding.secondaryLight,
        dark: branding.secondaryDark,
        contrastText: "#ffffff",
      },
      brand: {
        ...(lightTheme.palette?.brand || {}),
        espresso: branding.secondary,
        gold: branding.primary,
        champagne: branding.primaryLight,
        ink: branding.ink,
        navy: branding.secondary,
        cyan: branding.primary,
        red: branding.accent,
        yellow: branding.primaryLight,
      },
    },
  });
}

/** Hook for client components (Feed / ThemeProvider). */
export function useCompanyTheme(company) {
  const brandKey = [
    company?._id,
    company?.branding?.primary,
    company?.branding?.secondary,
    company?.branding?.accent,
  ].join("|");

  return useMemo(
    () => createThemeFromCompany(company),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [brandKey]
  );
}
