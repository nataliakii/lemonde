import {
  snapshotFromEditedOrder,
  isOrderEditDirtyAgainstBaseline,
} from "../orderEditDirty";
import dayjs from "dayjs";

describe("isOrderEditDirtyAgainstBaseline", () => {
  const start = dayjs("2026-08-05T14:00:00");
  const end = dayjs("2026-08-07T12:00:00");

  const edited = {
    car: "apt1",
    rentalStartDate: dayjs("2026-08-05"),
    rentalEndDate: dayjs("2026-08-07"),
    placeIn: "Nea Kallikratia",
    placeOut: "Nea Kallikratia",
    placeInDetail: "",
    placeOutDetail: "",
    ChildSeats: 0,
    insurance: "TPL",
    franchiseOrder: 0,
    totalPrice: 100,
    OverridePrice: null,
    numberOfDays: 2,
    customerName: "Stub",
    phone: "",
    email: "",
    secondDriver: false,
    Viber: false,
    Whatsapp: false,
    Telegram: false,
    flightNumber: "",
    drivingLicenceUrls: [],
    offline: true,
    guestsCount: 2,
    childrenCount: 0,
    needsTransfer: false,
    needsBabyBed: false,
  };

  test("same as baseline → not dirty", () => {
    const baseline = snapshotFromEditedOrder(edited, start, end);
    expect(
      isOrderEditDirtyAgainstBaseline(baseline, edited, start, end, false)
    ).toBe(false);
  });

  test("user change → dirty", () => {
    const baseline = snapshotFromEditedOrder(edited, start, end);
    const changed = { ...edited, guestsCount: 4 };
    expect(
      isOrderEditDirtyAgainstBaseline(baseline, changed, start, end, false)
    ).toBe(true);
  });

  test("no baseline yet → not dirty", () => {
    expect(
      isOrderEditDirtyAgainstBaseline(null, edited, start, end, false)
    ).toBe(false);
  });
});
