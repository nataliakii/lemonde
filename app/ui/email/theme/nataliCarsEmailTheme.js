/**
 * V Luxury Suites email theme — silver / platinum inline styles.
 */

export const EMAIL_STYLE = {
  bgPage: "#F4F5F7",
  bgCard: "#FFFFFF",
  bgDetailsCard: "#F0F2F4",
  bgPriceBlock: "#E8EBEE",
  text: "#1B1E24",
  muted: "#6B727C",
  accent: "#9AA3AD",
  border: "#D2D6DB",
  /** Slate header */
  headerTeal: "#1B1E24",
  headerText: "#D0D5DB",
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
