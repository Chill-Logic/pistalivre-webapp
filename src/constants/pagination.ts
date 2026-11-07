/** Desktop lists start at 10 per page (owner's call). */
export const DEFAULT_PAGE_SIZE = 10;

/** API ceiling; used by detail-page sections that show everything at once. */
export const MAX_PAGE_SIZE = 100;

/** "Itens por página" choices (desktop). */
export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100] as const;

/** Phones load 10 at a time, appending as the list scrolls. */
export const MOBILE_PAGE_SIZE = 10;

/** How a resource list is shown: cards or a table. */
export type ListView = "lista" | "tabela";
