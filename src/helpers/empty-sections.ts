import type { ReactNode } from "react";

/** One empty section waiting in the page's "Ainda sem registros" card. */
export type EmptySectionEntry = {
  id: string;
  title: string;
  /** What is missing (a sentence or the card's own empty text). */
  description: ReactNode;
  /** The section's buttons ("Registrar", "Enviar"…), kept usable in the group. */
  actions?: ReactNode;
  /** Where the section would be: the group lists them in page order. */
  anchor: HTMLElement | null;
};

/**
 * Per-page registry of the sections that are empty right now. A section adds
 * itself while empty and leaves when it gets content (or unmounts); the group
 * card reads the snapshot. Plain store + useSyncExternalStore: a section
 * re-registering does not re-render the other sections, only the group.
 */
export function createEmptySectionsStore() {
  const entries = new Map<string, EmptySectionEntry>();
  const listeners = new Set<() => void>();
  let snapshot: EmptySectionEntry[] = [];

  const emit = () => {
    snapshot = [...entries.values()].sort(byPagePosition);
    listeners.forEach((listener) => listener());
  };

  return {
    set(entry: EmptySectionEntry) {
      entries.set(entry.id, entry);
      emit();
    },
    remove(id: string) {
      if (entries.delete(id)) emit();
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
  };
}

export type EmptySectionsStore = ReturnType<typeof createEmptySectionsStore>;

/** Document order of the sections' anchors (no anchor = last). */
function byPagePosition(a: EmptySectionEntry, b: EmptySectionEntry) {
  if (!a.anchor || !b.anchor) return a.anchor ? -1 : b.anchor ? 1 : 0;
  return a.anchor.compareDocumentPosition(b.anchor) &
    Node.DOCUMENT_POSITION_FOLLOWING
    ? -1
    : 1;
}
