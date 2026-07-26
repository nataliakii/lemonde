import {
  canSendClientConfirmationEmail,
  getOrderApprovalStage,
  isOrderAdminApproved,
  orderRequiresAdminApproval,
} from "../adminApproval";
import { getOrderColor } from "../getOrderColor";
import { ORDER_COLORS } from "@/config/orderColors";

describe("adminApproval helpers", () => {
  test("website orders require admin approval", () => {
    expect(
      orderRequiresAdminApproval({ my_order: true, confirmed: false })
    ).toBe(true);
  });

  test("superadmin-created orders require admin approval", () => {
    expect(
      orderRequiresAdminApproval({
        my_order: false,
        createdByRole: 1,
        confirmed: false,
      })
    ).toBe(true);
  });

  test("offline stubs and regular admin drafts do not require approval", () => {
    expect(
      orderRequiresAdminApproval({ my_order: false, offline: true })
    ).toBe(false);
    expect(
      orderRequiresAdminApproval({
        my_order: false,
        createdByRole: 0,
        offline: false,
      })
    ).toBe(false);
  });

  test("send confirmation is gated until adminApproved", () => {
    const order = { my_order: true, adminApproved: false };
    expect(canSendClientConfirmationEmail(order)).toBe(false);
    expect(
      canSendClientConfirmationEmail({ ...order, adminApproved: true })
    ).toBe(true);
  });

  test("stage and color: pending → adminApproved → confirmed", () => {
    const pending = { my_order: true, confirmed: false, adminApproved: false };
    const approved = { my_order: true, confirmed: false, adminApproved: true };
    const confirmed = { my_order: true, confirmed: true, adminApproved: true };

    expect(getOrderApprovalStage(pending)).toBe("pending");
    expect(getOrderApprovalStage(approved)).toBe("adminApproved");
    expect(getOrderApprovalStage(confirmed)).toBe("confirmed");

    expect(isOrderAdminApproved(approved)).toBe(true);
    expect(getOrderColor(pending).key).toBe(ORDER_COLORS.PENDING_CLIENT.key);
    expect(getOrderColor(approved).key).toBe(ORDER_COLORS.ADMIN_APPROVED.key);
    expect(getOrderColor(confirmed).key).toBe(ORDER_COLORS.CONFIRMED_CLIENT.key);
  });
});
