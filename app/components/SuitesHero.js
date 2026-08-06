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
                    style={{ objectFit: "cover", filter: "brightness(1.06)" }}
                  />
                ) : (
                  <CldImage
                    src={src}
                    alt=""
                    fill
                    crop="fill"
                    priority={i === 0}
                    sizes="100vw"
                    style={{ objectFit: "cover", filter: "brightness(1.06)" }}
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
                "linear-gradient(165deg, rgba(5,8,12,0.38) 0%, rgba(11,18,24,0.22) 48%, rgba(5,8,12,0.42) 100%)",
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
            sx={{
              position: "absolute",
              left: { xs: 8, md: 20 },
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 3,
              bgcolor: "rgba(0,0,0,0.28)",
              color: "#FFFFFF",
              width: 40,
              height: 40,
              "&:hover": { bgcolor: "rgba(0,0,0,0.48)" },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            aria-label="Next hero photo"
            onClick={() => go(index + 1)}
            sx={{
              position: "absolute",
              right: { xs: 8, md: 20 },
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 3,
              bgcolor: "rgba(0,0,0,0.28)",
              color: "#FFFFFF",
              width: 40,
              height: 40,
              "&:hover": { bgcolor: "rgba(0,0,0,0.48)" },
            }}
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
                sx={{
                  width: i === index ? 22 : 8,
                  height: 8,
                  borderRadius: 4,
                  border: "none",
                  cursor: "pointer",
                  p: 0,
                  bgcolor:
                    i === index ? "#FFFFFF" : "rgba(255,255,255,0.45)",
                  transition: "width 0.25s ease, background-color 0.25s ease",
                }}
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
          py: { xs: 3, md: 4 },
          maxWidth: 820,
          // Soft local backdrop: readable type without darkening the whole photo
          ...(hasHeroImage
            ? {
                borderRadius: 2,
                background:
                  "radial-gradient(ellipse 85% 75% at 50% 45%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.28) 55%, transparent 78%)",
              }
            : null),
        }}
      >
        <Typography
          component="h1"
          className="brand-wordmark hero-reveal"
          sx={(theme) => ({
            ...brandWordmarkSx(theme, { bright: hasHeroImage }),
            fontSize: { xs: "clamp(2.8rem, 12vw, 5.5rem)", md: "5.5rem" },
            lineHeight: 1.22,
            mb: 2,
            ...(hasHeroImage
              ? {
                  filter:
                    "drop-shadow(0 2px 4px rgba(0,0,0,0.55)) drop-shadow(0 8px 28px rgba(0,0,0,0.45))",
                }
              : null),
          })}
        >
          {brandName}
        </Typography>

        <Typography
          className="hero-reveal-delay"
          sx={{
            color: "#FFFFFF",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: { xs: "1.08rem", md: "1.28rem" },
            letterSpacing: "0.03em",
            lineHeight: 1.45,
            maxWidth: 520,
            mx: "auto",
            mb: 4,
            textShadow: hasHeroImage
              ? "0 1px 2px rgba(0,0,0,0.75), 0 2px 8px rgba(0,0,0,0.55), 0 8px 32px rgba(0,0,0,0.4)"
              : "0 1px 2px rgba(0,0,0,0.35)",
          }}
        >
          {tagline}
        </Typography>

        <Box className="hero-reveal-delay-2">
          <Button
            component={Link}
            href={apartmentsHref}
            disableElevation
            sx={(theme) => {
              const onPhoto = hasHeroImage;
              return {
                position: "relative",
                overflow: "hidden",
                px: { xs: 3.5, md: 4.5 },
                py: { xs: 1.35, md: 1.55 },
                minWidth: 180,
                borderRadius: 0,
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontSize: "0.78rem",
                lineHeight: 1.2,
                color: onPhoto ? "#FFFFFF" : theme.palette.secondary.main,
                backgroundColor: onPhoto
                  ? "rgba(255,255,255,0.1)"
                  : theme.palette.primary.main,
                border: onPhoto
                  ? "1px solid rgba(255,255,255,0.92)"
                  : `1px solid ${theme.palette.primary.main}`,
                backdropFilter: onPhoto ? "blur(10px)" : "none",
                WebkitBackdropFilter: onPhoto ? "blur(10px)" : "none",
                boxShadow: onPhoto
                  ? "0 8px 32px rgba(0,0,0,0.28)"
                  : `0 8px 28px color-mix(in srgb, ${theme.palette.primary.main} 28%, transparent)`,
                transition:
                  "background-color 0.35s ease, color 0.35s ease, border-color 0.35s ease, transform 0.35s ease, box-shadow 0.35s ease, backdrop-filter 0.35s ease",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.28) 50%, transparent 70%)",
                  transform: "translateX(-120%)",
                  transition: "transform 0.55s ease",
                  pointerEvents: "none",
                },
                // Double selector so MUI Button defaults don't win over hover.
                "&&:hover": {
                  backgroundColor: onPhoto
                    ? "rgba(255,255,255,0.38)"
                    : theme.palette.primary.light,
                  color: onPhoto ? "#FFFFFF" : theme.palette.secondary.main,
                  borderColor: onPhoto
                    ? "#FFFFFF"
                    : theme.palette.primary.light,
                  backdropFilter: onPhoto ? "blur(14px)" : "none",
                  WebkitBackdropFilter: onPhoto ? "blur(14px)" : "none",
                  transform: "translateY(-2px)",
                  boxShadow: onPhoto
                    ? "0 0 0 1px rgba(255,255,255,0.55), 0 0 28px rgba(255,255,255,0.42), 0 12px 36px rgba(0,0,0,0.3)"
                    : `0 12px 32px color-mix(in srgb, ${theme.palette.primary.light} 35%, transparent)`,
                  "&::after": {
                    transform: "translateX(120%)",
                  },
                },
              };
            }}
          >
            {ctaLabel}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
