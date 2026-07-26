/**
 * Le Monde Suites email theme — inline styles for email clients.
 */

export const EMAIL_STYLE = {
  bgPage: "#F2F1EF",
  bgCard: "#FFFCFA",
  bgDetailsCard: "#F7F5F1",
  bgPriceBlock: "#F5F0E6",
  text: "#1A1612",
  muted: "#6B655C",
  accent: "#C9A227",
  border: "#E8E6E2",
  /** Espresso header */
  headerTeal: "#1A1612",
  headerText: "#E8D5A3",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

export function escapeHtml(s) {
  if (s == null || s === "") return "";
  const str = String(s);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Convert **text** to <strong>text</strong> for HTML; inner content is escaped.
 */
export function strongFromMarkdown(s) {
  if (s == null || s === "") return "";
  return String(s).replace(/\*\*([^*]+)\*\*/g, (_, inner) =>
    "<strong style=\"color:" + EMAIL_STYLE.accent + ";\">" + escapeHtml(inner) + "</strong>"
  );
}
