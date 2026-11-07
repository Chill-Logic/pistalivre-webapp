import { Badge } from "@/components/atoms/badge";
import { LABEL_MAPS } from "@/constants/label-maps";
import { PROPOSAL_STATUS_VARIANT } from "@/constants/proposal";
import { useLabels } from "@/hooks/ui/useLabels";
import type { ProposalStatus } from "@/types/proposal";

export function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  const { label } = useLabels();
  return (
    <Badge variant={PROPOSAL_STATUS_VARIANT[status]}>
      {label(LABEL_MAPS.proposalStatus, status)}
    </Badge>
  );
}
