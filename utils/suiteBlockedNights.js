import dayjs from "dayjs";
import { toBusinessStartOfDay } from "@/domain/time/businessDate";
import { isOrderDateBlocking } from "@/domain/orders/isOrderDateBlocking";

/**
 * Suite inventory hold for public search / suite calendar:
 * - confirmed bookings
 * - offline stubs
 * - pending website requests (my_order)
 * - admin/internal holds (my_order === false) with dates
 */
export function isSuiteInventoryBlocking(order) {
  if (!order) return false;
  if (order.offline === true) return true;
  if (order.confirmed === true) return true;
  if (order.my_order === true) return true;
  // Admin-created row (not a website request) still holds the suite
  if (order.my_order === false) {
    return Boolean(order.rentalStartDate && order.rentalEndDate);
  }
  return false;
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

    const start = toBusinessStartOfDay(order.rentalStartDate);
    const end = toBusinessStartOfDay(order.rentalEndDate);
    if (!start?.isValid?.() || !end?.isValid?.() || !end.isAfter(start, "day")) {
      continue;
    }

    // Iterate via YMD strings so calendar cells and availability use the same keys.
    let cursor = dayjs(`${start.format("YYYY-MM-DD")}T12:00:00`);
    const endNoon = dayjs(`${end.format("YYYY-MM-DD")}T12:00:00`);
    let guard = 0;
    while (cursor.isBefore(endNoon, "day") && guard < 400) {
      keys.add(cursor.format("YYYY-MM-DD"));
      cursor = cursor.add(1, "day");
      guard += 1;
    }
  }
  return keys;
}
