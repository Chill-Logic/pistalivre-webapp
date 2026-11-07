import DOMPurify from "dompurify";

/**
 * Sanitize template HTML before showing it, and mark the {{variables}} so
 * the reader sees what gets filled in. Never render API HTML unsanitized.
 */
export function previewHtml(html: string) {
  const marked = html.replace(
    /\{\{\{?\s*([\w.]+)\s*\}?\}\}/g,
    '<mark data-var="$1">{{$1}}</mark>',
  );
  return DOMPurify.sanitize(marked, { ADD_ATTR: ["data-var"] });
}
