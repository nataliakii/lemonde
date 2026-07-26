import mongoose from "mongoose";
import { Order } from "@models/order";
import { connectToDB } from "@lib/database";
import { requireAdmin } from "@/lib/adminAuth";
import { orderRequiresAdminApproval } from "@/domain/orders/adminApproval";
import { isOrderPaidAndClosed } from "@/domain/orders/orderStatus";
import { applyVisibilityToOrders } from "@/domain/orders/orderVisibility";
import { toPlain } from "@/domain/services/toPlain";

const JSON_HEADERS = { "Content-Type": "application/json" };

function toObjectIdOrNull(value) {
  if (value == null || value === "") return null;
  const s = String(value);
  if (!mongoose.Types.ObjectId.isValid(s)) return null;
  return new mongoose.Types.ObjectId(s);
}

/**
 * PATCH — set/clear adminApproved or adminRefused (mutually exclusive).
 * Body (optional): { action: "approve" | "refuse" }
 * - approve: toggle Admin OK (clears refuse when approving)
 * - refuse: toggle Admin refused (clears approve when refusing)
 * - omitted: legacy toggle of adminApproved only (also clears refuse when approving)
 */
export const PATCH = async (request, { params }) => {
  try {
    await connectToDB();

    const { session, errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    if (!session?.user) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid session" }),
        { status: 401, headers: JSON_HEADERS }
      );
    }

    const { orderId } = params;
    const order = await Order.findById(orderId);

    if (!order) {
      return new Response(
        JSON.stringify({ success: false, message: "Order not found" }),
        { status: 404, headers: JSON_HEADERS }
      );
    }

    if (isOrderPaidAndClosed(order.status)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Closed orders cannot be updated",
        }),
        { status: 403, headers: JSON_HEADERS }
      );
    }

    if (!orderRequiresAdminApproval(order)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "This order does not require admin approval",
        }),
        { status: 400, headers: JSON_HEADERS }
      );
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const action =
      body?.action === "refuse" || body?.action === "approve"
        ? body.action
        : "approve";

    const actorId = toObjectIdOrNull(session.user?.id || session.user?._id);
    const now = new Date();
    let message = "";

    if (action === "refuse") {
      const next = !Boolean(order.adminRefused);
      order.adminRefused = next;
      order.adminRefusedAt = next ? now : null;
      order.adminRefusedBy = next ? actorId : null;
      if (next) {
        order.adminApproved = false;
        order.adminApprovedAt = null;
        order.adminApprovedBy = null;
      }
      message = next ? "Admin refused" : "Admin refusal removed";
    } else {
      const next = !Boolean(order.adminApproved);
      order.adminApproved = next;
      order.adminApprovedAt = next ? now : null;
      order.adminApprovedBy = next ? actorId : null;
      if (next) {
        order.adminRefused = false;
        order.adminRefusedAt = null;
        order.adminRefusedBy = null;
      }
      message = next ? "Admin approved" : "Admin approval removed";
    }

    await order.save();

    const plain = toPlain(order.toObject ? order.toObject() : order);
    const [visible] = applyVisibilityToOrders([plain], session.user);

    return new Response(
      JSON.stringify({
        success: true,
        data: visible,
        message,
      }),
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (error) {
    console.error("[switchAdminApproved]", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error?.message || "Failed to update admin approval",
      }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
};
