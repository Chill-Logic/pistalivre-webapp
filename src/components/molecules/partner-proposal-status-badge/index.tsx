import { Badge } from "@/components/atoms/badge";
import {
  PARTNER_AREA_PROPOSAL_STATUS_LABELS,
  PARTNER_PROPOSAL_STATUS_LABELS,
  PARTNER_PROPOSAL_STATUS_VARIANT,
} from "@/constants/partner";
import type { PartnerProposalStatus } from "@/types/partner";

/**
 * A proposal version's situation. `area` = as the partner reads it (a
 * pending one is "Aguardando você"; the gestão reads "Enviada").
 */
export function PartnerProposalStatusBadge({
  status,
  area = false,
}: {
  status: PartnerProposalStatus;
  area?: boolean;
}) {
  const labels = area
    ? PARTNER_AREA_PROPOSAL_STATUS_LABELS
    : PARTNER_PROPOSAL_STATUS_LABELS;
  return (
    <Badge variant={PARTNER_PROPOSAL_STATUS_VARIANT[status]}>
      {labels[status]}
    </Badge>
  );
}
