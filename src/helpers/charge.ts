import type { BadgeVariantProps } from "@/components/atoms/badge/variants";
import type { ChargeAmounts } from "@/types/rental";
import { calendarDay, todayInBrasilia } from "@/utils/date";

export type ChargeSituation = "paid" | "partial" | "overdue" | "open";

/**
 * Overdue by STATUS or by DATE: a PENDING charge whose due day already passed
 * (in Brasília) is overdue, without waiting for the gateway to flip it.
 */
type ChargeLike = {
  amounts: ChargeAmounts;
  status: string;
  dueDate: string | null;
};

export function chargeSituation(charge: ChargeLike): ChargeSituation {
  if (charge.amounts.isPaid) {
    return charge.amounts.shortfall > 0 ? "partial" : "paid";
  }
  if (charge.status === "OVERDUE") return "overdue";
  if (!charge.dueDate) return "open";
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

/** A pix QR past its expiration can't be paid anymore (the invoice can). */
export function isPixExpired(expirationDate: string, now = new Date()) {
  return new Date(expirationDate.replace(" ", "T")).getTime() < now.getTime();
}

/** Base64 PNG from the gateway → src for an image. */
export function pixImageSrc(encodedImage: string) {
  return `data:image/png;base64,${encodedImage}`;
}
