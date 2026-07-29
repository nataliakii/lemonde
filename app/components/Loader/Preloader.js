"use client";

import { useLayoutEffect, useState } from "react";
import Image from "next/image";
import { Backdrop, Fade, Box, Typography, keyframes } from "@mui/material";
import { useMainContext } from "@app/Context";
import { resolveBrandConfig } from "@/domain/branding/resolveBrandConfig";
import {
  hexToRgba,
  softPageBackground,
} from "@/domain/branding/brandSurfaces";

const softPulse = keyframes`
  0%, 100% { opacity: 0.72; transform: scale(0.96); }
  50% { opacity: 1; transform: scale(1); }
`;

/**
 * Full-screen route/boot loader.
 * Logo + name + colors ONLY from company (Mongo) via props/context.
 * No local /public logo fallback — empty assets.logoMark → text-only.
 */
export default function Preloader({ loading, company: companyProp = null }) {
  const [visible, setVisible] = useState(true);
  const { company: companyFromContext } = useMainContext();
  const company = companyProp || companyFromContext;
  const brand = resolveBrandConfig(company);
  const logoSrc =
    typeof brand.assets.logoMark === "string" ? brand.assets.logoMark.trim() : "";
  const pageBg = softPageBackground(brand.branding.primaryLight, 14);
  const ink = brand.branding.secondary || "#0B1218";
  const shadow = hexToRgba(brand.branding.secondaryDark || ink, 0.18);
  const primary = brand.branding.primary || "#AEC0D0";
  const primaryLight = brand.branding.primaryLight || "#E6EEF5";
  const primaryDark = brand.branding.primaryDark || "#6F8496";

  useLayoutEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => setVisible(false), 700);
      return () => clearTimeout(timeout);
    } else {
      setVisible(true);
    }
  }, [loading]);

  return (
    <Fade in={loading || visible} timeout={{ enter: 400, exit: 700 }}>
      <Backdrop
        open={loading || visible}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 999,
          backgroundColor: pageBg,
          backgroundImage: [
            `radial-gradient(ellipse 70% 50% at 50% 35%, ${hexToRgba(primaryLight, 0.55)} 0%, transparent 65%)`,
            `linear-gradient(180deg, ${hexToRgba(primary, 0.22)} 0%, ${pageBg} 58%)`,
          ].join(", "),
          color: ink,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2.5,
          transition: "background-color 0.6s ease",
        }}
      >
        <Fade in={loading} timeout={400}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            {logoSrc ? (
              <Box
                sx={{
                  width: 112,
                  height: 112,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: `${softPulse} 1.4s ease-in-out infinite`,
                  filter: `drop-shadow(0 4px 16px ${shadow})`,
                }}
              >
                <Image
                  src={logoSrc}
                  alt={brand.name || "Logo"}
                  width={96}
                  height={96}
                  priority
                  unoptimized
                  style={{ objectFit: "contain" }}
                />
              </Box>
            ) : null}
            {brand.name ? (
              <Typography
                component="p"
                className="brand-wordmark"
                sx={{
                  m: 0,
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  fontSize: { xs: "1.35rem", md: "1.6rem" },
                  lineHeight: 1.1,
                  textAlign: "center",
                  background: `linear-gradient(
                    110deg,
                    ${primaryDark} 0%,
                    ${primaryLight} 28%,
                    ${primary} 48%,
                    color-mix(in srgb, ${primaryLight} 55%, #ffffff) 62%,
                    ${primary} 78%,
                    ${primaryDark} 100%
                  )`,
                  backgroundSize: "220% auto",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  animation: "brandShimmer 6s ease-in-out infinite",
                }}
              >
                {brand.name}
              </Typography>
            ) : null}
          </Box>
        </Fade>
      </Backdrop>
    </Fade>
  );
}
