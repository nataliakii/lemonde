/**
 * Email configuration — Le Monde Suites
 */

import { getBaseUrl } from "@config/domain";

/** Display name in From: header */
export const MAIL_FROM_NAME =
  String(process.env.MAIL_FROM_NAME || "").trim() || "Le Monde Suites";

/**
 * Primary inbox for admin/dev notifications (CC / fallback To).
 * Prefer MAIL_FROM_TO_ADMIN, then SMTP_USER, then public stay address.
 */
export const DEVELOPER_EMAIL =
  String(process.env.MAIL_FROM_TO_ADMIN || "").trim() ||
  String(process.env.SMTP_USER || "").trim() ||
  "admin@bbqr.site";

/** Public contact shown in signatures */
export const PUBLIC_CONTACT_EMAIL =
  String(process.env.PUBLIC_CONTACT_EMAIL || "").trim() ||
  "admin@bbqr.site";

/** Site URL for email footers */
export function getEmailSiteUrl() {
  return getBaseUrl();
}

/** Host label for footers, e.g. lemonde.kalikratia.com */
export function getEmailSiteHost() {
  try {
    return new URL(getEmailSiteUrl()).host;
  } catch {
    return "lemonde.kalikratia.com";
  }
}

export function getMailFromHeader(smtpUser) {
  const user = smtpUser || process.env.SMTP_USER || PUBLIC_CONTACT_EMAIL;
  return `${MAIL_FROM_NAME} <${user}>`;
}
