import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { VehicleStatusBadge } from "@/components/molecules/vehicle-status-badge";
import { LABEL_MAPS } from "@/constants/label-maps";
import { VEHICLE_TRANSITIONS } from "@/constants/vehicle";
import { useChangeVehicleStatus } from "@/hooks/api/gestao/vehicles/useChangeVehicleStatus";
import { useLabels } from "@/hooks/ui/useLabels";
import type { VehicleStatus } from "@/types/vehicle";

type VehicleStatusCardProps = {
  vehicleId: string;
  /** Stored status — the one transitions apply to. */
  status: VehicleStatus;
  hasActiveRental: boolean;
};

/** Current status and the legal next ones, each confirmed in a dialog. */
export function VehicleStatusCard({
  vehicleId,
  status,
  hasActiveRental,
}: VehicleStatusCardProps) {
  const { label } = useLabels();
  const changeStatus = useChangeVehicleStatus(vehicleId);
  const [target, setTarget] = useState<VehicleStatus | null>(null);
  const statusLabel = (code: VehicleStatus) =>
    label(LABEL_MAPS.vehicleStatus, code);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Situação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Box className="flex items-center gap-2">
          <Text tone="muted">Agora:</Text>
          <VehicleStatusBadge status={status} />
        </Box>
        {hasActiveRental && status !== "RENTED" && (
          <Text size="xs" tone="muted">
            Há uma locação ativa neste veículo, mas a situação gravada é{" "}
            {statusLabel(status).toLowerCase()}.
          </Text>
        )}
        <Box className="flex flex-wrap gap-2">
          {VEHICLE_TRANSITIONS[status].map((next) => (
            <ConfirmDialog
              key={next}
              open={target === next}
              onOpenChange={(open) => setTarget(open ? next : null)}
              trigger={
                <Button variant="outline" size="sm">
                  <ArrowRight />
                  {statusLabel(next)}
                </Button>
              }
              title={`Marcar como ${statusLabel(next).toLowerCase()}?`}
              description={
                next === "RENTED"
                  ? "Normalmente o veículo fica alugado sozinho ao ativar uma locação. Use isto só para corrigir a situação."
                  : `O veículo passa de ${statusLabel(status).toLowerCase()} para ${statusLabel(next).toLowerCase()}.`
              }
              confirmLabel="Alterar situação"
              isPending={changeStatus.isPending}
              onConfirm={() =>
                changeStatus.mutate(next, { onSuccess: () => setTarget(null) })
              }
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

export function VehicleStatusCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-20 text-base" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton shape="pill" className="h-5 w-24" />
        <Box className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </Box>
      </CardContent>
    </Card>
  );
}
