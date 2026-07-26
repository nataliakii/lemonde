/**
 * Order colors configuration
 *
 * 🎯 ЕДИНСТВЕННЫЙ ИСТОЧНИК ПРАВДЫ для цветов заказов
 *
 * Suites (Le Monde):
 * - Green  → confirmed
 * - Gold   → admin approved (awaiting client email / final confirm)
 * - Yellow → pending / needs admin review
 * - Hatch  → stubs (offline)
 *
 * Car rental still distinguishes client vs admin via keys; colors match suites.
 */

import { alpha } from "@mui/material/styles";
import { palette } from "@/theme";

const GREEN = palette.triadic.green; // "#3D7A5A"
const GREEN_LIGHT = palette.triadic.greenLight;
const GREEN_DARK = palette.triadic.greenDark;
const YELLOW = palette.triadic.yellow; // "#E0C56A"
const YELLOW_LIGHT = palette.triadic.yellowLight;
/** Admin-approved (reviewed) — brand gold, between pending yellow and confirmed green */
const ADMIN_OK = "#C9A227";
const ADMIN_OK_LIGHT = "#E0C56A";
const ADMIN_OK_DARK = "#8B7014";
const STUB = "#5C6BC0";
const STUB_PENDING = "#78909C";

/**
 * ORDER_COLORS - строгая структура с обязательными полями
 * Каждый объект содержит: key, main, light, dark, text, bg, label, labelEn
 */
export const ORDER_COLORS = {
  // Терминальный статус заказа: оплачен и закрыт
  PAID_AND_CLOSED: {
    key: "PAID_AND_CLOSED",
    main: "#7E57C2",
    light: "#9575CD",
    dark: "#673AB7",
    text: "#7E57C2",
    bg: alpha("#7E57C2", 0.16),
    label: "Оплачен и закрыт",
    labelEn: "Paid and closed",
  },

  // Подтверждённый клиентский заказ — зелёный
  CONFIRMED_CLIENT: {
    key: "CONFIRMED_CLIENT",
    main: GREEN,
    light: GREEN_LIGHT,
    dark: GREEN_DARK,
    text: GREEN_DARK,
    bg: alpha(GREEN, 0.14),
    label: "Подтверждён",
    labelEn: "Confirmed",
  },

  // Одобрен админом, ещё не confirmed — золотой
  ADMIN_APPROVED: {
    key: "ADMIN_APPROVED",
    main: ADMIN_OK,
    light: ADMIN_OK_LIGHT,
    dark: ADMIN_OK_DARK,
    text: ADMIN_OK_DARK,
    bg: alpha(ADMIN_OK, 0.22),
    label: "Одобрен админом",
    labelEn: "Admin OK",
  },

  // Ожидающий клиентский заказ — жёлтый
  PENDING_CLIENT: {
    key: "PENDING_CLIENT",
    main: YELLOW,
    light: YELLOW_LIGHT,
    dark: YELLOW,
    text: palette.neutral.black,
    bg: alpha(YELLOW, 0.35),
    label: "Неподтверждён",
    labelEn: "Pending",
  },

  // Подтверждённый админский заказ — зелёный (как клиентский)
  CONFIRMED_ADMIN: {
    key: "CONFIRMED_ADMIN",
    main: GREEN,
    light: GREEN_LIGHT,
    dark: GREEN_DARK,
    text: GREEN_DARK,
    bg: alpha(GREEN, 0.12),
    label: "Подтверждён",
    labelEn: "Confirmed",
  },

  // Ожидающий админский заказ — жёлтый (как клиентский)
  PENDING_ADMIN: {
    key: "PENDING_ADMIN",
    main: YELLOW,
    light: YELLOW_LIGHT,
    dark: YELLOW,
    text: palette.neutral.black,
    bg: alpha(YELLOW, 0.28),
    label: "Неподтверждён",
    labelEn: "Pending",
  },

  // Заглушка / офлайн — штриховка
  OFFLINE: {
    key: "OFFLINE",
    main: STUB,
    light: "#7986CB",
    dark: "#3949AB",
    text: "#283593",
    bg: alpha(STUB, 0.2),
    label: "Заглушка",
    labelEn: "Stub",
    hatch: true,
  },
  /** Unconfirmed stub — cooler gray-blue + hatch */
  OFFLINE_PENDING: {
    key: "OFFLINE_PENDING",
    main: STUB_PENDING,
    light: "#90A4AE",
    dark: "#546E7A",
    text: "#37474F",
    bg: alpha(STUB_PENDING, 0.22),
    label: "Заглушка",
    labelEn: "Stub",
    hatch: true,
  },
};

/**
 * Distinct diagonal hatch for stubs/offline — high-contrast white stripes.
 * @param {string} [baseColor]
 * @param {{ dense?: boolean }} [opts]
 */
export function getOfflineHatchBackground(
  baseColor = ORDER_COLORS.OFFLINE.main,
  opts = {}
) {
  const stripe = opts.dense ? 4 : 5;
  const gap = opts.dense ? 9 : 11;
  return `repeating-linear-gradient(
    -45deg,
    ${baseColor} 0px,
    ${baseColor} ${stripe}px,
    rgba(255,255,255,0.42) ${stripe}px,
    rgba(255,255,255,0.42) ${gap}px
  )`;
}

/**
 * Fill value for `background` (supports solid color and hatch gradient).
 * Prefer this over backgroundColor when the cell may be a stub.
 * @param {{ main: string, hatch?: boolean } | null | undefined} orderColor
 * @returns {string}
 */
