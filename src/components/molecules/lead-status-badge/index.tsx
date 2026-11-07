import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { LABEL_MAPS } from "@/constants/label-maps";
import { leadStatusVariant } from "@/helpers/crm";
import { useLabels } from "@/hooks/ui/useLabels";
import type { LeadStatus } from "@/types/crm";

export function LeadStatusBadge({
  status,
  isTest = false,
}: {
  status: LeadStatus;
  isTest?: boolean;
}) {
  const { label } = useLabels();
  return (
    <Box className="flex shrink-0 gap-1">
      {isTest && <Badge variant="warning">Teste</Badge>}
      <Badge variant={leadStatusVariant(status)}>
        {label(LABEL_MAPS.leadStatus, status)}
      </Badge>
    </Box>
  );
}
