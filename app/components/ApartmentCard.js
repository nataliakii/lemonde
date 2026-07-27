"use client";

import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  CircularProgress,
  IconButton,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CldImage } from "next-cloudinary";
import { CLOUDINARY_PLACEHOLDER_PUBLIC_ID } from "@config/cloudinary";
import { isDirectImageSrc } from "@/domain/media/imageSrc";
import { useMainContext } from "@app/Context";
import { getApartmentPriceFrom } from "@utils/stayAvailability";
import { getApartmentPath } from "@domain/locationSeo/locationSeoService";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";

const BookingModal = lazy(() =>
  import("@app/components/CarComponent/BookingModal")
);

function buildApartmentPhotos(apartment) {
  const list = [];
  if (apartment?.photoUrl) list.push(apartment.photoUrl);
  if (Array.isArray(apartment?.gallery)) {
    apartment.gallery.forEach((u) => {
      if (u && !list.includes(u)) list.push(u);
    });
  }
  return list.length ? list : [CLOUDINARY_PLACEHOLDER_PUBLIC_ID];
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

const ApartmentCard = React.memo(function ApartmentCard({
  apartment,
  isFirst = false,
  index = 0,
  stayPrice = null,
  stayPriceLoading = false,
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
  const [photoIndex, setPhotoIndex] = useState(0);
  const scrollerRef = useRef(null);

  const orders = useMemo(
    () => ordersByCarId(apartment._id),
    [ordersByCarId, apartment._id]
  );

  const photos = useMemo(
    () => buildApartmentPhotos(apartment),
    [apartment]
  );
  const multiPhoto = photos.length > 1;

  useEffect(() => {
    setPhotoIndex(0);
    if (scrollerRef.current) scrollerRef.current.scrollLeft = 0;
  }, [apartment?._id]);

  const priceFrom = getApartmentPriceFrom(apartment);
  const stayNights =
    stayCheckIn && stayCheckOut
      ? dayjs(stayCheckOut).diff(dayjs(stayCheckIn), "day")
      : 0;
  const stayTotal =
    stayPrice?.totalPrice != null && Number.isFinite(Number(stayPrice.totalPrice))
      ? Number(stayPrice.totalPrice)
      : null;
  const stayDays =
    stayPrice?.days > 0 ? stayPrice.days : stayNights > 0 ? stayNights : 0;

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

  const scrollToIndex = useCallback((nextIndex) => {
    const el = scrollerRef.current;
    if (!el) return;
    const width = el.clientWidth || 1;
    const clamped = Math.max(0, Math.min(photos.length - 1, nextIndex));
    el.scrollTo({ left: clamped * width, behavior: "smooth" });
    setPhotoIndex(clamped);
  }, [photos.length]);

  const handleScrollerScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const width = el.clientWidth || 1;
    const next = Math.round(el.scrollLeft / width);
    setPhotoIndex((prev) => (prev === next ? prev : next));
  }, []);

  const photo = (
    <Box
      sx={{
        gridArea: "photo",
        position: "relative",
        width: "100%",
        height: { xs: 280, sm: 340, md: "100%" },
        minHeight: { md: 380 },
        overflow: "hidden",
        bgcolor: "secondary.main",
      }}
    >
      <Box
        ref={scrollerRef}
        onScroll={handleScrollerScroll}
        sx={{
          display: "flex",
          height: "100%",
          width: "100%",
          overflowX: multiPhoto ? "auto" : "hidden",
          overflowY: "hidden",
          scrollSnapType: multiPhoto ? "x mandatory" : "none",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {photos.map((src, i) => (
          <Box
            key={`${src}-${i}`}
            component={!multiPhoto && suiteHref ? Link : "div"}
            href={!multiPhoto && suiteHref ? suiteHref : undefined}
            sx={{
              position: "relative",
              flex: "0 0 100%",
              width: "100%",
              height: "100%",
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
              display: "block",
              textDecoration: "none",
              color: "inherit",
              cursor: !multiPhoto && suiteHref ? "pointer" : "default",
            }}
          >
            {isDirectImageSrc(src) ? (
              <Image
                src={src}
                alt={`${apartment.model || "Suite"} photo ${i + 1}`}
                fill
                priority={isFirst && i === 0}
                sizes="(max-width: 900px) 100vw, 55vw"
                style={{ objectFit: "cover" }}
                className="suite-photo"
                draggable={false}
              />
            ) : (
              <CldImage
                src={src || CLOUDINARY_PLACEHOLDER_PUBLIC_ID}
                alt={`${apartment.model || "Suite"} photo ${i + 1}`}
                fill
                crop="fill"
                priority={isFirst && i === 0}
                sizes="(max-width: 900px) 100vw, 55vw"
                style={{ objectFit: "cover" }}
                className="suite-photo"
              />
            )}
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(14,12,10,0.05) 40%, rgba(14,12,10,0.35) 100%)",
          pointerEvents: "none",
        }}
      />

      {multiPhoto ? (
        <>
          <IconButton
            aria-label="Previous photo"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              scrollToIndex(photoIndex <= 0 ? photos.length - 1 : photoIndex - 1);
            }}
            sx={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
              bgcolor: "rgba(14,12,10,0.42)",
              color: "#F5F0E6",
              width: 36,
              height: 36,
              "&:hover": { bgcolor: "rgba(14,12,10,0.68)" },
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label="Next photo"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              scrollToIndex(
                photoIndex >= photos.length - 1 ? 0 : photoIndex + 1
              );
            }}
            sx={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
              bgcolor: "rgba(14,12,10,0.42)",
              color: "#F5F0E6",
              width: 36,
              height: 36,
              "&:hover": { bgcolor: "rgba(14,12,10,0.68)" },
            }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>

          <Stack
            direction="row"
            spacing={0.75}
            sx={{
              position: "absolute",
              left: "50%",
              bottom: 12,
              transform: "translateX(-50%)",
              zIndex: 2,
              px: 1,
              py: 0.5,
              borderRadius: 999,
              bgcolor: "rgba(14,12,10,0.35)",
            }}
          >
            {photos.map((_, i) => (
              <Box
                key={`dot-${i}`}
                component="button"
                type="button"
                aria-label={`Go to photo ${i + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  scrollToIndex(i);
                }}
                sx={{
                  width: i === photoIndex ? 16 : 7,
                  height: 7,
                  p: 0,
                  border: 0,
                  borderRadius: 999,
                  cursor: "pointer",
                  bgcolor:
                    i === photoIndex
                      ? "primary.main"
                      : "rgba(245,240,230,0.55)",
                  transition: "width 0.2s ease, background-color 0.2s ease",
                }}
              />
            ))}
          </Stack>

          <Typography
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 2,
              px: 1,
              py: 0.35,
              borderRadius: 1,
              bgcolor: "rgba(14,12,10,0.45)",
              color: "rgba(245,240,230,0.95)",
              fontSize: "0.72rem",
              letterSpacing: "0.06em",
              fontFamily: "var(--font-body)",
            }}
          >
            {photoIndex + 1} / {photos.length}
          </Typography>
        </>
      ) : null}
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
        background: (theme) =>
          index % 2 === 0
            ? theme.brandSurfaces?.apartmentPanelLight ||
              theme.palette.background.default
            : theme.brandSurfaces?.apartmentPanelDark ||
              theme.palette.secondary.main,
        color: (theme) =>
          index % 2 === 0
            ? "secondary.main"
            : theme.brandSurfaces?.onDark || "#F5F0E6",
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
          color: (theme) =>
            index % 2 === 0
              ? "primary.dark"
              : theme.palette.primary.light,
          opacity: index % 2 === 0 ? 1 : 0.85,
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
                color: index % 2 === 0 ? "primary.dark" : "primary.light",
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
            mb: 1.25,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {apartment.description}
        </Typography>
      ) : null}

      {Number(apartment?.transferPrice) > 0 ? (
        <Typography
          sx={{
            fontSize: "0.82rem",
            letterSpacing: "0.03em",
            opacity: 0.72,
            mb: 2,
          }}
        >
          Airport transfer €{Number(apartment.transferPrice)}
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
        {stayPriceLoading ? (
          <Stack direction="row" alignItems="center" spacing={1}>
            <CircularProgress
              size={20}
              thickness={4}
              sx={{
                color: index % 2 === 0 ? "primary.dark" : "primary.main",
              }}
            />
            <Typography
              sx={{
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
                opacity: 0.7,
              }}
            >
              Calculating price…
            </Typography>
          </Stack>
        ) : stayTotal != null ? (
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "1.55rem",
              fontWeight: 500,
              color: index % 2 === 0 ? "secondary.main" : "primary.light",
            }}
          >
            €{Math.round(stayTotal)}
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
              {stayDays > 0
                ? `for ${stayDays} night${stayDays === 1 ? "" : "s"}`
                : "for stay"}
            </Box>
          </Typography>
        ) : priceFrom != null ? (
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "1.55rem",
              fontWeight: 500,
              color: index % 2 === 0 ? "secondary.main" : "primary.light",
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
        ) : null}
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
              color: (theme) =>
                index % 2 === 0
                  ? theme.brandSurfaces?.onDark || "#F5F0E6"
                  : "secondary.main",
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
                color: index % 2 === 0 ? "secondary.main" : "primary.light",
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
