import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { CustomerStatus } from "@/types/customer";

type CustomerStatusBadgeProps = {
  status: CustomerStatus;
  isTest?: boolean;
};

/** Cadastro × Cliente, plus a "Teste" tag (test customers stay out of metrics). */
export function CustomerStatusBadge({
  status,
  isTest = false,
}: CustomerStatusBadgeProps) {
  const { label } = useLabels();
  return (
    <Box className="flex shrink-0 gap-1">
      {isTest && <Badge variant="warning">Teste</Badge>}
      <Badge variant={status === "ACTIVE" ? "success" : "neutral"}>
        {label(LABEL_MAPS.customerStatus, status)}
      </Badge>
    </Box>
  );
}
