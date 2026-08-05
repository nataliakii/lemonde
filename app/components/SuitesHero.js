"use client";

import { useCallback, useEffect, useState } from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Link from "next/link";
import Image from "next/image";
import { CldImage } from "next-cloudinary";
import { brandWordmarkSx } from "@/domain/branding/brandWordmarkSx";
import { isDirectImageSrc } from "@/domain/media/imageSrc";

const AUTO_MS = 5500;

/**
 * Full-bleed landing hero.
 * Photos from company.assets.heroImages (+ optional General heroLeadImage on the page).
 * Empty slides → branded gradient screen.
 */
export default function SuitesHero({
  locale = "en",
  tagline,
  ctaLabel,
  brandName = "V Luxury Suites",
  heroImages = [],
}) {
  const apartmentsHref = `/${locale}/apartments`;
  const slides = Array.isArray(heroImages)
    ? heroImages.map((s) => String(s || "").trim()).filter(Boolean)
    : [];
  const multi = slides.length > 1;
  const [index, setIndex] = useState(0);

  const go = useCallback(
    (next) => {
      if (!slides.length) return;
      const n = slides.length;
      setIndex(((next % n) + n) % n);
    },
    [slides.length]
  );

  useEffect(() => {
    setIndex(0);
  }, [slides.join("|")]);

  useEffect(() => {
    if (!multi) return undefined;
    const id = setInterval(() => go(index + 1), AUTO_MS);
    return () => clearInterval(id);
  }, [multi, index, go]);

  const hasHeroImage = slides.length > 0;

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
          {slides.map((src, i) => {
            const active = i === index;
            return (
              <Box
                key={`${src}-${i}`}
                aria-hidden={!active}
                sx={{
                  position: "absolute",
                  inset: 0,
                  opacity: active ? 1 : 0,
                  transition: "opacity 0.9s ease",
                  pointerEvents: "none",
                }}
              >
                {isDirectImageSrc(src) ? (
                  <Image
                    src={src}
                    alt=""
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <CldImage
                    src={src}
                    alt=""
                    fill
                    crop="fill"
                    priority={i === 0}
                    sizes="100vw"
                    style={{ objectFit: "cover" }}
                  />
                )}
              </Box>
            );
          })}
          <Box
            aria-hidden
            sx={(theme) => ({
              position: "absolute",
              inset: 0,
              zIndex: 1,
              background:
                theme.brandSurfaces?.heroImageOverlay ||
                "linear-gradient(165deg, rgba(5,8,12,0.72) 0%, rgba(11,18,24,0.55) 50%, rgba(5,8,12,0.78) 100%)",
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

      {multi ? (
        <>
          <IconButton
            aria-label="Previous hero photo"
            onClick={() => go(index - 1)}
            sx={(theme) => ({
              position: "absolute",
              left: { xs: 8, md: 20 },
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 3,
              bgcolor: "rgba(5,8,12,0.42)",
              color: theme.brandSurfaces?.onDark || theme.palette.primary.light,
              width: 40,
              height: 40,
              "&:hover": { bgcolor: "rgba(5,8,12,0.68)" },
            })}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            aria-label="Next hero photo"
            onClick={() => go(index + 1)}
            sx={(theme) => ({
              position: "absolute",
              right: { xs: 8, md: 20 },
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 3,
              bgcolor: "rgba(5,8,12,0.42)",
              color: theme.brandSurfaces?.onDark || theme.palette.primary.light,
              width: 40,
              height: 40,
              "&:hover": { bgcolor: "rgba(5,8,12,0.68)" },
            })}
          >
            <ChevronRightIcon />
          </IconButton>
          <Box
            sx={{
              position: "absolute",
              bottom: { xs: 20, md: 28 },
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 3,
              display: "flex",
              gap: 1,
            }}
          >
            {slides.map((_, i) => (
              <Box
                key={`dot-${i}`}
                component="button"
                type="button"
                aria-label={`Go to hero photo ${i + 1}`}
                onClick={() => setIndex(i)}
                sx={(theme) => ({
                  width: i === index ? 22 : 8,
                  height: 8,
                  borderRadius: 4,
                  border: "none",
                  cursor: "pointer",
                  p: 0,
                  bgcolor:
                    i === index
                      ? theme.palette.primary.light
                      : "rgba(230,238,245,0.4)",
                  transition: "width 0.25s ease, background-color 0.25s ease",
                })}
              />
            ))}
          </Box>
        </>
      ) : null}

      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          px: { xs: 3, md: 6 },
          maxWidth: 820,
        }}
      >
        <Typography
          component="h1"
          className="brand-wordmark hero-reveal"
          sx={(theme) => ({
            ...brandWordmarkSx(theme),
            fontSize: { xs: "clamp(2.8rem, 12vw, 5.5rem)", md: "5.5rem" },
            lineHeight: 1.22,
            mb: 2,
          })}
        >
          {brandName}
        </Typography>

        <Typography
          className="hero-reveal-delay"
          sx={(theme) => ({
            color: theme.brandSurfaces?.onDarkMuted || theme.palette.primary.light,
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
