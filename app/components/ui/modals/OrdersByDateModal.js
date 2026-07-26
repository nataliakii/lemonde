"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Grid,
  Divider,
  Paper,
  TextField,
  Alert,
} from "@mui/material";
import { formatDate, formatDateRange } from "@utils/businessTime";
import ModalLayout from "./ModalLayout";
import { ActionButton } from "../index";
import { useTranslation } from "react-i18next";
import { useMainContext } from "@app/Context";

/**
 * Orders-by-date modal: bookings starting / ending on the selected date.
 * Can print or email the report (default: company email).
 */
const OrdersByDateModal = ({
  open,
  onClose,
  date,
  startedOrders = [],
  endedOrders = [],
  getRegNumberByCarNumber,
}) => {
  const { t, i18n } = useTranslation();
  const { company } = useMainContext();
  const companyEmail = String(company?.email || "").trim();

  const [emailTo, setEmailTo] = useState(companyEmail);
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);

  useEffect(() => {
    if (!open) return;
    setEmailTo(companyEmail);
    setSendStatus(null);
    setSending(false);
  }, [open, companyEmail, date]);

  const cellSx = {
    whiteSpace: "nowrap",
  };

  const formatPlaceWithThessalonikiDetail = (place, detail) => {
    const p = String(place || "").trim();
    const d = String(detail || "").trim();
    if (!p) return "-";
    if (p.toLowerCase() === "thessaloniki" && d) return `${p} — ${d}`;
    return p;
  };

  const renderOrdersTable = (orders, emptyMessage, isStartingOrders = false) => {
    if (orders.length === 0) {
      return (
        <Typography align="center" sx={{ color: "text.secondary", py: 2 }}>
          {emptyMessage}
        </Typography>
      );
    }

    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
              {t("order.car")}
            </TableCell>
            <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
              {t("car.unitCode")}
            </TableCell>
            <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
              {t("order.termCol")}
            </TableCell>
            <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
              {t("order.clientGeneric")}
            </TableCell>
            <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
              {t("order.phone")}
            </TableCell>
            {isStartingOrders ? (
              <>
                <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
                  {t("order.pickupLocation")}
                </TableCell>
                <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
                  {t("order.flightNumber")}
                </TableCell>
              </>
            ) : (
              <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
                {t("order.returnLocation")}
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order, idx) => (
            <TableRow key={order._id || idx}>
              <TableCell sx={cellSx}>{order.carModel}</TableCell>
              <TableCell sx={cellSx}>
                {getRegNumberByCarNumber
                  ? getRegNumberByCarNumber(order.carNumber)
                  : order.carNumber}
              </TableCell>
              <TableCell sx={cellSx}>
                {order.rentalStartDate
                  ? formatDateRange(order.rentalStartDate, order.rentalEndDate)
                  : ""}
              </TableCell>
              <TableCell sx={cellSx}>
                {order._visibility?.hideClientContacts
                  ? "—"
                  : order.customerName}
              </TableCell>
              <TableCell sx={cellSx}>
                {order._visibility?.hideClientContacts ? "—" : order.phone}
              </TableCell>
              {isStartingOrders ? (
                <>
                  <TableCell sx={cellSx}>
                    {formatPlaceWithThessalonikiDetail(
                      order.placeIn,
                      order.placeInDetail
                    )}
                  </TableCell>
                  <TableCell sx={cellSx}>
                    {order.placeIn && order.placeIn.toLowerCase() === "airport"
                      ? order.flightNumber || "-"
                      : "-"}
                  </TableCell>
                </>
              ) : (
                <TableCell sx={cellSx}>
                  {formatPlaceWithThessalonikiDetail(
                    order.placeOut,
                    order.placeOutDetail
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const dateLabel = date ? formatDate(date, "DD.MM.YY") : "";
  const dateKey = date ? formatDate(date, "YYYY-MM-DD") : "";

  const handleSendEmail = async () => {
    const to = String(emailTo || "").trim();
    if (!to) {
      setSendStatus({ type: "error", message: t("order.dayReportEmailRequired") });
      return;
    }
    if (!dateKey) {
      setSendStatus({ type: "error", message: t("order.dayReportSendFailed") });
      return;
    }

    setSending(true);
    setSendStatus(null);
    try {
      const res = await fetch("/api/admin/orders/send-day-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          date: dateKey,
          to,
          locale: i18n.language,
          startedOrderIds: startedOrders.map((o) => o._id).filter(Boolean),
          endedOrderIds: endedOrders.map((o) => o._id).filter(Boolean),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || t("order.dayReportSendFailed"));
      }
      setSendStatus({
        type: "success",
        message: t("order.dayReportSent", { email: json.to || to }),
      });
    } catch (err) {
      setSendStatus({
        type: "error",
        message: err?.message || t("order.dayReportSendFailed"),
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <ModalLayout
      open={open}
      onClose={onClose}
      size="fullWidth"
      showCloseButton={true}
      closeOnBackdropClick={false}
      closeOnEscape={true}
    >
      <Box id="print-orders-modal">
        <Grid
          sx={{
            maxWidth: 1000,
            py: 2,
          }}
          container
          spacing={3}
        >
          <Grid item xs={12}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography
                variant="h6"
                align="center"
                sx={{ fontWeight: 600, mb: 1 }}
              >
                {t("order.ordersStartingOn", { date: dateLabel })}
              </Typography>

              <Divider sx={{ mb: 2 }} />

              {renderOrdersTable(
                startedOrders,
                t("order.noOrdersStarting"),
                true
              )}
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography
                variant="h6"
                align="center"
                sx={{ fontWeight: 600, mb: 1 }}
              >
                {t("order.ordersEndingOn", { date: dateLabel })}
              </Typography>

              <Divider sx={{ mb: 2 }} />

              {renderOrdersTable(
                endedOrders,
                t("order.noOrdersEnding"),
                false
              )}
            </Paper>
          </Grid>
        </Grid>

        <Box
          className="no-print"
          sx={{
            mt: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              width: "100%",
              maxWidth: 640,
            }}
          >
            <TextField
              size="small"
              type="email"
              label={t("order.dayReportEmailTo")}
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              disabled={sending}
              helperText={
                companyEmail
                  ? t("order.dayReportEmailDefaultHint", { email: companyEmail })
                  : undefined
              }
              sx={{ flex: "1 1 240px", minWidth: 220 }}
            />
            <ActionButton
              color="primary"
              size="small"
              onClick={handleSendEmail}
              loading={sending}
              label={
                sending ? t("order.dayReportSending") : t("order.sendEmail")
              }
            />
          </Box>

          {sendStatus && (
            <Alert
              severity={sendStatus.type === "success" ? "success" : "error"}
              sx={{ width: "100%", maxWidth: 640 }}
              onClose={() => setSendStatus(null)}
            >
              {sendStatus.message}
            </Alert>
          )}

          <Box
            sx={{
              mt: 1,
              display: "flex",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <ActionButton
              variant="outlined"
              color="warning"
              size="small"
              onClick={onClose}
              label={t("order.closeUpper")}
            />

            <ActionButton
              color="secondary"
              size="small"
              onClick={() => window.print()}
              label={t("order.print")}
            />
          </Box>
        </Box>
      </Box>
    </ModalLayout>
  );
};

export default OrdersByDateModal;
