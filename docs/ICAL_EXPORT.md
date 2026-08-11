# iCal export (cleaning sync)

Lemonde exposes a **read-only** calendar feed per suite so Cleaning Actually can create turnover cleans after checkout.

## Setup

1. Set `ICAL_EXPORT_SECRET` in `.env` / Vercel (16+ random characters).
2. Restart the app.
3. Admin → edit apartment → **Cleaning sync (iCal)** → **Copy URL**.
4. In Cleaning Actually: **Sites** → that place → **Rental calendar** → paste URL → Enable → Save → **Sync now**.

## Endpoints

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/api/ical/[slug]?token=…` | HMAC token from `ICAL_EXPORT_SECRET` + slug |
| `GET` | `/api/admin/ical-export-url?slug=…` | Admin session (returns copyable URL) |

Feed includes **confirmed**, not-refused stays with checkout in the last 7 days through ~400 days ahead.
