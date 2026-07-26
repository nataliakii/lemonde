# V Luxury Suites (Pefkohori) — deploy notes

This branch (`v-luxury-suites`) is a **separate property** from Le Monde Suites.

## Isolation from Le Monde

| | Le Monde (`main`) | V Luxury (this branch) |
|--|-------------------|-------------------------|
| Git | `main` | `v-luxury-suites` |
| Mongo DB | `lemonde` | `vluxury` (or any name ≠ `lemonde`) |
| `COMPANY_ID` | existing Le Monde id | `686f0a1b2c3d4e5f67890123` |
| Site URL | `https://lemonde.kalikratia.com` | your new host (set in env) |
| Vercel project | keep current | **new** project pointing at this branch |

Commits on this branch do **not** change `main` / Le Monde production until you merge (do not merge casually).

## Required env (new Vercel project / local `.env`)

```bash
MONGODB_URI=<same cluster OK>
MONGODB_DB_NAME=vluxury
COMPANY_ID=686f0a1b2c3d4e5f67890123
NEXT_PUBLIC_SITE_URL=https://YOUR-VLUXURY-HOST
NEXT_PUBLIC_API_BASE_URL=https://YOUR-VLUXURY-HOST
NEXTAUTH_URL=https://YOUR-VLUXURY-HOST
MAIL_FROM_NAME=V Luxury Suites
# phones/emails: same as Le Monde for now (SMTP_* unchanged)
CLOUDINARY_ROOT_FOLDER=vluxurysuites
```

Never point this deploy at `MONGODB_DB_NAME=lemonde`.

## Seed rooms

```bash
MONGODB_DB_NAME=vluxury COMPANY_ID=686f0a1b2c3d4e5f67890123 npm run seed:vluxury-apartments
```

The seed script **refuses** to run against `lemonde`.

## Photos

Room photos are empty after seed — upload via admin when ready (Booking assets are not copied).
