/**
 * Apartment (unit) service — direct DB access for server and API routes.
 */

import { connectToDB } from "@lib/database";
import { Apartment } from "@models/apartment";
import { applyVisibilityToOrders } from "@/domain/orders/orderVisibility";
import {
  buildCarsOwnerFilter,
  canAccessOwnedDoc,
} from "@/domain/owners/ownerScope";
import { toPlain } from "./toPlain";

export async function getApartments(options = {}) {
  await connectToDB();
  const session = options?.session ?? null;
  const filter = buildCarsOwnerFilter(session);
  const apartments = await Apartment.find(filter).lean();
  return toPlain(apartments ?? []);
}

/** @deprecated Use getApartments */
export const getCars = getApartments;

export async function getApartmentById(id, options = {}) {
  await connectToDB();
  const apartment = await Apartment.findById(id).populate("orders").lean();
  if (!apartment) return null;
  const user = options?.session?.user ?? null;
  if (user?.isAdmin && !canAccessOwnedDoc(user, apartment)) {
    return null;
  }
  if (apartment.orders && Array.isArray(apartment.orders)) {
    apartment.orders = applyVisibilityToOrders(apartment.orders, user);
  }
  return toPlain(apartment);
}

/** @deprecated Use getApartmentById */
export const getCarById = getApartmentById;

export async function getApartmentBySlug(slug, options = {}) {
  await connectToDB();
  const normalized = String(slug).trim().toLowerCase();
  const apartment = await Apartment.findOne({ slug: normalized })
    .populate("orders")
    .lean();
  if (!apartment) return null;
  const user = options?.session?.user ?? null;
  if (user?.isAdmin && !canAccessOwnedDoc(user, apartment)) {
    return null;
  }
  if (apartment.orders && Array.isArray(apartment.orders)) {
    apartment.orders = applyVisibilityToOrders(apartment.orders, user);
  }
  return toPlain(apartment);
}

/** @deprecated Use getApartmentBySlug */
export const getCarBySlug = getApartmentBySlug;
