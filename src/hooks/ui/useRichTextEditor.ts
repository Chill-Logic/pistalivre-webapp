import type { Extensions } from "@tiptap/core";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

/**
 * A TipTap editor holding HTML. `value` seeds it once (remount with a `key`
 * to load another document); every change goes back through `onChange`.
 * `extra` is read once: pass a stable list.
 */
export function useRichTextEditor(
  value: string,
  onChange: (html: string) => void,
  extra: Extensions = [],
) {
  return useEditor({
    // Same base extension set as the management app, so both normalize a
    // template's HTML the same way (the extras only decorate).
    extensions: [StarterKit, ...extra],
    content: value,
    immediatelyRender: true,
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });
}
