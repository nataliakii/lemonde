"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Image from "next/image";
import { CldImage } from "next-cloudinary";
import { CLOUDINARY_PLACEHOLDER_PUBLIC_ID } from "@config/cloudinary";
import { getApartmentPriceFrom } from "@utils/stayAvailability";
import { isDirectImageSrc as isHttp } from "@/domain/media/imageSrc";

/**
 * Suite gallery + stay details (replaces car-spec modal on apartments catalog).
 */
export default function SuiteDetailsModal({ open, onClose, apartment }) {
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    if (open) setPhotoIndex(0);
  }, [open, apartment?._id]);

  const photos = useMemo(() => {
    if (!apartment) return [];
    const list = [];
    if (apartment.photoUrl) list.push(apartment.photoUrl);
    if (Array.isArray(apartment.gallery)) {
      apartment.gallery.forEach((u) => {
        if (u && !list.includes(u)) list.push(u);
      });
    }
    return list.length ? list : [CLOUDINARY_PLACEHOLDER_PUBLIC_ID];
  }, [apartment]);

  const current = photos[Math.min(photoIndex, photos.length - 1)];
  const priceFrom = getApartmentPriceFrom(apartment);

  const facts = [
    apartment?.seats
      ? apartment.seats === 1
        ? "1 guest"
        : `${apartment.seats} guests`
      : null,
    apartment?.beds
      ? apartment.beds === 1
        ? "1 bed"
        : `${apartment.beds} beds`
      : null,
    apartment?.numberOfDoors > 0
      ? apartment.numberOfDoors === 1
        ? "1 bedroom"
        : `${apartment.numberOfDoors} bedrooms`
      : apartment?.class
        ? String(apartment.class).charAt(0).toUpperCase() +
          String(apartment.class).slice(1)
        : null,
    apartment?.sizeSqm ? `${apartment.sizeSqm} m²` : null,
    apartment?.bathrooms
      ? apartment.bathrooms === 1
        ? "1 bathroom"
        : `${apartment.bathrooms} bathrooms`
      : null,
    apartment?.floor != null ? `Floor ${apartment.floor}` : null,
    apartment?.airConditioning ? "Air conditioning" : null,
  ].filter(Boolean);

  const amenities = Array.isArray(apartment?.amenities)
    ? apartment.amenities
    : [];

  const go = (dir) => {
    setPhotoIndex((i) => {
      const next = i + dir;
      if (next < 0) return photos.length - 1;
      if (next >= photos.length) return 0;
      return next;
    });
  };

  if (!apartment) return null;

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="suite-details-title">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "94%", sm: 560, md: 720 },
          maxHeight: "92vh",
          bgcolor: "#FFFCFA",
          boxShadow: "0 24px 64px rgba(14,12,10,0.35)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          outline: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            aspectRatio: { xs: "4/3", md: "16/10" },
            bgcolor: "#1A1612",
            flexShrink: 0,
          }}
        >
          {isHttp(current) ? (
            <Image
              src={current}
              alt={apartment.model || "Suite"}
              fill
              sizes="(max-width: 900px) 94vw, 720px"
              style={{ objectFit: "cover" }}
              priority
            />
          ) : (
            <CldImage
              src={current || CLOUDINARY_PLACEHOLDER_PUBLIC_ID}
              alt={apartment.model || "Suite"}
              fill
              crop="fill"
              sizes="(max-width: 900px) 94vw, 720px"
              style={{ objectFit: "cover" }}
            />
          )}

          <IconButton
            aria-label="Close"
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              bgcolor: "rgba(14,12,10,0.55)",
              color: "#F5F0E6",
              "&:hover": { bgcolor: "rgba(14,12,10,0.75)" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          {photos.length > 1 && (
            <>
              <IconButton
                aria-label="Previous photo"
                onClick={() => go(-1)}
                sx={{
                  position: "absolute",
                  left: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(14,12,10,0.45)",
                  color: "#F5F0E6",
                  "&:hover": { bgcolor: "rgba(14,12,10,0.7)" },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                aria-label="Next photo"
                onClick={() => go(1)}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(14,12,10,0.45)",
                  color: "#F5F0E6",
                  "&:hover": { bgcolor: "rgba(14,12,10,0.7)" },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
              <Typography
                sx={{
                  position: "absolute",
                  bottom: 12,
                  right: 14,
                  color: "rgba(245,240,230,0.9)",
                  fontSize: "0.8rem",
                  letterSpacing: "0.06em",
                  textShadow: "0 1px 6px rgba(0,0,0,0.5)",
                }}
              >
                {photoIndex + 1} / {photos.length}
              </Typography>
            </>
          )}
        </Box>

        <Box sx={{ px: { xs: 2.5, md: 3.5 }, py: 2.5, overflowY: "auto" }}>
          <Typography
            id="suite-details-title"
            component="h2"
            sx={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: { xs: "1.75rem", md: "2.1rem" },
              color: "secondary.main",
              lineHeight: 1.15,
              mb: 0.75,
            }}
          >
            {apartment.model}
          </Typography>

          {facts.length > 0 && (
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: "0.95rem",
                letterSpacing: "0.02em",
                mb: 1.5,
              }}
            >
              {facts.join("  ·  ")}
            </Typography>
          )}

          {priceFrom != null && (
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: "1.35rem",
                color: "secondary.main",
                mb: 1.75,
              }}
            >
              from €{priceFrom}
              <Box
                component="span"
                sx={{
                  fontFamily: "var(--font-body)",
                  fontStyle: "normal",
                  fontSize: "0.85rem",
                  ml: 0.75,
                  opacity: 0.7,
                }}
              >
                / night
              </Box>
            </Typography>
          )}

          {apartment.description ? (
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: "0.98rem",
                lineHeight: 1.6,
                mb: 2,
              }}
            >
              {apartment.description}
            </Typography>
          ) : null}

          {amenities.length > 0 && (
            <Stack
              direction="row"
              flexWrap="wrap"
              useFlexGap
              spacing={0.85}
              sx={{ mb: 2.5 }}
            >
              {amenities.map((a) => (
                <Box
                  key={a}
                  component="span"
                  sx={{
                    px: 1.15,
                    py: 0.45,
                    fontSize: "0.7rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    border: "1px solid rgba(26,22,18,0.14)",
                    color: "secondary.light",
                    bgcolor: "rgba(201,162,39,0.06)",
                  }}
                >
                  {a}
                </Box>
              ))}
            </Stack>
          )}

          <Button
            onClick={onClose}
            variant="contained"
            fullWidth
            sx={{
              py: 1.15,
              fontWeight: 600,
              letterSpacing: "0.04em",
              bgcolor: "secondary.main",
              color: "#F5F0E6",
              boxShadow: "none",
              "&:hover": { bgcolor: "#2A2218" },
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
