export type HighlightPart = { text: string; hit: boolean };

/** One char folded (no accent, lower case) — keeps positions aligned with the original. */
const foldChar = (c: string) => c.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().charAt(0) || c;

/**
 * Splits `text` into pieces marking where any of `tokens` (already folded)
 * appears, ignoring accents and case: "João" is marked for "joao".
 */
export function highlightParts(text: string, tokens: string[]): HighlightPart[] {
  if (!text || tokens.length === 0) return [{ text, hit: false }];
  const folded = Array.from(text, foldChar).join("");
  const chars = Array.from(text);
  if (folded.length !== chars.length) return [{ text, hit: false }];
  const marks = new Array<boolean>(chars.length).fill(false);
  for (const token of tokens) {
    if (!token) continue;
    let at = folded.indexOf(token);
    while (at >= 0) {
      for (let i = at; i < at + token.length; i += 1) marks[i] = true;
      at = folded.indexOf(token, at + token.length);
    }
  }
  const parts: HighlightPart[] = [];
  chars.forEach((c, i) => {
    const last = parts[parts.length - 1];
    if (last && last.hit === marks[i]) last.text += c;
    else parts.push({ text: c, hit: marks[i] });
  });
  return parts;
}
