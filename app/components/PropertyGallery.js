"use client";

import { useCallback, useRef, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import Image from "next/image";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

/**
 * Full-bleed property photo strip after the hero.
 * Images: absolute Cloudinary/CDN URLs or local public paths from company.assets.galleryImages.
 */
export default function PropertyGallery({
  images = [],
  title = "The property",
  subtitle = "",
  brandName = "",
}) {
  const scrollerRef = useRef(null);
  const [active, setActive] = useState(0);
  const list = Array.isArray(images) ? images.filter(Boolean) : [];

  const scrollByCard = useCallback((dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector("[data-gallery-card]");
    const step = card ? card.getBoundingClientRect().width + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = el.querySelectorAll("[data-gallery-card]");
    if (!cards.length) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((card, i) => {
      const left = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(left - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActive(best);
  }, []);

  if (!list.length) return null;

  return (
    <Box
      component="section"
      aria-label={title}
      sx={{
        position: "relative",
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",
        width: "100vw",
        // Fixed dark band + extra top padding so the title sits fully on beige
        pt: { xs: 11, md: 14 },
        pb: { xs: 6, md: 8 },
        background: `
          linear-gradient(
            180deg,
            #1B1E24 0%,
            #0E1014 56px,
            #F4F5F7 56px,
            #F4F5F7 100%
          )
        `,
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2.5, md: 4 },
          mb: { xs: 3, md: 4 },
          textAlign: "center",
        }}
      >
        <Typography
          component="h2"
          className="brand-wordmark"
          sx={{
            fontSize: { xs: "2rem", md: "2.75rem" },
            lineHeight: 1.15,
            color: "secondary.main",
            mb: 1,
          }}
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography
            sx={{
              color: "text.secondary",
              fontFamily: "var(--font-body)",
              fontSize: { xs: "0.95rem", md: "1.05rem" },
              letterSpacing: "0.03em",
              maxWidth: 440,
              mx: "auto",
            }}
          >
            {subtitle}
          </Typography>
        ) : null}
      </Box>

      <Box sx={{ position: "relative" }}>
        <IconButton
          aria-label="Previous photo"
          onClick={() => scrollByCard(-1)}
          sx={{
            display: { xs: "none", md: "flex" },
            position: "absolute",
            left: { md: 16, lg: 32 },
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            bgcolor: "rgba(26,22,18,0.72)",
            color: "primary.light",
            "&:hover": { bgcolor: "rgba(26,22,18,0.9)" },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <IconButton
          aria-label="Next photo"
          onClick={() => scrollByCard(1)}
          sx={{
            display: { xs: "none", md: "flex" },
            position: "absolute",
            right: { md: 16, lg: 32 },
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            bgcolor: "rgba(26,22,18,0.72)",
            color: "primary.light",
            "&:hover": { bgcolor: "rgba(26,22,18,0.9)" },
          }}
        >
          <ChevronRightIcon />
        </IconButton>

        <Box
          ref={scrollerRef}
          onScroll={onScroll}
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            px: { xs: 2.5, md: 8 },
            pb: 1,
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          }}
        >
          {list.map((src, index) => (
            <Box
              key={`${src}-${index}`}
              data-gallery-card
              sx={{
                flex: "0 0 auto",
                width: {
                  xs: "min(86vw, 340px)",
                  sm: "min(70vw, 420px)",
                  md: "min(48vw, 520px)",
                },
                scrollSnapAlign: "center",
                borderRadius: 1,
                overflow: "hidden",
                position: "relative",
                aspectRatio: "4 / 3",
                boxShadow:
                  active === index
                    ? "0 12px 40px rgba(26,22,18,0.22)"
                    : "0 6px 20px rgba(26,22,18,0.12)",
                transform: active === index ? "scale(1)" : "scale(0.97)",
                transition: "transform 0.35s ease, box-shadow 0.35s ease",
              }}
            >
              <Image
                src={src}
                alt={
                  brandName
                    ? `${brandName} — photo ${index + 1}`
                    : `Property photo ${index + 1}`
                }
                fill
                sizes="(max-width: 600px) 86vw, (max-width: 900px) 70vw, 520px"
                style={{ objectFit: "cover" }}
                priority={index < 2}
              />
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 0.75,
          mt: 2.5,
        }}
      >
        {list.map((_, i) => (
          <Box
            key={i}
            component="button"
            type="button"
            aria-label={`Go to photo ${i + 1}`}
            onClick={() => {
              const el = scrollerRef.current;
              const card = el?.querySelectorAll("[data-gallery-card]")?.[i];
              card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
            }}
            sx={{
              width: active === i ? 22 : 8,
              height: 8,
              border: 0,
              borderRadius: 99,
              p: 0,
              cursor: "pointer",
              bgcolor: active === i ? "primary.main" : "rgba(26,22,18,0.25)",
              transition: "width 0.25s ease, background-color 0.25s ease",
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
