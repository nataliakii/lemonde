"use client";

import { useMemo } from "react";
import { createTheme } from "@mui/material/styles";
import { lightTheme } from "@theme";
import { resolveBrandConfig } from "./resolveBrandConfig";
import {
  brandAccentRule,
  brandApartmentPanelGradient,
  brandFooterGradient,
  brandGalleryBand,
  brandHeroGradient,
  brandHeroImageOverlay,
  brandOnDarkText,
  hexToRgba,
  softPageBackground,
} from "./brandSurfaces";

/**
 * Build MUI theme with company branding overrides (primary/secondary/accent + surfaces).
 * Falls back to site lightTheme when branding is empty.
 */
export function createThemeFromCompany(company) {
  const { branding } = resolveBrandConfig(company);
  if (!branding?.primary && !branding?.secondary) {
    return lightTheme;
  }

  const pageBg = softPageBackground(branding.primaryLight, 16);
  const pageSubtle = softPageBackground(branding.primaryLight, 10);

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
      background: {
        default: pageBg,
        paper: "#ffffff",
        subtle: pageSubtle,
        accent: hexToRgba(branding.primary, 0.08),
      },
      backgroundDark1: {
        bg: branding.secondary,
        text: "#ffffff",
        textSecondary: branding.primaryLight,
        primary: branding.primaryLight,
        secondary: branding.primaryLight,
        accent: branding.primary,
        success: "#5A9A78",
        warning: branding.primaryLight,
      },
      backgroundDark2: {
        bg: branding.secondaryDark,
        text: "#ffffff",
        textSecondary: hexToRgba(branding.primaryLight, 0.72),
        primary: branding.primaryLight,
        secondary: branding.primary,
        accent: branding.primaryLight,
        success: "#5A9A78",
        warning: branding.primaryLight,
      },
      backgroundLight: {
        bg: "#ffffff",
        text: branding.secondary,
        textSecondary: branding.ink,
        primary: branding.primary,
        secondary: branding.secondary,
        accent: branding.accent,
        success: "#3D7A5A",
        warning: branding.primaryDark,
      },
      text: {
        primary: branding.ink || branding.secondary,
        secondary: hexToRgba(branding.ink || branding.secondary, 0.72),
      },
    },
    brandSurfaces: {
      page: pageBg,
      hero: brandHeroGradient(branding),
      heroImageOverlay: brandHeroImageOverlay(branding),
      footer: brandFooterGradient(branding),
      accentRule: brandAccentRule(branding),
      galleryBand: brandGalleryBand(branding, pageBg),
      apartmentPanelLight: brandApartmentPanelGradient(branding, true),
      apartmentPanelDark: brandApartmentPanelGradient(branding, false),
      onDark: brandOnDarkText(branding, 0.94),
      onDarkMuted: brandOnDarkText(branding, 0.72),
    },
  });
}

/** Hook for client components (Feed / ThemeProvider). */
export function useCompanyTheme(company) {
  const brandKey = [
    company?._id,
    company?.branding?.primary,
    company?.branding?.primaryLight,
    company?.branding?.primaryDark,
    company?.branding?.secondary,
    company?.branding?.secondaryLight,
    company?.branding?.secondaryDark,
    company?.branding?.accent,
    company?.branding?.ink,
  ].join("|");

  return useMemo(
    () => createThemeFromCompany(company),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [brandKey]
  );
}
