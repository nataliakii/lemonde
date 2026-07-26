import { formatDate, formatDateRange, formatTime } from "@utils/businessTime";
import { SINGLE_PROPERTY_MODE } from "@/config/domain";

const LABELS = {
  en: {
    subject: "Day report {{date}} — check-ins / check-outs",
    checkIns: "Check-ins {{date}}",
    checkOuts: "Check-outs {{date}}",
    noneIn: "No check-ins on this date",
    noneOut: "No check-outs on this date",
    apartment: "Apartment",
    unit: "Unit code",
    dates: "Dates",
    client: "Client",
    phone: "Phone",
    pickup: "Pick-up",
    return: "Return",
    flight: "Flight",
    time: "Time",
  },
  ru: {
    subject: "Сводка на {{date}} — заезды / выезды",
    checkIns: "Заезды (check-in) {{date}}",
    checkOuts: "Выезды (check-out) {{date}}",
    noneIn: "Нет заездов на эту дату",
    noneOut: "Нет выездов на эту дату",
    apartment: "Апартамент",
    unit: "Код",
    dates: "Срок",
    client: "Клиент",
    phone: "Телефон",
    pickup: "Место получения",
    return: "Место возврата",
    flight: "Рейс",
    time: "Время",
  },
  el: {
    subject: "Αναφορά ημέρας {{date}} — check-in / check-out",
    checkIns: "Check-in {{date}}",
    checkOuts: "Check-out {{date}}",
    noneIn: "Δεν υπάρχουν check-in αυτή την ημερομηνία",
    noneOut: "Δεν υπάρχουν check-out αυτή την ημερομηνία",
    apartment: "Διαμέρισμα",
    unit: "Κωδικός",
    dates: "Διάστημα",
    client: "Πελάτης",
    phone: "Τηλέφωνο",
    pickup: "Παραλαβή",
    return: "Επιστροφή",
    flight: "Πτήση",
    time: "Ώρα",
  },
  de: {
    subject: "Tagesbericht {{date}} — Check-ins / Check-outs",
    checkIns: "Check-ins {{date}}",
    checkOuts: "Check-outs {{date}}",
    noneIn: "Keine Check-ins an diesem Datum",
    noneOut: "Keine Check-outs an diesem Datum",
    apartment: "Apartment",
    unit: "Code",
    dates: "Zeitraum",
    client: "Kunde",
    phone: "Telefon",
    pickup: "Abholung",
    return: "Rückgabe",
    flight: "Flug",
    time: "Zeit",
  },
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function placeLabel(place, detail) {
  const p = String(place || "").trim();
  const d = String(detail || "").trim();
  if (!p) return "-";
  if (p.toLowerCase() === "thessaloniki" && d) return `${p} — ${d}`;
  return p;
}

function cell(value) {
  return `<td style="padding:6px 8px;border:1px solid #ddd;white-space:nowrap;">${escapeHtml(
    value || "-"
  )}</td>`;
}

function buildCheckInRows(orders) {
  return orders
    .map((order) => {
      const flight =
        String(order.placeIn || "").toLowerCase() === "airport"
          ? order.flightNumber || "-"
          : "-";
      if (SINGLE_PROPERTY_MODE) {
        return `<tr>
          ${cell(order.carModel)}
          ${cell(formatDateRange(order.rentalStartDate, order.rentalEndDate))}
          ${cell(formatTime(order.timeIn) || "-")}
          ${cell(order.customerName)}
          ${cell(order.phone)}
        </tr>`;
      }
      return `<tr>
        ${cell(order.carModel)}
        ${cell(order.regNumber || order.carNumber)}
        ${cell(formatDateRange(order.rentalStartDate, order.rentalEndDate))}
        ${cell(formatTime(order.timeIn) || "-")}
        ${cell(order.customerName)}
        ${cell(order.phone)}
        ${cell(placeLabel(order.placeIn, order.placeInDetail))}
        ${cell(flight)}
      </tr>`;
    })
    .join("");
}

function buildCheckOutRows(orders) {
  return orders
    .map((order) => {
      if (SINGLE_PROPERTY_MODE) {
        return `<tr>
          ${cell(order.carModel)}
          ${cell(formatDateRange(order.rentalStartDate, order.rentalEndDate))}
          ${cell(formatTime(order.timeOut) || "-")}
          ${cell(order.customerName)}
          ${cell(order.phone)}
        </tr>`;
      }
      return `<tr>
        ${cell(order.carModel)}
        ${cell(order.regNumber || order.carNumber)}
        ${cell(formatDateRange(order.rentalStartDate, order.rentalEndDate))}
        ${cell(formatTime(order.timeOut) || "-")}
        ${cell(order.customerName)}
        ${cell(order.phone)}
        ${cell(placeLabel(order.placeOut, order.placeOutDetail))}
      </tr>`;
    })
    .join("");
}

function sectionTable({ title, emptyText, headerCells, rowsHtml }) {
  if (!rowsHtml) {
    return `<h2 style="font-size:16px;margin:24px 0 8px;">${escapeHtml(
      title
    )}</h2>
      <p style="color:#666;">${escapeHtml(emptyText)}</p>`;
  }
  return `<h2 style="font-size:16px;margin:24px 0 8px;">${escapeHtml(
    title
  )}</h2>
    <table style="border-collapse:collapse;width:100%;font-size:13px;">
      <thead>
        <tr style="background:#f5f5f5;">
          ${headerCells
            .map(
              (h) =>
                `<th style="padding:6px 8px;border:1px solid #ddd;text-align:left;">${escapeHtml(
                  h
                )}</th>`
            )
            .join("")}
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>`;
}

/**
 * Build subject + HTML for admin day check-in/check-out report.
 */
export function buildDayReportEmail({
  dateLabel,
  locale = "en",
  startedOrders = [],
  endedOrders = [],
}) {
  const lang = LABELS[locale] ? locale : "en";
  const L = LABELS[lang];
  const withDate = (tpl) => tpl.replace("{{date}}", dateLabel || "");

  const subject = withDate(L.subject);
  const checkInHeaders = SINGLE_PROPERTY_MODE
    ? [L.apartment, L.dates, L.time, L.client, L.phone]
    : [
        L.apartment,
        L.unit,
        L.dates,
        L.time,
        L.client,
        L.phone,
        L.pickup,
        L.flight,
      ];
  const checkOutHeaders = SINGLE_PROPERTY_MODE
    ? [L.apartment, L.dates, L.time, L.client, L.phone]
    : [L.apartment, L.unit, L.dates, L.time, L.client, L.phone, L.return];

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="UTF-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:24px;font-family:sans-serif;color:#1a1a1a;">
  ${sectionTable({
    title: withDate(L.checkIns),
    emptyText: L.noneIn,
    headerCells: checkInHeaders,
    rowsHtml: buildCheckInRows(startedOrders),
  })}
  ${sectionTable({
    title: withDate(L.checkOuts),
    emptyText: L.noneOut,
    headerCells: checkOutHeaders,
    rowsHtml: buildCheckOutRows(endedOrders),
  })}
</body>
</html>`;

  const text = [
    withDate(L.checkIns),
    startedOrders.length
      ? startedOrders
          .map(
            (o) =>
              SINGLE_PROPERTY_MODE
                ? `- ${o.carModel || "-"} / ${o.customerName || "-"} / ${o.phone || "-"}`
                : `- ${o.carModel || "-"} / ${o.regNumber || o.carNumber || "-"} / ${o.customerName || "-"} / ${o.phone || "-"}`
          )
          .join("\n")
      : L.noneIn,
    "",
    withDate(L.checkOuts),
    endedOrders.length
      ? endedOrders
          .map(
            (o) =>
              SINGLE_PROPERTY_MODE
                ? `- ${o.carModel || "-"} / ${o.customerName || "-"} / ${o.phone || "-"}`
                : `- ${o.carModel || "-"} / ${o.regNumber || o.carNumber || "-"} / ${o.customerName || "-"} / ${o.phone || "-"}`
          )
          .join("\n")
      : L.noneOut,
  ].join("\n");

  return { subject, html, text };
}

export function formatDayReportDateLabel(dateInput) {
  if (!dateInput) return "";
  return formatDate(dateInput, "DD.MM.YY");
}
