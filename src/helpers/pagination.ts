/** Page number from a URL param; anything invalid is page 1. */
export function parsePage(value: string | null) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function totalPages(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize));
}

/** "21–40 de 57" */
export function rangeLabel(page: number, pageSize: number, total: number) {
  if (total === 0) return "Nenhum resultado";
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return `${from}–${to} de ${total}`;
}
