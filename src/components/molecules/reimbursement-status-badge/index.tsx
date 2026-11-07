import { Badge } from "@/components/atoms/badge";
import type { BadgeVariantProps } from "@/components/atoms/badge/variants";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { ReimbursementStatus } from "@/types/portal";

const STATUS_VARIANT: Record<
  ReimbursementStatus,
  BadgeVariantProps["variant"]
> = {
  PENDING: "warning",
  APPROVED: "neutral",
  PAID: "success",
  FAILED: "error",
  REJECTED: "error",
};

export function ReimbursementStatusBadge({
  status,
}: {
  status: ReimbursementStatus;
}) {
  const { label } = useLabels();
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {label(LABEL_MAPS.reimbursementStatus, status)}
    </Badge>
  );
}
