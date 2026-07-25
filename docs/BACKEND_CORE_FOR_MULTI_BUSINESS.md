# Backend core map — for future multi-business documentation

This document freezes the **stable core** of the current Next.js + MongoDB booking backend after the Le Monde Suites remap (apartments UI on top of the historical `Car` unit model). Use it as the baseline when extracting a shared engine that can serve different businesses (cars, apartments, etc.).

## Stable entities

| Entity | Model file | Role |
|--------|------------|------|
| **Company** | `models/company.js` | Property / business settings: seasons, buffer, contacts, working hours |
| **Unit** (stored as `Apartment`) | `models/apartment.js` | Bookable inventory. Mongo collection: **`apartments`**. Legacy `models/car.js` re-exports. |
| **Order** | `models/order.js` | Stay/rental booking: dates/times, guest PII, `confirmed`, `my_order`, `offline`, `status`, FK `car` / `carNumber` / `carModel` |
| **User** | `models/user.js` | Auth: `role` `ADMIN=1` / `SUPERADMIN=2`, optional `ownerId` |
| **PriceBreakdown** | `models/PriceBreakdown.js` | Frozen line items when order is confirmed |

## Stable domain flows

```
Public booking  →  POST /api/order/add  →  Order(my_order=true, confirmed=false)
Admin calendar  →  domain/calendar + BigCalendar  →  conflict checks
Confirm         →  PATCH /api/order/update/switchConfirm/[orderId]
Official email  →  POST /api/admin/orders/send-confirmation  (often SUPERADMIN)
```

Key modules:

- Calendar / overlaps: `domain/calendar/`
- Confirm + conflicts: `domain/orders/confirmOrderFlow.js`, `domain/booking/`
- Access policy: `domain/orders/orderAccessPolicy.js`, `domain/orders/orderRbacShim.js`
- Auth guards: `lib/adminAuth.js` (`requireAdmin`, `requireSuperAdmin`), NextAuth in `lib/authOptions.js`
- Notifications: `domain/orders` notification policy + email/telegram helpers

## Roles (current single-property mode)

| Role | Scope |
|------|--------|
| **ADMIN** | Manage units & orders for the property; **can confirm client bookings** |
| **SUPERADMIN** | Same + owners tooling (hidden in UI when `SINGLE_PROPERTY_MODE`), force overrides, confirmation email PDF |

Flag: `SINGLE_PROPERTY_MODE` in `config/domain.js` (currently `true`).

## API surface (core vs business-specific)

### Core (keep for any business)

- `POST /api/order/add`
- `PATCH /api/order/update/*` (incl. `switchConfirm`, move unit)
- `GET` order refetch / admin order lists
- `POST /api/apartment/addOne`, apartment update/delete/list (unit CRUD; `/api/car/*` re-exports)
- `GET /api/company`
- `/api/auth/[...nextauth]`

Migration: `npm run migrate:cars-to-apartments` renames Mongo `cars` → `apartments`.

Canonical URL: **only** `NEXT_PUBLIC_SITE_URL` (`config/domain.js`).
### Business-specific (extract / plugin later)

- Delivery zones + delivery price slices (`models/DeliveryZone.js`, `domain/delivery/`)
- Transfers (`models/Transfer.js`, `/api/transfers`, `/admin/transfers`)
- Multi-owner fleet (`/api/admin/owners`, `ownerId` scoping)
- Car SEO location pages (`domain/locationSeo/`, aggregator API)
- Unit schema extras: transmission, fuel, kasko, child seats, licence uploads

## What “multi-business” should mean later

1. **Shared kernel:** Company + Unit + Order + User + calendar conflicts + confirm + notifications.
2. **Business pack:** unit field schema, public booking form fields, pricing extras, SEO, legal copy, theme/brand.
3. **Request router:** map host or `businessType` → pack (validation, DTO labels, optional modules). Do **not** fork calendars per business.

Until then, apartments reuse the car collection and APIs; UI and enums speak “apartment/suite”.

## Related docs in repo

- `docs/ORDER_FLOW.md` — order lifecycle (still car-oriented wording in places)
- `docs/MULTI_TENANT.md` — owner scoping (disabled in UX under single-property mode)
- `docs/TIMEZONE_GUIDE.md` — Athens business TZ
