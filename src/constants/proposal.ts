import type { BadgeVariantProps } from "@/components/atoms/badge/variants";
import type { ProposalStatus } from "@/types/proposal";

export const PROPOSAL_STATUSES = ["SENT", "ACCEPTED", "REJECTED"] as const;

export const PROPOSAL_STATUS_VARIANT: Record<
  ProposalStatus,
  BadgeVariantProps["variant"]
> = {
  SENT: "neutral",
  ACCEPTED: "success",
  REJECTED: "error",
};
