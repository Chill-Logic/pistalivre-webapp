import type { TemplateVariableCatalog } from "@/types/template";

/**
 * Handlebars blocks offered in the menu (editor knowledge, not catalog
 * data). Inserted as `opener` + caret + `closer`; `%s` is the chosen path.
 */
export type BlockDef = {
  opener: string;
  closer: string;
  /** What may fill `%s`: any variable, only lists, or nothing. */
  needs?: "any" | "list";
};

const BLOCKS: {
  key: string;
  label: string;
  description: string;
  block: BlockDef;
}[] = [
  {
    key: "#if",
    label: "Se … então",
    description: "Mostra o trecho só quando o campo estiver preenchido.",
    block: { opener: "{{#if %s}}", closer: "{{/if}}", needs: "any" },
  },
  {
    key: "#unless",
    label: "Se NÃO … então",
    description:
      "O contrário do “Se”: mostra o trecho quando o campo estiver vazio.",
    block: { opener: "{{#unless %s}}", closer: "{{/unless}}", needs: "any" },
  },
  {
    key: "#each",
    label: "Repetir para cada item",
    description:
      "Repete o trecho para cada item de uma lista (ex.: as parcelas da caução).",
    block: { opener: "{{#each %s}}", closer: "{{/each}}", needs: "list" },
  },
  {
    key: "else",
    label: "Senão",
    description:
      "Alternativa dentro de um “Se”: use entre a abertura e o fechamento.",
    block: { opener: "{{else}}", closer: "" },
  },
];

const BLOCKS_GROUP = "Condições e repetições";

/** One entry of the variable menu, already with the text it inserts. */
export type VariableOption = {
  /** Unique in the menu (a key may repeat across groups). */
  id: string;
  type: "variable" | "slot" | "item" | "block";
  key: string;
  label: string;
  description?: string;
  /** The catalog kind ("text", "list"…); blocks and slots have none. */
  kind?: string;
  /** Example value, or the key when there is none. */
  hint: string;
  group: string;
  /**
   * `{{key}}` for a variable, even when the menu was opened with `{{{`: the
   * triple form skips HTML escaping, so a customer named "Bar & Cia <Ltda>"
   * would inject markup in the PDF. Only slots (whole HTML blocks) get it.
   */
  text: string;
  block?: BlockDef;
};

/** What the highlight checks a `{{…}}` against. */
export type VariableSets = {
  keys: Set<string>;
  slots: Set<string>;
  /** Declared list-item fields, e.g. "this.amount". */
  itemKeys: Set<string>;
};

export type MustacheKind = "known" | "unknown" | "slot" | "helper" | "split";

/**
 * Menu order: the slots (body only), each group's curated variables then
 * its raw ones (straight from the schema), the fields of a list item (for
 * inside `#each`) and the blocks (`#if`, `#each`…).
 */
export function flattenTemplateVariables(
  catalog: TemplateVariableCatalog | undefined,
  withSlots: boolean,
): VariableOption[] {
  if (!catalog) return [];
  const slots: VariableOption[] = withSlots
    ? catalog.slots.map((slot) => ({
        id: `slot:${slot.key}`,
        type: "slot",
        key: slot.key,
        label: slot.label,
        description: slot.description,
        hint: `{{{${slot.key}}}}`,
        group: "Blocos",
        text: `{{{${slot.key}}}}`,
      }))
    : [];
  const variables: VariableOption[] = catalog.groups.flatMap((group) =>
    [...group.variables, ...group.rawVariables].map((variable) => ({
      id: `${group.key}:${variable.key}`,
      type: "variable",
      key: variable.key,
      label: variable.label,
      description: variable.description,
      kind: variable.kind,
      hint: variable.example ?? variable.key,
      group: group.label,
      text: `{{${variable.key}}}`,
    })),
  );
  const items: VariableOption[] = catalog.groups.flatMap((group) =>
    group.variables.flatMap((list) =>
      (list.itemFields ?? []).map((field) => ({
        id: `item:${list.key}:${field.key}`,
        type: "item",
        key: `this.${field.key}`,
        label: field.label,
        description: field.description,
        kind: field.kind,
        hint: field.example ?? `this.${field.key}`,
        group: `Dentro de “Repetir” em ${list.label}`,
        text: `{{this.${field.key}}}`,
      })),
    ),
  );
  const blocks: VariableOption[] = BLOCKS.map((block) => ({
    id: `block:${block.key}`,
    type: "block",
    key: block.key,
    label: block.label,
    description: block.description,
    hint: block.block.opener.replace(" %s", ""),
    group: BLOCKS_GROUP,
    text: block.block.opener.replace("%s", "") + block.block.closer,
    block: block.block,
  }));
  return [...slots, ...variables, ...items, ...blocks];
}

/**
 * A block waiting for its path, read from the text: `{{#each caution.inst`
 * → the each block + "caution.inst". Null while the block name is still
 * being typed (no space yet), so the block list keeps filtering.
 */
export function splitBlockQuery(
  query: string,
): { key: string; label: string; block: BlockDef; rest: string } | null {
  const match = /^(#\w+)\s+(.*)$/.exec(query.trimStart());
  if (!match) return null;
  const def = BLOCKS.find((block) => block.key === match[1]);
  if (!def?.block.needs) return null;
  return { key: def.key, label: def.label, block: def.block, rest: match[2] };
}

/** Variables a block's path may be (only lists for `#each`). */
export function pathOptions(
  options: VariableOption[],
  needs: "any" | "list",
): VariableOption[] {
  return options.filter(
    (option) =>
      (option.type === "variable" || option.type === "item") &&
      (needs === "any" || option.kind === "list"),
  );
}

/** Accent- and case-insensitive, so "caucao" finds "Caução". */
function normalize(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
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
  // `#` is reaching for block syntax: match keys only, or every variable
  // whose description mentions a block would show up.
  const keysOnly = q.startsWith("#");

  const scored: { option: VariableOption; score: number; index: number }[] = [];
  options.forEach((option, index) => {
    const key = normalize(option.key);
    const label = normalize(option.label);
    const description = normalize(option.description ?? "");
    let score = -1;
    if (key.startsWith(q)) score = 0;
    else if (keysOnly) score = -1;
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
    itemKeys: new Set(
      (catalog?.groups ?? []).flatMap((group) =>
        group.variables.flatMap((list) =>
          (list.itemFields ?? []).map((field) => `this.${field.key}`),
        ),
      ),
    ),
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
    if (sets.itemKeys.has(path)) return "helper";
    if (path === "this" || path.startsWith("this.") || path.startsWith("@")) {
      return "helper";
    }
    return sets.keys.has(path) ? "helper" : "unknown";
  }

  // No custom helpers are registered: an unknown `{{#foo}}` renders nothing.
  if (key.startsWith("#")) return "unknown";
  if (sets.itemKeys.has(key)) return "known";
  if (key === "this" || key.startsWith("this.") || key.startsWith("@")) {
    return "helper";
  }
  if (sets.slots.has(key)) return "slot";
  if (sets.keys.has(key)) return "known";
  return "unknown";
}
