import type { SuggestionMatch, Trigger } from "@tiptap/suggestion";

/**
 * `{{` detection, replacing @tiptap/suggestion's default matcher, which
 * misbehaves with a two-character brace trigger: it only fires after a
 * space (`valor{{` would never open), does not stop at `}` (parking the
 * caret after a finished `{{customer.name}}` re-opens it) and knows nothing
 * about `{{{` (the slot form).
 *
 * Anchored at the caret, so it matches the LAST opening. `#` and one space
 * are allowed so a hand-typed `{{#each ` keeps the menu open.
 */
const TRIGGER_RE = /(\{\{\{?)(#\w*(?:\s+[\w.[\]]*)?|[\w.[\]]*)$/;

/** One char per inline leaf keeps string offsets aligned with positions. */
export const LEAF_CHAR = "￼";

export function findVariableTrigger({ $position }: Trigger): SuggestionMatch {
  const parent = $position.parent;
  if (!parent.isTextblock || parent.type.spec.code) return null;

  const offset = $position.parentOffset;
  const before = parent.textBetween(0, offset, undefined, LEAF_CHAR);
  const match = TRIGGER_RE.exec(before);
  if (!match) return null;

  const from = $position.start() + match.index;
  let to = $position.pos;

  // Swallow a `}}`/`}}}` right after the caret: re-opening the menu inside
  // an existing variable then REPLACES it instead of nesting braces.
  const after = parent.textBetween(
    offset,
    parent.content.size,
    undefined,
    LEAF_CHAR,
  );
  const closing = /^\}\}\}?/.exec(after);
  if (closing) to += closing[0].length;

  return { range: { from, to }, query: match[2], text: match[0] };
}
