"use client";

import { useState, useEffect, useMemo } from "react";
import { Box, Button, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useMainContext } from "@app/Context";

function isPastDay(date, today) {
  return Boolean(date && date.isValid() && date.isBefore(today, "day"));
}

/**
 * Check-in / check-out search for apartment catalog.
 * Past dates are not selectable.
 */
export default function StayDateSearch() {
  const { stayCheckIn, stayCheckOut, setStayDates, clearStayDates } =
    useMainContext();
  const today = useMemo(() => dayjs().startOf("day"), []);
  const [checkIn, setCheckIn] = useState(() => {
    const v = stayCheckIn ? dayjs(stayCheckIn) : null;
    return isPastDay(v, today) ? null : v;
  });
  const [checkOut, setCheckOut] = useState(() => {
    const v = stayCheckOut ? dayjs(stayCheckOut) : null;
    return isPastDay(v, today) ? null : v;
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const nextIn = stayCheckIn ? dayjs(stayCheckIn) : null;
    const nextOut = stayCheckOut ? dayjs(stayCheckOut) : null;
    if (isPastDay(nextIn, today) || isPastDay(nextOut, today)) {
      clearStayDates();
      setCheckIn(null);
      setCheckOut(null);
      return;
    }
    setCheckIn(nextIn);
    setCheckOut(nextOut);
  }, [stayCheckIn, stayCheckOut, today, clearStayDates]);

  const handleCheckInChange = (v) => {
    if (isPastDay(v, today)) {
      setError("Check-in cannot be in the past.");
      return;
    }
    setError("");
    setCheckIn(v);
    if (v && checkOut && !checkOut.isAfter(v, "day")) {
      setCheckOut(v.add(1, "day"));
    }
  };

  const handleCheckOutChange = (v) => {
    if (isPastDay(v, today)) {
      setError("Check-out cannot be in the past.");
      return;
    }
    setError("");
    setCheckOut(v);
  };

  const handleSearch = () => {
    setError("");
    if (!checkIn || !checkOut) {
      setError("Select check-in and check-out dates.");
      return;
    }
    if (isPastDay(checkIn, today)) {
      setError("Check-in cannot be in the past.");
      return;
    }
    if (isPastDay(checkOut, today)) {
      setError("Check-out cannot be in the past.");
      return;
    }
    if (!checkOut.isAfter(checkIn, "day")) {
      setError("Check-out must be after check-in.");
      return;
    }
    setStayDates({
      checkIn: checkIn.format("YYYY-MM-DD"),
      checkOut: checkOut.format("YYYY-MM-DD"),
    });
  };

  const handleClear = () => {
    setCheckIn(null);
    setCheckOut(null);
    setError("");
    clearStayDates();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        component="section"
        sx={{
          position: "relative",
          px: { xs: 2, md: 4 },
          py: { xs: 2.5, md: 3 },
          mb: { xs: 2, md: 3 },
          background: `
            linear-gradient(135deg, rgba(26,22,18,0.97) 0%, rgba(42,34,24,0.95) 55%, rgba(26,22,18,0.98) 100%)
          `,
          borderBottom: "1px solid rgba(201,162,39,0.28)",
          boxShadow: "0 12px 40px rgba(26,22,18,0.12)",
        }}
      >
        <Typography
          sx={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: { xs: "1.35rem", md: "1.6rem" },
            color: "rgba(232,213,163,0.95)",
            mb: 0.5,
          }}
        >
          Find your stay
        </Typography>
        <Typography
          sx={{
            color: "rgba(245,240,230,0.65)",
            fontSize: "0.92rem",
            mb: 2,
            maxWidth: 480,
          }}
        >
          Choose dates to see available suites. Check-in 15:00 · Check-out 11:00
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            alignItems: "flex-start",
          }}
        >
          <DatePicker
            label="Check-in"
            value={checkIn}
            onChange={handleCheckInChange}
            minDate={today}
            disablePast
            shouldDisableDate={(date) => isPastDay(date, today)}
            slotProps={{
              textField: {
                size: "small",
                inputProps: { readOnly: true },
                sx: {
                  minWidth: { xs: "100%", sm: 168 },
                  bgcolor: "rgba(255,255,255,0.06)",
                  borderRadius: 1,
                  "& .MuiOutlinedInput-root": {
                    color: "#F5F0E6",
                    "& fieldset": { borderColor: "rgba(201,162,39,0.35)" },
                    "&:hover fieldset": { borderColor: "rgba(201,162,39,0.55)" },
                  },
                  "& .MuiInputLabel-root": { color: "rgba(232,213,163,0.75)" },
                  "& .MuiSvgIcon-root": { color: "rgba(201,162,39,0.85)" },
                },
              },
            }}
          />
          <DatePicker
            label="Check-out"
            value={checkOut}
            onChange={handleCheckOutChange}
            minDate={checkIn ? checkIn.add(1, "day") : today.add(1, "day")}
            disablePast
            shouldDisableDate={(date) => {
              if (isPastDay(date, today)) return true;
              if (checkIn && !date.isAfter(checkIn, "day")) return true;
              return false;
            }}
            slotProps={{
              textField: {
                size: "small",
                inputProps: { readOnly: true },
                sx: {
                  minWidth: { xs: "100%", sm: 168 },
                  bgcolor: "rgba(255,255,255,0.06)",
                  borderRadius: 1,
                  "& .MuiOutlinedInput-root": {
                    color: "#F5F0E6",
                    "& fieldset": { borderColor: "rgba(201,162,39,0.35)" },
                    "&:hover fieldset": { borderColor: "rgba(201,162,39,0.55)" },
                  },
                  "& .MuiInputLabel-root": { color: "rgba(232,213,163,0.75)" },
                  "& .MuiSvgIcon-root": { color: "rgba(201,162,39,0.85)" },
                },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{
              minWidth: 120,
              height: 40,
              px: 2.5,
              fontWeight: 600,
              letterSpacing: "0.04em",
              bgcolor: "primary.main",
              color: "secondary.main",
              boxShadow: "none",
              "&:hover": {
                bgcolor: "primary.light",
                boxShadow: "0 4px 16px rgba(201,162,39,0.35)",
              },
            }}
          >
            Search
          </Button>
          {(stayCheckIn || stayCheckOut) && (
            <Button
              variant="text"
              onClick={handleClear}
              sx={{
                height: 40,
                color: "rgba(232,213,163,0.8)",
                textTransform: "none",
                "&:hover": { color: "#E8D5A3", bgcolor: "transparent" },
              }}
            >
              Clear dates
            </Button>
          )}
        </Box>

        {error ? (
          <Typography sx={{ color: "#E8A090", mt: 1.5, fontSize: "0.875rem" }}>
            {error}
          </Typography>
        ) : null}

        {stayCheckIn && stayCheckOut ? (
          <Typography
            sx={{
              mt: 1.75,
              color: "rgba(232,213,163,0.9)",
              fontSize: "0.9rem",
              letterSpacing: "0.02em",
            }}
          >
            Showing suites for{" "}
            <Box component="span" sx={{ color: "#E8D5A3", fontWeight: 600 }}>
              {dayjs(stayCheckIn).format("D MMM")} –{" "}
              {dayjs(stayCheckOut).format("D MMM YYYY")}
            </Box>
            {` · ${dayjs(stayCheckOut).diff(dayjs(stayCheckIn), "day")} night${
              dayjs(stayCheckOut).diff(dayjs(stayCheckIn), "day") === 1
                ? ""
                : "s"
            }`}
          </Typography>
        ) : null}
      </Box>
    </LocalizationProvider>
  );
}
