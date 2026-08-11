"use client";

import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";

/**
 * Signature desktop cursor: a soft platinum ring that follows the pointer.
 * Disabled on touch / coarse pointers and when reduced-motion is preferred.
 */
export default function SteelCursor() {
  const ringRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return undefined;

    setEnabled(true);
    document.documentElement.classList.add("steel-cursor-on");

    const ring = ringRef.current;
    if (!ring) return undefined;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;
    let hovering = false;

    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const onOver = (e) => {
      const el = e.target;
      if (!(el instanceof Element)) return;
      hovering = Boolean(
        el.closest(
          "a, button, [role='button'], input, textarea, select, label, .steel-cursor-target"
        )
      );
      ring.dataset.hover = hovering ? "1" : "0";
    };

    const tick = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      ring.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.documentElement.classList.remove("steel-cursor-on");
    };
  }, []);

  if (!enabled) return null;

  return (
    <Box
      ref={ringRef}
      aria-hidden
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        width: 28,
        height: 28,
        borderRadius: "50%",
        border: "1px solid rgba(230, 238, 245, 0.75)",
        backgroundColor: "rgba(174, 192, 208, 0.12)",
        boxShadow:
          "0 0 0 1px rgba(11,18,24,0.15), 0 0 20px rgba(174, 192, 208, 0.35)",
        pointerEvents: "none",
        transition:
          "width 0.25s ease, height 0.25s ease, border-color 0.25s ease, background-color 0.25s ease",
        '&[data-hover="1"]': {
          width: 46,
          height: 46,
          borderColor: "rgba(255,255,255,0.95)",
          backgroundColor: "rgba(174, 192, 208, 0.22)",
        },
      }}
    />
  );
}
