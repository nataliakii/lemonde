"use client";

import { useLayoutEffect, useState } from "react";
import Image from "next/image";
import { Backdrop, Fade, Box, keyframes } from "@mui/material";

const softPulse = keyframes`
  0%, 100% { opacity: 0.72; transform: scale(0.96); }
  50% { opacity: 1; transform: scale(1); }
`;

export default function Preloader({ loading }) {
  const [visible, setVisible] = useState(true);

  useLayoutEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => setVisible(false), 700);
      return () => clearTimeout(timeout);
    } else {
      setVisible(true);
    }
  }, [loading]);

  return (
    <Fade in={loading || visible} timeout={{ enter: 400, exit: 700 }}>
      <Backdrop
        open={loading || visible}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 999,
          backgroundColor: "rgba(255, 252, 250, 0.92)",
          color: "#1A1612",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transition: "background-color 0.6s ease",
        }}
      >
        <Fade in={loading} timeout={400}>
          <Box
            sx={{
              width: 112,
              height: 112,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: `${softPulse} 1.4s ease-in-out infinite`,
              filter: "drop-shadow(0 4px 16px rgba(26,22,18,0.18))",
            }}
          >
            <Image
              src="/logo-mark.png"
              alt="Le Monde Suites"
              width={96}
              height={96}
              priority
              style={{ objectFit: "contain" }}
            />
          </Box>
        </Fade>
      </Backdrop>
    </Fade>
  );
}
