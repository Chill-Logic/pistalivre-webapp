import { Badge } from "@/components/atoms/badge";
import { LABEL_MAPS } from "@/constants/label-maps";
import { contractStatusVariant } from "@/helpers/partner";
import { useLabels } from "@/hooks/ui/useLabels";
import type { PartnerContractStatus } from "@/types/partner";

export function PartnerContractStatusBadge({
  status,
}: {
  status: PartnerContractStatus;
}) {
  const { label } = useLabels();
  return (
    <Badge variant={contractStatusVariant(status)}>
      {label(LABEL_MAPS.partnerContractStatus, status)}
    </Badge>
  );
}
