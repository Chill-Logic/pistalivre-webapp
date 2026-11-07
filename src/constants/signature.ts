import type { BadgeVariantProps } from "@/components/atoms/badge/variants";
import type { SignatureStatus, SignerStatus } from "@/types/signature";

/** Drafts first, like the management screen: they are the issuer's queue. */
export const SIGNATURE_STATUSES = [
  "DRAFT",
  "SENT",
  "SIGNED",
  "REFUSED",
  "CANCELED",
] as const;

export const SIGNATURE_STATUS_VARIANT: Record<
  SignatureStatus,
  BadgeVariantProps["variant"]
> = {
  DRAFT: "outline",
  SENT: "warning",
  SIGNED: "success",
  REFUSED: "error",
  CANCELED: "neutral",
};

export const SIGNER_STATUS_VARIANT: Record<
  SignerStatus,
  BadgeVariantProps["variant"]
> = {
  PENDING: "warning",
  SIGNED: "success",
  REFUSED: "error",
};
