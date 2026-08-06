"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Box,
  Button,
  Typography,
} from "@mui/material";
import {
  PRINCESS_GALLERY_IMAGES,
  PRINCESS_HERO_IMAGES,
  PRINCESS_ROOMS,
  getPrincessPromoCopy,
  princessBookingUrl,
} from "@/domain/princessSuite/promoContent";

function GlassCta({ href, children, external = false }) {
  const props = external
    ? { component: "a", href, target: "_blank", rel: "noopener noreferrer" }
    : { component: "a", href };
  return (
    <Button
      {...props}
      disableElevation
      sx={{
        px: { xs: 3.5, md: 4.25 },
        py: { xs: 1.25, md: 1.4 },
        minWidth: 180,
        borderRadius: 0,
        fontFamily: "var(--font-body)",
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        fontSize: "0.78rem",
        lineHeight: 1.2,
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
      {children}
    </Button>
  );
}

function SolidCta({ href, children, external = false }) {
  const props = external
    ? { component: "a", href, target: "_blank", rel: "noopener noreferrer" }
    : { component: "a", href };
  return (
    <Button
      {...props}
      disableElevation
      sx={(theme) => ({
        px: { xs: 3.5, md: 4.25 },
        py: { xs: 1.25, md: 1.4 },
        minWidth: 180,
        borderRadius: 0,
        fontFamily: "var(--font-body)",
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        fontSize: "0.78rem",
        lineHeight: 1.2,
        color: theme.palette.secondary.main,
        backgroundColor: theme.palette.primary.main,
        border: `1px solid ${theme.palette.primary.main}`,
        boxShadow: "none",
        transition: "background-color 0.25s ease, border-color 0.25s ease",
        "&&:hover": {
          backgroundColor: theme.palette.primary.light,
          borderColor: theme.palette.primary.light,
          boxShadow: "none",
        },
      })}
    >
      {children}
    </Button>
  );
}

function HeroCarousel({ images }) {
  const [index, setIndex] = useState(0);
  const slides = images.filter(Boolean);
  const multi = slides.length > 1;

  useEffect(() => {
    if (!multi) return undefined;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      5200
    );
    return () => clearInterval(id);
  }, [multi, slides.length]);

  return (
    <>
      {slides.map((src, i) => (
        <Box
          key={src}
          aria-hidden={i !== index}
          sx={{
            position: "absolute",
            inset: 0,
            opacity: i === index ? 1 : 0,
            transition: "opacity 1s ease",
          }}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            style={{ objectFit: "cover", filter: "brightness(1.05)" }}
          />
        </Box>
      ))}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(11,18,24,0.35) 0%, rgba(11,18,24,0.22) 42%, rgba(11,18,24,0.72) 100%)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

/**
 * Marketing landing for S Luxury Princess Suite (Nea Kallikratia),
 * hosted on the V Luxury Suites site as a sister-property promo.
 */
export default function PrincessSuitePromo({ locale = "en" }) {
  const copy = getPrincessPromoCopy(locale);
  const bookingUrl = princessBookingUrl(locale);
  const roomsRef = useRef(null);

  const scrollToRooms = (e) => {
    e.preventDefault();
    roomsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box component="article">
      {/* Hero — one composition */}
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
          alignItems: "flex-end",
          justifyContent: "center",
          overflow: "hidden",
          bgcolor: "secondary.dark",
        }}
      >
        <HeroCarousel images={PRINCESS_HERO_IMAGES} />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: 920,
            px: { xs: 2.5, md: 4 },
            pb: { xs: 7, md: 10 },
            pt: { xs: 12, md: 14 },
            textAlign: "center",
          }}
        >
          <Typography
            className="hero-reveal"
            component="p"
            sx={{
              mb: 1.5,
              fontFamily: "var(--font-body)",
              fontSize: "0.72rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.78)",
            }}
          >
            {copy.place}
          </Typography>

          <Typography
            className="brand-wordmark hero-reveal"
            component="h1"
            sx={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: { xs: "2.35rem", sm: "3.1rem", md: "3.75rem" },
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
              textShadow:
                "0 1px 2px rgba(0,0,0,0.55), 0 8px 28px rgba(0,0,0,0.35)",
              mb: 2,
            }}
          >
            {copy.brand}
          </Typography>

          <Typography
            className="hero-reveal-delay"
            component="p"
            sx={{
              maxWidth: 540,
              mx: "auto",
              mb: 4,
              fontFamily: "var(--font-body)",
              fontSize: { xs: "1.05rem", md: "1.2rem" },
              lineHeight: 1.45,
              color: "rgba(255,255,255,0.92)",
              textShadow: "0 1px 8px rgba(0,0,0,0.45)",
            }}
          >
            {copy.headline}
          </Typography>

          <Box
            className="hero-reveal-delay-2"
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
              justifyContent: "center",
            }}
          >
            <GlassCta href={bookingUrl} external>
              {copy.cta}
            </GlassCta>
            <Button
              onClick={scrollToRooms}
              sx={{
                px: 3,
                py: 1.35,
                borderRadius: 0,
                color: "rgba(255,255,255,0.88)",
                fontFamily: "var(--font-body)",
                fontSize: "0.78rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                borderBottom: "1px solid rgba(255,255,255,0.45)",
                "&:hover": {
                  bgcolor: "transparent",
                  color: "#fff",
                  borderBottomColor: "#fff",
                },
              }}
            >
              {copy.ctaSecondary}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Rooms */}
      <Box
        ref={roomsRef}
        component="section"
        id="apartments"
        sx={{
          maxWidth: 920,
          mx: "auto",
          px: { xs: 2.5, md: 4 },
          pt: { xs: 8, md: 11 },
          pb: { xs: 6, md: 8 },
        }}
      >
        <Typography
          component="h2"
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: { xs: "1.85rem", md: "2.35rem" },
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: "secondary.main",
            mb: 1,
            textAlign: "center",
          }}
        >
          {copy.roomsTitle}
        </Typography>
        <Typography
          sx={{
            textAlign: "center",
            fontFamily: "var(--font-body)",
            color: "text.secondary",
            mb: { xs: 4, md: 5 },
            maxWidth: 480,
            mx: "auto",
          }}
        >
          {copy.roomsSubtitle}
        </Typography>

        <Box
          component="ul"
          sx={{
            listStyle: "none",
            m: 0,
            p: 0,
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {PRINCESS_ROOMS.map((room, i) => (
            <Box
              key={room.id}
              component="li"
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr auto",
                  md: "minmax(0, 1.1fr) minmax(0, 1.4fr) auto",
                },
                columnGap: { xs: 2, md: 3 },
                rowGap: 0.35,
                alignItems: "baseline",
                py: { xs: 2.25, md: 2.5 },
                borderTop: (theme) =>
                  `1px solid color-mix(in srgb, ${theme.palette.primary.main} 28%, transparent)`,
                borderBottom:
                  i === PRINCESS_ROOMS.length - 1
                    ? (theme) =>
                        `1px solid color-mix(in srgb, ${theme.palette.primary.main} 28%, transparent)`
                    : "none",
                transition: "background-color 0.25s ease",
                "&:hover": {
                  bgcolor: (theme) =>
                    `color-mix(in srgb, ${theme.palette.primary.light} 14%, transparent)`,
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: "var(--font-display)",
                  fontSize: { xs: "1.2rem", md: "1.35rem" },
                  color: "secondary.main",
                  gridColumn: { xs: "1", md: "1" },
                }}
              >
                {room.name}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.82rem",
                  letterSpacing: "0.06em",
                  color: "text.secondary",
                  gridColumn: { xs: "1 / -1", md: "2" },
                  gridRow: { xs: 2, md: "auto" },
                }}
              >
                {room.kind}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.78rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "primary.dark",
                  textAlign: "right",
                  whiteSpace: "nowrap",
                  gridColumn: { xs: "2", md: "3" },
                  gridRow: { xs: 1, md: "auto" },
                }}
              >
                {copy.sizeLabel(room.sizeM2)} · {copy.guestsLabel(room.guests)}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 5, display: "flex", justifyContent: "center" }}>
          <SolidCta href={bookingUrl} external>
            {copy.cta}
          </SolidCta>
        </Box>
      </Box>

      {/* Atmosphere gallery — full bleed */}
      <Box
        component="section"
        aria-label={copy.galleryTitle}
        sx={{
          position: "relative",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
          width: "100vw",
          py: { xs: 5, md: 7 },
          bgcolor: "secondary.main",
          overflow: "hidden",
        }}
      >
        <Typography
          sx={{
            textAlign: "center",
            mb: 3,
            fontFamily: "var(--font-body)",
            fontSize: "0.72rem",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "primary.light",
            opacity: 0.85,
          }}
        >
          {copy.galleryTitle}
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            overflowX: "auto",
            px: { xs: 2, md: 4 },
            pb: 1,
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            "&::-webkit-scrollbar": { height: 4 },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "primary.main",
            },
          }}
        >
          {PRINCESS_GALLERY_IMAGES.map((src) => (
            <Box
              key={src}
              sx={{
                position: "relative",
                flex: "0 0 auto",
                width: { xs: "78vw", sm: 360, md: 420 },
                height: { xs: 240, md: 300 },
                scrollSnapAlign: "start",
                overflow: "hidden",
              }}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 600px) 78vw, 420px"
                style={{ objectFit: "cover" }}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Location */}
      <Box
        component="section"
        sx={{
          position: "relative",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
          width: "100vw",
          minHeight: { xs: 360, md: 440 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Image
          src="/images/Gallery/EXTERNAL/PAN_4.jpg"
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(11,18,24,0.78) 0%, rgba(11,18,24,0.45) 100%)",
          }}
        />
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: 560,
            px: 3,
            py: 8,
            textAlign: "center",
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: { xs: "1.75rem", md: "2.2rem" },
              color: "#fff",
              mb: 2,
            }}
          >
            {copy.locationTitle}
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-body)",
              fontSize: { xs: "1rem", md: "1.08rem" },
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.9)",
              mb: 4,
            }}
          >
            {copy.locationBody}
          </Typography>
          <GlassCta href={bookingUrl} external>
            {copy.cta}
          </GlassCta>
        </Box>
      </Box>
    </Box>
  );
}
