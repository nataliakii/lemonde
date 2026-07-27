import { NextResponse } from "next/server";
import { getCars } from "@/domain/services";
import { buildLocalizedSitemap } from "@lib/sitemap/sitemapBuilder";
import { sitemapToPrettyXml } from "@lib/sitemap/sitemapToXml";

/** Per-site sitemap: V Luxury uses apartment URLs on vluxury.kalikratia.com */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const cars = await getCars().catch(() => []);
    const entries = buildLocalizedSitemap(cars ?? []);
    const xml = sitemapToPrettyXml(entries);
    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  } catch (error) {
    console.error("[sitemap.xml]", error);
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n',
      {
        status: 500,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
