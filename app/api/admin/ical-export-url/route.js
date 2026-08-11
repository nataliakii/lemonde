import { getBaseUrl } from "@/config/domain";
import {
  buildIcalTokenForSlug,
  getIcalExportSecret,
  normalizeIcalSlug,
} from "@/domain/ical/buildIcal";
import { requireAdmin } from "@/lib/adminAuth";
import { connectToDB } from "@lib/database";
import { Apartment } from "@models/apartment";

/**
 * Returns the copyable iCal URL for a suite (admin only).
 * GET /api/admin/ical-export-url?slug=princess-suite
 */
export async function GET(request) {
  try {
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const secret = getIcalExportSecret();
    if (!secret) {
      return Response.json(
        {
          success: false,
          message:
            "ICAL_EXPORT_SECRET is not set. Add it to the server env, then reload.",
        },
        { status: 503 }
      );
    }

    const slug = normalizeIcalSlug(
      request.nextUrl.searchParams.get("slug") || ""
    );
    if (!slug) {
      return Response.json(
        { success: false, message: "slug is required" },
        { status: 400 }
      );
    }

    await connectToDB();
    const apartment = await Apartment.findOne({ slug })
      .select("_id slug model")
      .lean();

    if (!apartment) {
      return Response.json(
        { success: false, message: "Apartment not found" },
        { status: 404 }
      );
    }

    const token = buildIcalTokenForSlug(slug, secret);
    const url = `${getBaseUrl()}/api/ical/${encodeURIComponent(slug)}?token=${encodeURIComponent(token)}`;

    return Response.json({
      success: true,
      data: {
        slug,
        url,
        apartmentName: apartment.model || slug,
      },
    });
  } catch (error) {
    console.error("[ical-export-url GET]", error);
    return Response.json(
      { success: false, message: error.message || "Failed" },
      { status: 500 }
    );
  }
}
