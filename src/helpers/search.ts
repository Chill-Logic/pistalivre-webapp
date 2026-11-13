import { RECENT_SEARCHES_MAX, SEARCH_ACTIONS, type SearchAction } from "@/constants/search";
import { ROUTES, routeTo } from "@/constants/routes";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { safeStorage } from "@/helpers/safe-storage";
import type { SearchResultItem } from "@/types/search";

/** Lower case, no accents (same folding as the server's index). */
export const foldSearch = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** The words worth highlighting in a result (2+ letters, or any number). */
export function highlightTokens(query: string): string[] {
  return [
    ...new Set(
      foldSearch(query)
        .split(/[^a-z0-9@]+/)
        .filter((w) => w.length >= 2 || /\d/.test(w)),
    ),
  ];
}

/** Where Enter goes for a server result (null = nowhere to open). */
export function searchTargetPath(item: SearchResultItem): string | null {
  const { type, id } = item.target;
  if (!id) return null;
  switch (type) {
    case "rental":
      return routeTo.rental(id);
    case "customer":
      return routeTo.customer(id);
    case "vehicle":
      return routeTo.vehicle(id);
    case "maintenance":
      return routeTo.maintenance(id);
    case "inspection":
      return routeTo.inspection(id);
    case "lead":
      return routeTo.lead(id);
    case "proposal":
      return routeTo.proposal(id);
    case "document":
      return `${ROUTES.documents}/${id}`;
    case "debt":
      return routeTo.debt(id);
    case "supplier":
      return routeTo.supplier(id);
    case "partner":
      return routeTo.partner(id);
    case "expense":
      // A bill opens its month (the target id is YYYY-MM).
      return `${ROUTES.financeBills}?mes=${encodeURIComponent(id)}`;
    default:
      return null;
  }
}

/** Actions whose name or keywords have every typed word. */
export function searchActions(query: string, isAdmin: boolean): SearchAction[] {
  const words = foldSearch(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return SEARCH_ACTIONS.filter((a) => {
    if (a.adminOnly && !isAdmin) return false;
    const text = foldSearch(`${a.label} ${a.keywords.join(" ")}`);
    return words.every((w) => text.includes(w));
  });
}

/** Strong local match (the name starts with what was typed): screens/actions go on top. */
export function startsWithQuery(label: string, query: string): boolean {
  const q = foldSearch(query).trim();
  return q.length >= 2 && foldSearch(label).startsWith(q);
}

const recentKey = (userId: string) => `${STORAGE_KEYS.recentSearches}:${userId}`;

export function readRecentSearches(userId: string): string[] {
  try {
    const parsed: unknown = JSON.parse(safeStorage.get(recentKey(userId)) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Remembers a search that led somewhere (most recent first, no repeats). */
export function rememberSearch(userId: string, query: string): string[] {
  const q = query.trim();
  if (q.length < 2) return readRecentSearches(userId);
  const next = [q, ...readRecentSearches(userId).filter((x) => foldSearch(x) !== foldSearch(q))].slice(
    0,
    RECENT_SEARCHES_MAX,
  );
  safeStorage.set(recentKey(userId), JSON.stringify(next));
  return next;
}

/** Forgets one recent search (the "×" on its line). */
export function forgetSearch(userId: string, query: string): string[] {
  const next = readRecentSearches(userId).filter((x) => x !== query);
  safeStorage.set(recentKey(userId), JSON.stringify(next));
  return next;
}

export function clearRecentSearches(userId: string) {
  safeStorage.remove(recentKey(userId));
}
