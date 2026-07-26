import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/adminAuth";
import { connectToDB } from "@lib/database";
import { Order } from "@models/order";
import { Apartment } from "@models/apartment";
import { getCompany } from "@/domain/services/companyService";
import { COMPANY_ID } from "@config/company";
import { sendEmailDirect } from "@/lib/email/sendDirect";
import {
  buildDayReportEmail,
  formatDayReportDateLabel,
} from "@/domain/orders/buildDayReportEmail";
import { formatDate } from "@utils/businessTime";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUPPORTED_LOCALES = new Set(["en", "ru", "el", "de"]);

function normalizeEmail(value) {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

function normalizeLocale(value) {
  if (typeof value !== "string") return "en";
  const lang = value.trim().toLowerCase().split("-")[0];
  return SUPPORTED_LOCALES.has(lang) ? lang : "en";
}

function toObjectIds(ids) {
  if (!Array.isArray(ids)) return [];
  return ids
    .map((id) => String(id || "").trim())
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
}

async function loadOrdersWithReg(ids) {
  if (!ids.length) return [];
  const orders = await Order.find({ _id: { $in: ids } })
    .select(
      "carModel carNumber customerName phone placeIn placeInDetail placeOut placeOutDetail flightNumber rentalStartDate rentalEndDate timeIn timeOut car"
    )
    .lean();

  const carIds = [
    ...new Set(
      orders
        .map((o) => (o.car ? String(o.car) : null))
        .filter(Boolean)
    ),
  ];
  const cars = carIds.length
    ? await Apartment.find({ _id: { $in: carIds } })
        .select("regNumber carNumber")
        .lean()
    : [];
  const regByCarId = new Map(
    cars.map((c) => [String(c._id), c.regNumber || c.carNumber || ""])
  );

  const byId = new Map(
    orders.map((o) => [
      String(o._id),
      {
        ...o,
        regNumber: o.car ? regByCarId.get(String(o.car)) || o.carNumber : o.carNumber,
      },
    ])
  );

  // Preserve client order of IDs
  return ids.map((id) => byId.get(String(id))).filter(Boolean);
}

/**
 * POST { date, to?, locale?, startedOrderIds?, endedOrderIds? }
 * Emails check-in / check-out day report. Default recipient = company.email.
 */
export async function POST(request) {
  try {
    await connectToDB();
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const body = await request.json().catch(() => ({}));
    const dateRaw = typeof body.date === "string" ? body.date.trim() : "";
    if (!dateRaw) {
      return NextResponse.json(
        { success: false, message: "date is required" },
        { status: 400 }
      );
    }

    const dateKey = formatDate(dateRaw, "YYYY-MM-DD") || dateRaw;
    const locale = normalizeLocale(body.locale);
    const company = await getCompany(COMPANY_ID);
    const companyEmail = normalizeEmail(company?.email);
    const requestedTo = normalizeEmail(body.to);
    const toEmail = requestedTo || companyEmail;

    if (!toEmail || !EMAIL_RE.test(toEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid recipient email is required",
        },
        { status: 400 }
      );
    }

    const startedIds = toObjectIds(body.startedOrderIds);
    const endedIds = toObjectIds(body.endedOrderIds);

    const [startedOrders, endedOrders] = await Promise.all([
      loadOrdersWithReg(startedIds),
      loadOrdersWithReg(endedIds),
    ]);

    const dateLabel = formatDayReportDateLabel(dateKey);
    const { subject, html, text } = buildDayReportEmail({
      dateLabel,
      locale,
      startedOrders,
      endedOrders,
    });

    await sendEmailDirect({
      title: subject,
      message: text,
      html,
      to: [toEmail],
    });

    return NextResponse.json({
      success: true,
      to: toEmail,
      startedCount: startedOrders.length,
      endedCount: endedOrders.length,
    });
  } catch (error) {
    console.error("[send-day-report POST]", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to send day report email",
      },
      { status: 500 }
    );
  }
}
