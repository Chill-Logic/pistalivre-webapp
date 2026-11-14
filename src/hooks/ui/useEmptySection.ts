import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type {
  EmptySectionEntry,
  EmptySectionsStore,
} from "@/helpers/empty-sections";

/** The page's empty-sections group; null = the page has no group. */
export const EmptySectionsContext = createContext<EmptySectionsStore | null>(
  null,
);

const NO_ENTRIES: EmptySectionEntry[] = [];
const noop = () => () => {};

type EmptySectionInput = {
  /** Empty right now (only then it joins the group). */
  empty: boolean;
  title: string;
  description: ReactNode;
  actions?: ReactNode;
};

/**
 * A section that, while empty and on a page with a group, moves into the
 * group's card instead of drawing its own. Returns `grouped` (render only
 * the anchor) and the anchor's ref (keeps the page order in the group).
 */
export function useEmptySection({
  empty,
  title,
  description,
  actions,
}: EmptySectionInput) {
  const store = useContext(EmptySectionsContext);
  const id = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const grouped = Boolean(store) && empty;

  // Every render: the actions are new elements each time (their state lives
  // in the group, reconciled by id).
  useLayoutEffect(() => {
    if (!store || !grouped) return;
    store.set({ id, title, description, actions, anchor });
  });
  useLayoutEffect(() => {
    if (!store || !grouped) return;
    return () => store.remove(id);
  }, [store, grouped, id]);

  return { grouped, anchorRef: setAnchor };
}

/** The sections waiting in the group, in page order. */
export function useEmptySections() {
  const store = useContext(EmptySectionsContext);
  return useSyncExternalStore(
    store?.subscribe ?? noop,
    store?.getSnapshot ?? (() => NO_ENTRIES),
    store?.getSnapshot ?? (() => NO_ENTRIES),
  );
}
