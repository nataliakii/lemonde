"use client";

import React, { useState } from "react";
import { Box, Stack, styled } from "@mui/material";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { useMainContext } from "@app/Context";
import DefaultButton from "@/app/components/ui/buttons/DefaultButton";
import { SINGLE_PROPERTY_MODE } from "@/config/domain";

const HeroImagesModal = dynamic(
  () => import("@/app/admin/features/settings/HeroImagesModal"),
  { ssr: false }
);
const GeneralImagesModal = dynamic(
  () => import("@/app/admin/features/settings/GeneralImagesModal"),
  { ssr: false }
);

const StyledTopBar = styled(Box)(({ theme }) => ({
  zIndex: 996,
  position: "fixed",
  top: 60,
  left: 0,
  width: "100%",
  display: "flex",
  justifyContent: "center",
  paddingTop: theme.spacing(1.25),
  paddingBottom: theme.spacing(1.25),
  backgroundColor: theme.palette.backgroundDark1?.bg || "#0B1F3A",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
}));

/**
 * AdminTopBar — action strip under the admin navbar (apartments page).
 */
export default function AdminTopBar({ feature, onAddClick, onBulkAddClick }) {
  const { t } = useTranslation();
  const { scrolled } = useMainContext();
  const [generalModalOpen, setGeneralModalOpen] = useState(false);
  const [heroModalOpen, setHeroModalOpen] = useState(false);

  const isCars = feature === "cars";
  if (!isCars) return null;

  const outlinedSx = {
    flex: "1 1 0",
    minWidth: 0,
    maxWidth: 280,
    border: "1px solid rgba(255,255,255,0.35)",
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.08)",
      borderColor: "rgba(255,255,255,0.55)",
    },
  };

  return (
    <>
      <StyledTopBar
        className="admin-topbar"
        sx={{
          display: {
            xs: "flex",
            "@media (maxWidth: 900px) and (orientation: landscape)": "flex",
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          flexWrap="wrap"
          useFlexGap
          spacing={1.5}
          sx={{
            width: "100%",
            maxWidth: 960,
            px: 2,
            rowGap: 1,
          }}
        >
          {onAddClick && (
            <DefaultButton
              onClick={onAddClick}
              relative
              padding={scrolled ? 0.75 : 1.25}
              sx={{
                flex: "1 1 0",
                minWidth: 0,
                maxWidth: 280,
              }}
            >
              {t("carPark.addCar") || "Add apartment"}
            </DefaultButton>
          )}
          {onBulkAddClick && !SINGLE_PROPERTY_MODE && (
            <DefaultButton
              onClick={onBulkAddClick}
              relative
              padding={scrolled ? 0.75 : 1.25}
              sx={outlinedSx}
            >
              Bulk add cars
            </DefaultButton>
          )}
          <DefaultButton
            onClick={() => setGeneralModalOpen(true)}
            relative
            padding={scrolled ? 0.75 : 1.25}
            sx={outlinedSx}
          >
            General photos
          </DefaultButton>
          <DefaultButton
            onClick={() => setHeroModalOpen(true)}
            relative
            padding={scrolled ? 0.75 : 1.25}
            sx={outlinedSx}
          >
            Homepage hero
          </DefaultButton>
        </Stack>
      </StyledTopBar>

      <GeneralImagesModal
        open={generalModalOpen}
        onClose={() => setGeneralModalOpen(false)}
      />
      <HeroImagesModal
        open={heroModalOpen}
        onClose={() => setHeroModalOpen(false)}
      />
    </>
  );
}
