import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  useTheme,
  Tooltip,
  ButtonBase,
  Popover,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  ORDER_COLORS,
  getOrderColorsForLegend,
  getOfflineHatchBackground,
  getSuitesLegendRows,
} from "@/config/orderColors";
import { useMainContext } from "@app/Context";
import { SINGLE_PROPERTY_MODE } from "@/config/domain";
import dynamic from "next/dynamic";

const SettingsIcon = dynamic(() => import("@mui/icons-material/Settings"), {
  ssr: false,
});
const BufferSettingsModal = dynamic(
  () => import("@/app/admin/features/settings/BufferSettingsModal"),
  { ssr: false }
);

const TOOLBAR_LEGEND_DETAIL_BY_KEY = {
  PAID_AND_CLOSED: "suites.legendPaidClosed",
  CONFIRMED_CLIENT: "suites.legendConfirmedTip",
  CONFIRMED_ADMIN: "suites.legendConfirmedTip",
  ADMIN_APPROVED: "suites.legendAdminApprovedTip",
  OFFLINE: "suites.legendStubTip",
  OFFLINE_PENDING: "suites.legendStubTip",
  PENDING_CLIENT: "suites.legendPendingTip",
  PENDING_ADMIN: "suites.legendPendingTip",
};

const LEGEND_POPOVER_ID = "calendar-admin-legend-popover";

/**
 * Легенда календаря.
 * Suites: зелёный = подтверждён, жёлтый = неподтверждён, штрих = заглушка.
 */
