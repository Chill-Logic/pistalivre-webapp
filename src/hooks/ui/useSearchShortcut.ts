import { useEffect } from "react";
import { searchPalette } from "@/hooks/ui/useSearchPalette";

/** Typing into something: "/" there is a character, not the shortcut. */
function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/** Ctrl+K / Cmd+K anywhere, and "/" outside text fields, open the search. */
export function useSearchShortcut() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const mod = event.ctrlKey || event.metaKey;
      if (mod && !event.altKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (searchPalette.get()) searchPalette.close();
        else searchPalette.open();
        return;
      }
      if (event.key === "/" && !mod && !event.altKey && !isEditable(event.target)) {
        event.preventDefault();
        searchPalette.open();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
