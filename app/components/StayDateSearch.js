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
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import dayjs from "dayjs";
import { useMainContext } from "@app/Context";
import StayRangeCalendar from "@app/components/StayRangeCalendar";

function isPastDay(date, today) {
  return Boolean(date && date.isValid() && date.isBefore(today, "day"));
}

/**
 * Stay search: one date-range field → one shared calendar
 * (1st click = check-in, 2nd = check-out).
 * Neutral dark, readable strip — works on any brand.
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
    if (!range[0] || !range[1]) {
      // Open calendar if dates incomplete
      const el = document.getElementById("stay-date-range-field");
      if (el) setAnchorEl(el);
      setError("Select check-in, then check-out in the calendar.");
      return;
    }
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

  const rangeLabel = (() => {
    const a = range[0]?.isValid?.() ? range[0].format("DD MMM YYYY") : "";
    const b = range[1]?.isValid?.() ? range[1].format("DD MMM YYYY") : "";
    if (a && b) return `${a}  →  ${b}`;
    if (a) return `${a}  →  check-out`;
    return "";
  })();

  const pickingStep =
    range[0] && !range[1] ? "Now pick check-out" : "First pick check-in";

  const open = Boolean(anchorEl);

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        px: { xs: 2, md: 4 },
        py: { xs: 2.5, md: 3 },
        mb: { xs: 2, md: 3 },
        background: "linear-gradient(180deg, #14181E 0%, #1B2129 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: { xs: "1.35rem", md: "1.6rem" },
          color: "#F4F6F8",
          mb: 0.5,
        }}
      >
        Find your stay
      </Typography>
      <Typography
        sx={{
          color: "rgba(244,246,248,0.72)",
          fontSize: "0.92rem",
          mb: 2,
          maxWidth: 540,
        }}
      >
        Open the calendar once — tap check-in, then check-out. Check-in 15:00 ·
        Check-out 11:00
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
          id="stay-date-range-field"
          size="small"
          label="Stay dates"
          placeholder="Select check-in → check-out"
          value={rangeLabel}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <CalendarMonthOutlinedIcon
                sx={{ mr: 1, color: "rgba(244,246,248,0.55)", fontSize: 20 }}
              />
            ),
          }}
          inputProps={{
            readOnly: true,
            "aria-haspopup": "dialog",
            "aria-expanded": open,
          }}
          sx={{
            minWidth: { xs: "100%", sm: 320 },
            flex: { sm: "1 1 320px" },
            maxWidth: 420,
            bgcolor: "rgba(255,255,255,0.06)",
            borderRadius: 1,
            "& .MuiOutlinedInput-root": {
              color: "#F4F6F8",
              cursor: "pointer",
              "& fieldset": { borderColor: "rgba(255,255,255,0.22)" },
              "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
              "&.Mui-focused fieldset": {
                borderColor: theme.palette.primary.main,
              },
            },
            "& .MuiInputLabel-root": { color: "rgba(244,246,248,0.65)" },
            "& .MuiInputBase-input": {
              cursor: "pointer",
              "&::placeholder": {
                color: "rgba(244,246,248,0.45)",
                opacity: 1,
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
              boxShadow: "none",
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
              color: "rgba(244,246,248,0.7)",
              textTransform: "none",
              "&:hover": { color: "#fff", bgcolor: "transparent" },
            }}
          >
            Clear dates
          </Button>
        )}
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.28)",
              overflow: "hidden",
              maxWidth: "calc(100vw - 24px)",
              borderRadius: 1.5,
            },
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.25,
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            bgcolor: "#F7F8FA",
          }}
        >
          <Typography
            sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#1B2129" }}
          >
            {pickingStep}
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "rgba(27,33,41,0.65)" }}>
            One calendar for both dates
          </Typography>
        </Box>
        <StayRangeCalendar
          value={range}
          onChange={handleRangeChange}
          minDate={today}
          calendars={isMobile ? 1 : 2}
          shouldDisableDate={(date) => isPastDay(date, today)}
        />
      </Popover>

      {error ? (
        <Typography sx={{ color: "#FFB4A8", mt: 1.5, fontSize: "0.875rem" }}>
          {error}
        </Typography>
      ) : null}

      {stayCheckIn && stayCheckOut ? (
        <Typography
          sx={{
            mt: 1.75,
            color: "rgba(244,246,248,0.78)",
            fontSize: "0.9rem",
            letterSpacing: "0.02em",
          }}
        >
          Available suites for{" "}
          <Box component="span" sx={{ color: "#fff", fontWeight: 600 }}>
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
