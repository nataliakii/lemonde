"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useDeferredValue,
} from "react";
import { Grid, Container, Typography, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

import { useMainContext } from "../Context";
import CarItemComponent from "./CarComponent/CarItemComponent";
import ApartmentCard from "./ApartmentCard";
import { carMatchesSearchQuery } from "@utils/carSearch";
import { isApartmentAvailableForStay } from "@utils/stayAvailability";
import { SINGLE_PROPERTY_MODE, DISCOUNT_UI_ENABLED } from "@config/domain";

const Section = styled("section")(() => ({
  backgroundColor: "transparent",
  textAlign: "center",
}));

import dayjs from "dayjs";

function CarGrid() {
  const { t } = useTranslation();
  const {
    cars,
    selectedClass,
    selectedTransmission,
    selectedSeats,
    carSearchQuery,
    stayCheckIn,
    stayCheckOut,
    ordersByCarId,
  } = useMainContext();
  const deferredSearchQuery = useDeferredValue(carSearchQuery || "");
  const suitesMode = SINGLE_PROPERTY_MODE;

  const skipScrollOnFilterMount = useRef(true);

  useEffect(() => {
    if (skipScrollOnFilterMount.current) {
      skipScrollOnFilterMount.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [
    selectedClass,
    selectedTransmission,
    selectedSeats,
    deferredSearchQuery,
    stayCheckIn,
    stayCheckOut,
  ]);

  const [discount, setDiscount] = useState(null);
  const [discountStart, setDiscountStart] = useState(null);
  const [discountEnd, setDiscountEnd] = useState(null);

  const fetchDiscount = useCallback(async () => {
    if (!DISCOUNT_UI_ENABLED) return;
    try {
      const res = await fetch("/api/discount");
      if (!res.ok) throw new Error("Ошибка загрузки скидки");
      const data = await res.json();
      setDiscount(data.discount || null);
      setDiscountStart(data.startDate ? dayjs(data.startDate) : null);
      setDiscountEnd(data.endDate ? dayjs(data.endDate) : null);
    } catch {
      /* optional */
    }
  }, []);

  useEffect(() => {
    if (!DISCOUNT_UI_ENABLED) return undefined;
    let timer;
    if (typeof window !== "undefined" && window.requestIdleCallback) {
      timer = window.requestIdleCallback(
        () => {
          fetchDiscount().catch(() => {});
        },
        { timeout: 2000 }
      );
    } else {
      timer = setTimeout(() => {
        fetchDiscount().catch(() => {});
      }, 100);
    }

    return () => {
      if (
        typeof window !== "undefined" &&
        window.requestIdleCallback &&
        typeof timer === "number"
      ) {
        window.cancelIdleCallback(timer);
      } else if (typeof timer !== "undefined") {
        clearTimeout(timer);
      }
    };
  }, [fetchDiscount]);

  const filteredCars = useMemo(() => {
    return cars
      .filter((car) => {
        const seatCount =
          typeof car.seats === "number" && Number.isFinite(car.seats)
            ? car.seats
            : null;
        const seatsOk =
          selectedSeats === "All" ||
          (seatCount != null && String(seatCount) === selectedSeats);
        const basicOk =
          (selectedClass === "All" || car.class === selectedClass) &&
          (selectedTransmission === "All" ||
            car.transmission === selectedTransmission) &&
          seatsOk &&
          carMatchesSearchQuery(car, deferredSearchQuery);

        if (!basicOk) return false;

        if (suitesMode && stayCheckIn && stayCheckOut) {
          return isApartmentAvailableForStay(
            ordersByCarId(car._id),
            stayCheckIn,
            stayCheckOut
          );
        }
        return true;
      })
      .sort((a, b) => {
        const sa = Number(a.sort) || 0;
        const sb = Number(b.sort) || 0;
        if (sa !== sb) return sa - sb;
        return String(a.model || "").localeCompare(String(b.model || ""));
      });
  }, [
    selectedClass,
    selectedTransmission,
    selectedSeats,
    deferredSearchQuery,
    cars,
    suitesMode,
    stayCheckIn,
    stayCheckOut,
    ordersByCarId,
  ]);

  const noCarsMatchFilters =
    Array.isArray(cars) && cars.length > 0 && filteredCars.length === 0;

  if (suitesMode) {
    return (
      <Box
        sx={{
          maxWidth: 1120,
          mx: "auto",
          mt: { xs: 1, md: 2 },
          mb: 8,
          px: { xs: 2, md: 3 },
        }}
      >
        <Section>
          {noCarsMatchFilters ? (
            <Box sx={{ py: 6, px: 2, maxWidth: 520, mx: "auto" }}>
              <Typography
                component="p"
                role="status"
                aria-live="polite"
                sx={{
                  color: "text.secondary",
                  textAlign: "center",
                  lineHeight: 1.55,
                  fontFamily: "var(--font-body)",
                }}
              >
                {stayCheckIn && stayCheckOut
                  ? "No suites available for these dates. Try different check-in or check-out."
                  : t("catalog.noCarsMatchFilters")}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 3, md: 4.5 },
              }}
            >
              {filteredCars?.map((car, index) => (
                <ApartmentCard
                  key={car._id}
                  apartment={car}
                  isFirst={index === 0}
                  index={index}
                />
              ))}
            </Box>
          )}
        </Section>
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 5 }}>
      <Section>
        <Grid
          container
          spacing={{ sm: 2, sx: 0.4 }}
          direction="column"
          sx={{ alignItems: "center", alignContent: "center" }}
        >
          {noCarsMatchFilters ? (
            <Grid item xs={12} sx={{ py: 4, px: 2, maxWidth: 560 }}>
              <Typography
                component="p"
                variant="body1"
                role="status"
                aria-live="polite"
                sx={{
                  color: "text.secondary",
                  textAlign: "center",
                  lineHeight: 1.5,
                }}
              >
                {t("catalog.noCarsMatchFilters")}
              </Typography>
            </Grid>
          ) : null}
          {filteredCars?.map((car, index) => (
            <Grid item xs={12} sx={{ padding: 2 }} key={car._id}>
              <CarItemComponent
                car={car}
                discount={discount}
                discountStart={discountStart}
                discountEnd={discountEnd}
                isFirstCar={index === 0}
              />
            </Grid>
          ))}
        </Grid>
      </Section>
    </Container>
  );
}

export default CarGrid;
