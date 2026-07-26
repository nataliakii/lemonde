/**
 * Match orders to an apartment after reseed / stale ObjectIds.
 * Prefer car._id; carNumber/regNumber only when the order does not point at
 * another known apartment (avoids attaching every suite's bookings to one).
 */

function norm(value) {
  if (value == null) return "";
  const s = String(value).trim();
  return s;
}

/**
 * @param {object} apartment
 * @param {{ excludeOrderId?: string|import("mongoose").Types.ObjectId, knownApartmentIds?: string[] }} [options]
 * @returns {object} Mongo filter
 */
export function buildOrdersForApartmentFilter(apartment, options = {}) {
  if (!apartment?._id) {
    return { _id: { $exists: false } };
  }

  const apartmentId = apartment._id;
  const carNumber = norm(apartment.carNumber);
  const regNumber = norm(apartment.regNumber);
  const knownIds = (options.knownApartmentIds || [])
    .map((id) => String(id))
    .filter(Boolean);
  const otherIds = knownIds.filter((id) => id !== String(apartmentId));

  const or = [{ car: apartmentId }];

  // Stale ObjectId fallback: same carNumber/regNumber, but not linked to another
  // apartment that still exists in the fleet.
  const staleCarClause =
    otherIds.length > 0
      ? { car: { $nin: otherIds } }
      : {};

  if (carNumber) {
    or.push({ ...staleCarClause, carNumber });
    or.push({ ...staleCarClause, regNumber: carNumber });
  }
  if (regNumber && regNumber !== carNumber) {
    or.push({ ...staleCarClause, regNumber });
    or.push({ ...staleCarClause, carNumber: regNumber });
  }

  const filter = { $or: or };
  if (options.excludeOrderId) {
    filter._id = { $ne: options.excludeOrderId };
  }
  return filter;
}

/**
 * Client-side mirror of {@link buildOrdersForApartmentFilter}.
 * @param {object} order
 * @param {object} apartment
 * @param {object[]} [knownApartments]
 */
export function orderBelongsToApartment(order, apartment, knownApartments = []) {
  if (!order || !apartment?._id) return false;

  const apartmentId = String(apartment._id);
  const orderCarId = order.car?._id ?? order.car;

  if (orderCarId != null && String(orderCarId) === apartmentId) {
    return true;
  }

  // Order already linked to a different known apartment → do not rematch by number.
  if (orderCarId != null && Array.isArray(knownApartments) && knownApartments.length) {
    const linkedElsewhere = knownApartments.some((apt) => {
      const id = apt?._id;
      return id != null && String(id) === String(orderCarId) && String(id) !== apartmentId;
    });
    if (linkedElsewhere) return false;
  }

  const aptCarNumber = norm(apartment.carNumber);
  const aptReg = norm(apartment.regNumber);
  const orderCarNumber = norm(order.carNumber ?? order.car?.carNumber);
  const orderReg = norm(order.regNumber ?? order.car?.regNumber);

  if (aptCarNumber) {
    if (orderCarNumber && orderCarNumber === aptCarNumber) return true;
    if (orderReg && orderReg === aptCarNumber) return true;
  }
  if (aptReg) {
    if (orderReg && orderReg === aptReg) return true;
    if (orderCarNumber && orderCarNumber === aptReg) return true;
  }

  return false;
}
