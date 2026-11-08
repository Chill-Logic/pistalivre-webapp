import { posToDOMRect } from "@tiptap/core";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { VariableSuggestionMenuHandle } from "@/components/molecules/variable-suggestion-menu";
import {
  REPAINT_VARIABLES,
  VariableHighlight,
} from "@/helpers/editor/variable-highlight";
import {
  readVariableTrigger,
  VariableSuggestion,
  type VariableTriggerState,
} from "@/helpers/editor/variable-suggestion";
import {
  filterTemplateVariables,
  flattenTemplateVariables,
  variableSets,
} from "@/helpers/template-variables";
import { useRichTextEditor } from "@/hooks/ui/useRichTextEditor";
import type { TemplateVariableCatalog } from "@/types/template";

/**
 * Rich text for a contract template: `{{variables}}` highlighted (unknown
 * ones flagged) and typing `{{` opens the variable menu at the caret.
 */
export function useTemplateEditor(
  value: string,
  onChange: (html: string) => void,
  catalog: TemplateVariableCatalog | undefined,
  withSlots: boolean,
) {
  const sets = useMemo(() => variableSets(catalog), [catalog]);
  // Read through refs so the extension list stays stable (a new list would
  // recreate the editor and lose the caret and the undo history).
  const setsRef = useRef(sets);
  const keyHandlerRef = useRef<((event: KeyboardEvent) => boolean) | null>(
    null,
  );
  const menuRef = useRef<VariableSuggestionMenuHandle>(null);
  const [extensions] = useState(() => [
    VariableHighlight.configure({ getSets: () => setsRef.current }),
    VariableSuggestion.configure({ keyHandlerRef }),
  ]);
  const editor = useRichTextEditor(value, onChange, extensions);

  // Catalog arrived: repaint. A transaction with no steps neither fires
  // onUpdate nor lands in the undo history.
  useEffect(() => {
    setsRef.current = sets;
    editor?.view.dispatch(editor.state.tr.setMeta(REPAINT_VARIABLES, true));
  }, [sets, editor]);

  // Subscribed by hand: leaving the suggestion (Escape) is a transaction
  // with no steps, which `useEditorState` would not re-render for.
  const [trigger, setTrigger] = useState<VariableTriggerState | null>(null);
  // Kept after the menu closes: it fades out showing the last list, not
  // "nenhuma variável" for a frame (Enter or erasing the `{{`).
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (!editor) return;
    const sync = () => {
      const next = readVariableTrigger(editor.state);
      if (next) setQuery(next.query);
      setTrigger((previous) =>
        previous?.from === next?.from &&
        previous?.to === next?.to &&
        previous?.query === next?.query
          ? previous
          : next,
      );
    };
    editor.on("transaction", sync);
    sync();
    return () => {
      editor.off("transaction", sync);
    };
  }, [editor]);

  const triggerRef = useRef(trigger);
  const editorRef = useRef(editor);
  useLayoutEffect(() => {
    triggerRef.current = trigger;
    editorRef.current = editor;
    // The ProseMirror plugin routes keys to whatever the menu exposes.
    keyHandlerRef.current = (event) => menuRef.current?.onKeyDown(event) ?? false;
  });

  /** Virtual anchor for the menu, measured on every call (scroll, resize). */
  const anchorRef = useRef({
    getBoundingClientRect: () => {
      const current = triggerRef.current;
      const view = editorRef.current?.view;
      return current && view
        ? posToDOMRect(view, current.from, current.to)
        : new DOMRect();
    },
  });

  const allOptions = useMemo(
    () => flattenTemplateVariables(catalog, withSlots),
    [catalog, withSlots],
  );
  const options = useMemo(
    () => filterTemplateVariables(allOptions, query),
    [allOptions, query],
  );

  /** One text insertion = one undo step. Replaces the typed `{{…`. */
  const insert = (text: string) => {
    if (!editor) return;
    const current = triggerRef.current;
    const range = current ?? {
      from: editor.state.selection.from,
      to: editor.state.selection.to,
    };
    editor
      .chain()
      .focus()
      .insertContentAt(range, { type: "text", text })
      .setTextSelection(range.from + text.length)
      .run();
  };

  return { editor, trigger, query, options, anchorRef, menuRef, insert };
}
