/**
 * @jest-environment node
 */
import {
  buildOrdersForApartmentFilter,
  orderBelongsToApartment,
} from "@/domain/orders/apartmentOrderLookup";

describe("apartmentOrderLookup", () => {
  const apartment = {
    _id: "aaaaaaaaaaaaaaaaaaaaaaaa",
    carNumber: "LMS-05",
    regNumber: "LMS-05",
  };
  const other = {
    _id: "cccccccccccccccccccccccc",
    carNumber: "LMS-01",
    regNumber: "LMS-01",
  };

  test("buildOrdersForApartmentFilter includes id and number fields", () => {
    expect(buildOrdersForApartmentFilter(apartment)).toEqual({
      $or: [
        { car: "aaaaaaaaaaaaaaaaaaaaaaaa" },
        { carNumber: "LMS-05" },
        { regNumber: "LMS-05" },
      ],
    });
  });

  test("buildOrdersForApartmentFilter excludes other known apartment ids on number match", () => {
    const filter = buildOrdersForApartmentFilter(apartment, {
      knownApartmentIds: [apartment._id, other._id],
    });
    expect(filter.$or).toEqual([
      { car: "aaaaaaaaaaaaaaaaaaaaaaaa" },
      { car: { $nin: [String(other._id)] }, carNumber: "LMS-05" },
      { car: { $nin: [String(other._id)] }, regNumber: "LMS-05" },
    ]);
  });

  test("orderBelongsToApartment matches stale car ObjectId via carNumber", () => {
    const order = {
      car: "bbbbbbbbbbbbbbbbbbbbbbbb",
      carNumber: "LMS-05",
      rentalStartDate: "2026-08-01",
    };
    expect(orderBelongsToApartment(order, apartment, [apartment, other])).toBe(
      true
    );
  });

  test("orderBelongsToApartment does not rematch when car points at another known suite", () => {
    const order = {
      car: other._id,
      carNumber: "LMS-05", // wrong / stale number on a live LMS-01 order
    };
    expect(orderBelongsToApartment(order, apartment, [apartment, other])).toBe(
      false
    );
  });

  test("orderBelongsToApartment rejects unrelated suite", () => {
    expect(
      orderBelongsToApartment(
        { car: "bbbbbbbbbbbbbbbbbbbbbbbb", carNumber: "LMS-01" },
        apartment,
        [apartment, other]
      )
    ).toBe(false);
  });
});
