"use client";

import React, { lazy, Suspense, useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  IconButton,
  Container,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Image from "next/image";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { CLOUDINARY_PLACEHOLDER_PUBLIC_ID } from "@config/cloudinary";
import { useMainContext } from "@app/Context";
import { getApartmentPriceFrom } from "@utils/stayAvailability";
import { getApartmentPath } from "@domain/locationSeo/locationSeoService";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";

const BookingModal = lazy(() =>
  import("@app/components/CarComponent/BookingModal")
);

function isHttp(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}

function guestsLabel(seats) {
  const n = Number(seats);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n === 1 ? "1 guest" : `${n} guests`;
}

function bedsLabel(apartment) {
  const beds = Number(apartment?.beds);
  if (Number.isFinite(beds) && beds > 0) {
    return beds === 1 ? "1 bed" : `${beds} beds`;
  }
  const bedrooms = Number(apartment?.numberOfDoors);
  if (Number.isFinite(bedrooms) && bedrooms > 0) {
    return bedrooms === 1 ? "1 bedroom" : `${bedrooms} bedrooms`;
  }
  return null;
}

export default function SuitePageView({
  apartmentSlug,
  locale = "en",
  relatedSuites = [],
}) {
  const {
    cars,
    stayCheckIn,
    stayCheckOut,
    ordersByCarId,
    fetchAndUpdateActiveOrders,
    isLoading,
  } = useMainContext();
  const { enqueueSnackbar } = useSnackbar();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const apartment = useMemo(
    () =>
      (cars || []).find(
        (c) =>
          c?.slug &&
          String(c.slug).toLowerCase() === String(apartmentSlug).toLowerCase()
      ) || null,
    [cars, apartmentSlug]
  );

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

  const current = photos[Math.min(photoIndex, Math.max(photos.length - 1, 0))];
  const priceFrom = getApartmentPriceFrom(apartment);

  const facts = [
    guestsLabel(apartment?.seats),
    bedsLabel(apartment),
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

  const orders = useMemo(
    () => (apartment?._id ? ordersByCarId(apartment._id) : []),
    [ordersByCarId, apartment?._id]
  );

  const go = (dir) => {
    setPhotoIndex((i) => {
      const next = i + dir;
      if (next < 0) return photos.length - 1;
      if (next >= photos.length) return 0;
      return next;
    });
  };

  const handleRequest = () => {
    if (!stayCheckIn || !stayCheckOut) {
      enqueueSnackbar("Choose check-in and check-out dates above first.", {
        variant: "info",
      });
      document
        .getElementById("stay-date-search")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setModalOpen(true);
  };

  if (!apartment) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <Typography sx={{ color: "text.secondary" }}>Loading suite…</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ pb: { xs: 6, md: 10 } }}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: "52vh", md: "68vh" },
          minHeight: { xs: 320, md: 480 },
          bgcolor: "#1A1612",
          overflow: "hidden",
        }}
      >
        {isHttp(current) ? (
          <Image
            src={current}
            alt={apartment.model || "Suite"}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <CldImage
            src={current || CLOUDINARY_PLACEHOLDER_PUBLIC_ID}
            alt={apartment.model || "Suite"}
            fill
            crop="fill"
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
        )}

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(14,12,10,0.15) 0%, rgba(14,12,10,0.55) 100%)",
            pointerEvents: "none",
          }}
        />

        {photos.length > 1 && (
          <>
            <IconButton
              aria-label="Previous photo"
              onClick={() => go(-1)}
              sx={{
                position: "absolute",
                left: { xs: 8, md: 20 },
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
                right: { xs: 8, md: 20 },
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
                bottom: 16,
                right: 20,
                color: "rgba(245,240,230,0.92)",
                fontSize: "0.85rem",
                letterSpacing: "0.08em",
              }}
            >
              {photoIndex + 1} / {photos.length}
            </Typography>
          </>
        )}
      </Box>

      {photos.length > 1 && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            px: { xs: 2, md: 4 },
            py: 1.5,
            overflowX: "auto",
            bgcolor: "#FFFCFA",
          }}
        >
          {photos.map((src, i) => (
            <Box
              key={`${src}-${i}`}
              onClick={() => setPhotoIndex(i)}
              sx={{
                position: "relative",
                width: 72,
                height: 54,
                flexShrink: 0,
                cursor: "pointer",
                opacity: i === photoIndex ? 1 : 0.55,
                outline:
                  i === photoIndex
                    ? "2px solid"
                    : "1px solid rgba(26,22,18,0.12)",
                outlineColor: i === photoIndex ? "primary.main" : undefined,
                outlineOffset: 1,
                overflow: "hidden",
              }}
            >
              {isHttp(src) ? (
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="72px"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <CldImage
                  src={src}
                  alt=""
                  fill
                  crop="fill"
                  sizes="72px"
                  style={{ objectFit: "cover" }}
                />
              )}
            </Box>
          ))}
        </Box>
      )}

      <Container maxWidth="md" sx={{ pt: { xs: 3.5, md: 5 }, px: { xs: 2.5, md: 3 } }}>
        <Typography
          component={Link}
          href={`/${locale}/apartments`}
          sx={{
            display: "inline-block",
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "primary.dark",
            textDecoration: "none",
            mb: 2,
            "&:hover": { color: "primary.main" },
          }}
        >
          ← All suites
        </Typography>

        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: { xs: "2.15rem", md: "3rem" },
            color: "secondary.main",
            lineHeight: 1.1,
            mb: 1.25,
          }}
        >
          {apartment.model}
        </Typography>

        {facts.length > 0 && (
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "1rem",
              letterSpacing: "0.02em",
              mb: 1.75,
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
              fontSize: "1.5rem",
              color: "secondary.main",
              mb: 2.5,
            }}
          >
            from €{priceFrom}
            <Box
              component="span"
              sx={{
                fontFamily: "var(--font-body)",
                fontStyle: "normal",
                fontSize: "0.9rem",
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
              fontSize: { xs: "1rem", md: "1.05rem" },
              lineHeight: 1.7,
              mb: 3,
              maxWidth: 640,
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
            sx={{ mb: 3.5 }}
          >
            {amenities.map((a) => (
              <Box
                key={a}
                component="span"
                sx={{
                  px: 1.2,
                  py: 0.5,
                  fontSize: "0.72rem",
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
          variant="contained"
          onClick={handleRequest}
          sx={{
            px: 3.25,
            py: 1.2,
            fontWeight: 600,
            letterSpacing: "0.05em",
            boxShadow: "none",
            bgcolor: "secondary.main",
            color: "#F5F0E6",
            "&:hover": {
              bgcolor: "#2A2218",
              boxShadow: "0 8px 24px rgba(26,22,18,0.28)",
            },
          }}
        >
          Request stay
        </Button>
      </Container>

      {relatedSuites.length > 0 && (
        <Container maxWidth="lg" sx={{ mt: { xs: 6, md: 8 }, px: { xs: 2, md: 4 } }}>
          <Typography
            sx={{
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "primary.dark",
              mb: 2,
            }}
          >
            Other suites
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "repeat(4, 1fr)",
              },
              gap: 2,
            }}
          >
            {relatedSuites.map((suite) => {
              const href = getApartmentPath(locale, suite.slug);
              const photo = suite.photoUrl || CLOUDINARY_PLACEHOLDER_PUBLIC_ID;
              const http = isHttp(photo);
              return (
                <Box
                  key={suite.slug}
                  component={Link}
                  href={href}
                  sx={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "block",
                    border: "1px solid rgba(26,22,18,0.08)",
                    overflow: "hidden",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 28px rgba(26,22,18,0.1)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "4/3",
                      bgcolor: "#1A1612",
                    }}
                  >
                    {http ? (
                      <Image
                        src={photo}
                        alt={suite.model || "Suite"}
                        fill
                        sizes="(max-width: 600px) 100vw, 25vw"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <CldImage
                        src={photo}
                        alt={suite.model || "Suite"}
                        fill
                        crop="fill"
                        sizes="(max-width: 600px) 100vw, 25vw"
                        style={{ objectFit: "cover" }}
                      />
                    )}
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography
                      sx={{
                        fontFamily: "var(--font-display)",
                        fontStyle: "italic",
                        fontSize: "1.15rem",
                        color: "secondary.main",
                      }}
                    >
                      {suite.model}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Container>
      )}

      {modalOpen && stayCheckIn && stayCheckOut && (
        <Suspense fallback={null}>
          <BookingModal
            fetchAndUpdateOrders={fetchAndUpdateActiveOrders}
            open={modalOpen}
            car={apartment}
            orders={orders}
            presetDates={{
              startDate: dayjs(stayCheckIn),
              endDate: dayjs(stayCheckOut),
            }}
            isLoading={isLoading}
            selectedTimes={{ start: null, end: null }}
            onClose={() => setModalOpen(false)}
          />
        </Suspense>
      )}
    </Box>
  );
}
