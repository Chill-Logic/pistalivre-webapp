import {
  isNavGroup,
  type NavEntry,
  type NavItem,
} from "@/constants/navigation";

/** Lower case, no accents: "Manutenções" is found typing "manutencao". */
const fold = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/**
 * Menu items whose name (or whose section's name) has every typed word:
 * "fin ext" finds Financeiro › Extrato. Section order is kept.
 */
export type NavMatch = { item: NavItem; group: string | null };

export function searchNav(entries: NavEntry[], query: string): NavMatch[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const matches = (text: string) =>
    words.every((word) => fold(text).includes(word));
  return entries.flatMap((entry): NavMatch[] =>
    isNavGroup(entry)
      ? entry.items
          .filter((item) => matches(`${entry.label} ${item.label}`))
          .map((item) => ({ item, group: entry.label }))
      : matches(entry.label)
        ? [{ item: entry, group: null }]
        : [],
  );
}
