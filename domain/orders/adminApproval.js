/**
 * Admin approval / refusal workflow (suites / staff review before client emails).
 *
 * Applies to website bookings (my_order) and orders created by a superadmin.
 * Offline stubs do not require this step.
 *
 * adminApproved and adminRefused are mutually exclusive.
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
  return Boolean(order?.adminApproved) && !Boolean(order?.adminRefused);
}

/**
 * @param {Object|null|undefined} order
 * @returns {boolean}
 */
export function isOrderAdminRefused(order) {
  return Boolean(order?.adminRefused) && !Boolean(order?.adminApproved);
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
  if (isOrderAdminRefused(order)) return false;
  if (!orderRequiresAdminApproval(order)) return true;
  return isOrderAdminApproved(order);
}

/**
 * Superadmin may send a refusal email only after admin marked the order refused.
 *
 * @param {Object|null|undefined} order
 * @returns {boolean}
 */
export function canSendClientRefusalEmail(order) {
  if (!order) return false;
  if (!orderRequiresAdminApproval(order)) return false;
  return isOrderAdminRefused(order);
}

/**
 * Visual stage for calendar / badges.
 * @returns {"closed"|"stub"|"confirmed"|"adminApproved"|"adminRefused"|"pending"}
 */
export function getOrderApprovalStage(order) {
  if (!order) return "pending";
  if (isOrderPaidAndClosed(order.status)) return "closed";
  if (order.offline === true) return "stub";
  if (order.confirmed === true) return "confirmed";
  if (orderRequiresAdminApproval(order) && isOrderAdminRefused(order)) {
    return "adminRefused";
  }
  if (
    orderRequiresAdminApproval(order) &&
    isOrderAdminApproved(order) &&
    !order.confirmed
  ) {
    return "adminApproved";
  }
  return "pending";
}
