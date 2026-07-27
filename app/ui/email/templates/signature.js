/**
 * Email signature — brand from getSeoConfig() (Mongo company / property defaults).
 */

import {
  PUBLIC_CONTACT_EMAIL,
  getEmailSiteHost,
  getEmailSiteUrl,
} from "@config/email";
import { getSeoConfig } from "@config/seo";

const siteUrl = getEmailSiteUrl();
const siteHost = getEmailSiteHost();
const seo = getSeoConfig();
const siteName = seo.siteName || "V Luxury Suites";
const tagline =
  seo.placeName
    ? `Suites in ${seo.placeName}, Halkidiki`
    : "Suites in Pefkohori, Halkidiki";

export const EMAIL_SIGNATURE_HTML = `
<div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #e0e0e0;">
  <div style="text-align: center; font-size: 13px; color: #616161; line-height: 1.8;">
    <div style="margin-bottom: 8px;">
      <strong style="color: #1A1612; font-size: 14px;">${siteName}</strong>
    </div>
    <div style="color: #757575; margin-bottom: 12px;">
      ${tagline}
    </div>
    <div style="margin-top: 16px;">
      <a href="${siteUrl}" style="color: #C9A227; text-decoration: none; margin: 0 12px;">
        🌐 ${siteHost}
      </a>
      <span style="color: #bdbdbd;">|</span>
      <a href="mailto:${PUBLIC_CONTACT_EMAIL}" style="color: #C9A227; text-decoration: none; margin: 0 12px;">
        ✉️ ${PUBLIC_CONTACT_EMAIL}
      </a>
    </div>
  </div>
</div>`;

export const EMAIL_SIGNATURE_TEXT = `--

${siteName}
${tagline}

Website: ${siteUrl}
Email: ${PUBLIC_CONTACT_EMAIL}`;
