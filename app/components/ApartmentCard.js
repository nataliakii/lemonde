"use client";

import React, { lazy, Suspense, useMemo, useState } from "react";
import { Box, Button, Typography, Stack } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CldImage } from "next-cloudinary";
import { CLOUDINARY_PLACEHOLDER_PUBLIC_ID } from "@config/cloudinary";
import { useMainContext } from "@app/Context";
import { getApartmentPriceFrom } from "@utils/stayAvailability";
import { getApartmentPath } from "@domain/locationSeo/locationSeoService";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";

const BookingModal = lazy(() =>
  import("@app/components/CarComponent/BookingModal")
);

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

const ApartmentCard = React.memo(function ApartmentCard({
  apartment,
  isFirst = false,
  index = 0,
}) {
  const {
    stayCheckIn,
    stayCheckOut,
    ordersByCarId,
    fetchAndUpdateActiveOrders,
    isLoading,
  } = useMainContext();
  const { enqueueSnackbar } = useSnackbar();
  const pathname = usePathname();
  const localeFromUrl = pathname?.split("/")[1];
  const locale =
    localeFromUrl && localeFromUrl.length === 2 ? localeFromUrl : "en";
  const suiteHref = apartment?.slug
    ? getApartmentPath(locale, apartment.slug)
    : null;
  const [modalOpen, setModalOpen] = useState(false);

  const orders = useMemo(
    () => ordersByCarId(apartment._id),
    [ordersByCarId, apartment._id]
  );

  const priceFrom = getApartmentPriceFrom(apartment);
  const isHttpPhoto =
    typeof apartment?.photoUrl === "string" &&
    /^https?:\/\//i.test(apartment.photoUrl);

  const meta = [
    guestsLabel(apartment.seats),
    bedsLabel(apartment),
    apartment.sizeSqm ? `${apartment.sizeSqm} m²` : null,
    apartment.bathrooms
      ? apartment.bathrooms === 1
        ? "1 bath"
        : `${apartment.bathrooms} baths`
      : null,
  ].filter(Boolean);

  const amenities = Array.isArray(apartment.amenities)
    ? apartment.amenities.slice(0, 5)
    : [];

  const imageRight = index % 2 === 1;
  const suiteNo = String(index + 1).padStart(2, "0");

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

  const photo = (
    <Box
      component={suiteHref ? Link : "div"}
      href={suiteHref || undefined}
      sx={{
        gridArea: "photo",
        position: "relative",
        width: "100%",
        height: { xs: 280, sm: 340, md: "100%" },
        minHeight: { md: 380 },
        overflow: "hidden",
        cursor: suiteHref ? "pointer" : "default",
        bgcolor: "#1A1612",
        textDecoration: "none",
        color: "inherit",
        display: "block",
      }}
    >
      {isHttpPhoto ? (
        <Image
          src={apartment.photoUrl}
          alt={apartment.model || "Suite"}
          fill
          priority={isFirst}
          sizes="(max-width: 900px) 100vw, 55vw"
          style={{
            objectFit: "cover",
            transition: "transform 0.7s ease",
          }}
          className="suite-photo"
        />
      ) : (
        <CldImage
          src={apartment?.photoUrl || CLOUDINARY_PLACEHOLDER_PUBLIC_ID}
          alt={apartment.model || "Suite"}
          fill
          crop="fill"
          priority={isFirst}
          sizes="(max-width: 900px) 100vw, 55vw"
          style={{
            objectFit: "cover",
            transition: "transform 0.7s ease",
          }}
          className="suite-photo"
        />
      )}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(14,12,10,0.05) 40%, rgba(14,12,10,0.35) 100%)",
          pointerEvents: "none",
        }}
      />
    </Box>
  );

  const copy = (
    <Box
      sx={{
        gridArea: "copy",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        px: { xs: 2.5, md: 5 },
        py: { xs: 3, md: 4.5 },
        background:
          index % 2 === 0
            ? "linear-gradient(160deg, #FFFCFA 0%, #F3F0EA 100%)"
            : "linear-gradient(200deg, #1A1612 0%, #2A2218 100%)",
        color: index % 2 === 0 ? "secondary.main" : "#F5F0E6",
        minHeight: { md: 380 },
      }}
    >
      <Typography
        sx={{
          fontFamily: "var(--font-body)",
          fontSize: "0.72rem",
          fontWeight: 600,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: index % 2 === 0 ? "primary.dark" : "rgba(232,213,163,0.85)",
          mb: 1.5,
        }}
      >
        Suite {suiteNo}
      </Typography>

      <Typography
        component={suiteHref ? Link : "h2"}
        href={suiteHref || undefined}
        sx={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: { xs: "2rem", md: "2.45rem" },
          lineHeight: 1.1,
          mb: 1.25,
          color: "inherit",
          textDecoration: "none",
          cursor: suiteHref ? "pointer" : "default",
          transition: "color 0.25s ease",
          "&:hover": suiteHref
            ? {
                color: index % 2 === 0 ? "primary.dark" : "#E8D5A3",
              }
            : undefined,
        }}
      >
        {apartment.model}
      </Typography>

      {meta.length > 0 && (
        <Typography
          sx={{
            fontSize: "0.9rem",
            letterSpacing: "0.03em",
            opacity: 0.78,
            mb: 1.5,
          }}
        >
          {meta.join("  ·  ")}
        </Typography>
      )}

      {apartment.description ? (
        <Typography
          sx={{
            fontSize: { xs: "0.95rem", md: "1.02rem" },
            lineHeight: 1.6,
            opacity: 0.82,
            maxWidth: 420,
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
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
                px: 1.1,
                py: 0.4,
                fontSize: "0.68rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                border:
                  index % 2 === 0
                    ? "1px solid rgba(26,22,18,0.14)"
                    : "1px solid rgba(232,213,163,0.28)",
                color:
                  index % 2 === 0
                    ? "secondary.light"
                    : "rgba(232,213,163,0.9)",
              }}
            >
              {a}
            </Box>
          ))}
        </Stack>
      )}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ sm: "center" }}
        spacing={2}
        sx={{ mt: "auto" }}
      >
        {priceFrom != null && (
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "1.55rem",
              fontWeight: 500,
              color: index % 2 === 0 ? "secondary.main" : "#E8D5A3",
            }}
          >
            from €{priceFrom}
            <Box
              component="span"
              sx={{
                fontFamily: "var(--font-body)",
                fontStyle: "normal",
                fontSize: "0.85rem",
                fontWeight: 500,
                ml: 0.75,
                opacity: 0.7,
              }}
            >
              / night
            </Box>
          </Typography>
        )}
        <Stack direction="row" spacing={1.25} sx={{ flexWrap: "wrap" }}>
          <Button
            variant="contained"
            onClick={handleRequest}
            sx={{
              px: 2.5,
              py: 1.05,
              fontWeight: 600,
              letterSpacing: "0.05em",
              boxShadow: "none",
              bgcolor: index % 2 === 0 ? "secondary.main" : "primary.main",
              color: index % 2 === 0 ? "#F5F0E6" : "secondary.main",
              "&:hover": {
                bgcolor: index % 2 === 0 ? "#2A2218" : "primary.light",
                boxShadow:
                  index % 2 === 0
                    ? "0 8px 24px rgba(26,22,18,0.28)"
                    : "0 8px 24px rgba(201,162,39,0.35)",
              },
            }}
          >
            Request stay
          </Button>
          {suiteHref && (
            <Button
              component={Link}
              href={suiteHref}
              variant="outlined"
              sx={{
                px: 2,
                borderColor:
                  index % 2 === 0
                    ? "rgba(26,22,18,0.22)"
                    : "rgba(232,213,163,0.4)",
                color: index % 2 === 0 ? "secondary.main" : "#E8D5A3",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor:
                    index % 2 === 0
                      ? "rgba(201,162,39,0.06)"
                      : "rgba(201,162,39,0.12)",
                },
              }}
            >
              View suite
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );

  return (
    <Box
      component="article"
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
        gridTemplateAreas: {
          xs: `"photo" "copy"`,
          md: imageRight ? `"copy photo"` : `"photo copy"`,
        },
        overflow: "hidden",
        border: "1px solid rgba(26,22,18,0.08)",
        boxShadow: "0 10px 36px rgba(26,22,18,0.06)",
        transition: "transform 0.4s ease, box-shadow 0.4s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 18px 48px rgba(26,22,18,0.12)",
          "& .suite-photo": {
            transform: "scale(1.04)",
          },
        },
      }}
    >
      {photo}
      {copy}

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
});

export default ApartmentCard;
