import { Badge } from "@/components/atoms/badge";
import { VehicleStatusBadge } from "@/components/molecules/vehicle-status-badge";
import { LABEL_MAPS } from "@/constants/label-maps";
import {
  PARTNER_CYCLE_STATE,
  PARTNER_TODAY_STATE,
} from "@/constants/partner-area";
import { useLabels } from "@/hooks/ui/useLabels";
import type {
  PartnerAreaCycleState,
  PartnerAreaTodayState,
  PartnerContractStatus,
} from "@/types/partner-area";
import type { VehicleStatus } from "@/types/vehicle";

/** Today's state of the motorcycle; none once it left the contract. */
export function PartnerVehicleStatusBadge({
  status,
}: {
  status: VehicleStatus | null;
}) {
  if (!status) return <Badge variant="outline">Fora do contrato</Badge>;
  return <VehicleStatusBadge status={status} />;
}

export function PartnerContractStatusBadge({
  status,
}: {
  status: PartnerContractStatus;
}) {
  const { label } = useLabels();
  return (
    <Badge variant={status === "ACTIVE" ? "success" : "outline"}>
      {label(LABEL_MAPS.partnerContractStatus, status)}
    </Badge>
  );
}

/** A rent cycle: paid, in part, missing, not due yet, waived. */
export function PartnerCycleStateBadge({
  state,
}: {
  state: PartnerAreaCycleState;
}) {
  const { label, variant } = PARTNER_CYCLE_STATE[state];
  return <Badge variant={variant}>{label}</Badge>;
}

/** Today's cycle of the rent, as the server tells it. */
export function PartnerTodayStateBadge({
  state,
}: {
  state: PartnerAreaTodayState;
}) {
  const { label, variant } = PARTNER_TODAY_STATE[state];
  return <Badge variant={variant}>{label}</Badge>;
}
