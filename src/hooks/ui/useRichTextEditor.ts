import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

/**
 * A TipTap editor holding HTML. `value` seeds it once (remount with a `key`
 * to load another document); every change goes back through `onChange`.
 */
export function useRichTextEditor(
  value: string,
  onChange: (html: string) => void,
) {
  return useEditor({
    // Same extension set as the management app, so both normalize a
    // template's HTML the same way.
    extensions: [StarterKit],
    content: value,
    immediatelyRender: true,
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });
}
