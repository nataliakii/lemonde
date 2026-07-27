import { MetadataRoute } from "next";
import { getBaseUrl, SINGLE_PROPERTY_MODE } from "@config/domain";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  const disallow = ["/admin/", "/api/", "/login", "/car/"];
  if (SINGLE_PROPERTY_MODE) {
    // Legacy car routes redirect; keep them out of the index.
    disallow.push("/cars/");
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    // Per-site sitemap (V Luxury → vluxury.kalikratia.com/sitemap.xml)
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
