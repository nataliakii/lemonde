"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useTranslation } from "react-i18next";

/**
 * Shows the copyable iCal feed URL for a suite (for Cleaning Actually sync).
 */
export default function IcalExportField({ slug }) {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const normalized = String(slug || "")
      .trim()
      .toLowerCase();
    if (!normalized) {
      setUrl("");
      setError("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");
    setCopied(false);

    void fetch(
      `/api/admin/ical-export-url?slug=${encodeURIComponent(normalized)}`,
      { cache: "no-store" }
    )
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !body?.success) {
          setUrl("");
          setError(
            body?.message ||
              t("car.icalExportUnavailable", {
                defaultValue: "iCal export is not available yet.",
              })
          );
          return;
        }
        setUrl(body.data?.url || "");
        setError("");
      })
      .catch(() => {
        if (!cancelled) {
          setUrl("");
          setError(
            t("car.icalExportUnavailable", {
              defaultValue: "iCal export is not available yet.",
            })
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, t]);

  async function copyUrl() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(
        t("car.icalCopyFailed", {
          defaultValue: "Could not copy. Select the URL and copy manually.",
        })
      );
    }
  }

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        width: "100%",
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {t("car.icalExportTitle", {
          defaultValue: "Cleaning sync (iCal)",
        })}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {t("car.icalExportHint", {
          defaultValue:
            "Paste this URL into Cleaning Actually → Sites → Rental calendar, then Sync now.",
        })}
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={18} />
          <Typography variant="body2">
            {t("car.icalLoading", { defaultValue: "Loading feed URL…" })}
          </Typography>
        </Box>
      ) : (
        <>
          <TextField
            fullWidth
            size="small"
            value={url}
            placeholder={
              error ||
              t("car.icalNeedSlug", {
                defaultValue: "Save a suite slug first",
              })
            }
            InputProps={{ readOnly: true }}
            error={Boolean(error) && !url}
            helperText={error && !url ? error : undefined}
          />
          <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              type="button"
              variant="outlined"
              size="small"
              startIcon={<ContentCopyIcon />}
              disabled={!url}
              onClick={() => void copyUrl()}
            >
              {copied
                ? t("car.icalCopied", { defaultValue: "Copied" })
                : t("car.icalCopy", { defaultValue: "Copy URL" })}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
