import { Box, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const formatDateTime = (date, time) => {
  if (!date) return null;

  const formattedDate = dayjs(date).format("DD.MM.YYYY");

  if (time) {
    const timeStr = time.includes("T") ? dayjs(time).format("HH:mm") : time;
    return `${formattedDate} (${timeStr})`;
  }

  return formattedDate;
};

const isDateInRange = (date, startDate, endDate) => {
  const checkDate = dayjs(date);
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  return checkDate.isAfter(start) && checkDate.isBefore(end);
};

export default function RenderConflictMessage({
  datesInRange,
  startDate,
  endDate,
  confirmed = false,
}) {
  const { t } = useTranslation();

  if (!datesInRange?.length || !startDate || !endDate) return null;

  const currentBookingStart = dayjs(startDate);
  const currentBookingEnd = dayjs(endDate);

  const startConflicts = datesInRange.filter(
    (pending) =>
      pending.isEnd &&
      dayjs(pending.date).format("YYYY-MM-DD") ===
        currentBookingStart.format("YYYY-MM-DD")
  );

  const endConflicts = datesInRange.filter(
    (pending) =>
      pending.isStart &&
      dayjs(pending.date).format("YYYY-MM-DD") ===
        currentBookingEnd.format("YYYY-MM-DD")
  );

  const internalConflicts = datesInRange.filter((pending) => {
    const pendingDate = dayjs(pending.date);
    const isAlreadyCounted =
      startConflicts.includes(pending) || endConflicts.includes(pending);

    return (
      !isAlreadyCounted &&
      isDateInRange(pendingDate, currentBookingStart, currentBookingEnd)
    );
  });

  const confirmedPrefix = confirmed
    ? `${t("order.confirmedShort")} `
    : "";

  return (
    <Box sx={{ mt: 2 }}>
      {startConflicts.length > 0 && (
        <Typography variant="body1" color="error" sx={{ mb: 1 }}>
          {confirmedPrefix}
          {t("order.conflictWithStart")}{" "}
          {startConflicts.map((conflict, index) => (
            <span key={index}>
              {formatDateTime(conflict.date, conflict.timeEnd)}
              {index < startConflicts.length - 1 ? ", " : ""}
            </span>
          ))}
        </Typography>
      )}

      {endConflicts.length > 0 && (
        <Typography variant="body1" color="error" sx={{ mb: 1 }}>
          {confirmedPrefix}
          {t("order.conflictWithEnd")}{" "}
          {endConflicts.map((conflict, index) => (
            <span key={index}>
              {formatDateTime(conflict.date, conflict.timeStart)}
              {index < endConflicts.length - 1 ? ", " : ""}
            </span>
          ))}
        </Typography>
      )}

      {internalConflicts.length > 0 && (
        <Typography variant="body2" color="error" sx={{ mb: 1 }}>
          {confirmedPrefix}
          {t("order.conflictInRange")}{" "}
          {internalConflicts.map((conflict, index) => (
            <span key={index}>
              {formatDateTime(conflict.date)}
              {index < internalConflicts.length - 1 ? ", " : ""}
            </span>
          ))}
        </Typography>
      )}
    </Box>
  );
}
