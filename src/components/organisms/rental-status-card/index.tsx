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
import { RentalStatusBadge } from "@/components/molecules/rental-status-badge";
import { RentalTerminationDialog } from "@/components/organisms/rental-termination-dialog";
import { LABEL_MAPS } from "@/constants/label-maps";
import {
  OTHER_TERMINATION_REASON,
  RENTAL_TRANSITIONS,
} from "@/constants/rental";
import { useChangeRentalStatus } from "@/hooks/api/gestao/rentals/useChangeRentalStatus";
import { useLabels } from "@/hooks/ui/useLabels";
import type {
  RentalDetail,
  RentalStatus,
  RentalTermination,
} from "@/types/rental";
import { formatCalendarDate } from "@/utils/format";

type RentalStatusCardProps = {
  rental: Pick<
    RentalDetail,
    "id" | "code" | "status" | "source" | "termination"
  >;
};

/** Current status and the legal next ones, each confirmed in a dialog. */
export function RentalStatusCard({ rental }: RentalStatusCardProps) {
  const { label } = useLabels();
  const changeStatus = useChangeRentalStatus(rental.id);
  const [target, setTarget] = useState<RentalStatus | null>(null);
  const statusLabel = (code: RentalStatus) =>
    label(LABEL_MAPS.rentalStatus, code);
  const nextStatuses = RENTAL_TRANSITIONS[rental.status];
  const movesVehicle = rental.source === "SYSTEM";

  const consequence = (next: RentalStatus) => {
    if (!movesVehicle) {
      return "Locação retroativa: o veículo não muda de situação.";
    }
    if (next === "ACTIVE") {
      return "O veículo passa a alugado e o cliente fica ativo. Nenhuma cobrança é emitida.";
    }
    if (next === "RETURNED" || next === "CANCELLED" || next === "WITHDRAWN") {
      return "O veículo volta a ficar disponível. Esta situação é final e não pode ser desfeita.";
    }
    return `A locação passa de ${statusLabel(rental.status).toLowerCase()} para ${statusLabel(next).toLowerCase()}.`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Situação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Box className="flex items-center gap-2">
          <Text tone="muted">Agora:</Text>
          <RentalStatusBadge status={rental.status} />
        </Box>
        {rental.termination && (
          <TerminationSummary termination={rental.termination} />
        )}
        {rental.status === "ACTIVE" ? (
          <Box className="flex flex-wrap gap-2">
            <RentalTerminationDialog rental={rental} />
          </Box>
        ) : nextStatuses.length === 0 ? (
          <Text size="xs" tone="muted">
            Situação final: a locação não muda mais.
          </Text>
        ) : (
          <Box className="flex flex-wrap gap-2">
            {nextStatuses.map((next) => (
              <ConfirmDialog
                key={next}
                open={target === next}
                onOpenChange={(open) => setTarget(open ? next : null)}
                destructive={next === "CANCELLED" || next === "WITHDRAWN"}
                trigger={
                  <Button variant="outline" size="sm">
                    <ArrowRight />
                    {statusLabel(next)}
                  </Button>
                }
                title={`Marcar como ${statusLabel(next).toLowerCase()}?`}
                description={consequence(next)}
                confirmLabel="Alterar situação"
                isPending={changeStatus.isPending}
                onConfirm={() =>
                  changeStatus.mutate(next, {
                    onSuccess: () => setTarget(null),
                  })
                }
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

/** "Rescindida em 07/11/2026 · Inadimplência, Veículo recolhido". */
function TerminationSummary({
  termination,
}: {
  termination: RentalTermination;
}) {
  const { label } = useLabels();
  const reasons = termination.reasons
    .map((code) =>
      code === OTHER_TERMINATION_REASON && termination.otherReason
        ? termination.otherReason
        : label(LABEL_MAPS.rentalTerminationReason, code),
    )
    .join(", ");

  return (
    <Box className="space-y-1 rounded-md border p-3">
      <Text size="sm" weight="medium">
        Rescindida em {formatCalendarDate(termination.date)}
      </Text>
      <Text size="xs" tone="muted">
        {reasons}
        {termination.byName && ` · por ${termination.byName}`}
      </Text>
      {termination.notes && (
        <Text size="xs" tone="muted">
          {termination.notes}
        </Text>
      )}
    </Box>
  );
}

export function RentalStatusCardSkeleton() {
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
