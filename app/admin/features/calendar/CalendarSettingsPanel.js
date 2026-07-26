"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import dynamic from "next/dynamic";
import { SINGLE_PROPERTY_MODE } from "@/config/domain";
import { useTranslation } from "react-i18next";

const CloseIcon = dynamic(() => import("@mui/icons-material/Close"), {
  ssr: false,
});
const BufferSettingsModal = dynamic(
  () => import("@/app/admin/features/settings/BufferSettingsModal"),
  { ssr: false }
);
const LegendCalendarAdmin = dynamic(
  () => import("@/app/components/calendar-ui/LegendCalendarAdmin"),
  { ssr: false }
);

/**
 * Unified admin calendar display settings panel (localStorage via useCalendarViewSettings).
 */
export default function CalendarSettingsPanel({
  open,
  onClose,
  settings,
  setShowLegend,
  setShowBufferInLegend,
  setShowDeliveryInLegend,
  setShowConflictBadges,
  setHighlightToday,
  setAutoScrollToToday,
}) {
  const { t } = useTranslation();
  const [bufferModalOpen, setBufferModalOpen] = useState(false);

  const showBufferShortcut =
    !settings.showLegend || !settings.showBufferInLegend;

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: false }}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 380 },
            maxWidth: "100vw",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            maxHeight: "100%",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle1" component="h2" fontWeight={600}>
            {t("admin.calendar.settings")}
          </Typography>
          <IconButton
            edge="end"
            onClick={onClose}
            aria-label={t("admin.calendar.closeSettings")}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            px: 2,
            py: 2,
            overflowY: "auto",
            flex: 1,
            minHeight: 0,
          }}
        >
          <Stack spacing={2}>
            <Typography variant="caption" color="text.secondary">
              {t("admin.calendar.visibility")}
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={settings.showLegend}
                  onChange={(e) => setShowLegend(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  {t("admin.calendar.showLegend")}
                </Typography>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={settings.showBufferInLegend}
                  onChange={(e) => setShowBufferInLegend(e.target.checked)}
                  disabled={!settings.showLegend}
                />
              }
              label={
                <Typography variant="body2">
                  {SINGLE_PROPERTY_MODE
                    ? t("admin.calendar.bufferInLegendSuites")
                    : t("admin.calendar.bufferInLegendOrders")}
                </Typography>
              }
            />

            {!SINGLE_PROPERTY_MODE && (
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={settings.showDeliveryInLegend}
                    onChange={(e) => setShowDeliveryInLegend(e.target.checked)}
                    disabled={!settings.showLegend}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t("admin.calendar.deliveryInLegend")}
                  </Typography>
                }
              />
            )}

            <Divider />

            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={settings.showConflictBadges}
                  onChange={(e) => setShowConflictBadges(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  {t("admin.calendar.conflictBadges")}
                </Typography>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={settings.highlightToday}
                  onChange={(e) => setHighlightToday(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  {t("admin.calendar.highlightToday")}
                </Typography>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={settings.autoScrollToToday}
                  onChange={(e) => setAutoScrollToToday(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  {t("admin.calendar.autoScrollToday")}
                </Typography>
              }
            />

            {showBufferShortcut && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setBufferModalOpen(true)}
                sx={{ alignSelf: "flex-start", mt: 1 }}
              >
                {t("admin.calendar.bufferSettings")}
              </Button>
            )}

            {settings.showLegend && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  {t("admin.calendar.legend")}
                </Typography>
                <Box data-bigcalendar-legend sx={{ width: "100%" }}>
                  <LegendCalendarAdmin
                    showBufferControls={settings.showBufferInLegend}
                    showDeliveryInfo={
                      !SINGLE_PROPERTY_MODE && settings.showDeliveryInLegend
                    }
                    inDrawer
                  />
                </Box>
              </>
            )}
          </Stack>
        </Box>
      </Drawer>

      <BufferSettingsModal
        open={bufferModalOpen}
        onClose={() => setBufferModalOpen(false)}
      />
    </>
  );
}
