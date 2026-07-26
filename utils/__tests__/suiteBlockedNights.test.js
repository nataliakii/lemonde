import { getOccupiedNightKeys } from "../suiteBlockedNights";
import { isApartmentAvailableForStay } from "../stayAvailability";

/** Athens midnight as UTC ISO (Europe/Athens, no DST edge cases used here). */
function athensDayUtcIso(ymd) {
  return `${ymd}T00:00:00+03:00`;
}

describe("getOccupiedNightKeys", () => {
  test("returns empty set for no orders", () => {
    expect(getOccupiedNightKeys([]).size).toBe(0);
    expect(getOccupiedNightKeys(null).size).toBe(0);
  });

  test("inventory hold: pending website orders occupy nights", () => {
    const keys = getOccupiedNightKeys([
      {
        confirmed: false,
        offline: false,
        my_order: true,
        rentalStartDate: athensDayUtcIso("2026-08-03"),
        rentalEndDate: athensDayUtcIso("2026-08-06"),
      },
    ]);
    expect([...keys].sort()).toEqual([
      "2026-08-03",
      "2026-08-04",
      "2026-08-05",
    ]);
  });

  test("legacy mode: unconfirmed non-offline ignored when inventoryHold=false", () => {
    const keys = getOccupiedNightKeys(
      [
        {
          confirmed: false,
          offline: false,
          my_order: true,
          rentalStartDate: athensDayUtcIso("2026-08-03"),
          rentalEndDate: athensDayUtcIso("2026-08-06"),
        },
      ],
      { inventoryHold: false }
    );
    expect([...keys]).toEqual([]);
  });

  test("blocks nights as [checkIn, checkOut) for confirmed stay", () => {
    const keys = getOccupiedNightKeys([
      {
        confirmed: true,
        rentalStartDate: athensDayUtcIso("2026-08-03"),
        rentalEndDate: athensDayUtcIso("2026-08-06"),
      },
    ]);
    expect([...keys].sort()).toEqual([
      "2026-08-03",
      "2026-08-04",
      "2026-08-05",
    ]);
    expect(keys.has("2026-08-06")).toBe(false);
  });

  test("offline orders block dates like confirmed", () => {
    const keys = getOccupiedNightKeys([
      {
        confirmed: false,
        offline: true,
        rentalStartDate: athensDayUtcIso("2026-09-01"),
        rentalEndDate: athensDayUtcIso("2026-09-03"),
      },
    ]);
    expect([...keys].sort()).toEqual(["2026-09-01", "2026-09-02"]);
  });
});

describe("isApartmentAvailableForStay", () => {
  test("checkout day is free for the next guest", () => {
    const orders = [
      {
        confirmed: true,
        rentalStartDate: athensDayUtcIso("2026-08-03"),
        rentalEndDate: athensDayUtcIso("2026-08-06"),
      },
    ];
    // Previous guest checks out 6 Aug → new stay starting 6 Aug is free
    expect(isApartmentAvailableForStay(orders, "2026-08-06", "2026-08-08")).toBe(
      true
    );
    expect(isApartmentAvailableForStay(orders, "2026-08-05", "2026-08-08")).toBe(
      false
    );
  });

  test("pending website request blocks catalog stay search", () => {
    const orders = [
      {
        confirmed: false,
        my_order: true,
        rentalStartDate: athensDayUtcIso("2026-07-29"),
        rentalEndDate: athensDayUtcIso("2026-08-04"),
      },
    ];
    expect(isApartmentAvailableForStay(orders, "2026-07-28", "2026-08-04")).toBe(
      false
    );
  });
});
