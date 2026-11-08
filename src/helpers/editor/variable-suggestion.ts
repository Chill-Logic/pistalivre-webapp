import { Extension } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion from "@tiptap/suggestion";
import { findVariableTrigger } from "./variable-trigger";

/** Where the `{{…}}` being typed is, and what follows the braces. */
export type VariableTriggerState = { from: number; to: number; query: string };

/**
 * The part of @tiptap/suggestion's plugin state that is read (the library
 * does not export its state type).
 */
type SuggestionState = {
  active: boolean;
  range: { from: number; to: number };
  query: string | null;
};

/** Plugin state is per EditorState, so editors on one page never collide. */
export const variableSuggestionKey = new PluginKey<SuggestionState>(
  "variableSuggestion",
);

export type VariableSuggestionOptions = {
  /** Filled by React; returns true when the menu consumed the key. */
  keyHandlerRef: { current: ((event: KeyboardEvent) => boolean) | null };
};

/**
 * Opens the variable menu when `{{` is typed. @tiptap/suggestion is used
 * only for its state machine (IME, Escape not re-opening on the next key,
 * the decoration over the typed range); the menu is drawn by React from
 * this plugin's state.
 */
export const VariableSuggestion = Extension.create<VariableSuggestionOptions>({
  name: "variableSuggestion",
  // Ahead of StarterKit's keymaps: Enter picks instead of splitting the block.
  priority: 200,

  addOptions() {
    return { keyHandlerRef: { current: null } };
  },

  addProseMirrorPlugins() {
    const { keyHandlerRef } = this.options;
    return [
      Suggestion({
        editor: this.editor,
        pluginKey: variableSuggestionKey,
        char: "{{",
        allowSpaces: false,
        allowedPrefixes: null,
        startOfLine: false,
        findSuggestionMatch: findVariableTrigger,
        decorationTag: "span",
        decorationClass: "rounded-[3px] font-mono ring-1 ring-inset ring-primary/40",
        minQueryLength: 0,
        items: () => [],
        render: () => ({
          onKeyDown: ({ event }) => keyHandlerRef.current?.(event) ?? false,
        }),
      }),
    ];
  },
});

/** The trigger in `state`, or null when the menu should be closed. */
export function readVariableTrigger(
  state: Parameters<typeof variableSuggestionKey.getState>[0],
): VariableTriggerState | null {
  const suggestion = variableSuggestionKey.getState(state);
  return suggestion?.active
    ? {
        from: suggestion.range.from,
        to: suggestion.range.to,
        query: suggestion.query ?? "",
      }
    : null;
}
