import { Badge } from "@/components/atoms/badge";
import { LABEL_MAPS } from "@/constants/label-maps";
import { rentalStatusVariant } from "@/helpers/rental";
import { useLabels } from "@/hooks/ui/useLabels";
import type { RentalStatus } from "@/types/rental";

export function RentalStatusBadge({ status }: { status: RentalStatus }) {
  const { label } = useLabels();
  return (
    <Badge variant={rentalStatusVariant(status)}>
      {label(LABEL_MAPS.rentalStatus, status)}
    </Badge>
  );
}
