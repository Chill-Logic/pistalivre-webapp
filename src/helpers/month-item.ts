import { LABEL_MAPS, type LabelMapName } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { moneyIn } from "@/helpers/currency";
import { paymentText } from "@/helpers/payment-card";
import type { MonthItem } from "@/types/expense";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

type Label = (map: LabelMapName, code: string) => string;

/** Where the item's name leads (a one-off has no page of its own). */
export function monthItemHref(item: MonthItem): string | null {
  if (item.supplier) return routeTo.supplier(item.supplier.id);
  if (item.debt) return routeTo.debt(item.debt.id);
  return null;
}

/** Line under the name: vehicle, installment, kind of debt, how it's paid. */
export function monthItemDetail(item: MonthItem, label: Label): string {
  return [
    item.debt &&
      `Parcela ${item.debt.installment} de ${item.debt.installments} · ${label(LABEL_MAPS.debtKind, item.debt.kind)}`,
    item.vehicle && `${item.vehicle.plate} · ${item.vehicle.label}`,
    paymentText(item, label),
  ]
    .filter(Boolean)
    .join(" · ");
}

/**
 * What happened, in words: "Registrado em 05/11/2026 · por Ana". The system
 * only records (the money moves outside it), so it says registered, not paid.
 */
export function monthItemOutcome(item: MonthItem): string {
  const parts = [
    item.status === "PAID" && item.paidAt && `Registrado em ${formatCalendarDate(item.paidAt)}`,
    item.status === "PARTIAL" &&
      item.amount != null &&
      `${formatCurrency(item.amount)} registrados${item.paidAt ? ` até ${formatCalendarDate(item.paidAt)}` : ""}`,
    item.surcharge != null && `${formatCurrency(item.surcharge)} de multa/juros`,
    item.status === "OPEN" &&
      item.expense &&
      item.amount != null &&
      `Conta de ${formatCurrency(item.amount)}`,
    item.expense?.createdByName && `por ${item.expense.createdByName}`,
  ];
  return parts.filter(Boolean).join(" · ");
}

/** The prediction in the bill's currency ("US$ 20,00"), null in reais. */
export function monthItemExpectedForeign(item: MonthItem): string | null {
  if (item.currency === "BRL" || item.expectedForeign == null) return null;
  return moneyIn(item.expectedForeign, item.currency);
}

/** What was recorded in the bill's currency ("US$ 20,00"), null in reais. */
export function monthItemAmountForeign(item: MonthItem): string | null {
  const foreign = item.expense?.foreignAmount;
  if (item.currency === "BRL" || foreign == null) return null;
  return moneyIn(foreign, item.currency);
}

export type MonthItemGroup = { key: string; title: string; items: MonthItem[] };

/** The month's sections, in the order the screen shows them (empty ones out). */
export function groupMonthItems(items: MonthItem[]): MonthItemGroup[] {
  const groups: MonthItemGroup[] = [
    {
      key: "company",
      title: "Da empresa",
      items: items.filter((i) => i.kind === "FIXED" && i.supplier?.scope === "COMPANY"),
    },
    {
      key: "vehicle",
      title: "Por veículo",
      items: items.filter((i) => i.kind === "FIXED" && i.supplier?.scope === "VEHICLE"),
    },
    { key: "debt", title: "Parcelas de dívidas", items: items.filter((i) => i.kind === "DEBT") },
    { key: "one-off", title: "Avulsas", items: items.filter((i) => i.kind === "ONE_OFF") },
  ];
  return groups.filter((group) => group.items.length > 0);
}
