/** Groups items by a key, keeping the order in which each key first shows up. */
export function groupInOrder<T>(
  items: T[],
  keyOf: (item: T) => string,
): [key: string, items: T[]][] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups.entries()];
}
