import type { BadgeVariantProps } from "@/components/atoms/badge/variants";
import type { Charge } from "@/types/rental";
import { calendarDay, todayInBrasilia } from "@/utils/date";

export type ChargeSituation = "paid" | "partial" | "overdue" | "open";

/**
 * Overdue by STATUS or by DATE: a PENDING charge whose due day already passed
 * (in Brasília) is overdue, without waiting for the gateway to flip it.
 */
export function chargeSituation(charge: Charge): ChargeSituation {
  if (charge.amounts.isPaid) {
    return charge.amounts.shortfall > 0 ? "partial" : "paid";
  }
  if (charge.status === "OVERDUE") return "overdue";
  return calendarDay(charge.dueDate) < todayInBrasilia() ? "overdue" : "open";
}

const SITUATION: Record<
  ChargeSituation,
  { label: string; variant: BadgeVariantProps["variant"] }
> = {
  paid: { label: "Pago", variant: "success" },
  partial: { label: "Pago parcial", variant: "warning" },
  overdue: { label: "Vencido", variant: "error" },
  open: { label: "A vencer", variant: "neutral" },
};

export function chargeSituationBadge(situation: ChargeSituation) {
  return SITUATION[situation];
}
