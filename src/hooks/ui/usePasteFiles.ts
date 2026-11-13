import { useCallback, useEffect, useRef } from "react";

type Target = { id: number; onFiles: (files: File[]) => void };

/**
 * Who takes a pasted file (Ctrl+V of a print or of files copied in the file
 * explorer): the most recently mounted attach area — the dialog just opened
 * sits on top — or the one the person last pointed at / focused, when a page
 * has several. One document listener for all of them.
 */
const stack: Target[] = [];
let installed = false;
let seq = 0;

function onDocumentPaste(event: ClipboardEvent) {
  const files = Array.from(event.clipboardData?.files ?? []);
  if (files.length === 0 || stack.length === 0) return;
  // A field that handles its own paste (the Livrinho's chat) keeps it.
  const target = event.target as HTMLElement | null;
  if (target?.closest?.("[data-own-paste]")) return;
  // Text that comes along still pastes into the field being typed in.
  if (!event.clipboardData?.getData("text/plain")) event.preventDefault();
  stack[stack.length - 1].onFiles(files);
}

/** Registers an attach area for Ctrl+V; spread the result on its root to make it the active one. */
export function usePasteFiles(
  onFiles: (files: File[]) => void,
  enabled = true,
) {
  const handler = useRef(onFiles);
  handler.current = onFiles;
  const id = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    if (!installed) {
      document.addEventListener("paste", onDocumentPaste);
      installed = true;
    }
    seq += 1;
    const target: Target = {
      id: seq,
      onFiles: (files) => handler.current(files),
    };
    id.current = target.id;
    stack.push(target);
    return () => {
      const at = stack.findIndex((t) => t.id === target.id);
      if (at >= 0) stack.splice(at, 1);
    };
  }, [enabled]);

  const activate = useCallback(() => {
    const at = stack.findIndex((t) => t.id === id.current);
    if (at >= 0 && at !== stack.length - 1) stack.push(...stack.splice(at, 1));
  }, []);

  return { onPointerEnter: activate, onFocusCapture: activate };
}
