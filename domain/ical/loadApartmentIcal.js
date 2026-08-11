/**
 * Load confirmed apartment stays for iCal export.
 */

import { connectToDB } from "@lib/database";
import { Apartment } from "@models/apartment";
import { Order } from "@models/order";
import { buildOrdersForApartmentFilter } from "@/domain/orders/apartmentOrderLookup";
import {
  buildApartmentIcalCalendar,
  normalizeIcalSlug,
  orderToIcalStay,
} from "@/domain/ical/buildIcal";

const LOOKBACK_DAYS = 7;
const LOOKAHEAD_DAYS = 400;

/**
 * @param {string} slug
 * @returns {Promise<{ apartment: object, ical: string, eventCount: number } | null>}
 */
export async function buildIcalForApartmentSlug(slug) {
  await connectToDB();

  const normalized = normalizeIcalSlug(slug);
  if (!normalized) return null;

  const apartment = await Apartment.findOne({ slug: normalized })
    .select("_id slug model carNumber regNumber")
    .lean();

  if (!apartment) return null;

  const knownApartments = await Apartment.find({})
    .select("_id")
    .lean();
  const knownApartmentIds = knownApartments.map((doc) => String(doc._id));

  const now = Date.now();
  const from = new Date(now - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const to = new Date(now + LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000);

  const apartmentFilter = buildOrdersForApartmentFilter(apartment, {
    knownApartmentIds,
  });

  const orders = await Order.find({
    $and: [
      apartmentFilter,
      { confirmed: true },
      { adminRefused: { $ne: true } },
      {
        $or: [
          { rentalEndDate: { $gte: from, $lte: to } },
          { timeOut: { $gte: from, $lte: to } },
        ],
      },
    ],
  })
    .select(
      "_id orderNumber customerName rentalStartDate rentalEndDate timeIn timeOut confirmed adminRefused"
    )
    .sort({ rentalStartDate: 1 })
    .lean();

  const stays = orders.map(orderToIcalStay).filter(Boolean);

  const ical = buildApartmentIcalCalendar({
    slug: apartment.slug || normalized,
    apartmentName: apartment.model || apartment.carNumber || normalized,
    stays,
  });

  return {
    apartment,
    ical,
    eventCount: stays.length,
  };
}
