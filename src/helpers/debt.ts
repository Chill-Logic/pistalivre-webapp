import type { BadgeVariantProps } from "@/components/atoms/badge/variants";
import { LABEL_MAPS, type LabelMapName } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import type {
  DebtInstallment,
  DebtLender,
  DebtListItem,
  DebtStatus,
} from "@/types/debt";
import { formatCalendarDate } from "@/utils/format";
import { pluralize } from "@/utils/text";

type Variant = BadgeVariantProps["variant"];
type LabelFn = (map: LabelMapName, code: string) => string;

const STATUS_VARIANT: Record<DebtStatus["variant"], Variant> = {
  success: "success",
  destructive: "error",
  warning: "warning",
  neutral: "neutral",
};

/** Screen of the lender's record (customer, fixed cost, staff), if any. */
export function lenderHref(lender: DebtLender) {
  if (lender.customerId) return routeTo.customer(lender.customerId);
  if (lender.supplierId) return routeTo.supplier(lender.supplierId);
  if (lender.userId) return routeTo.user(lender.userId);
  return null;
}

/** "2 pagamentos · 1 documento" of a list item (null when it has neither). */
export function debtCountsLabel(debt: DebtListItem) {
  const parts = [
    debt.paymentCount &&
      pluralize(debt.paymentCount, "pagamento", "pagamentos"),
    debt.documentCount &&
      pluralize(debt.documentCount, "documento", "documentos"),
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

/** API badge variant → our Badge variant. */
export function debtStatusVariant(status: DebtStatus): Variant {
  return STATUS_VARIANT[status.variant] ?? "neutral";
}

const INSTALLMENT_VARIANT: Record<DebtInstallment["status"], Variant> = {
  PAID: "success",
  PARTIAL: "warning",
  OVERDUE: "error",
  OPEN: "neutral",
};

export function installmentVariant(status: DebtInstallment["status"]): Variant {
  return INSTALLMENT_VARIANT[status];
}

/** Paid progress is good news: green, never the brand red (which reads as alarm). */
export const PAID_METER_COLOR = "hsl(var(--success-fg))";

/** Share already amortized, 0–1 (for the progress meter). */
export function paidShare(debt: Pick<DebtListItem, "balance">) {
  const { total, paid } = debt.balance;
  return total > 0 ? Math.min(paid / total, 1) : 0;
}

/**
 * "2% ao mês (simples, sobre o valor emprestado)" / "10% sobre o valor
 * original" / null when there is no interest.
 */
export function interestDescription(debt: DebtListItem, label: LabelFn) {
  if (debt.interestPercent == null) return null;
  const percent = `${debt.interestPercent.toLocaleString("pt-BR")}%`;
  const period = label(LABEL_MAPS.debtInterestPeriod, debt.interestPeriod);
  if (debt.interestPeriod === "TOTAL") return `${percent} ${period}`;
  const mode = label(LABEL_MAPS.debtInterestMode, debt.interestMode);
  const base = label(LABEL_MAPS.debtInterestBase, debt.interestBase);
  return `${percent} ${period} (${mode}, sobre ${base})`;
}

/** "Venceu 01/11/2026" / "Próxima parcela 01/12/2026" / null. */
export function nextDueLabel(debt: DebtListItem) {
  if (!debt.nextDueDate || debt.balance.settled) return null;
  const date = formatCalendarDate(debt.nextDueDate);
  if (debt.overdue) return `Venceu ${date}`;
  return debt.installments > 1 ? `Próxima parcela ${date}` : `Vence ${date}`;
}

/** "2,2 meses" (the API sends many decimals). */
export function elapsedLabel(periods: number | null) {
  if (periods == null) return null;
  const value = periods.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  return `${value} ${periods >= 2 ? "meses" : "mês"}`;
}
