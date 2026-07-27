import type { MetadataRoute } from "next";

const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";
const XHTML_NS = "http://www.w3.org/1999/xhtml";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Google prefers W3C date or full datetime; date-only is safest. */
function toSitemapLastmod(value: string | Date): string {
  const iso =
    typeof value === "string" ? value : new Date(value).toISOString();
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return d.toISOString().slice(0, 10);
}

/**
 * Builds a pretty-printed sitemap XML string from Next.js Sitemap entries.
 * Uses explicit closing tags (Google Search Console is picky about self-closing xhtml links).
 */
export function sitemapToPrettyXml(entries: MetadataRoute.Sitemap): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<urlset xmlns="${SITEMAP_NS}" xmlns:xhtml="${XHTML_NS}">`,
  ];

  const indent = "  ";
  const indent2 = "    ";

  for (const entry of entries) {
    if (!entry?.url) continue;

    lines.push(`${indent}<url>`);
    lines.push(`${indent2}<loc>${escapeXml(entry.url)}</loc>`);

    if (entry.lastModified) {
      lines.push(
        `${indent2}<lastmod>${escapeXml(toSitemapLastmod(entry.lastModified))}</lastmod>`
      );
    }
    if (entry.changeFrequency) {
      lines.push(
        `${indent2}<changefreq>${escapeXml(entry.changeFrequency)}</changefreq>`
      );
    }
    if (entry.priority != null && Number.isFinite(Number(entry.priority))) {
      const p = Math.min(1, Math.max(0, Number(entry.priority)));
      lines.push(`${indent2}<priority>${p.toFixed(1)}</priority>`);
    }

    const languages = entry.alternates?.languages;
    if (languages && typeof languages === "object") {
      const locales = Object.keys(languages).sort();
      for (const locale of locales) {
        const href = languages[locale];
        if (!href) continue;
        // Absolute URLs required; builder already absolutizes via toAbsoluteUrl.
        lines.push(
          `${indent2}<xhtml:link rel="alternate" hreflang="${escapeXml(locale)}" href="${escapeXml(href)}"></xhtml:link>`
        );
      }
    }

    lines.push(`${indent}</url>`);
  }

  lines.push("</urlset>");
  return `${lines.join("\n")}\n`;
}
