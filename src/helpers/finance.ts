import { routeTo } from "@/constants/routes";
import type { BarItem } from "@/types/chart";
import type { Delinquency } from "@/types/dashboard";
import { formatCurrency } from "@/utils/format";
import { pluralize } from "@/utils/text";

const MONTH_DAY = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});
const MONTH_DAY_YEAR = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Heading of a due day in the collection queue: "Hoje", "Ontem", or the date
 * ("13 de outubro"; with the year when it isn't this year's).
 */
export function dueDayLabel(
  dueDate: string,
  daysLate: number,
  now = new Date(),
) {
  if (daysLate === 0) return "Hoje";
  if (daysLate === 1) return "Ontem";
  const date = new Date(`${dueDate}T00:00:00Z`);
  const sameYear = date.getUTCFullYear() === now.getUTCFullYear();
  return (sameYear ? MONTH_DAY : MONTH_DAY_YEAR).format(date);
}

/**
 * Everyone overdue right now (the API already sorts by amount), with how
 * many charges are late: "R$ 1.200,00 · 3 cobranças".
 */
export function delinquentItems(delinquency: Delinquency): BarItem[] {
  return delinquency.delinquentCustomers.map((customer) => ({
    key: customer.customerId,
    label: customer.name,
    value: customer.amount,
    display: `${formatCurrency(customer.amount)} · ${pluralize(customer.count, "cobrança", "cobranças")}`,
    to: routeTo.customer(customer.customerId),
  }));
}

/** History: who pays late most often, "4x · ~6 dias" (top 5, by the API). */
export function latePayerItems(delinquency: Delinquency): BarItem[] {
  return delinquency.topLatePayers.map((payer) => ({
    key: payer.customerId,
    label: payer.name,
    value: payer.lateCount,
    display: `${payer.lateCount}x · ~${pluralize(Math.round(payer.avgDaysLate), "dia", "dias")}`,
    to: routeTo.customer(payer.customerId),
  }));
}

/** "3 dias de atraso"; nothing for today. */
export function lateLabel(daysLate: number) {
  return daysLate > 0
    ? `${pluralize(daysLate, "dia", "dias")} de atraso`
    : null;
}
