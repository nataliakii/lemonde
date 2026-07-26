import { formatAdminNotificationBody } from "../adminNotifyLocales";

function createOrderCreatedPayload(overrides = {}) {
  return {
    intent: "ORDER_CREATED",
    orderNumber: "1001",
    orderId: "o1",
    carModel: "Le Monde Suites, 2",
    regNumber: "LMS-02",
    rentalStartDate: "2026-01-15T22:00:00.000Z",
    rentalEndDate: "2026-01-17T22:00:00.000Z",
    timeIn: "2026-01-15T12:00:00.000Z",
    timeOut: "2026-01-17T10:00:00.000Z",
    placeIn: "Airport",
    placeOut: "City",
    numberOfDays: 2,
    totalPrice: 199,
    insurance: "TPL",
    drivingLicenceUrls: [],
    ...overrides,
  };
}

describe("formatAdminNotificationBody ORDER_CREATED (suites)", () => {
  it("uses apartment / check-in labels and omits car-only blocks", () => {
    const lic =
      "https://res.cloudinary.com/demo/image/upload/v1/order/licence.jpg";
    const body = formatAdminNotificationBody(
      createOrderCreatedPayload({
        drivingLicenceUrls: [lic],
        insurance: "CDW",
      }),
      "New client order created",
      "en",
      { includeDrivingLicenceInfo: true }
    );
    expect(body).toContain("🏠 Apartment:");
    expect(body).toContain("📅 Check-in:");
    expect(body).toContain("📅 Check-out:");
    expect(body).not.toContain("Driver's licence");
    expect(body).not.toContain(lic);
    expect(body).not.toContain("Insurance: CDW");
    expect(body).not.toContain("📍 Location:");
  });

  it("uses Russian apartment strings for ru locale", () => {
    const body = formatAdminNotificationBody(
      createOrderCreatedPayload(),
      "New client order created",
      "ru",
      { includeDrivingLicenceInfo: true }
    );
    expect(body).toContain("🏠 Апартаменты:");
    expect(body).toContain("📅 Заезд:");
    expect(body).not.toContain("Водительские права");
  });

  it("omits driving licence block completely when licence info is disabled", () => {
    const lic =
      "https://res.cloudinary.com/demo/image/upload/v1/order/licence.jpg";
    const body = formatAdminNotificationBody(
      createOrderCreatedPayload({
        drivingLicenceUrls: [lic],
        hasDrivingLicenceUpload: true,
      }),
      "New client order created",
      "en",
      { includeDrivingLicenceInfo: false }
    );
    expect(body).not.toContain("Driver's licence");
    expect(body).not.toContain(lic);
  });
});

describe("formatAdminNotificationBody non-create (e.g. Telegram update)", () => {
  it("includes apartment label before action", () => {
    const body = formatAdminNotificationBody(
      {
        intent: "CRITICAL_EDIT",
        orderNumber: "55",
        orderId: "id",
        carModel: "X",
        regNumber: "R1",
        action: "UPDATE_DATES",
        source: "ADMIN_UI",
        actorName: "Admin",
        timestamp: "2026-01-01T00:00:00.000Z",
      },
      "CRITICAL: CRITICAL_EDIT on confirmed client order",
      "en",
      { includeDrivingLicenceInfo: false }
    );
    expect(body).toContain("Apartment:");
    expect(body).toContain("Action:");
  });
});
