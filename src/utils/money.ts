const BRL = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** What the user typed → number, reading digits as cents ("12345" → 123.45). */
export function parseMoneyInput(text: string) {
  const digits = text.replace(/\D/g, "").slice(0, 12);
  return digits ? Number(digits) / 100 : null;
}

/** 1234.5 → "1.234,50" (the "R$" lives outside the input). */
export function formatMoneyInput(value: number | null | undefined) {
  return value === null || value === undefined ? "" : BRL.format(value);
}
