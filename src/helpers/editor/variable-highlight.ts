import { Extension } from "@tiptap/core";
import { Mark, type Node as PMNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import {
  classifyMustache,
  type MustacheKind,
  type VariableSets,
} from "@/helpers/template-variables";
import { LEAF_CHAR } from "./variable-trigger";

/** Triple first; `[^{}]` stops a match from spanning two mustaches. */
const MUSTACHE_RE = /\{\{\{([^{}]*)\}\}\}|\{\{([^{}]*)\}\}/g;

const BASE = "rounded-[3px] px-0.5 font-mono text-[0.92em] ring-1 ring-inset";

// Brand red is the error color here, so a known variable is a neutral chip
// and only the problems are red.
const KIND_CLASS: Record<MustacheKind, string> = {
  known: `${BASE} bg-secondary text-foreground ring-border`,
  slot: `${BASE} bg-success text-success-foreground ring-success-foreground/30`,
  helper: `${BASE} bg-warning text-warning-foreground ring-warning-foreground/30`,
  unknown: `${BASE} bg-error text-error-foreground ring-error-foreground/35 line-through`,
  split: `${BASE} bg-error text-error-foreground ring-error-foreground/35 underline decoration-wavy`,
};

const KIND_TITLE: Record<MustacheKind, string> = {
  known: "Variável do modelo",
  slot: "Bloco substituído ao gerar o documento",
  helper: "Sintaxe do modelo (condição, repetição)",
  unknown: "Variável desconhecida: sai em branco no documento",
  split:
    "A formatação está partindo a variável: tire o negrito/itálico do trecho",
};

/**
 * A variable split by formatting (`<strong>{{customer.</strong>name}}`)
 * reaches Handlebars with a tag inside the braces and breaks the merge.
 */
function hasUniformMarks(block: PMNode, from: number, to: number) {
  let first: readonly Mark[] | null = null;
  let uniform = true;
  block.nodesBetween(from, to, (child) => {
    if (!child.isInline) return true;
    if (first === null) first = child.marks;
    else if (!Mark.sameSet(first, child.marks)) uniform = false;
    return false;
  });
  return uniform;
}

function decorate(doc: PMNode, sets: VariableSets) {
  const decorations: Decoration[] = [];
  doc.descendants((node, pos) => {
    if (!node.isTextblock) return true; // lists, quotes: keep descending
    if (node.type.spec.code) return false;
    const text = node.textBetween(0, node.content.size, undefined, LEAF_CHAR);
    for (const match of text.matchAll(MUSTACHE_RE)) {
      const start = match.index;
      const end = start + match[0].length;
      const inner = match[1] ?? match[2] ?? "";
      const kind = hasUniformMarks(node, start, end)
        ? classifyMustache(inner, sets)
        : "split";
      // Offsets are relative to the block's content: +1 for its own token.
      decorations.push(
        Decoration.inline(pos + 1 + start, pos + 1 + end, {
          class: KIND_CLASS[kind],
          title: KIND_TITLE[kind],
        }),
      );
    }
    return false;
  });
  return DecorationSet.create(doc, decorations);
}

export const variableHighlightKey = new PluginKey<DecorationSet>(
  "variableHighlight",
);

/** Meta that asks for a repaint (the catalog arrived or changed). */
export const REPAINT_VARIABLES = "repaintVariables";

export type VariableHighlightOptions = {
  /** Read live, so the catalog can arrive without recreating the editor. */
  getSets: () => VariableSets;
};

/**
 * Paints `{{variables}}` in the template editor, flagging the unknown ones.
 * Decoration only, never a node or mark: `getHTML()` must keep the literal
 * `{{customer.name}}`, which Handlebars merges from the stored HTML.
 */
export const VariableHighlight = Extension.create<VariableHighlightOptions>({
  name: "variableHighlight",

  addOptions() {
    return { getSets: () => ({ keys: new Set(), slots: new Set() }) };
  },

  addProseMirrorPlugins() {
    const { getSets } = this.options;
    return [
      new Plugin<DecorationSet>({
        key: variableHighlightKey,
        state: {
          init: (_, state) => decorate(state.doc, getSets()),
          // One regex pass over a contract-sized doc is cheap, and an edit
          // can create or destroy a variable anywhere.
          apply: (tr, previous) =>
            tr.docChanged || tr.getMeta(REPAINT_VARIABLES)
              ? decorate(tr.doc, getSets())
              : previous,
        },
        props: {
          decorations: (state) => variableHighlightKey.getState(state),
        },
      }),
    ];
  },
});
