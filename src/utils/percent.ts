const PERCENT = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

/** 40 → "40%"; 12.5 → "12,5%". */
export function formatPercent(value: number) {
  return `${PERCENT.format(value)}%`;
}

/** "12,5" → 12.5; "" → null; anything not a number → NaN. */
export function parsePercentInput(text: string) {
  const clean = text.trim().replace("%", "").replace(",", ".");
  return clean ? Number(clean) : null;
}

/** 12.5 → "12,5" (for the input); null → "". */
export function percentInputOf(value: number | null | undefined) {
  return value === null || value === undefined
    ? ""
    : String(value).replace(".", ",");
}
