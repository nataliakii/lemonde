"use client";

import { Box, Button, Typography } from "@mui/material";
import Link from "next/link";

/**
 * Full-bleed landing hero for Le Monde Suites.
 * Brand mark lives in the navbar; hero is wordmark + tagline + CTA.
 */
export default function SuitesHero({ locale = "en", tagline, ctaLabel }) {
  const apartmentsHref = `/${locale}/apartments`;

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",
        width: "100vw",
        minHeight: { xs: "calc(100dvh - 60px)", md: "calc(100dvh - 60px)" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: `
          radial-gradient(ellipse 80% 60% at 70% 20%, rgba(201,162,39,0.22) 0%, transparent 55%),
          radial-gradient(ellipse 60% 50% at 15% 80%, rgba(232,213,163,0.12) 0%, transparent 50%),
          linear-gradient(165deg, #0E0C0A 0%, #1A1612 45%, #2A2218 100%)
        `,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          px: { xs: 3, md: 6 },
          maxWidth: 820,
        }}
      >
        <Typography
          component="h1"
          className="brand-wordmark hero-reveal"
          sx={{
            fontSize: { xs: "clamp(2.8rem, 12vw, 5.5rem)", md: "5.5rem" },
            lineHeight: 1.05,
            mb: 2,
          }}
        >
          Le Monde Suites
        </Typography>

        <Typography
          className="hero-reveal-delay"
          sx={{
            color: "rgba(245, 240, 230, 0.82)",
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            fontSize: { xs: "1.05rem", md: "1.25rem" },
            letterSpacing: "0.04em",
            maxWidth: 480,
            mx: "auto",
            mb: 4,
          }}
        >
          {tagline}
        </Typography>

        <Box className="hero-reveal-delay-2">
          <Button
            component={Link}
            href={apartmentsHref}
            variant="contained"
            sx={{
              px: 4,
              py: 1.4,
              borderRadius: 1,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontSize: "0.85rem",
              backgroundColor: "primary.main",
              color: "secondary.main",
              boxShadow: "0 0 24px rgba(201,162,39,0.35)",
              "&:hover": {
                backgroundColor: "primary.light",
                color: "secondary.main",
                boxShadow: "0 0 32px rgba(232,213,163,0.45)",
              },
            }}
          >
            {ctaLabel}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
