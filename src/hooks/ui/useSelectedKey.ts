import { useState } from "react";

/**
 * A selected item among `keys`, falling back to `fallback` while nothing
 * (or a key that no longer exists) is selected.
 */
export function useSelectedKey(keys: string[], fallback: string | undefined) {
  const [selected, setSelected] = useState<string | null>(null);
  const current = selected && keys.includes(selected) ? selected : fallback;
  return [current, setSelected] as const;
}
