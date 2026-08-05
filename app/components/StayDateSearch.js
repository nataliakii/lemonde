"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  Popover,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import { useMainContext } from "@app/Context";
import StayRangeCalendar from "@app/components/StayRangeCalendar";
import { hexToRgba } from "@/domain/branding/brandSurfaces";

function isPastDay(date, today) {
  return Boolean(date && date.isValid() && date.isBefore(today, "day"));
}

/**
 * Booking-style stay search: Check-in + Check-out open one shared range calendar.
 * First click = check-in, second = check-out. Colors follow company theme.
 */
export default function StayDateSearch() {
  const { stayCheckIn, stayCheckOut, setStayDates, clearStayDates } =
    useMainContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const today = useMemo(() => dayjs().startOf("day"), []);
  const [range, setRange] = useState(() => {
    const nextIn = stayCheckIn ? dayjs(stayCheckIn) : null;
    const nextOut = stayCheckOut ? dayjs(stayCheckOut) : null;
    if (isPastDay(nextIn, today) || isPastDay(nextOut, today)) {
      return [null, null];
    }
    return [nextIn, nextOut];
  });
  const [error, setError] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  const primary = theme.palette.primary.main;
  const primaryLight = theme.palette.primary.light;
  const secondary = theme.palette.secondary.main;
  const secondaryDark = theme.palette.secondary.dark;
  const secondaryLight = theme.palette.secondary.light;
  const onDark =
    theme.brandSurfaces?.onDark || hexToRgba(primaryLight, 0.94);
  const onDarkMuted =
    theme.brandSurfaces?.onDarkMuted || hexToRgba(primaryLight, 0.72);

  const fieldSx = {
    minWidth: { xs: "100%", sm: 156 },
    bgcolor: hexToRgba("#ffffff", 0.06),
    borderRadius: 1,
    "& .MuiOutlinedInput-root": {
      color: onDark,
      cursor: "pointer",
      "& fieldset": { borderColor: hexToRgba(primary, 0.35) },
      "&:hover fieldset": { borderColor: hexToRgba(primary, 0.55) },
      "&.Mui-focused fieldset": { borderColor: hexToRgba(primary, 0.85) },
    },
    "& .MuiInputLabel-root": { color: onDarkMuted },
    "& .MuiInputBase-input": { cursor: "pointer" },
  };

  useEffect(() => {
    const nextIn = stayCheckIn ? dayjs(stayCheckIn) : null;
    const nextOut = stayCheckOut ? dayjs(stayCheckOut) : null;
    if (isPastDay(nextIn, today) || isPastDay(nextOut, today)) {
      clearStayDates();
      setRange([null, null]);
      return;
    }
    setRange([nextIn, nextOut]);
  }, [stayCheckIn, stayCheckOut, today, clearStayDates]);

  const applyDates = useCallback(
    (nextIn, nextOut) => {
      setError("");
      if (!nextIn || !nextOut) {
        setError("Select check-in and check-out dates.");
        return false;
      }
      if (isPastDay(nextIn, today)) {
        setError("Check-in cannot be in the past.");
        return false;
      }
      if (isPastDay(nextOut, today)) {
        setError("Check-out cannot be in the past.");
        return false;
      }
      if (!nextOut.isAfter(nextIn, "day")) {
        setError("Check-out must be after check-in.");
        return false;
      }
      const inStr = nextIn.format("YYYY-MM-DD");
      const outStr = nextOut.format("YYYY-MM-DD");
      if (stayCheckIn === inStr && stayCheckOut === outStr) return true;
      setStayDates({ checkIn: inStr, checkOut: outStr });
      return true;
    },
    [setStayDates, stayCheckIn, stayCheckOut, today]
  );

  const handleRangeChange = (nextRange) => {
    const nextIn = nextRange?.[0] || null;
    const nextOut = nextRange?.[1] || null;
    setRange([nextIn, nextOut]);
    setError("");

    if (nextIn && isPastDay(nextIn, today)) {
      setError("Check-in cannot be in the past.");
      return;
    }
    if (nextOut && isPastDay(nextOut, today)) {
      setError("Check-out cannot be in the past.");
      return;
    }
    if (nextIn && nextOut) {
      applyDates(nextIn, nextOut);
      setAnchorEl(null);
    }
  };

  const handleSearch = () => {
    applyDates(range[0], range[1]);
  };

  const handleClear = () => {
    setRange([null, null]);
    setError("");
    clearStayDates();
  };

  const openCalendar = (e) => setAnchorEl(e.currentTarget);

  const nightCount =
    stayCheckIn && stayCheckOut
      ? dayjs(stayCheckOut).diff(dayjs(stayCheckIn), "day")
      : 0;

  const checkInLabel = range[0]?.isValid?.()
    ? range[0].format("DD MMM YYYY")
    : "";
  const checkOutLabel = range[1]?.isValid?.()
    ? range[1].format("DD MMM YYYY")
    : "";

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        px: { xs: 2, md: 4 },
        py: { xs: 2.5, md: 3 },
        mb: { xs: 2, md: 3 },
        background:
          theme.brandSurfaces?.footer ||
          `linear-gradient(135deg, ${hexToRgba(secondary, 0.97)} 0%, ${hexToRgba(secondaryLight, 0.95)} 55%, ${hexToRgba(secondaryDark, 0.98)} 100%)`,
        borderBottom: `1px solid ${hexToRgba(primary, 0.28)}`,
        boxShadow: `0 12px 40px ${hexToRgba(secondaryDark, 0.18)}`,
      }}
    >
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: { xs: "1.35rem", md: "1.6rem" },
          color: onDark,
          mb: 0.5,
        }}
      >
        Find your stay
      </Typography>
      <Typography
        sx={{
          color: onDarkMuted,
          fontSize: "0.92rem",
          mb: 2,
          maxWidth: 520,
        }}
      >
        Pick check-in and check-out in one calendar to see free suites and
        prices. Check-in 15:00 · Check-out 11:00
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          alignItems: "flex-start",
        }}
      >
        <TextField
          size="small"
          label="Check-in"
          value={checkInLabel}
          onClick={openCalendar}
          inputProps={{ readOnly: true, "aria-haspopup": "dialog" }}
          sx={fieldSx}
        />
        <TextField
          size="small"
          label="Check-out"
          value={checkOutLabel}
          onClick={openCalendar}
          inputProps={{ readOnly: true, "aria-haspopup": "dialog" }}
          sx={fieldSx}
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
              boxShadow: `0 4px 16px ${hexToRgba(primary, 0.35)}`,
            },
          }}
        >
          Search
        </Button>
        {(stayCheckIn || stayCheckOut || range[0] || range[1]) && (
          <Button
            variant="text"
            onClick={handleClear}
            sx={{
              height: 40,
              color: onDarkMuted,
              textTransform: "none",
              "&:hover": { color: primaryLight, bgcolor: "transparent" },
            }}
          >
            Clear dates
          </Button>
        )}
      </Box>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              border: `1px solid ${hexToRgba(primary, 0.25)}`,
              boxShadow: `0 16px 48px ${hexToRgba(secondaryDark, 0.28)}`,
              overflow: "auto",
              maxWidth: "calc(100vw - 24px)",
            },
          },
        }}
      >
        <StayRangeCalendar
          value={range}
          onChange={handleRangeChange}
          minDate={today}
          calendars={isMobile ? 1 : 2}
          shouldDisableDate={(date) => isPastDay(date, today)}
        />
      </Popover>

      {error ? (
        <Typography
          sx={{
            color: theme.palette.error.main || "#E8A090",
            mt: 1.5,
            fontSize: "0.875rem",
          }}
        >
          {error}
        </Typography>
      ) : null}

      {stayCheckIn && stayCheckOut ? (
        <Typography
          sx={{
            mt: 1.75,
            color: onDarkMuted,
            fontSize: "0.9rem",
            letterSpacing: "0.02em",
          }}
        >
          Available suites for{" "}
          <Box component="span" sx={{ color: primaryLight, fontWeight: 600 }}>
            {dayjs(stayCheckIn).format("D MMM")} –{" "}
            {dayjs(stayCheckOut).format("D MMM YYYY")}
          </Box>
          {` · ${nightCount} night${nightCount === 1 ? "" : "s"}`}
          {" · prices calculated for these dates"}
        </Typography>
      ) : null}
    </Box>
  );
}
