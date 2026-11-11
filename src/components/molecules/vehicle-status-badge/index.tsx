import { Badge } from "@/components/atoms/badge";
import type { BadgeVariantProps } from "@/components/atoms/badge/variants";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { VehicleStatus } from "@/types/vehicle";

const STATUS_VARIANT: Record<VehicleStatus, BadgeVariantProps["variant"]> = {
  AVAILABLE: "success",
  // Deal being closed, nothing paid: a light mark; money in: held (amber).
  IN_CONTRACTING: "outline",
  RESERVED: "warning",
  RENTED: "neutral",
  MAINTENANCE: "warning",
  INACTIVE: "outline",
};

export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  const { label } = useLabels();
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {label(LABEL_MAPS.vehicleStatus, status)}
    </Badge>
  );
}
