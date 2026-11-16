import { formatCalendarDate } from "@/utils/format";
import type { HandoverWarning } from "@/types/rental";
import type { BadgeVariantProps } from "@/components/atoms/badge/variants";
import { CLOSED_RENTAL_STATUSES } from "@/constants/rental";
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

/** Returned, cancelled or withdrawn: nothing else happens on it. */
export function isRentalClosed(status: RentalStatus) {
  return CLOSED_RENTAL_STATUSES.includes(status);
}

/** "R$ 650,00 · Semanal" */
export function rateLabel(rate: number, periodLabel: string) {
  return `${formatCurrency(rate)} · ${periodLabel}`;
}

/** Text of the "vehicle left before the signature" warning. */
export function handoverWarningText(warning: HandoverWarning) {
  const on = formatCalendarDate(warning.handoverOn);
  return warning.kind === "UNSIGNED"
    ? `Veículo entregue em ${on} sem o contrato assinado. Assine o contrato o quanto antes.`
    : `Veículo entregue em ${on}, antes da assinatura do contrato (${formatCalendarDate(warning.signedOn)}).`;
}
