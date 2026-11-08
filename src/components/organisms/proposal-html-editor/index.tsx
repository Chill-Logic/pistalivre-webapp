import { useId } from "react";
import { Box } from "@/components/atoms/box";
import { Label } from "@/components/atoms/label";
import { RichTextContent } from "@/components/atoms/rich-text-content";
import { RichTextToolbar } from "@/components/molecules/rich-text-toolbar";
import { useRichTextEditor } from "@/hooks/ui/useRichTextEditor";

type ProposalHtmlEditorProps = {
  label: string;
  value: string;
  onChange: (html: string) => void;
};

/**
 * The proposal text to review before issuing (what is here freezes in the
 * PDF). It seeds once: remount it with a `key` to load a new draft or the
 * AI's version. TipTap's schema drops anything that is not text formatting.
 */
export function ProposalHtmlEditor({
  label,
  value,
  onChange,
}: ProposalHtmlEditorProps) {
  const labelId = useId();
  const editor = useRichTextEditor(value, onChange);

  return (
    <Box className="space-y-2">
      <Label id={labelId}>{label}</Label>
      <Box>
        {editor && <RichTextToolbar editor={editor} />}
        <RichTextContent editor={editor} labelledBy={labelId} />
      </Box>
    </Box>
  );
}
