import type { BadgeVariantProps } from "@/components/atoms/badge/variants";
import type { RentalStatus } from "@/types/rental";
import { formatCurrency } from "@/utils/format";

type Variant = BadgeVariantProps["variant"];

const RENTAL_STATUS_VARIANT: Record<RentalStatus, Variant> = {
  DRAFT: "neutral",
  RESERVED: "neutral",
  CONTRACT_PENDING: "warning",
  SIGNED: "neutral",
  AWAITING_CAUTION: "warning",
  AWAITING_DELIVERY: "warning",
  ACTIVE: "success",
  RETURNED: "outline",
  CANCELLED: "outline",
  WITHDRAWN: "outline",
};

export function rentalStatusVariant(status: RentalStatus): Variant {
  return RENTAL_STATUS_VARIANT[status] ?? "neutral";
}

/** "R$ 650,00 · Semanal" */
export function rateLabel(rate: number, periodLabel: string) {
  return `${formatCurrency(rate)} · ${periodLabel}`;
}
