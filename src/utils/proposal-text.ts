/**
 * The proposal's HTML as plain text, to paste on WhatsApp (port of the
 * management app's `htmlToText`). The signature line — the one starting with
 * the company's legal name — is left out: the message carries the terms, not
 * the formal footer. One line per paragraph/item, no blank lines (in a chat a
 * gap between every item looks odd).
 */
export function proposalHtmlToText(html: string, omitLegalName = "") {
  const raw = html
    .replace(/<\/(p|h[1-6]|div|tr)>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
  const legal = omitLegalName.trim().toLowerCase();
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 0 && !(legal && line.toLowerCase().startsWith(legal)),
    )
    .join("\n");
}
