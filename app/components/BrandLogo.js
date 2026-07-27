"use client";

import { Box } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useMainContext } from "@app/Context";
import { resolveBrandConfig } from "@/domain/branding/resolveBrandConfig";
import { brandWordmarkSx } from "@/domain/branding/brandWordmarkSx";

/**
 * Brand mark + wordmark from company.assets / company.name (Mongo).
 * No local /public logo fallback — empty assets.logoMark → wordmark only.
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
  const logoSrc = (
    logoProp ||
    brand.assets.logoMark ||
    ""
  ).trim();

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
      {logoSrc ? (
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
            unoptimized
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>
      ) : null}
      {showWordmark && (
        <Box
          component="span"
          className="brand-wordmark"
          sx={(theme) => ({
            ...brandWordmarkSx(theme),
            fontSize: { xs: "1.2rem", md: "1.45rem" },
            lineHeight: 1.1,
            whiteSpace: "nowrap",
            ...wordmarkSx,
          })}
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
