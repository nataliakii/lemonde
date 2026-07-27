"use client";

import { Box, Button, Typography } from "@mui/material";
import Link from "next/link";
import Image from "next/image";

/**
 * Full-bleed landing hero.
 * Brand name / optional hero image come from company (DB) via props.
 * Gradients use theme.brandSurfaces from Mongo company.branding.
 */
export default function SuitesHero({
  locale = "en",
  tagline,
  ctaLabel,
  brandName = "V Luxury Suites",
  heroImage = "",
}) {
  const apartmentsHref = `/${locale}/apartments`;
  const hasHeroImage = Boolean(heroImage);

  return (
    <Box
      component="section"
      sx={(theme) => ({
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
        background: hasHeroImage
          ? theme.palette.secondary.dark
          : theme.brandSurfaces?.hero || theme.palette.secondary.main,
      })}
    >
      {hasHeroImage ? (
        <>
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
          <Box
            aria-hidden
            sx={(theme) => ({
              position: "absolute",
              inset: 0,
              background:
                theme.brandSurfaces?.heroImageOverlay ||
                "linear-gradient(165deg, rgba(14,12,10,0.72) 0%, rgba(26,22,18,0.55) 50%, rgba(14,12,10,0.78) 100%)",
            })}
          />
        </>
      ) : (
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
      )}

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
          {brandName}
        </Typography>

        <Typography
          className="hero-reveal-delay"
          sx={(theme) => ({
            color: theme.brandSurfaces?.onDarkMuted || "rgba(245, 240, 230, 0.82)",
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            fontSize: { xs: "1.05rem", md: "1.25rem" },
            letterSpacing: "0.04em",
            maxWidth: 480,
            mx: "auto",
            mb: 4,
          })}
        >
          {tagline}
        </Typography>

        <Box className="hero-reveal-delay-2">
          <Button
            component={Link}
            href={apartmentsHref}
            variant="contained"
            sx={(theme) => ({
              px: 4,
              py: 1.4,
              borderRadius: 1,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontSize: "0.85rem",
              backgroundColor: "primary.main",
              color: "secondary.main",
              boxShadow: `0 0 24px color-mix(in srgb, ${theme.palette.primary.main} 35%, transparent)`,
              "&:hover": {
                backgroundColor: "primary.light",
                color: "secondary.main",
                boxShadow: `0 0 32px color-mix(in srgb, ${theme.palette.primary.light} 45%, transparent)`,
              },
            })}
          >
            {ctaLabel}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
