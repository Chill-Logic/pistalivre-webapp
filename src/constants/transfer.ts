import type { BadgeVariantProps } from "@/components/atoms/badge/variants";
import type {
  TransferPurpose,
  TransferSourceAccount,
  TransferStatus,
} from "@/types/transfer";

/*
 * The API catalog (GET /labels) has no map for transfers yet: these mirror
 * transfer.entity / the old Next screen. Move to LABEL_MAPS if it comes.
 */

export const TRANSFER_SOURCE_LABELS: Record<TransferSourceAccount, string> = {
  INTER: "Banco Inter",
  ASAAS: "Asaas",
  C6: "C6",
};

export const TRANSFER_PURPOSE_LABELS: Record<TransferPurpose, string> = {
  ADHOC: "Avulsa",
  REIMBURSEMENT: "Reembolso",
};

export const TRANSFER_STATUS: Record<
  TransferStatus,
  { label: string; variant: BadgeVariantProps["variant"] }
> = {
  PROCESSING: { label: "Processando", variant: "neutral" },
  DONE: { label: "Pago", variant: "success" },
  FAILED: { label: "Falhou", variant: "error" },
};
