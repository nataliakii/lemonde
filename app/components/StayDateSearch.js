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

function isPastDay(date, today) {
  return Boolean(date && date.isValid() && date.isBefore(today, "day"));
}

const fieldSx = {
  minWidth: { xs: "100%", sm: 156 },
  bgcolor: "rgba(255,255,255,0.06)",
  borderRadius: 1,
  "& .MuiOutlinedInput-root": {
    color: "#F5F0E6",
    cursor: "pointer",
    "& fieldset": { borderColor: "rgba(201,162,39,0.35)" },
    "&:hover fieldset": { borderColor: "rgba(201,162,39,0.55)" },
    "&.Mui-focused fieldset": { borderColor: "rgba(201,162,39,0.85)" },
  },
  "& .MuiInputLabel-root": { color: "rgba(232,213,163,0.75)" },
  "& .MuiInputBase-input": { cursor: "pointer" },
};

/**
 * Booking-style stay search: Check-in + Check-out open one shared range calendar.
 * Community MUI only (no Pro license watermark).
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
          onClick={(e) => setAnchorEl(e.currentTarget)}
          inputProps={{ readOnly: true }}
          sx={fieldSx}
        />
        <TextField
          size="small"
          label="Check-out"
          value={checkOutLabel}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          inputProps={{ readOnly: true }}
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
              boxShadow: "0 4px 16px rgba(201,162,39,0.35)",
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
              color: "rgba(232,213,163,0.8)",
              textTransform: "none",
              "&:hover": { color: "#E8D5A3", bgcolor: "transparent" },
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
              border: "1px solid rgba(201,162,39,0.25)",
              boxShadow: "0 16px 48px rgba(26,22,18,0.28)",
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
          Available suites for{" "}
          <Box component="span" sx={{ color: "#E8D5A3", fontWeight: 600 }}>
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
