import { useState, useEffect } from "react";
import { Grid, Box, Typography, Button } from "@mui/material";
import dayjs from "dayjs";
import { useMainContext } from "@app/Context";
import { deleteOrder } from "@/utils/action";
import { useTranslation } from "react-i18next";

export default function ConflictMessage({
  initialConflicts,
  type,
  setUpdateMessage,
}) {
  const { t } = useTranslation();
  const { fetchAndUpdateOrders } = useMainContext();
  const [loading, setLoading] = useState(false);
  const [conflicts, setConflicts] = useState(initialConflicts);

  useEffect(() => {
    setConflicts(initialConflicts);
  }, [initialConflicts]);

  const mappingTypes = {
    1: t("order.conflictDatesChange"),
    2: t("order.conflictBlockingBookings"),
    3: t("order.conflictHasConflicts"),
  };

  const handleDeleteOrder = async (orderId) => {
    setLoading(true);
    try {
      const result = await deleteOrder(orderId);

      if (!result.success) {
        setUpdateMessage(result.message || t("order.orderDeleteFailed"));
        throw new Error(result.message || t("order.orderDeleteFailed"));
      }
      await fetchAndUpdateOrders();
      setConflicts((prevConflicts) =>
        prevConflicts.filter((o) => o._id !== orderId)
      );
      setUpdateMessage(t("order.orderDeletedSuccess"));
    } catch (error) {
      console.error("Failed to delete order:", error);
      setUpdateMessage(
        `${t("order.orderDeleteFailed")}: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  if (
    !conflicts ||
    conflicts.length < 1 ||
    !initialConflicts ||
    initialConflicts.length < 1
  )
    return;

  return (
    <Box width="100%">
      <Typography
        variant="h6"
        color={type == 1 ? "primary.main" : "error"}
        sx={{ lineHeight: "1.2rem", my: 1 }}
      >
        {mappingTypes[type]}
      </Typography>

      <Grid container spacing={2}>
        {conflicts.map((o) => (
          <Grid item xs={12} sm={12} md={6} key={o.id || o._id}>
            <Box border={1} borderColor="grey.300" p={2} borderRadius={2}>
              <Typography variant="body1" fontWeight="bold">
                {o.customerName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("order.bookingFromTo", {
                  from: dayjs(o.rentalStartDate).format("MMM D"),
                  to: dayjs(o.rentalEndDate).format("MMM D"),
                })}
              </Typography>
              <Typography variant="body2">{o.email}</Typography>
              <Typography variant="body2">{o.phone}</Typography>
              <Typography
                variant="body2"
                color={o.confirmed ? "success.main" : "error"}
              >
                {o.confirmed
                  ? t("order.confirmedShort")
                  : t("order.notConfirmedShort")}
              </Typography>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleDeleteOrder(o.id || o._id)}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {t("order.delete")}
              </Button>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
