import type { TemplateVariableCatalog } from "@/types/template";

/** One entry of the variable menu, already with the text it inserts. */
export type VariableOption = {
  /** Unique in the menu (a key may repeat across groups). */
  id: string;
  key: string;
  label: string;
  description?: string;
  /** Example value, or the key when there is none. */
  hint: string;
  group: string;
  /**
   * `{{key}}` for a variable, even when the menu was opened with `{{{`: the
   * triple form skips HTML escaping, so a customer named "Bar & Cia <Ltda>"
   * would inject markup in the PDF. Only slots (whole HTML blocks) get it.
   */
  text: string;
};

/** What the highlight checks a `{{…}}` against. */
export type VariableSets = { keys: Set<string>; slots: Set<string> };

export type MustacheKind = "known" | "unknown" | "slot" | "helper" | "split";

/**
 * Menu order: the slots (body only), then each group's curated variables
 * followed by its raw ones (straight from the schema).
 */
export function flattenTemplateVariables(
  catalog: TemplateVariableCatalog | undefined,
  withSlots: boolean,
): VariableOption[] {
  if (!catalog) return [];
  const slots = withSlots
    ? catalog.slots.map((slot) => ({
        id: `slot:${slot.key}`,
        key: slot.key,
        label: slot.label,
        description: slot.description,
        hint: `{{{${slot.key}}}}`,
        group: "Blocos",
        text: `{{{${slot.key}}}}`,
      }))
    : [];
  const variables = catalog.groups.flatMap((group) =>
    [...group.variables, ...group.rawVariables].map((variable) => ({
      id: `${group.key}:${variable.key}`,
      key: variable.key,
      label: variable.label,
      description: variable.description,
      hint: variable.example ?? variable.key,
      group: group.label,
      text: `{{${variable.key}}}`,
    })),
  );
  return [...slots, ...variables];
}

/** Accent- and case-insensitive, so "caucao" finds "Caução". */
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * Ranked filter for what was typed after `{{`: key prefix, then label
 * prefix, then key/label/description containing it (same ranking as the
 * management editor).
 */
export function filterTemplateVariables(
  options: VariableOption[],
  query: string,
): VariableOption[] {
  const q = normalize(query.trim());
  if (!q) return options;

  const scored: { option: VariableOption; score: number; index: number }[] =
    [];
  options.forEach((option, index) => {
    const key = normalize(option.key);
    const label = normalize(option.label);
    const description = normalize(option.description ?? "");
    let score = -1;
    if (key.startsWith(q)) score = 0;
    else if (label.startsWith(q)) score = 1;
    else if (key.includes(q)) score = 2;
    else if (label.includes(q)) score = 3;
    else if (description.includes(q)) score = 4;
    if (score >= 0) scored.push({ option, score, index });
  });

  return scored
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map((entry) => entry.option);
}

export function variableSets(
  catalog: TemplateVariableCatalog | undefined,
): VariableSets {
  return {
    keys: new Set(
      (catalog?.groups ?? []).flatMap((group) =>
        [...group.variables, ...group.rawVariables].map((v) => v.key),
      ),
    ),
    slots: new Set((catalog?.slots ?? []).map((slot) => slot.key)),
  };
}

/** Block openers the renderer understands; their path is checked too. */
const BLOCK_OPENER = /^#(if|unless|each|with)\s+(.+)$/;

/**
 * What a `{{…}}` is. The path inside `{{#if x}}`/`{{#each x}}` is checked
 * like any variable, so a typo in a condition shows instead of silently
 * hiding the section. Closers, `else`, comments and loop-locals (`this.x`,
 * `@index`) stay neutral: they cannot be checked from one paragraph.
 */
export function classifyMustache(
  inner: string,
  sets: VariableSets,
): MustacheKind {
  const key = inner.trim();

  if (/^[/!>^]/.test(key) || key === "else" || key.startsWith("else ")) {
    return "helper";
  }

  const opener = BLOCK_OPENER.exec(key);
  if (opener) {
    const path = opener[2].trim().split(/\s+/)[0];
    if (path === "this" || path.startsWith("this.") || path.startsWith("@")) {
      return "helper";
    }
    return sets.keys.has(path) ? "helper" : "unknown";
  }

  // No custom helpers are registered: an unknown `{{#foo}}` renders nothing.
  if (key.startsWith("#")) return "unknown";
  if (key === "this" || key.startsWith("this.") || key.startsWith("@")) {
    return "helper";
  }
  if (sets.slots.has(key)) return "slot";
  if (sets.keys.has(key)) return "known";
  return "unknown";
}
