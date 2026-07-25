"use client";

import { Box } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

/**
 * Le Monde Suites brand mark + optional cursive wordmark.
 */
export default function BrandLogo({
  href = "/",
  showWordmark = true,
  markSize = 36,
  wordmarkSx = {},
  linkSx = {},
}) {
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
          boxShadow: "0 0 0 1.5px rgba(201,162,39,0.45)",
        }}
      >
        <Image
          src="/logo-mark.svg"
          alt="Le Monde Suites"
          width={markSize}
          height={markSize}
          priority
          style={{ display: "block", width: "100%", height: "100%" }}
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
          Le Monde Suites
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
