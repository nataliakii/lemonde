"use client";

import { useMemo, useState } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

function RangeDay(props) {
  const theme = useTheme();
  const {
    day,
    outsideCurrentMonth,
    rangeStart,
    rangeEnd,
    selected,
    ...other
  } = props;

  const primary = theme.palette.primary.main;
  const contrast = theme.palette.primary.contrastText || "#111";

  const isStart =
    rangeStart && day.isSame(rangeStart, "day") && !outsideCurrentMonth;
  const isEnd = rangeEnd && day.isSame(rangeEnd, "day") && !outsideCurrentMonth;
  const inMiddle =
    rangeStart &&
    rangeEnd &&
    day.isBetween(rangeStart, rangeEnd, "day", "()") &&
    !outsideCurrentMonth;

  return (
    <PickersDay
      {...other}
      day={day}
      outsideCurrentMonth={outsideCurrentMonth}
      selected={Boolean(isStart || isEnd || selected)}
      sx={{
        ...(inMiddle
          ? {
              bgcolor: `${alpha(primary, 0.16)} !important`,
              borderRadius: 0,
              color: "text.primary",
            }
          : null),
        ...(isStart || isEnd
          ? {
              bgcolor: `${primary} !important`,
              color: `${contrast} !important`,
              fontWeight: 700,
            }
          : null),
        "&.Mui-disabled": {
          opacity: 0.32,
          textDecoration: "line-through",
        },
      }}
    />
  );
}

/**
 * Check-in / check-out on one calendar.
 * First click = check-in, second = check-out.
 */
export default function StayRangeCalendar({
  value = [null, null],
  onChange,
  shouldDisableDate,
  minDate,
  calendars,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const calendarCount = calendars ?? (isMobile ? 1 : 2);
  const [monthLeft, setMonthLeft] = useState(() =>
    (value?.[0] && dayjs(value[0]).isValid()
      ? dayjs(value[0])
      : dayjs()
    ).startOf("month")
  );

  const rangeStart =
    value?.[0] && dayjs(value[0]).isValid() ? dayjs(value[0]) : null;
  const rangeEnd =
    value?.[1] && dayjs(value[1]).isValid() ? dayjs(value[1]) : null;

  const handleSelect = (day) => {
    if (!day || !day.isValid()) return;
    if (shouldDisableDate?.(day)) return;

    if (!rangeStart || (rangeStart && rangeEnd)) {
      onChange?.([day.startOf("day"), null]);
      return;
    }

    if (day.isBefore(rangeStart, "day")) {
      onChange?.([day.startOf("day"), null]);
      return;
    }

    if (day.isSame(rangeStart, "day")) {
      onChange?.([null, null]);
      return;
    }

    onChange?.([rangeStart, day.startOf("day")]);
  };

  const months = useMemo(() => {
    return Array.from({ length: calendarCount }, (_, i) =>
      monthLeft.add(i, "month")
    );
  }, [calendarCount, monthLeft]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: { xs: "center", md: "flex-start" },
          gap: { xs: 1, md: 0 },
          bgcolor: "#FFFFFF",
          overflow: "hidden",
        }}
      >
        {months.map((month, index) => (
          <DateCalendar
            key={month.format("YYYY-MM")}
            value={null}
            referenceDate={month}
            onChange={handleSelect}
            minDate={minDate}
            shouldDisableDate={shouldDisableDate}
            views={["day"]}
            fixedWeekNumber={6}
            onMonthChange={(newMonth) => {
              if (index === 0) {
                setMonthLeft(dayjs(newMonth).startOf("month"));
              } else {
                setMonthLeft(
                  dayjs(newMonth).subtract(index, "month").startOf("month")
                );
              }
            }}
            slots={{ day: RangeDay }}
            slotProps={{
              day: {
                rangeStart,
                rangeEnd,
              },
            }}
            sx={{
              maxWidth: 320,
              "& .MuiPickersCalendarHeader-root": {
                color: "text.primary",
              },
              "& .MuiPickersArrowSwitcher-button": {
                color: "primary.main",
              },
              "& .MuiDayCalendar-weekDayLabel": {
                color: "text.secondary",
              },
            }}
          />
        ))}
      </Box>
    </LocalizationProvider>
  );
}
