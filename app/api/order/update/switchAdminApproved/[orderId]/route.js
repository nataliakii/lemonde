import { Order } from "@models/order";
import { connectToDB } from "@lib/database";
import { requireAdmin } from "@/lib/adminAuth";
import {
  orderRequiresAdminApproval,
} from "@/domain/orders/adminApproval";
import { isOrderPaidAndClosed } from "@/domain/orders/orderStatus";
import { applyVisibilityToOrders } from "@/domain/orders/orderVisibility";
import { toPlain } from "@/domain/services/toPlain";

const JSON_HEADERS = { "Content-Type": "application/json" };

/**
 * PATCH — toggle adminApproved for website / superadmin-created orders.
 * Admin and Superadmin may toggle (e.g. Superadmin after a phone booking).
 * Closed and offline orders are rejected.
 */
export const PATCH = async (request, { params }) => {
  try {
    await connectToDB();

    const { session, errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

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

    const next = !Boolean(order.adminApproved);
    order.adminApproved = next;
    order.adminApprovedAt = next ? new Date() : null;
    order.adminApprovedBy = next ? session.user?.id || session.user?._id || null : null;

    await order.save();

    const plain = toPlain(order.toObject ? order.toObject() : order);
    const [visible] = applyVisibilityToOrders([plain], session.user);

    return new Response(
      JSON.stringify({
        success: true,
        data: visible,
        message: next ? "Admin approved" : "Admin approval removed",
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
