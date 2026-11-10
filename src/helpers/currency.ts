import type { Conversion, Currency } from "@/types/currency";
import { formatCurrency, formatDateTime, formatMoney, formatRate } from "@/utils/format";
import { formatPercent } from "@/utils/percent";

/** An amount in its currency: R$ 1.234,56 / US$ 20,00 / € 10,00. */
export function moneyIn(amount: number, currency: Currency) {
  return currency === "BRL" ? formatCurrency(amount) : formatMoney(amount, currency);
}

/** "≈ R$ 116,57" — or why there's no estimate yet. */
export function brlEstimate(brl: number | null) {
  return brl === null ? "sem cotação ainda" : `≈ ${formatCurrency(brl)}`;
}

/** "US$ 20,00 (≈ R$ 116,57)" — reais stay plain. */
export function moneyWithEstimate(amount: number, currency: Currency, brl: number | null) {
  return currency === "BRL"
    ? formatCurrency(amount)
    : `${moneyIn(amount, currency)} (${brlEstimate(brl)})`;
}

/** "Cotação de 10/11/2026 às 13:06: R$ 5,5840 + 4,38% do cartão". */
export function conversionNote(conversion: Conversion) {
  const surcharge =
    conversion.surchargePercent > 0
      ? ` + ${formatPercent(conversion.surchargePercent)} do cartão`
      : "";
  const when = formatDateTime(conversion.quotedAt).replace(/:\d{2}$/, "").replace(", ", " às ");
  return `Cotação de ${when}: ${formatRate(conversion.rate)}${surcharge}`;
}
