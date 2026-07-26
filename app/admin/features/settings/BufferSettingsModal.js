/**
 * BufferSettingsModal
 *
 * Modal for configuring buffer time between bookings.
 */

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  Button,
  Alert,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useMainContext } from "@app/Context";
import { updateCompanyBuffer } from "@utils/action";
import { useTranslation } from "react-i18next";

export default function BufferSettingsModal({ open, onClose }) {
  const { t } = useTranslation();
  const { company, updateCompanyInContext } = useMainContext();
  const currentBufferTime =
    company?.bufferTime != null ? Number(company.bufferTime) : undefined;
  const [bufferHours, setBufferHours] = useState(currentBufferTime ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setBufferHours(currentBufferTime != null ? currentBufferTime : "");
      setError(null);
      setSuccess(false);
    }
  }, [open, currentBufferTime]);

  const handleSave = async () => {
    if (!company?._id) {
      setError(t("adminModals.bufferCompanyMissing"));
      return;
    }

    const bufferValue = Number(bufferHours);

    if (isNaN(bufferValue) || bufferValue < 0 || bufferValue > 24) {
      setError(t("adminModals.bufferInvalid"));
      return;
    }

    if (currentBufferTime != null && bufferValue === currentBufferTime) {
      setError(t("adminModals.bufferUnchanged"));
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateCompanyBuffer(company._id, bufferValue);

      if (!result.success) {
        throw new Error(result.error || t("adminModals.bufferSaveError"));
      }

      setSuccess(true);

      if (result.data) {
        await updateCompanyInContext(company._id, result.data);
      } else {
        await updateCompanyInContext(company._id);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error saving bufferTime:", err);
      setError(err.message || t("adminModals.bufferSaveError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6" component="span">
          {t("adminModals.bufferTitle")}
        </Typography>
        <IconButton onClick={onClose} size="small" aria-label={t("basic.close")}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("adminModals.bufferIntro")}
          </Typography>
          <Typography
            component="ul"
            variant="body2"
            color="text.secondary"
            sx={{ pl: 2, mb: 2 }}
          >
            <li>{t("adminModals.bufferItem1")}</li>
            <li>{t("adminModals.bufferItem2")}</li>
            <li>{t("adminModals.bufferItem3")}</li>
            <li>{t("adminModals.bufferItem4")}</li>
          </Typography>
        </Box>

        <TextField
          label={t("adminModals.bufferHours")}
          type="number"
          value={bufferHours}
          onChange={(e) => setBufferHours(Number(e.target.value))}
          fullWidth
          size="small"
          inputProps={{ min: 0, max: 24, step: 1 }}
          sx={{ mb: 2 }}
        />

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            {t("adminModals.bufferCurrent", {
              hours: currentBufferTime ?? "—",
            })}
            {company?.bufferTime !== undefined && (
              <span
                style={{
                  color: "#666",
                  fontSize: "0.875rem",
                  marginLeft: "8px",
                }}
              >
                {t("adminModals.bufferFromDb")}
              </span>
            )}
            {company?.bufferTime === undefined && (
              <span
                style={{
                  color: "#666",
                  fontSize: "0.875rem",
                  marginLeft: "8px",
                }}
              >
                {t("adminModals.bufferFallback")}
              </span>
            )}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t("adminModals.bufferAffects")}
          </Typography>
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              {t("adminModals.bufferUpdated", { hours: bufferHours })}
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          disabled={loading}
        >
          {t("basic.cancel")}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={
            loading ||
            bufferHours === "" ||
            isNaN(Number(bufferHours)) ||
            (currentBufferTime != null &&
              Number(bufferHours) === currentBufferTime)
          }
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? t("adminModals.saving") : t("basic.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
