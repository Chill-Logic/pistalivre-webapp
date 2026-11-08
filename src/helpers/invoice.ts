import type { BadgeVariantProps } from "@/components/atoms/badge/variants";

type Variant = BadgeVariantProps["variant"];

/** Same colors as the management app: authorized green, failed/canceled red. */
export function invoiceStatusVariant(status: string): Variant {
  if (status === "AUTHORIZED") return "success";
  if (status === "ERROR" || status === "CANCELED") return "error";
  return "neutral";
}

/** Statuses Asaas still lets cancel (the management app's rule). */
export function canCancelInvoice(status: string) {
  return ["AUTHORIZED", "SCHEDULED", "SYNCHRONIZED"].includes(status);
}
