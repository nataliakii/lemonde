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
 * Signature homepage moment — a living horizon line with poetic Kassandra copy.
 * Inspired by editorial hotel storytelling (Homeric Poems energy), in V Luxury voice.
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
      { threshold: 0.35 }
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
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",
        width: "100vw",
        minHeight: { xs: "72vh", md: "78vh" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        bgcolor: "secondary.dark",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          transform: visible ? "scale(1.04)" : "scale(1.12)",
          transition: "transform 2.4s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: "cover", filter: "brightness(0.92) saturate(0.92)" }}
        />
      </Box>

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(11,18,24,0.55) 0%, rgba(11,18,24,0.28) 42%, rgba(11,18,24,0.62) 100%)",
        }}
      />

      {/* Living horizon */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          top: { xs: "46%", md: "48%" },
          height: 1,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            height: 1,
            width: visible ? "72%" : "0%",
            maxWidth: 720,
            background:
              "linear-gradient(90deg, transparent, rgba(174,192,208,0.15) 12%, rgba(230,238,245,0.95) 50%, rgba(174,192,208,0.15) 88%, transparent)",
            boxShadow: "0 0 24px rgba(174,192,208,0.35)",
            transition: "width 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.15s",
          }}
        />
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 720,
          px: { xs: 2.5, md: 4 },
          textAlign: "center",
        }}
      >
        <Box sx={{ mb: { xs: 3, md: 3.5 } }}>
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
                  xs: i === 2 ? "2.15rem" : "1.65rem",
                  md: i === 2 ? "3.4rem" : "2.35rem",
                },
                lineHeight: 1.15,
                letterSpacing: i === 2 ? "0.02em" : "-0.02em",
                color: i === 2 ? "#E6EEF5" : "rgba(255,255,255,0.92)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(22px)",
                transition: `opacity 0.9s ease ${0.28 + i * 0.18}s, transform 0.9s ease ${0.28 + i * 0.18}s`,
                textShadow: "0 2px 24px rgba(0,0,0,0.35)",
              }}
            >
              {line}
            </Typography>
          ))}
        </Box>

        <Typography
          sx={{
            fontFamily: "var(--font-body)",
            fontSize: { xs: "0.95rem", md: "1.05rem" },
            letterSpacing: "0.04em",
            color: "rgba(230,238,245,0.78)",
            mb: 4,
            opacity: visible ? 1 : 0,
            transition: "opacity 1s ease 0.95s",
          }}
        >
          {copy.whisper}
        </Typography>

        <Box
          component={Link}
          href={`/${locale}/apartments`}
          className="steel-cursor-target"
          sx={{
            display: "inline-block",
            fontFamily: "var(--font-body)",
            fontSize: "0.76rem",
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            textDecoration: "none",
            color: "rgba(255,255,255,0.9)",
            borderBottom: "1px solid rgba(255,255,255,0.45)",
            pb: 0.5,
            opacity: visible ? 1 : 0,
            transition:
              "opacity 0.8s ease 1.1s, color 0.25s ease, border-color 0.25s ease",
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
