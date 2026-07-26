import dayjs from "dayjs";
import { getOccupiedNightKeys } from "@utils/suiteBlockedNights";

/**
 * Nights of a stay are [checkIn, checkOut) — checkout day is free for the next guest.
 * A suite is unavailable if any occupied night overlaps that range.
 *
 * Uses suite inventory holds (confirmed, offline stubs, pending website requests,
 * and admin drafts) — not car-rental time-buffer coloring.
 */
export function isApartmentAvailableForStay(orders, checkIn, checkOut) {
  if (!checkIn || !checkOut) return true;
  const start = dayjs(checkIn).startOf("day");
  const end = dayjs(checkOut).startOf("day");
  if (!start.isValid() || !end.isValid() || !end.isAfter(start, "day")) {
    return false;
  }

  const occupied = getOccupiedNightKeys(orders, { inventoryHold: true });

  let cursor = start;
  while (cursor.isBefore(end, "day")) {
    if (occupied.has(cursor.format("YYYY-MM-DD"))) {
      return false;
    }
    cursor = cursor.add(1, "day");
  }
  return true;
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
