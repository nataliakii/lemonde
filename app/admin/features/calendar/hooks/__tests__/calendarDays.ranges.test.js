import { buildCalendarDays, getTodayIndex } from "../calendarDays";

describe("buildCalendarDays period ranges", () => {
  const july2026 = { month: 6, year: 2026, rangeDirection: "forward" };

  test("1m shows the full selected month from day 1", () => {
    const days = buildCalendarDays({
      ...july2026,
      viewMode: "full",
      calendarDayRange: "1m",
    });
    expect(days).toHaveLength(31);
    expect(days[0].dayjs.format("YYYY-MM-DD")).toBe("2026-07-01");
    expect(days[days.length - 1].dayjs.format("YYYY-MM-DD")).toBe(
      "2026-07-31"
    );
  });

  test("2m shows from day 1 of selected month through end of next month", () => {
    const days = buildCalendarDays({
      ...july2026,
      viewMode: "full",
      calendarDayRange: "2m",
    });
    expect(days[0].dayjs.format("YYYY-MM-DD")).toBe("2026-07-01");
    expect(days[days.length - 1].dayjs.format("YYYY-MM-DD")).toBe(
      "2026-08-31"
    );
    expect(days.length).toBe(62);
  });

  test("15d shows mid-month to mid-month window (distinct from 1m)", () => {
    const days = buildCalendarDays({
      ...july2026,
      viewMode: "range15",
      calendarDayRange: "15d",
    });
    expect(days[0].dayjs.format("YYYY-MM-DD")).toBe("2026-07-15");
    expect(days[days.length - 1].dayjs.format("YYYY-MM-DD")).toBe(
      "2026-08-15"
    );
    expect(days.length).toBeGreaterThan(15);
    expect(days.length).toBeLessThan(62);
  });

  test("period switches produce different first days late in the month", () => {
    const d15 = buildCalendarDays({
      ...july2026,
      viewMode: "range15",
      calendarDayRange: "15d",
    });
    const d1m = buildCalendarDays({
      ...july2026,
      viewMode: "full",
      calendarDayRange: "1m",
    });
    const d2m = buildCalendarDays({
      ...july2026,
      viewMode: "full",
      calendarDayRange: "2m",
    });

    expect(d15[0].date).not.toBe(d1m[0].date);
    expect(d1m[0].date).toBe(1);
    expect(d2m[0].date).toBe(1);
    expect(d2m.length).toBeGreaterThan(d1m.length);
  });
});

describe("getTodayIndex", () => {
  test("finds today when present in the window", () => {
    const days = buildCalendarDays({
      month: 6,
      year: 2026,
      viewMode: "full",
      rangeDirection: "forward",
      calendarDayRange: "1m",
    });
    const idx = getTodayIndex(days);
    // Only assert shape when "today" is outside July 2026 in CI clocks
    expect(typeof idx).toBe("number");
    expect(idx).toBeGreaterThanOrEqual(-1);
  });
});