export function getOrderFillBackground(orderColor) {
  if (!orderColor?.main) return "transparent";
  if (orderColor.hatch) return getOfflineHatchBackground(orderColor.main);
  return orderColor.main;
}

/**
 * sx fill for a calendar order cell (solid or hatched).
 * @param {{ main: string, hatch?: boolean } | null | undefined} orderColor
 */
export function getOrderFillSx(orderColor) {
  if (!orderColor?.main) return { background: "transparent" };
  return {
    background: getOrderFillBackground(orderColor),
    backgroundColor: "transparent",
  };
}

/**
 * MOVE_MODE_COLORS - цвета для режима перемещения заказов
 * 
 * ⚠️ ЗАФИКСИРОВАНО: Эти цвета НЕ должны изменяться без согласования.
 * Используются для визуального выделения доступных автомобилей при перемещении заказа.
 * 
 * ПРАВИЛА ИСПОЛЬЗОВАНИЯ:
 * - ВСЕГДА используйте эти константы, НЕ хардкодите цвета
 * - НЕ используйте theme.palette.warning.main (может быть amber)
 * - НЕ используйте theme.palette.triadic.yellowBright (может быть amber)
 * - YELLOW_OVERLAY: для прозрачных overlay (rgba с alpha 0.8)
 * - YELLOW_SOLID: для сплошного фона ячеек (#ffeb3b)
 * 
 * ГДЕ ИСПОЛЬЗУЕТСЯ:
 * - CalendarRow.js: createYellowOverlay, gradientBackground, backgroundColor
 * - BigCalendar.js: (если нужно в будущем)
 * 
 * ИЗМЕНЕНИЕ ЦВЕТОВ:
 * - ТОЛЬКО здесь в config/orderColors.js
 * - После изменения проверить визуально в CalendarRow
 * - Убедиться, что цвет желтый, а не amber
 */
export const MOVE_MODE_COLORS = {
  // Желтый цвет для выделения доступных ячеек при перемещении
  // Используется для overlay и фона ячеек
  YELLOW_OVERLAY: "rgba(255, 235, 59, 0.8)", // Прозрачный желтый для overlay
  YELLOW_SOLID: "#ffeb3b", // Сплошной желтый для фона ячеек
  // Источник: palette.triadic.yellowBright может быть amber, поэтому используем явный желтый
  
  // Синий цвет для выделения перемещаемого заказа (из палитры темы)
  // Используется для подсветки дат заказа на оригинальном автомобиле
  // BLUE_SELECTED: palette.secondary.main, // "#008989" - прежний цвет
  BLUE_SELECTED: "#007BFF", // ярко-синий для перемещаемого заказа (long press), отличный от confirmed client
};

/**
 * ORDER_UI_COLORS - дополнительные цвета для UI (не используются в getOrderColor)
 */
export const ORDER_UI_COLORS = {
  // Заказ который нельзя подтвердить (конфликт)
  BLOCKED: {
    key: "BLOCKED",
    main: palette.neutral.gray600,
    light: palette.neutral.gray500,
    dark: palette.neutral.gray700,
    text: palette.neutral.gray600,
    bg: alpha(palette.neutral.gray600, 0.12),
    label: "Заблокирован",
    labelEn: "Blocked",
  },

  // Завершённый заказ (в прошлом) - для UI только
  COMPLETED: {
    key: "COMPLETED",
    main: palette.secondary.main,
    light: palette.secondary.light,
    dark: palette.secondary.dark,
    text: palette.secondary.main,
    bg: alpha(palette.secondary.main, 0.12),
    label: "Завершён",
    labelEn: "Completed",
  },
};

/**
 * Получить цвета для легенды календаря.
 * Suites: confirmed / admin OK / pending / stub.
 * Car rental: полный набор статусов.
 */
export function getOrderColorsForLegend({ suites = false } = {}) {
  if (suites) {
    return [
      ORDER_COLORS.CONFIRMED_CLIENT,
      ORDER_COLORS.ADMIN_APPROVED,
      ORDER_COLORS.PENDING_CLIENT,
      ORDER_COLORS.OFFLINE,
    ];
  }
  return [
    ORDER_COLORS.PAID_AND_CLOSED,
    ORDER_COLORS.CONFIRMED_CLIENT,
    ORDER_COLORS.CONFIRMED_ADMIN,
    ORDER_COLORS.ADMIN_APPROVED,
    ORDER_COLORS.OFFLINE,
    ORDER_COLORS.OFFLINE_PENDING,
    ORDER_COLORS.PENDING_CLIENT,
    ORDER_COLORS.PENDING_ADMIN,
  ];
}

/**
 * Compact suites legend rows for toolbar / strip (i18n keys + colors).
 */
export function getSuitesLegendRows() {
  return [
    {
      key: "confirmed",
      color: ORDER_COLORS.CONFIRMED_CLIENT.main,
      hatch: false,
      labelKey: "suites.legendConfirmed",
      tipKey: "suites.legendConfirmedTip",
    },
    {
      key: "adminApproved",
      color: ORDER_COLORS.ADMIN_APPROVED.main,
      hatch: false,
      labelKey: "suites.legendAdminApproved",
      tipKey: "suites.legendAdminApprovedTip",
    },
    {
      key: "pending",
      color: ORDER_COLORS.PENDING_CLIENT.main,
      hatch: false,
      labelKey: "suites.legendPending",
      tipKey: "suites.legendPendingTip",
    },
    {
      key: "stub",
      color: ORDER_COLORS.OFFLINE.main,
      hatch: true,
      labelKey: "suites.legendStub",
      tipKey: "suites.legendStubTip",
    },
  ];
}

export default ORDER_COLORS;
