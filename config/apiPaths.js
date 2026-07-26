/**
 * Centralized API paths. Single source of truth for internal API routes.
 */

export const API_PATHS = {
  APARTMENT_ALL: "/api/apartment/all",
  APARTMENT_BY_ID: (id) => `/api/apartment/${id}`,
  APARTMENT_BY_SLUG: (slug) =>
    `/api/apartment/slug/${encodeURIComponent(slug)}`,
  APARTMENT_ADD_ONE: "/api/apartment/addOne",
  APARTMENT_UPDATE: "/api/apartment/update",
  APARTMENT_DELETE: (id) => `/api/apartment/delete/${id}`,
  APARTMENT_MODELS: "/api/apartment/models",

  /** @deprecated Use APARTMENT_* */
  CAR_ALL: "/api/apartment/all",
  CAR_BY_ID: (id) => `/api/apartment/${id}`,
  CAR_BY_SLUG: (slug) => `/api/apartment/slug/${encodeURIComponent(slug)}`,
  CAR_ADD_ONE: "/api/apartment/addOne",
  CAR_UPDATE: "/api/apartment/update",
  CAR_DELETE: (carId) => `/api/apartment/delete/${carId}`,
  CAR_MODELS: "/api/apartment/models",

  ORDER_ADD: "/api/order/add",
  ORDER_UPLOAD_DRIVING_LICENCE: "/api/order/upload-driving-licence",
  ORDER_BY_CAR: (carId) => `/api/order/${carId}`,
  ORDER_REFETCH: "/api/order/refetch",
  ORDER_REFETCH_ACTIVE: "/api/order/refetch-active",
  ORDER_REFETCH_ONE: (orderId) => `/api/order/refetch/${orderId}`,
  ORDER_UPDATE: (orderId) => `/api/order/update/${orderId}`,
  ORDER_UPDATE_MOVE_CAR: "/api/order/update/moveCar",
  ORDER_UPDATE_CHANGE_DATES: "/api/order/update/changeDates",
  ORDER_UPDATE_CUSTOMER: "/api/order/update/customer",
  ORDER_UPDATE_SWITCH_CONFIRM: (orderId) =>
    `/api/order/update/switchConfirm/${orderId}`,
  ORDER_UPDATE_SWITCH_ADMIN_APPROVED: (orderId) =>
    `/api/order/update/switchAdminApproved/${orderId}`,
  ORDER_DELETE_ONE: (orderId) => `/api/order/deleteOne/${orderId}`,
  ORDER_CALC_TOTAL_PRICE: "/api/order/calcTotalPrice",

  COMPANY: (id) => `/api/company/${id}`,
  COMPANY_BUFFER: (id) => `/api/company/buffer/${id}`,

  ADMIN_ORDERS: "/api/admin/orders",
  ADMIN_ORDERS_SEND_CONFIRMATION: "/api/admin/orders/send-confirmation",

  DISCOUNT: "/api/discount",
  SEND_EMAIL: "/api/sendEmail",
  TELEGRAM_SEND: "/api/telegram/send",
};
