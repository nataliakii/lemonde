"use client";

import { useLayoutEffect, useState } from "react";
import Image from "next/image";
import { Backdrop, Fade, Box, keyframes } from "@mui/material";
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
 * Colors + logo come from company.branding / company.assets (Mongo).
 * Optional `company` prop for SSR first paint before context hydrates.
 */
export default function Preloader({ loading, company: companyProp = null }) {
  const [visible, setVisible] = useState(true);
  const { company: companyFromContext } = useMainContext();
  const company = companyProp || companyFromContext;
  const brand = resolveBrandConfig(company);
  const logoSrc = brand.assets.logoMark || "/logo-mark.png";
  const pageBg = softPageBackground(brand.branding.primaryLight, 14);
  const ink = brand.branding.secondary || "#1B1E24";
  const shadow = hexToRgba(brand.branding.secondaryDark || ink, 0.18);

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
          backgroundImage: `linear-gradient(180deg, ${hexToRgba(brand.branding.primaryLight, 0.35)} 0%, ${pageBg} 55%)`,
          color: ink,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transition: "background-color 0.6s ease",
        }}
      >
        <Fade in={loading} timeout={400}>
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
              style={{ objectFit: "contain" }}
            />
          </Box>
        </Fade>
      </Backdrop>
    </Fade>
  );
}
