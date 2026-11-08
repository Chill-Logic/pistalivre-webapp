import type { BadgeVariantProps } from "@/components/atoms/badge/variants";
import type { ContractStatus } from "@/types/contract";

/** The API has no label map for contracts: same words as the management app. */
export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  DRAFT: "Rascunho",
  SENT: "Enviado para assinatura",
  SIGNED: "Assinado",
  VOID: "Cancelado",
};

export const CONTRACT_STATUS_VARIANT: Record<
  ContractStatus,
  BadgeVariantProps["variant"]
> = {
  DRAFT: "outline",
  SENT: "warning",
  SIGNED: "success",
  VOID: "neutral",
};

/** Kind slug of a contract document ("contrato", "contrato-assinado"…). */
export const CONTRACT_CATEGORY_SLUG = "contrato";
