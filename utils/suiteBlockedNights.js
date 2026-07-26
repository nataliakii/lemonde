import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { BUSINESS_TZ } from "@utils/businessTime";
import { isOrderDateBlocking } from "@/domain/orders/isOrderDateBlocking";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Occupied suite nights as YYYY-MM-DD.
 * Matches stay nights [checkIn, checkOut) used by isApartmentAvailableForStay.
 */
export function getOccupiedNightKeys(orders) {
  const keys = new Set();
  for (const order of orders || []) {
    if (!isOrderDateBlocking(order)) continue;
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
