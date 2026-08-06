"use client";

import Image from "next/image";
import Link from "next/link";
import { Box, Button, Typography } from "@mui/material";
import {
  PRINCESS_ROUTE,
  getPrincessPromoCopy,
} from "@/domain/princessSuite/promoContent";

/**
 * Homepage band promoting the sister property in Nea Kallikratia.
 */
export default function PrincessSuiteTeaser({ locale = "en" }) {
  const copy = getPrincessPromoCopy(locale);
  const href = `/${locale}${PRINCESS_ROUTE}`;

  return (
    <Box
      component="section"
      aria-label={copy.teaserTitle}
      sx={{
        position: "relative",
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",
        width: "100vw",
        minHeight: { xs: 320, md: 380 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        mt: { xs: 2, md: 4 },
      }}
    >
      <Image
        src="/images/Gallery/EXTERNAL/SEA_1.jpg"
        alt=""
        fill
        sizes="100vw"
        style={{ objectFit: "cover", filter: "brightness(0.95)" }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(105deg, rgba(11,18,24,0.82) 0%, rgba(11,18,24,0.48) 55%, rgba(11,18,24,0.28) 100%)",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 720,
          px: { xs: 2.5, md: 4 },
          py: { xs: 6, md: 7 },
          textAlign: { xs: "center", md: "left" },
        }}
      >
        <Typography
          sx={{
            mb: 1.25,
            fontFamily: "var(--font-body)",
            fontSize: "0.7rem",
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.72)",
          }}
        >
          {copy.teaserEyebrow}
        </Typography>
        <Typography
          component="h2"
          sx={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: { xs: "1.85rem", md: "2.45rem" },
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#FFFFFF",
            mb: 1.5,
          }}
        >
          {copy.teaserTitle}
        </Typography>
        <Typography
          sx={{
            fontFamily: "var(--font-body)",
            fontSize: { xs: "0.98rem", md: "1.05rem" },
            lineHeight: 1.5,
            color: "rgba(255,255,255,0.88)",
            mb: 3.5,
            maxWidth: 420,
            mx: { xs: "auto", md: 0 },
          }}
        >
          {copy.teaserBody}
        </Typography>
        <Button
          component={Link}
          href={href}
          disableElevation
          sx={{
            px: 3.5,
            py: 1.25,
            borderRadius: 0,
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontSize: "0.76rem",
            color: "#FFFFFF",
            backgroundColor: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.85)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            boxShadow: "none",
            transition: "background-color 0.25s ease, border-color 0.25s ease",
            "&&:hover": {
              backgroundColor: "rgba(255,255,255,0.22)",
              borderColor: "#FFFFFF",
              boxShadow: "none",
            },
          }}
        >
          {copy.teaserCta}
        </Button>
      </Box>
    </Box>
  );
}
