import { exitSuggestion } from "@tiptap/suggestion";
import { useId } from "react";
import { Box } from "@/components/atoms/box";
import { Label } from "@/components/atoms/label";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/atoms/popover";
import { RichTextContent } from "@/components/atoms/rich-text-content";
import { Text } from "@/components/atoms/text";
import { RichTextToolbar } from "@/components/molecules/rich-text-toolbar";
import { VariablePicker } from "@/components/molecules/variable-picker";
import { VariableSuggestionMenu } from "@/components/molecules/variable-suggestion-menu";
import { variableSuggestionKey } from "@/helpers/editor/variable-suggestion";
import { useTemplateEditor } from "@/hooks/ui/useTemplateEditor";
import type { TemplateVariableCatalog } from "@/types/template";

type TemplateHtmlEditorProps = {
  label: string;
  value: string;
  onChange: (html: string) => void;
  catalog: TemplateVariableCatalog | undefined;
  /** The contract body takes the caução slot; the clauses don't. */
  withSlots?: boolean;
  hint?: string;
  error?: string;
};

/**
 * Rich text for a contract template: "Inserir variável" in the toolbar, or
 * type `{{` to pick one at the caret; variables are highlighted and the
 * unknown ones flagged.
 */
export function TemplateHtmlEditor({
  label,
  value,
  onChange,
  catalog,
  withSlots = false,
  hint,
  error,
}: TemplateHtmlEditorProps) {
  const labelId = useId();
  const { editor, trigger, query, options, anchorRef, menuRef, insert } =
    useTemplateEditor(value, onChange, catalog, withSlots);
  const closeMenu = () => {
    if (editor) exitSuggestion(editor.view, variableSuggestionKey);
  };

  return (
    <Box className="space-y-2">
      <Label id={labelId}>{label}</Label>
      {hint && (
        <Text size="xs" tone="muted">
          {hint}
        </Text>
      )}
      <Box>
        {editor && (
          <RichTextToolbar editor={editor}>
            <VariablePicker
              catalog={catalog}
              withSlots={withSlots}
              onPick={(text) =>
                editor.chain().focus().insertContent(text).run()
              }
            />
          </RichTextToolbar>
        )}
        <RichTextContent
          editor={editor}
          labelledBy={labelId}
          invalid={Boolean(error)}
        />
      </Box>
      {catalog && (
        <Popover open={Boolean(trigger)}>
          <PopoverAnchor virtualRef={anchorRef} />
          <PopoverContent
            side="bottom"
            sideOffset={6}
            className="w-80 max-w-[calc(100vw-2rem)]"
            // The caret stays in the editor while the menu is open.
            onOpenAutoFocus={(event) => event.preventDefault()}
            onCloseAutoFocus={(event) => event.preventDefault()}
            onMouseDown={(event) => event.preventDefault()}
            // Radix catches Escape on the document before ProseMirror does,
            // so the suggestion would stay active with the menu stuck open.
            onEscapeKeyDown={closeMenu}
            onInteractOutside={closeMenu}
          >
            <VariableSuggestionMenu
              key={query}
              ref={menuRef}
              options={options}
              onPick={(option) => insert(option.text)}
            />
          </PopoverContent>
        </Popover>
      )}
      {error && (
        <Text size="xs" tone="destructive">
          {error}
        </Text>
      )}
    </Box>
  );
}
