import { EditorContent, type Editor } from "@tiptap/react";
import { cn } from "@/utils/cn";

type RichTextContentProps = {
  editor: Editor | null;
  /** id of the visible label (the editable area is a textbox). */
  labelledBy?: string;
  invalid?: boolean;
  className?: string;
};

/**
 * The editable area of a rich text editor (TipTap draws its own DOM, so it
 * lives in an atom). Document typography: headings, lists, paragraphs.
 */
export function RichTextContent({
  editor,
  labelledBy,
  invalid = false,
  className,
}: RichTextContentProps) {
  return (
    <EditorContent
      editor={editor}
      aria-labelledby={labelledBy}
      className={cn(
        "rounded-b-md border border-t-0 bg-card px-3 py-2 text-sm focus-within:ring-1 focus-within:ring-ring",
        "[&_.ProseMirror]:max-h-[60vh] [&_.ProseMirror]:min-h-40 [&_.ProseMirror]:overflow-y-auto [&_.ProseMirror]:outline-none",
        "[&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:font-semibold",
        "[&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6",
        invalid && "border-destructive",
        className,
      )}
    />
  );
}
