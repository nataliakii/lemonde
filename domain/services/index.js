/**
 * Domain services — direct DB access for server components and API routes.
 * Use these instead of calling internal API routes via fetch from server code.
 */

export {
  getApartments,
  getCars,
  getApartmentById,
  getCarById,
  getApartmentBySlug,
  getCarBySlug,
} from "./apartmentService";
export { getCompany } from "./companyService";
export { getActiveOrders, getAllOrders } from "./orderService";
