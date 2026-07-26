/**
 * Customer booking refusal email (suite not available / request declined).
 */

import { EMAIL_STYLE, escapeHtml } from "@/app/ui/email/theme/nataliCarsEmailTheme";
import { EMAIL_SIGNATURE_HTML } from "@/app/ui/email/templates/signature";

/**
 * @param {{
 *   title: string,
 *   greeting: string,
 *   intro: string,
 *   detailsHeading: string,
 *   orderNumberLabel: string,
 *   orderNumberValue: string,
 *   vehicleLabel: string,
 *   vehicleValue: string,
 *   rentalPeriodLabel: string,
 *   rentalPeriodValue: string,
 *   closing: string,
 * }} data
 * @returns {string}
 */
export function renderCustomerBookingRefusal(data) {
  const s = EMAIL_STYLE;
  const {
    title,
    greeting,
    intro,
    detailsHeading,
    orderNumberLabel,
    orderNumberValue,
    vehicleLabel,
    vehicleValue,
    rentalPeriodLabel,
    rentalPeriodValue,
    closing,
  } = data;

  const row = (label, value) =>
    `<tr>
      <td style="padding:10px 0;border-bottom:1px solid ${s.border};vertical-align:top;">
        <div style="font-size:12px;color:${s.muted};text-transform:uppercase;letter-spacing:0.4px;margin-bottom:4px;">${escapeHtml(label)}</div>
        <div style="font-size:15px;color:${s.text};font-weight:600;">${escapeHtml(value)}</div>
      </td>
    </tr>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${s.bgPage};font-family:${s.fontSans};color:${s.text};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${s.bgPage};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:12px;padding:28px 24px;border:1px solid ${s.border};">
          <tr>
            <td>
              <div style="font-size:20px;font-weight:700;color:${s.accent};margin-bottom:16px;">${escapeHtml(title)}</div>
              <p style="margin:0 0 12px;line-height:1.55;">${escapeHtml(greeting)}</p>
              <p style="margin:0 0 20px;line-height:1.55;">${escapeHtml(intro)}</p>
              <div style="font-size:13px;font-weight:600;color:${s.accent};margin-bottom:8px;">${escapeHtml(detailsHeading)}</div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${row(orderNumberLabel, orderNumberValue)}
                ${row(vehicleLabel, vehicleValue)}
                ${row(rentalPeriodLabel, rentalPeriodValue)}
              </table>
              <p style="margin:20px 0 0;line-height:1.55;">${escapeHtml(closing)}</p>
              <div style="margin-top:24px;">${EMAIL_SIGNATURE_HTML}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
