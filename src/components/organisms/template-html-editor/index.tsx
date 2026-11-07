import { useId } from "react";
import { Box } from "@/components/atoms/box";
import { Label } from "@/components/atoms/label";
import { RichTextContent } from "@/components/atoms/rich-text-content";
import { Text } from "@/components/atoms/text";
import { RichTextToolbar } from "@/components/molecules/rich-text-toolbar";
import { VariablePicker } from "@/components/molecules/variable-picker";
import { useRichTextEditor } from "@/hooks/ui/useRichTextEditor";
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

/** Rich text for a contract template, with "Inserir variável". */
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
  const editor = useRichTextEditor(value, onChange);

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
      {error && (
        <Text size="xs" tone="destructive">
          {error}
        </Text>
      )}
    </Box>
  );
}
