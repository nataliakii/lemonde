/**
 * Admin approval workflow (suites / staff review before client confirmation email).
 *
 * Applies to website bookings (my_order) and orders created by a superadmin.
 * Offline stubs do not require this step.
 */

import { isOrderPaidAndClosed } from "@/domain/orders/orderStatus";

/** createdByRole on Order: 0 = admin, 1 = superadmin */
export const ORDER_CREATED_BY_SUPERADMIN = 1;

/**
 * @param {Object|null|undefined} order
 * @returns {boolean}
 */
export function orderRequiresAdminApproval(order) {
  if (!order) return false;
  if (order.offline === true) return false;
  if (isOrderPaidAndClosed(order.status)) return false;
  if (order.my_order === true) return true;
  if (Number(order.createdByRole) === ORDER_CREATED_BY_SUPERADMIN) return true;
  return false;
}

/**
 * @param {Object|null|undefined} order
 * @returns {boolean}
 */
export function isOrderAdminApproved(order) {
  return Boolean(order?.adminApproved);
}

/**
 * Superadmin may send the official client confirmation email only after
 * admin approval (when the order requires it).
 *
 * @param {Object|null|undefined} order
 * @returns {boolean}
 */
export function canSendClientConfirmationEmail(order) {
  if (!order) return false;
  if (!orderRequiresAdminApproval(order)) return true;
  return isOrderAdminApproved(order);
}

/**
 * Visual stage for calendar / badges.
 * @returns {"closed"|"stub"|"confirmed"|"adminApproved"|"pending"}
 */
export function getOrderApprovalStage(order) {
  if (!order) return "pending";
  if (isOrderPaidAndClosed(order.status)) return "closed";
  if (order.offline === true) return "stub";
  if (order.confirmed === true) return "confirmed";
  if (
    orderRequiresAdminApproval(order) &&
    isOrderAdminApproved(order) &&
    !order.confirmed
  ) {
    return "adminApproved";
  }
  return "pending";
}
