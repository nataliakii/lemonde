/**
 * Pure iCal helpers for exporting apartment stays (cleaning / channel sync).
 */

import { createHmac, timingSafeEqual } from "node:crypto";

export function normalizeIcalSlug(slug) {
  return String(slug || "")
    .trim()
    .toLowerCase()
    .replace(/\.ics$/i, "");
}

export function getIcalExportSecret() {
  return String(process.env.ICAL_EXPORT_SECRET || "").trim();
}

/** Stable per-suite token derived from the shared secret. */
export function buildIcalTokenForSlug(slug, secret = getIcalExportSecret()) {
  const normalized = normalizeIcalSlug(slug);
  if (!secret || !normalized) return null;
  return createHmac("sha256", secret)
    .update(`ical-export:${normalized}`)
    .digest("hex")
    .slice(0, 32);
}

export function isValidIcalToken(slug, token, secret = getIcalExportSecret()) {
  const expected = buildIcalTokenForSlug(slug, secret);
  if (!expected || token == null || String(token).trim() === "") {
    return false;
  }
  const provided = Buffer.from(String(token).trim());
  const wanted = Buffer.from(expected);
  if (provided.length !== wanted.length) {
    return false;
  }
  return timingSafeEqual(provided, wanted);
}

export function escapeIcalText(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Format a Date as UTC iCal DATE-TIME. */
export function formatIcalUtc(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  const s = String(d.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${day}T${h}${min}${s}Z`;
}

/**
 * @param {object} params
 * @param {string} params.slug
 * @param {string} [params.apartmentName]
 * @param {string} [params.prodId]
 * @param {Array<{
 *   id: string,
 *   checkInAt: Date,
 *   checkOutAt: Date,
 *   summary?: string,
 *   description?: string,
 * }>} params.stays
 */
export function buildApartmentIcalCalendar(params) {
  const slug = normalizeIcalSlug(params.slug);
  const prodId = params.prodId || `-//Le Monde Suites//iCal Export//EN`;
  const calName = params.apartmentName
    ? `${params.apartmentName} stays`
    : `${slug} stays`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${prodId}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcalText(calName)}`,
  ];

  const nowStamp = formatIcalUtc(new Date());

  for (const stay of params.stays || []) {
    const start = formatIcalUtc(stay.checkInAt);
    const end = formatIcalUtc(stay.checkOutAt);
    if (!start || !end) continue;
    if (new Date(stay.checkOutAt).getTime() <= new Date(stay.checkInAt).getTime()) {
      continue;
    }

    const uid = `${String(stay.id).trim()}@${slug || "apartment"}`;
    const summary =
      stay.summary?.trim() ||
      (params.apartmentName ? `Stay · ${params.apartmentName}` : "Guest stay");

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${escapeIcalText(uid)}`);
    if (nowStamp) lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`DTSTART:${start}`);
    lines.push(`DTEND:${end}`);
    lines.push(`SUMMARY:${escapeIcalText(summary)}`);
    if (stay.description?.trim()) {
      lines.push(`DESCRIPTION:${escapeIcalText(stay.description.trim())}`);
    }
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

/**
 * Map a lemonde Order lean doc to a stay window.
 * Prefer timeIn/timeOut; fall back to rentalStartDate / rentalEndDate.
 */
export function orderToIcalStay(order) {
  if (!order?._id) return null;

  const checkInAt = order.timeIn
    ? new Date(order.timeIn)
    : order.rentalStartDate
      ? new Date(order.rentalStartDate)
      : null;
  const checkOutAt = order.timeOut
    ? new Date(order.timeOut)
    : order.rentalEndDate
      ? new Date(order.rentalEndDate)
      : null;

  if (
    !checkInAt ||
    !checkOutAt ||
    Number.isNaN(checkInAt.getTime()) ||
    Number.isNaN(checkOutAt.getTime())
  ) {
    return null;
  }

  const name = String(order.customerName || "").trim();
  const orderNo = String(order.orderNumber || "").trim();
  const summary = [name || "Guest", orderNo ? `#${orderNo}` : null]
    .filter(Boolean)
    .join(" · ");

  return {
    id: `order-${String(order._id)}`,
    checkInAt,
    checkOutAt,
    summary,
    description: orderNo ? `Order ${orderNo}` : undefined,
  };
}
