/**
 * @jest-environment node
 */
import {
  buildApartmentIcalCalendar,
  buildIcalTokenForSlug,
  escapeIcalText,
  formatIcalUtc,
  isValidIcalToken,
  normalizeIcalSlug,
  orderToIcalStay,
} from "@/domain/ical/buildIcal";

describe("normalizeIcalSlug", () => {
  it("strips .ics and lowercases", () => {
    expect(normalizeIcalSlug("Princess-Suite.ICS")).toBe("princess-suite");
  });
});

describe("ical token", () => {
  const secret = "test-secret-at-least-16";

  it("accepts the matching per-slug token", () => {
    const token = buildIcalTokenForSlug("suite-a", secret);
    expect(token).toHaveLength(32);
    expect(isValidIcalToken("suite-a", token, secret)).toBe(true);
    expect(isValidIcalToken("suite-b", token, secret)).toBe(false);
  });
});

describe("formatIcalUtc", () => {
  it("formats UTC instants", () => {
    expect(formatIcalUtc(new Date("2026-08-12T11:00:00.000Z"))).toBe(
      "20260812T110000Z"
    );
  });
});

describe("escapeIcalText", () => {
  it("escapes commas and newlines", () => {
    expect(escapeIcalText("A, B\nC")).toBe("A\\, B\\nC");
  });
});

describe("orderToIcalStay", () => {
  it("prefers timeIn/timeOut", () => {
    const stay = orderToIcalStay({
      _id: "aaaaaaaaaaaaaaaaaaaaaaaa",
      orderNumber: "42",
      customerName: "Ada",
      rentalStartDate: new Date("2026-08-10T00:00:00.000Z"),
      rentalEndDate: new Date("2026-08-12T00:00:00.000Z"),
      timeIn: new Date("2026-08-10T15:00:00.000Z"),
      timeOut: new Date("2026-08-12T11:00:00.000Z"),
    });

    expect(stay.checkInAt.toISOString()).toBe("2026-08-10T15:00:00.000Z");
    expect(stay.checkOutAt.toISOString()).toBe("2026-08-12T11:00:00.000Z");
    expect(stay.summary).toContain("Ada");
    expect(stay.summary).toContain("#42");
  });
});

describe("buildApartmentIcalCalendar", () => {
  it("emits VEVENT blocks for stays", () => {
    const ical = buildApartmentIcalCalendar({
      slug: "princess-suite",
      apartmentName: "Princess Suite",
      stays: [
        {
          id: "order-1",
          checkInAt: new Date("2026-08-10T15:00:00.000Z"),
          checkOutAt: new Date("2026-08-12T11:00:00.000Z"),
          summary: "Guest Alpha",
        },
      ],
    });

    expect(ical).toContain("BEGIN:VCALENDAR");
    expect(ical).toContain("BEGIN:VEVENT");
    expect(ical).toContain("UID:order-1@princess-suite");
    expect(ical).toContain("DTSTART:20260810T150000Z");
    expect(ical).toContain("DTEND:20260812T110000Z");
    expect(ical).toContain("SUMMARY:Guest Alpha");
    expect(ical).toContain("END:VCALENDAR");
  });
});
