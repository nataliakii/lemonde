import { NextResponse } from "next/server";

import {
  isValidIcalToken,
  normalizeIcalSlug,
} from "@/domain/ical/buildIcal";
import { buildIcalForApartmentSlug } from "@/domain/ical/loadApartmentIcal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public iCal feed for one suite.
 * GET /api/ical/[slug]?token=…
 *
 * Paste this URL into Cleaning Actually → Sites → Rental calendar.
 */
export async function GET(request, { params }) {
  try {
    const slug = normalizeIcalSlug(params?.slug);
    if (!slug) {
      return new NextResponse("Slug required", { status: 400 });
    }

    const token =
      request.nextUrl.searchParams.get("token") ||
      request.headers.get("x-ical-token") ||
      "";

    if (!isValidIcalToken(slug, token)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const result = await buildIcalForApartmentSlug(slug);
    if (!result) {
      return new NextResponse("Apartment not found", { status: 404 });
    }

    return new NextResponse(result.ical, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `inline; filename="${slug}.ics"`,
        "Cache-Control": "no-store",
        "X-Ical-Events": String(result.eventCount),
      },
    });
  } catch (error) {
    console.error("[ical GET]", error);
    return new NextResponse("Failed to build calendar", { status: 500 });
  }
}
