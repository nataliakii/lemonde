import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import { authOptions } from "@lib/authOptions";
import { connectToDB } from "@lib/database";
import { Order } from "@models/order";
import { Apartment } from "@models/apartment";
import { ROLE } from "@models/user";
import { renderCustomerBookingRefusalEmail } from "@/app/ui/email/renderEmail";
import { pickCustomerEmailLocale } from "@locales/customerEmail";
import { canSendClientRefusalEmail } from "@/domain/orders/adminApproval";

const SUPPORTED_LOCALES = new Set(["en", "ru", "el", "de", "bg", "ro", "sr", "uk", "pl"]);
const INTERNAL_PASSWORD_HEADER = "x-internal-password";
const DEFAULT_CC_EMAIL = "admin@bbqr.site";

function normalizeLocale(input) {
  if (typeof input !== "string") return "en";
  const normalized = input.trim().toLowerCase();
  if (!normalized) return "en";
  return SUPPORTED_LOCALES.has(normalized) ? normalized : "en";
}

function normalizeEmail(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const isSuperAdminSession =
      session?.user?.isAdmin === true && session?.user?.role === ROLE.SUPERADMIN;

    const expectedInternalPassword = process.env.ORDER_CONFIRMATION_INTERNAL_PASSWORD;
    const providedInternalPassword = request.headers
      .get(INTERNAL_PASSWORD_HEADER)
      ?.trim();
    const hasInternalPassword =
      typeof expectedInternalPassword === "string" &&
      expectedInternalPassword.length > 0 &&
      providedInternalPassword === expectedInternalPassword;

    if (!isSuperAdminSession && !hasInternalPassword) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const orderId = typeof body?.orderId === "string" ? body.orderId.trim() : "";
    const adminUiLocale = normalizeLocale(body?.locale);

    if (!orderId) {
      return NextResponse.json(
        { message: "orderId is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { message: "Invalid orderId format" },
        { status: 400 }
      );
    }

    await connectToDB();
    const order = await Order.findById(orderId).lean();

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (!canSendClientRefusalEmail(order)) {
      return NextResponse.json(
        {
          message:
            "Admin refusal is required before sending a refusal email to the guest",
        },
        { status: 403 }
      );
    }

    const locale =
      order.my_order === true
        ? pickCustomerEmailLocale(order, adminUiLocale)
        : "en";

    const customerEmail = normalizeEmail(order.email);
    if (!customerEmail) {
      return NextResponse.json(
        { message: "Order has no customer email" },
        { status: 400 }
      );
    }

    let regNumber =
      typeof order.regNumber === "string" ? order.regNumber.trim() : "";
    if (!regNumber && order.car && mongoose.Types.ObjectId.isValid(String(order.car))) {
      const car = await Apartment.findById(order.car).select("regNumber").lean();
      regNumber =
        typeof car?.regNumber === "string" ? car.regNumber.trim() : "";
    }

    const ccEmail =
      normalizeEmail(process.env.ORDER_CONFIRMATION_CC_EMAIL) || DEFAULT_CC_EMAIL;

    const payload = {
      orderId: order._id?.toString?.() || order._id,
      orderNumber: order.orderNumber,
      regNumber,
      carNumber: order.carNumber,
      carModel: order.carModel,
      rentalStartDate: order.rentalStartDate,
      rentalEndDate: order.rentalEndDate,
      timeIn: order.timeIn,
      timeOut: order.timeOut,
      placeIn: order.placeIn,
      placeOut: order.placeOut,
      numberOfDays: order.numberOfDays,
      totalPrice:
        order.OverridePrice !== null && order.OverridePrice !== undefined
          ? order.OverridePrice
          : order.totalPrice,
      customerName: order.customerName,
      phone: order.phone,
      email: customerEmail,
      locale,
      fromLocalhost: order.fromLocalhost === true,
    };

    const { title, text, html } = renderCustomerBookingRefusalEmail(payload);

    const sendEmailResponse = await fetch(
      `${new URL(request.url).origin}/api/sendEmail`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          title,
          text,
          html,
          to: [customerEmail],
          cc: [ccEmail],
        }),
      }
    );

    if (!sendEmailResponse.ok) {
      const errorBody = await sendEmailResponse
        .json()
        .catch(() => ({ message: "Email service error" }));
      const message =
        errorBody?.error || errorBody?.message || "Failed to send email";
      return NextResponse.json(
        { message },
        { status: sendEmailResponse.status }
      );
    }

    const flagUpdateResult = await Order.updateOne(
      { _id: order._id },
      { $set: { IsRefusalEmailSent: true } }
    );
    if (!flagUpdateResult?.acknowledged || flagUpdateResult?.matchedCount === 0) {
      return NextResponse.json(
        { message: "Email sent, but failed to persist IsRefusalEmailSent flag" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Refusal email sent",
        sentTo: customerEmail,
        cc: ccEmail,
        orderId,
        locale,
        IsRefusalEmailSent: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[send-refusal] error:", error);
    return NextResponse.json(
      {
        message: "Failed to send refusal email",
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
