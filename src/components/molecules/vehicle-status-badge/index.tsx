import { Badge } from "@/components/atoms/badge";
import type { BadgeVariantProps } from "@/components/atoms/badge/variants";
import { VEHICLE_STATUS_LABELS } from "@/constants/labels";
import type { VehicleStatus } from "@/types/vehicle";

const STATUS_VARIANT: Record<VehicleStatus, BadgeVariantProps["variant"]> = {
  AVAILABLE: "success",
  RENTED: "neutral",
  MAINTENANCE: "warning",
  INACTIVE: "outline",
};

export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {VEHICLE_STATUS_LABELS[status]}
    </Badge>
  );
}
