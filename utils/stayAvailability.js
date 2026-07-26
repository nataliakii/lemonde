import { toBusinessStartOfDay } from "@/domain/time/businessDate";
import { getOccupiedNightKeys } from "@utils/suiteBlockedNights";

/**
 * Normalize any date-like value to a calendar YYYY-MM-DD (Athens business day).
 * Date-only strings are used as-is — no timezone shift.
 */
export function toStayYmd(value) {
  if (value == null || value === "") return null;
  if (typeof value === "string") {
    const s = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  }
  if (value?.format && typeof value.format === "function" && value.isValid?.()) {
    // Dayjs from the calendar already represents the clicked calendar day
    return value.format("YYYY-MM-DD");
  }
  const d = toBusinessStartOfDay(value);
  return d?.isValid?.() ? d.format("YYYY-MM-DD") : null;
}

/**
 * Every stay night as YYYY-MM-DD in [checkIn, checkOut).
 * Checkout morning is not a stay night (next guest may arrive that day).
 */
export function getRequestedStayNightKeys(checkIn, checkOut) {
  const startStr = toStayYmd(checkIn);
  const endStr = toStayYmd(checkOut);
  if (!startStr || !endStr || endStr <= startStr) return [];

  const keys = [];
  // Iterate in UTC calendar space from the YMD labels (no local TZ drift).
  const cursor = new Date(`${startStr}T00:00:00.000Z`);
  const end = new Date(`${endStr}T00:00:00.000Z`);
  if (Number.isNaN(cursor.getTime()) || Number.isNaN(end.getTime())) return [];

  while (cursor < end) {
    keys.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return keys;
}

/**
 * Nights inside the requested stay that are already held/booked.
 * Checks EVERY night in the range — not only check-in / check-out.
 */
export function getConflictingStayNights(orders, checkIn, checkOut, options = {}) {
  const requested = getRequestedStayNightKeys(checkIn, checkOut);
  if (!requested.length) return requested;

  const occupied = getOccupiedNightKeys(orders, {
    inventoryHold: options.inventoryHold !== false,
  });

  return requested.filter((ymd) => occupied.has(ymd));
}

/**
 * Suite is available only when every night in [checkIn, checkOut) is free.
 */
export function isApartmentAvailableForStay(orders, checkIn, checkOut) {
  if (!checkIn || !checkOut) return true;
  const requested = getRequestedStayNightKeys(checkIn, checkOut);
  // Invalid / empty range (e.g. same day) → not bookable
  if (!requested.length) return false;
  return getConflictingStayNights(orders, checkIn, checkOut).length === 0;
}

/** Nightly “from” price for catalog cards */
export function getApartmentPriceFrom(apartment) {
  const tiers = apartment?.pricingTiers;
  if (!tiers || typeof tiers !== "object") return null;
  const season =
    tiers.NoSeason ||
    tiers.LowSeason ||
    tiers.MiddleSeason ||
    Object.values(tiers)[0];
  const days = season?.days;
  if (!days || typeof days !== "object") return null;
  const vals = Object.values(days)
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!vals.length) return null;
  return Math.min(...vals);
}
