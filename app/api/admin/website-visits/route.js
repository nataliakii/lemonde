import { connectToDB } from "@lib/database";
import { requireSuperAdmin } from "@/lib/adminAuth";
import WebsiteVisit from "@models/WebsiteVisit";
import { buildHumansOnlyWebsiteVisitMongoClause } from "@/domain/visitors/websiteVisitNotification";

function parsePositiveInt(value, fallback, { min = 1, max = 200 } = {}) {
  const n = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function parseDays(value, fallback = 7) {
  return parsePositiveInt(value, fallback, { min: 1, max: 90 });
}

function parseBool(value, fallback = true) {
  if (value == null || value === "") return fallback;
  const s = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(s)) return true;
  if (["0", "false", "no", "off"].includes(s)) return false;
  return fallback;
}

/**
 * GET /api/admin/website-visits (superadmin)
 * Query: days=7, page=1, limit=50, country=, q=, humansOnly=1 (default)
 */
export async function GET(request) {
  try {
    await connectToDB();
    const { errorResponse } = await requireSuperAdmin(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const days = parseDays(searchParams.get("days"), 7);
    const page = parsePositiveInt(searchParams.get("page"), 1, {
      min: 1,
      max: 1000,
    });
    const limit = parsePositiveInt(searchParams.get("limit"), 50, {
      min: 1,
      max: 100,
    });
    const country = String(searchParams.get("country") || "").trim();
    const q = String(searchParams.get("q") || "").trim();
    const humansOnly = parseBool(searchParams.get("humansOnly"), true);

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const filter = { createdAt: { $gte: since } };

    if (humansOnly) {
      Object.assign(filter, buildHumansOnlyWebsiteVisitMongoClause());
    }

    if (country) {
      filter.country = new RegExp(
        `^${country.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        "i"
      );
    }

    if (q) {
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(safe, "i");
      filter.$or = [
        { url: rx },
        { path: rx },
        { ip: rx },
        { city: rx },
        { region: rx },
        { host: rx },
        { language: rx },
      ];
    }

    const skip = (page - 1) * limit;

    const [total, visits, byDay, byCountry, byPath] = await Promise.all([
      WebsiteVisit.countDocuments(filter),
      WebsiteVisit.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WebsiteVisit.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      WebsiteVisit.aggregate([
        { $match: filter },
        {
          $group: {
            _id: { $ifNull: ["$country", ""] },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 12 },
      ]),
      WebsiteVisit.aggregate([
        { $match: filter },
        {
          $group: {
            _id: { $ifNull: ["$path", ""] },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 12 },
      ]),
    ]);

    return Response.json({
      success: true,
      data: {
        visits,
        total,
        page,
        limit,
        days,
        humansOnly,
        stats: {
          byDay: byDay.map((row) => ({ date: row._id, count: row.count })),
          byCountry: byCountry.map((row) => ({
            country: row._id || "unknown",
            count: row.count,
          })),
          byPath: byPath.map((row) => ({
            path: row._id || "/",
            count: row.count,
          })),
        },
      },
    });
  } catch (error) {
    console.error("[website-visits GET]", error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
