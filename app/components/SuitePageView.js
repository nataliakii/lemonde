"use client";

import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Container,
  CircularProgress,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Image from "next/image";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import StayRangeCalendar from "@app/components/StayRangeCalendar";
import { CLOUDINARY_PLACEHOLDER_PUBLIC_ID } from "@config/cloudinary";
import { useMainContext } from "@app/Context";
import {
  getApartmentPriceFrom,
  isApartmentAvailableForStay,
} from "@utils/stayAvailability";
import { getOccupiedNightKeys } from "@utils/suiteBlockedNights";
import { getApartmentPath } from "@domain/locationSeo/locationSeoService";
import { calculateTotalPrice } from "@utils/action";
import { buildBookingPriceSummary } from "@/domain/orders/bookingPriceSummary";
import { softPageBackground } from "@/domain/branding/brandSurfaces";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import { isDirectImageSrc as isHttp } from "@/domain/media/imageSrc";

const BookingModal = lazy(() =>
  import("@app/components/CarComponent/BookingModal")
);

function isPastDay(date, today) {
  return Boolean(date && date.isValid() && date.isBefore(today, "day"));
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
  initialApartment = null,
}) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const primaryLight = theme.palette.primary.light;
  const secondary = theme.palette.secondary.main;
  const {
    cars,
    stayCheckIn,
    stayCheckOut,
    setStayDates,
    ordersByCarId,
    fetchAndUpdateActiveOrders,
    isLoading,
  } = useMainContext();
  const { enqueueSnackbar } = useSnackbar();
  const today = useMemo(() => dayjs().startOf("day"), []);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [range, setRange] = useState(() => [
    stayCheckIn ? dayjs(stayCheckIn) : null,
    stayCheckOut ? dayjs(stayCheckOut) : null,
  ]);
  const [stayPrice, setStayPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);

  // Keep calendar inventory in sync (SSR orders can be missing after client nav).
  useEffect(() => {
    if (typeof fetchAndUpdateActiveOrders === "function") {
      fetchAndUpdateActiveOrders();
    }
  }, [fetchAndUpdateActiveOrders]);

  const apartment = useMemo(() => {
    const fromCars = (cars || []).find(
      (c) =>
        c?.slug &&
        String(c.slug).toLowerCase() === String(apartmentSlug).toLowerCase()
    );
    return fromCars || initialApartment || null;
  }, [cars, apartmentSlug, initialApartment]);

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

  useEffect(() => {
    const nextIn = stayCheckIn ? dayjs(stayCheckIn) : null;
    const nextOut = stayCheckOut ? dayjs(stayCheckOut) : null;
    setRange([nextIn, nextOut]);
  }, [stayCheckIn, stayCheckOut]);

  const checkInStr = range[0]?.isValid?.()
    ? range[0].format("YYYY-MM-DD")
    : null;
  const checkOutStr = range[1]?.isValid?.()
    ? range[1].format("YYYY-MM-DD")
    : null;
  const hasDates = Boolean(checkInStr && checkOutStr);

  const occupiedNights = useMemo(
    () => getOccupiedNightKeys(orders),
    [orders]
  );

  const isAvailable = useMemo(() => {
    if (!hasDates || !apartment) return null;
    return isApartmentAvailableForStay(orders, checkInStr, checkOutStr);
  }, [hasDates, apartment, orders, checkInStr, checkOutStr]);

  const nightCount = hasDates
    ? dayjs(checkOutStr).diff(dayjs(checkInStr), "day")
    : 0;

  const isDateBlocked = useCallback(
    (date) => {
      if (isPastDay(date, today)) return true;
      const ymd = date.format("YYYY-MM-DD");
      const start = range[0];
      const end = range[1];

      // Choosing check-out: every night in [checkIn, checkOut) must be free.
      if (start?.isValid?.() && !end?.isValid?.()) {
        if (!date.isAfter(start, "day")) return true;
        let cursor = start.startOf("day");
        while (cursor.isBefore(date, "day")) {
          if (occupiedNights.has(cursor.format("YYYY-MM-DD"))) return true;
          cursor = cursor.add(1, "day");
        }
        // Check-out morning itself may be another guest's check-in — allowed.
        return false;
      }

      // Complete selection: keep endpoints usable; only occupy real stay nights.
      if (start?.isValid?.() && end?.isValid?.()) {
        if (date.isSame(end, "day")) return false;
      }

      return occupiedNights.has(ymd);
    },
    [occupiedNights, range, today]
  );

  useEffect(() => {
    if (!apartment?._id || !hasDates || isAvailable === false) {
      setStayPrice(null);
      setPriceLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let cancelled = false;
    setPriceLoading(true);
    setStayPrice(null);

    const carId =
      apartment?._id?.toString?.() ||
      apartment?.carNumber ||
      apartment?.regNumber ||
      "";

    (async () => {
      const result = await calculateTotalPrice(
        carId,
        checkInStr,
        checkOutStr,
        "TPL",
        0,
        { signal: controller.signal }
      );
      if (cancelled || controller.signal.aborted) return;
      if (result?.ok) {
        setStayPrice(buildBookingPriceSummary(result));
      } else {
        setStayPrice(null);
      }
      setPriceLoading(false);
    })().catch(() => {
      if (!cancelled && !controller.signal.aborted) {
        setStayPrice(null);
        setPriceLoading(false);
      }
    });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    apartment?._id,
    apartment?.carNumber,
    apartment?.regNumber,
    hasDates,
    isAvailable,
    checkInStr,
    checkOutStr,
  ]);

  const applyRange = useCallback(
    (nextIn, nextOut) => {
      if (!nextIn || !nextOut || !nextOut.isAfter(nextIn, "day")) return false;
      if (isPastDay(nextIn, today) || isPastDay(nextOut, today)) return false;
      const inStr = nextIn.format("YYYY-MM-DD");
      const outStr = nextOut.format("YYYY-MM-DD");
      if (!isApartmentAvailableForStay(orders, inStr, outStr)) {
        enqueueSnackbar("This suite is not available for these dates.", {
          variant: "warning",
        });
        return false;
      }
      setStayDates({ checkIn: inStr, checkOut: outStr });
      return true;
    },
    [enqueueSnackbar, orders, setStayDates, today]
  );

  const handleRangeChange = (nextRange) => {
    const nextIn = nextRange?.[0] || null;
    const nextOut = nextRange?.[1] || null;

    if (!nextIn || !nextOut) {
      setRange([nextIn, nextOut]);
      return;
    }

    const ok = applyRange(nextIn, nextOut);
    if (ok) {
      setRange([nextIn, nextOut]);
      setModalOpen(true);
    } else {
      // Keep check-in, clear invalid check-out so the guest can try again
      setRange([nextIn, null]);
    }
  };

  const handleModalDatesChange = useCallback(
    ({ startDate, endDate }) => {
      if (!startDate || !endDate) return;
      const inStr = dayjs(startDate).format("YYYY-MM-DD");
      const outStr = dayjs(endDate).format("YYYY-MM-DD");
      setRange([dayjs(inStr), dayjs(outStr)]);
      setStayDates({ checkIn: inStr, checkOut: outStr });
    },
    [setStayDates]
  );

  const go = (dir) => {
    setPhotoIndex((i) => {
      const next = i + dir;
      if (next < 0) return photos.length - 1;
      if (next >= photos.length) return 0;
      return next;
    });
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
          bgcolor: "secondary.main",
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
              "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.5) 100%)",
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
                bgcolor: "rgba(0,0,0,0.4)",
                color: "#FFFFFF",
                "&:hover": { bgcolor: "rgba(0,0,0,0.62)" },
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
                bgcolor: "rgba(0,0,0,0.4)",
                color: "#FFFFFF",
                "&:hover": { bgcolor: "rgba(0,0,0,0.62)" },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
            <Typography
              sx={{
                position: "absolute",
                bottom: 16,
                right: 20,
                color: "rgba(255,255,255,0.92)",
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
                    : `1px solid ${alpha(secondary, 0.14)}`,
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

        {priceFrom != null && !hasDates && (
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "1.5rem",
              color: "secondary.main",
              mb: 1,
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

        {Number(apartment?.transferPrice) > 0 ? (
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.92rem",
              letterSpacing: "0.02em",
              mb: 2.5,
            }}
          >
            Airport transfer €{Number(apartment.transferPrice)}
          </Typography>
        ) : null}

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
                  border: `1px solid ${alpha(secondary, 0.16)}`,
                  color: secondary,
                  bgcolor: alpha(primary, 0.08),
                }}
              >
                {a}
              </Box>
            ))}
          </Stack>
        )}

        <Box
          id="suite-booking"
          sx={{
            mt: 1,
            mb: 2,
            p: { xs: 2, md: 2.5 },
            maxWidth: { xs: "100%", md: 720 },
            border: `1px solid ${alpha(primary, 0.35)}`,
            background:
              theme.brandSurfaces?.apartmentPanelLight ||
              `linear-gradient(160deg, ${softPageBackground(primaryLight, 6)} 0%, ${softPageBackground(primaryLight, 16)} 100%)`,
            boxShadow: `0 10px 32px ${alpha(secondary, 0.08)}`,
          }}
        >
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "1.35rem",
              color: "secondary.main",
              mb: 0.5,
            }}
          >
            Book this suite
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.9rem",
              mb: 1.25,
            }}
          >
            Select check-in, then check-out — booked nights are disabled. The
            request form opens as soon as your stay is available. Check-in
            15:00 · Check-out 11:00
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            sx={{ mb: 1.5, flexWrap: "wrap", gap: 1 }}
          >
            <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  mr: 0.75,
                  bgcolor: "primary.main",
                  verticalAlign: "middle",
                }}
              />
              Selected stay
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  mr: 0.75,
                  bgcolor: alpha(secondary, 0.18),
                  verticalAlign: "middle",
                }}
              />
              Unavailable
            </Typography>
          </Stack>

          <StayRangeCalendar
            value={range}
            onChange={handleRangeChange}
            minDate={today}
            shouldDisableDate={isDateBlocked}
          />

          {hasDates ? (
            <Box sx={{ mt: 2 }}>
              {isAvailable === false ? (
                <Typography sx={{ color: "#B5473A", fontSize: "0.92rem" }}>
                  Not available for{" "}
                  {dayjs(checkInStr).format("D MMM")} –{" "}
                  {dayjs(checkOutStr).format("D MMM YYYY")}
                  {nightCount > 0
                    ? ` · ${nightCount} night${nightCount === 1 ? "" : "s"}`
                    : ""}
                  . Try other dates.
                </Typography>
              ) : (
                <Stack spacing={0.75}>
                  <Typography
                    sx={{
                      color: "secondary.main",
                      fontSize: "0.92rem",
                      fontWeight: 600,
                    }}
                  >
                    Available for{" "}
                    {dayjs(checkInStr).format("D MMM")} –{" "}
                    {dayjs(checkOutStr).format("D MMM YYYY")}
                    {nightCount > 0
                      ? ` · ${nightCount} night${nightCount === 1 ? "" : "s"}`
                      : ""}
                  </Typography>
                  {priceLoading ? (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CircularProgress size={18} sx={{ color: "primary.main" }} />
                      <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
                        Calculating price…
                      </Typography>
                    </Stack>
                  ) : stayPrice?.totalPrice != null ? (
                    <Typography
                      sx={{
                        fontFamily: "var(--font-display)",
                        fontStyle: "italic",
                        fontSize: "1.55rem",
                        color: "secondary.main",
                      }}
                    >
                      €{Math.round(Number(stayPrice.totalPrice))}
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
                        for {stayPrice.days || nightCount} night
                        {(stayPrice.days || nightCount) === 1 ? "" : "s"}
                      </Box>
                    </Typography>
                  ) : priceFrom != null ? (
                    <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
                      from €{priceFrom} / night
                    </Typography>
                  ) : null}
                </Stack>
              )}
            </Box>
          ) : (
            <Typography sx={{ mt: 1.5, color: "text.secondary", fontSize: "0.9rem" }}>
              Tap a free night for check-in, then another for check-out.
            </Typography>
          )}
        </Box>
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
                    border: `1px solid ${alpha(secondary, 0.1)}`,
                    overflow: "hidden",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 12px 28px ${alpha(secondary, 0.12)}`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "4/3",
                      bgcolor: "secondary.main",
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

      {modalOpen && hasDates && isAvailable !== false && (
        <Suspense fallback={null}>
          <BookingModal
            fetchAndUpdateOrders={fetchAndUpdateActiveOrders}
            open={modalOpen}
            car={apartment}
            orders={orders}
            presetDates={{
              startDate: dayjs(checkInStr),
              endDate: dayjs(checkOutStr),
            }}
            onDatesChange={handleModalDatesChange}
            isLoading={isLoading}
            selectedTimes={{ start: null, end: null }}
            onClose={() => setModalOpen(false)}
          />
        </Suspense>
      )}
    </Box>
  );
}