function LegendCalendarAdmin({
  client,
  showLegendItems = true,
  legendIconsOnly = false,
  showBufferControls = true,
  showDeliveryInfo = true,
  inDrawer = false,
  inToolbar = false,
  /** Full-width strip under toolbar with labels (suites default) */
  asStrip = false,
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { company } = useMainContext();
  const [bufferModalOpen, setBufferModalOpen] = useState(false);
  const [legendExpanded, setLegendExpanded] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);
  const legendGroupRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarsePointer(Boolean(mq.matches));
    sync();
    if (mq.addEventListener) mq.addEventListener("change", sync);
    else if (mq.addListener) mq.addListener(sync);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", sync);
      else if (mq.removeListener) mq.removeListener(sync);
    };
  }, []);

  const darkBgColors = theme.palette.backgroundDark1 || {};
  const primaryTextColor = inToolbar || asStrip
    ? "rgba(255,255,255,0.9)"
    : darkBgColors.text || "#ffffff";
  const secondaryTextColor = inToolbar || asStrip
    ? "rgba(255,255,255,0.72)"
    : darkBgColors.text || "#ffffff";

  const deliveryVisible = !SINGLE_PROPERTY_MODE && Boolean(showDeliveryInfo);
  const deliveryPrice =
    company?.deliveryPricePerKm != null &&
    Number.isFinite(company.deliveryPricePerKm)
      ? company.deliveryPricePerKm
      : null;
  const bufferRaw = company?.bufferTime;
  const bufferLabel =
    typeof bufferRaw === "number" && Number.isFinite(bufferRaw)
      ? bufferRaw >= 24 && bufferRaw % 24 === 0
        ? `${bufferRaw / 24} day`
        : `${bufferRaw}h`
      : "—";

  const baseItemSx = {
    display: "inline-flex",
    alignItems: "center",
    gap: inToolbar || asStrip ? 0.55 : 0.6,
    color: primaryTextColor,
    fontSize: asStrip ? "0.78rem" : inToolbar ? "0.72rem" : "0.75rem",
    lineHeight: 1.1,
    whiteSpace: "nowrap",
    maxWidth: "100%",
  };

  const legendTooltipTitle = (label, tooltip) =>
    tooltip && String(tooltip).trim() ? `${label}: ${tooltip}` : label;

  const CompactLegendItem = ({ color, label, tooltip, iconsOnly, hatch }) => {
    const title = legendTooltipTitle(label, tooltip);
    const swatch = (
      <Box
        component="span"
        sx={{
          width: iconsOnly ? 11 : asStrip ? 12 : 9,
          height: iconsOnly ? 11 : asStrip ? 12 : 9,
          minWidth: iconsOnly ? 11 : asStrip ? 12 : 9,
          borderRadius: iconsOnly || asStrip ? "3px" : "2px",
          backgroundColor: hatch ? undefined : color,
          background: hatch ? getOfflineHatchBackground(color) : undefined,
          boxShadow:
            iconsOnly || asStrip
              ? "0 0 0 1px rgba(255,255,255,0.12) inset"
              : "none",
        }}
      />
    );
    if (iconsOnly) {
      return (
        <Tooltip title={title} arrow>
          <Box
            sx={{
              ...baseItemSx,
              cursor: "help",
              px: 0.35,
              py: 0.35,
              borderRadius: 0.75,
              "&:hover": { backgroundColor: "rgba(255,255,255,0.06)" },
            }}
          >
            {swatch}
          </Box>
        </Tooltip>
      );
    }
    return (
      <Tooltip title={tooltip || ""} arrow>
        <Box
          sx={{
            ...baseItemSx,
            cursor: tooltip ? "help" : "default",
            px: asStrip ? 0.85 : 0,
            py: asStrip ? 0.35 : 0,
            borderRadius: asStrip ? 1 : 0,
            border: asStrip ? "1px solid rgba(255,255,255,0.12)" : "none",
            backgroundColor: asStrip ? "rgba(255,255,255,0.04)" : "transparent",
          }}
        >
          {swatch}
          <Typography
            component="span"
            variant="caption"
            sx={{
              color: secondaryTextColor,
              fontSize: asStrip ? "0.78rem" : inToolbar ? "0.7rem" : "0.74rem",
              fontWeight: asStrip ? 600 : 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {label}
          </Typography>
        </Box>
      </Tooltip>
    );
  };

  const FullLegendItem = ({
    color,
    label,
    tooltip,
    wrap = false,
    hatch = false,
  }) => (
    <Tooltip title={tooltip || ""} arrow>
      <Box
        sx={{
          display: "flex",
          alignItems: wrap ? "flex-start" : "center",
          justifyContent: "flex-start",
          gap: 1,
          cursor: tooltip ? "help" : "default",
          py: wrap ? 0.35 : 0,
          minWidth: 0,
        }}
      >
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 14,
            height: 14,
            minWidth: 14,
            backgroundColor: hatch ? undefined : color,
            background: hatch ? getOfflineHatchBackground(color) : undefined,
            borderRadius: "3px",
            flexShrink: 0,
            mt: wrap ? 0.2 : 0,
            boxShadow: "0 0 0 1px rgba(255,255,255,0.1) inset",
          }}
        />
        <Typography
          component="span"
          variant="body2"
          sx={{
            fontSize: "0.8125rem",
            color: darkBgColors.text || "#ffffff",
            fontWeight: 500,
            whiteSpace: wrap ? "normal" : "nowrap",
            wordBreak: wrap ? "break-word" : "normal",
            lineHeight: wrap ? 1.35 : 1.2,
            flex: wrap ? "1 1 auto" : "none",
            minWidth: 0,
          }}
        >
          {label}
        </Typography>
      </Box>
    </Tooltip>
  );

  const suitesMode = SINGLE_PROPERTY_MODE && !client;
  const suitesRows = suitesMode
    ? getSuitesLegendRows().map((row) => ({
        key: row.key,
        color: row.color,
        hatch: row.hatch,
        label: t(row.labelKey),
        tooltip: t(row.tipKey),
      }))
    : null;

  const rowDisplay =
    asStrip || inDrawer || inToolbar ? "flex" : { xs: "none", sm: "flex" };

  const compactLegendItems = client
    ? [
        {
          key: "client-confirmed",
          color: ORDER_COLORS.CONFIRMED_CLIENT.main,
          label: t("order.unavailable-dates"),
          tooltip: t("suites.legendBooked"),
        },
      ]
    : suitesRows || [
        {
          key: "paid-and-closed",
          color: ORDER_COLORS.PAID_AND_CLOSED.main,
          label: "Closed",
          tooltip: t("suites.legendPaidClosed"),
        },
        {
          key: "confirmed-client",
          color: ORDER_COLORS.CONFIRMED_CLIENT.main,
          label: "Client",
          tooltip: t("suites.legendConfirmedTip"),
        },
        {
          key: "confirmed-admin",
          color: ORDER_COLORS.CONFIRMED_ADMIN.main,
          label: "Admin",
          tooltip: t("suites.legendConfirmedTip"),
        },
        {
          key: "offline",
          color: ORDER_COLORS.OFFLINE.main,
          hatch: true,
          label: t("suites.legendStub"),
          tooltip: t("suites.legendStubTip"),
        },
        {
          key: "offline-pending",
          color: ORDER_COLORS.OFFLINE_PENDING.main,
          hatch: true,
          label: t("suites.legendStub"),
          tooltip: t("suites.legendStubTip"),
        },
        {
          key: "pending-client",
          color: ORDER_COLORS.PENDING_CLIENT.main,
          label: "Pending",
          tooltip: t("suites.legendPendingTip"),
        },
        {
          key: "pending-admin",
          color: ORDER_COLORS.PENDING_ADMIN.main,
          label: "Pending Admin",
          tooltip: t("suites.legendPendingTip"),
        },
      ];

  const toolbarInfoOnly = inToolbar && !showLegendItems && !asStrip;
  const useIconOnlyLegend = Boolean(
    inToolbar && showLegendItems && legendIconsOnly && !suitesMode && !asStrip
  );
  const toolbarInteractiveLegend = Boolean(
    useIconOnlyLegend && !client && !suitesMode
  );
  const toolbarLegendRows = toolbarInteractiveLegend
    ? getOrderColorsForLegend({ suites: false }).map((oc) => ({
        key: oc.key,
        color: oc.main,
        hatch: Boolean(oc.hatch),
        hoverTitle: oc.label,
        label: oc.label,
        detailTooltip: TOOLBAR_LEGEND_DETAIL_BY_KEY[oc.key]
          ? t(TOOLBAR_LEGEND_DETAIL_BY_KEY[oc.key])
          : "",
      }))
    : [];

  // Suites strip: labeled chips only
  if (asStrip && showLegendItems && suitesRows) {
    return (
      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap"
        spacing={0}
        sx={{
          width: "100%",
          px: "10px",
          py: 0.65,
          columnGap: 1,
          rowGap: 0.55,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          backgroundColor: "rgba(0,0,0,0.18)",
        }}
        aria-label={t("suites.legendAria")}
      >
        <Typography
          component="span"
          sx={{
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
            mr: 0.5,
          }}
        >
          {t("suites.legendTitle")}
        </Typography>
        {suitesRows.map((item) => (
          <CompactLegendItem
            key={item.key}
            color={item.color}
            hatch={item.hatch}
            label={item.label}
            tooltip={item.tooltip}
          />
        ))}
      </Stack>
    );
  }

  return (
    <Stack
      display={rowDisplay}
      width={useIconOnlyLegend ? "auto" : "100%"}
      maxWidth={useIconOnlyLegend ? "100%" : undefined}
      spacing={inToolbar ? 0.5 : 0.9}
      sx={{
        py: inToolbar ? 0 : 0.7,
        px: inToolbar ? 0 : 1.25,
        backgroundColor: inToolbar
          ? "transparent"
          : theme.palette.backgroundDark1?.bg || "#1a1a1a",
        borderRadius: inToolbar ? 0 : 1.25,
        boxShadow: inToolbar ? "none" : "0 2px 8px rgba(0, 0, 0, 0.25)",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={toolbarInfoOnly ? "center" : "space-between"}
        flexWrap="wrap"
        sx={{
          columnGap: useIconOnlyLegend ? 0.5 : inToolbar ? 0.95 : 1.25,
          rowGap: inToolbar ? 0.35 : 0.6,
        }}
      >
        {showLegendItems && toolbarInteractiveLegend ? (
          <>
            <ButtonBase
              ref={legendGroupRef}
              id="calendar-admin-legend-trigger"
              component="div"
              aria-label={t("suites.legendOpenFull")}
              aria-expanded={legendExpanded}
              aria-haspopup="dialog"
              aria-controls={LEGEND_POPOVER_ID}
              onClick={() => setLegendExpanded((open) => !open)}
              disableRipple
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.45,
                minWidth: 0,
                maxWidth: "100%",
                flexWrap: "nowrap",
                py: 0.35,
                px: 0.55,
                borderRadius: 1,
                border: "1px solid rgba(255,255,255,0.14)",
                backgroundColor: "rgba(255,255,255,0.03)",
                color: "inherit",
                textAlign: "left",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderColor: "rgba(255,255,255,0.22)",
                },
                "&.Mui-focusVisible": {
                  outline: "2px solid rgba(255,255,255,0.55)",
                  outlineOffset: 1,
                },
              }}
            >
              {toolbarLegendRows.map((item) => (
                <Tooltip
                  key={item.key}
                  title={item.hoverTitle}
                  arrow
                  disableHoverListener={coarsePointer}
                  disableFocusListener={coarsePointer}
                  disableTouchListener
                >
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 11,
                      height: 11,
                      minWidth: 11,
                      borderRadius: "3px",
                      backgroundColor: item.hatch ? undefined : item.color,
                      background: item.hatch
                        ? getOfflineHatchBackground(item.color)
                        : undefined,
                      boxShadow: "0 0 0 1px rgba(255,255,255,0.12) inset",
                      pointerEvents: coarsePointer ? "none" : "auto",
                    }}
                  />
                </Tooltip>
              ))}
            </ButtonBase>
            <Popover
              id={LEGEND_POPOVER_ID}
              open={legendExpanded}
              anchorEl={legendGroupRef.current}
              onClose={() => setLegendExpanded(false)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              disableRestoreFocus
              slotProps={{
                paper: {
                  sx: {
                    p: 1.25,
                    maxWidth: "min(calc(100vw - 16px), 340px)",
                    maxHeight: "min(70vh, 360px)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "8px",
                    bgcolor: "#2e2e2e",
                    color: "rgba(255,255,255,0.92)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.22)",
                  },
                },
              }}
            >
              <Box
                component="div"
                role="dialog"
                aria-label={t("suites.legendAria")}
                sx={{
                  overflowY: "auto",
                  overflowX: "hidden",
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 1,
                  rowGap: 0.75,
                  maxWidth: "100%",
                  pr: 0.25,
                }}
              >
                {toolbarLegendRows.map((item) => (
                  <Box
                    key={`pop-${item.key}`}
                    sx={{
                      flex: "1 1 140px",
                      minWidth: 0,
                      maxWidth: "100%",
                    }}
                  >
                    <FullLegendItem
                      color={item.color}
                      label={item.label}
                      tooltip={item.detailTooltip}
                      hatch={item.hatch}
                      wrap
                    />
                  </Box>
                ))}
              </Box>
            </Popover>
          </>
        ) : showLegendItems ? (
          <Stack
            direction="row"
            alignItems="center"
            flexWrap="wrap"
            sx={{
              columnGap: useIconOnlyLegend ? 0.35 : 1.1,
              rowGap: 0.45,
              minWidth: 0,
            }}
          >
            {compactLegendItems.map((item) => (
              <CompactLegendItem
                key={item.key}
                color={item.color}
                hatch={item.hatch}
                label={item.label}
                tooltip={item.tooltip}
                iconsOnly={useIconOnlyLegend}
              />
            ))}
          </Stack>
        ) : null}

        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          justifyContent={toolbarInfoOnly ? "center" : "flex-end"}
          sx={{
            columnGap: 0.75,
            rowGap: 0.45,
            minWidth: 0,
            ...(toolbarInfoOnly ? { ml: 0 } : { ml: "auto" }),
          }}
        >
          {showBufferControls && (
            <Tooltip
              title={`Буфер между заказами: ${
                company?.bufferTime != null ? `${company.bufferTime} ч.` : "—"
              } (нажмите для изменения)`}
              arrow
            >
              <ButtonBase
                onClick={() => setBufferModalOpen(true)}
                sx={{
                  ...baseItemSx,
                  px: inToolbar ? 0.5 : 0.7,
                  py: inToolbar ? 0.15 : 0.25,
                  borderRadius: 0.9,
                  color: inToolbar
                    ? "rgba(255,255,255,0.78)"
                    : theme.palette.secondary.light,
                  maxWidth: { xs: "100%", sm: "180px" },
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.06)",
                    color: inToolbar
                      ? "rgba(255,255,255,0.94)"
                      : theme.palette.secondary.main,
                  },
                }}
              >
                <Typography
                  component="span"
                  sx={{ fontSize: "0.8rem", lineHeight: 1 }}
                >
                  ⏱
                </Typography>
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    color: "inherit",
                    fontSize: inToolbar ? "0.71rem" : "0.74rem",
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  Buffer: {bufferLabel}
                </Typography>
                <SettingsIcon sx={{ fontSize: 14, color: "inherit" }} />
              </ButtonBase>
            </Tooltip>
          )}

          {deliveryVisible && (
            <Tooltip title={t("suites.deliveryPerKm")} arrow>
              <Typography
                variant="caption"
                sx={{
                  ...baseItemSx,
                  color: inToolbar
                    ? "rgba(255,255,255,0.72)"
                    : theme.palette.secondary.light,
                  fontWeight: 600,
                  px: inToolbar ? 0.45 : 0.6,
                  py: inToolbar ? 0.15 : 0.25,
                  borderRadius: 0.8,
                  maxWidth: { xs: "100%", sm: "150px" },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <Box component="span" sx={{ fontSize: "0.8rem", lineHeight: 1 }}>
                  🚚
                </Box>
                <Box
                  component="span"
                  sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {deliveryPrice != null ? `${deliveryPrice} €/км` : "— €/км"}
                </Box>
              </Typography>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      {!client &&
        showLegendItems &&
        legendExpanded &&
        !toolbarInteractiveLegend &&
        !suitesMode && (
          <Stack
            direction="row"
            flexWrap="wrap"
            sx={{
              columnGap: 1.25,
              rowGap: 0.65,
              pt: 0.35,
              maxWidth: 340,
              width: "100%",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            <FullLegendItem
              color={ORDER_COLORS.PAID_AND_CLOSED.main}
              label={ORDER_COLORS.PAID_AND_CLOSED.label}
              tooltip={t("suites.legendPaidClosed")}
              wrap
            />
            <FullLegendItem
              color={ORDER_COLORS.CONFIRMED_CLIENT.main}
              label={ORDER_COLORS.CONFIRMED_CLIENT.label}
              tooltip={t("suites.legendConfirmedTip")}
              wrap
            />
            <FullLegendItem
              color={ORDER_COLORS.PENDING_CLIENT.main}
              label={ORDER_COLORS.PENDING_CLIENT.label}
              tooltip={t("suites.legendPendingTip")}
              wrap
            />
            <FullLegendItem
              color={ORDER_COLORS.OFFLINE.main}
              label={t("suites.legendStub")}
              tooltip={t("suites.legendStubTip")}
              hatch
              wrap
            />
          </Stack>
        )}

      <BufferSettingsModal
        open={bufferModalOpen}
        onClose={() => setBufferModalOpen(false)}
      />
    </Stack>
  );
}

export default LegendCalendarAdmin;
