"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Box, Typography } from "@mui/material";

const COPY = {
  en: {
    lines: ["Still water.", "Open sky.", "Kassandra."],
    whisper: "Where the day softens into the Aegean.",
    cta: "Find your suite",
  },
  ru: {
    lines: ["Тихая вода.", "Открытое небо.", "Кассандра."],
    whisper: "Там, где день растворяется в Эгейском море.",
    cta: "Найти свой сьют",
  },
  uk: {
    lines: ["Тиха вода.", "Відкрите небо.", "Кассандра."],
    whisper: "Там, де день розчиняється в Егейському морі.",
    cta: "Знайти свій сьют",
  },
  de: {
    lines: ["Stilles Wasser.", "Offener Himmel.", "Kassandra."],
    whisper: "Wo der Tag sanft in die Ägäis übergeht.",
    cta: "Suite finden",
  },
  el: {
    lines: ["Ήρεμο νερό.", "Ανοιχτός ουρανός.", "Κασσάνδρα."],
    whisper: "Εκεί που η μέρα μαλακώνει στο Αιγαίο.",
    cta: "Βρείτε το suite σας",
  },
};

/**
 * Quiet Kassandra moment on the homepage — photo + three lines + CTA.
 * Kept simple on purpose (no custom cursor / glow experiments).
 */
export default function HorizonMoment({
  locale = "en",
  imageSrc = "/images/Gallery/EXTERNAL/SEA_1.jpg",
}) {
  const copy = COPY[locale] || COPY.en;
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setVisible(true);
      return undefined;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.28 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Box
      ref={sectionRef}
      component="section"
      aria-label={copy.lines.join(" ")}
      sx={{
        position: "relative",
        minHeight: { xs: "70vh", md: "76vh" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        bgcolor: "#0B1218",
        // Full-bleed without breaking the page width
        ml: "calc(50% - 50vw)",
        width: "100vw",
        maxWidth: "100vw",
      }}
    >
      <Image
        src={imageSrc}
        alt=""
        fill
        sizes="100vw"
        priority={false}
        style={{ objectFit: "cover" }}
      />

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(11,18,24,0.5) 0%, rgba(11,18,24,0.32) 45%, rgba(11,18,24,0.68) 100%)",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 640,
          px: { xs: 2.5, md: 4 },
          textAlign: "center",
        }}
      >
        <Box sx={{ mb: { xs: 2.5, md: 3 } }}>
          {copy.lines.map((line, i) => (
            <Typography
              key={line}
              component="p"
              sx={{
                m: 0,
                fontFamily: "var(--font-display)",
                fontStyle: i === 2 ? "italic" : "normal",
                fontWeight: 500,
                fontSize: {
                  xs: i === 2 ? "2.1rem" : "1.55rem",
                  md: i === 2 ? "3.2rem" : "2.2rem",
                },
                lineHeight: 1.2,
                letterSpacing: i === 2 ? "0.02em" : "-0.02em",
                color: "#FFFFFF",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(16px)",
                transition: `opacity 0.7s ease ${0.12 + i * 0.12}s, transform 0.7s ease ${0.12 + i * 0.12}s`,
              }}
            >
              {line}
            </Typography>
          ))}
        </Box>

        <Typography
          sx={{
            fontFamily: "var(--font-body)",
            fontSize: { xs: "0.95rem", md: "1.02rem" },
            lineHeight: 1.5,
            color: "rgba(255,255,255,0.82)",
            mb: 3.5,
            opacity: visible ? 1 : 0,
            transition: "opacity 0.7s ease 0.55s",
          }}
        >
          {copy.whisper}
        </Typography>

        <Box
          component={Link}
          href={`/${locale}/apartments`}
          sx={{
            display: "inline-block",
            fontFamily: "var(--font-body)",
            fontSize: "0.76rem",
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            textDecoration: "none",
            color: "rgba(255,255,255,0.92)",
            borderBottom: "1px solid rgba(255,255,255,0.5)",
            pb: 0.5,
            opacity: visible ? 1 : 0,
            transition: "opacity 0.7s ease 0.7s, border-color 0.2s ease, color 0.2s ease",
            "&:hover": {
              color: "#fff",
              borderBottomColor: "#fff",
            },
          }}
        >
          {copy.cta}
        </Box>
      </Box>
    </Box>
  );
}
