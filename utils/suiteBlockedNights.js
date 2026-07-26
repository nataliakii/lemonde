import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { BUSINESS_TZ } from "@utils/businessTime";
import { isOrderDateBlocking } from "@/domain/orders/isOrderDateBlocking";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Suite inventory hold: any live booking on the calendar blocks nights,
 * including pending website requests and unconfirmed admin drafts.
 * (Car-rental isOrderDateBlocking stays stricter: confirmed/offline only.)
 */
export function isSuiteInventoryBlocking(order) {
  if (!order) return false;
  if (order.offline === true) return true;
  if (order.confirmed === true) return true;
  if (order.my_order === true) return true;
  // Admin-created draft also holds the suite for public search / suite calendar
  return Boolean(order.rentalStartDate && order.rentalEndDate);
}

/**
 * Occupied suite nights as YYYY-MM-DD.
 * Matches stay nights [checkIn, checkOut) — checkout morning frees the room.
 *
 * @param {Array} orders
 * @param {{ inventoryHold?: boolean }} [options]
 *   inventoryHold=true (default): pending + drafts also occupy nights
 *   inventoryHold=false: only confirmed/offline (legacy car-style)
 */
export function getOccupiedNightKeys(orders, options = {}) {
  const inventoryHold = options.inventoryHold !== false;
  const keys = new Set();
  for (const order of orders || []) {
    const blocks = inventoryHold
      ? isSuiteInventoryBlocking(order)
      : isOrderDateBlocking(order);
    if (!blocks) continue;
    if (!order?.rentalStartDate || !order?.rentalEndDate) continue;

    let cursor = dayjs.utc(order.rentalStartDate).tz(BUSINESS_TZ).startOf("day");
    const end = dayjs.utc(order.rentalEndDate).tz(BUSINESS_TZ).startOf("day");
    if (!cursor.isValid() || !end.isValid() || !end.isAfter(cursor, "day")) {
      continue;
    }

    while (cursor.isBefore(end, "day")) {
      keys.add(cursor.format("YYYY-MM-DD"));
      cursor = cursor.add(1, "day");
    }
  }
  return keys;
}
