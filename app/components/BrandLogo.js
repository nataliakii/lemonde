"use client";

import { Box } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useMainContext } from "@app/Context";
import { resolveBrandConfig } from "@/domain/branding/resolveBrandConfig";

/**
 * Brand mark + wordmark from company.assets / company.name (DB),
 * with local fallbacks for empty /public logo.
 */
export default function BrandLogo({
  href = "/",
  showWordmark = true,
  markSize = 36,
  wordmarkSx = {},
  linkSx = {},
  name: nameProp,
  logoSrc: logoProp,
}) {
  const { company } = useMainContext();
  const brand = resolveBrandConfig(company);
  const name = nameProp || brand.name;
  const logoSrc = logoProp || brand.assets.logoMark || "/logo-mark.png";

  const content = (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1.25,
        textDecoration: "none",
        ...linkSx,
      }}
    >
      <Box
        sx={{
          width: markSize,
          height: markSize,
          flexShrink: 0,
          borderRadius: "50%",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Image
          src={logoSrc}
          alt={name}
          width={markSize}
          height={markSize}
          priority
          style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>
      {showWordmark && (
        <Box
          component="span"
          className="brand-wordmark"
          sx={{
            fontSize: { xs: "1.2rem", md: "1.45rem" },
            lineHeight: 1.1,
            whiteSpace: "nowrap",
            ...wordmarkSx,
          }}
        >
          {name}
        </Box>
      )}
    </Box>
  );

  if (!href) return content;
  return (
    <Link href={href} style={{ textDecoration: "none", display: "inline-flex" }}>
      {content}
    </Link>
  );
}
