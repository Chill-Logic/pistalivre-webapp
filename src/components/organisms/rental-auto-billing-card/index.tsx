import { PowerOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/atoms/badge";
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
import { AutoBillingEnableDialog } from "@/components/organisms/auto-billing-enable-dialog";
import { QueryError } from "@/components/organisms/query-error";
import { SkipWeekdaysDialog } from "@/components/organisms/skip-weekdays-dialog";
import { LABEL_MAPS } from "@/constants/label-maps";
import { moneyErrorMessage } from "@/helpers/money-errors";
import { useSetAutoBilling } from "@/hooks/api/gestao/rentals/useBillingMutations";
import { useRentalBilling } from "@/hooks/api/gestao/rentals/useRentalBilling";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";
import { useLabels } from "@/hooks/ui/useLabels";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

/**
 * Rent auto-billing of the rental: on/off (where it charges), the next
 * charge it will create and, on the daily rent, the weekdays it skips.
 */
export function RentalAutoBillingCard({ rentalId }: { rentalId: string }) {
  const { label } = useLabels();
  const billing = useRentalBilling(rentalId);
  const disable = useSetAutoBilling(rentalId);
  const idempotency = useIdempotencyKey();
  const [confirming, setConfirming] = useState(false);

  if (billing.isPending) return <RentalAutoBillingCardSkeleton />;
  if (billing.isError) {
    return (
      <QueryError error={billing.error} onRetry={() => billing.refetch()} />
    );
  }

  const view = billing.data;
  const { autoBilling } = view;
  const skipLabel = view.skipWeekdays.length
    ? `Não cobra: ${view.skipWeekdays.map((day) => label(LABEL_MAPS.weekday, day)).join(", ")}`
    : "Cobra todos os dias";

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Cobrança automática</CardTitle>
        {autoBilling.enabled ? (
          <ConfirmDialog
            open={confirming}
            onOpenChange={setConfirming}
            trigger={
              <Button variant="outline" size="sm">
                <PowerOff />
                Desativar
              </Button>
            }
            title="Desativar as cobranças automáticas?"
            description="O sistema para de gerar as cobranças de aluguel. As que já saíram continuam valendo."
            confirmLabel="Desativar"
            isPending={disable.isPending}
            onConfirm={() =>
              disable.mutate(
                { key: idempotency.key, input: { enabled: false } },
                {
                  onSuccess: () => {
                    idempotency.renew();
                    setConfirming(false);
                  },
                  onError: (error) => toast.error(moneyErrorMessage(error)),
                },
              )
            }
          />
        ) : (
          autoBilling.canEnable && <AutoBillingEnableDialog billing={view} />
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {autoBilling.enabled ? (
          <Badge variant="success">
            {autoBilling.channel === "manual"
              ? "Ativa · fora do Asaas"
              : "Ativa · pelo Asaas"}
          </Badge>
        ) : (
          <Badge variant="neutral">Desligada</Badge>
        )}
        <Text size="sm" tone="muted">
          {label(LABEL_MAPS.rentBillingTiming, autoBilling.timing)}
        </Text>
        {autoBilling.enabled && autoBilling.nextDueDate && (
          <Text size="sm">
            Próxima: {formatCalendarDate(autoBilling.nextDueDate)}
            {autoBilling.nextAmount != null &&
              ` · ${formatCurrency(autoBilling.nextAmount)}`}
          </Text>
        )}
        {!autoBilling.enabled && !autoBilling.canEnable && (
          <Text size="sm" tone="muted">
            Ative a locação para habilitar as cobranças automáticas de aluguel.
          </Text>
        )}
        {view.ratePeriod === "DAILY" && (
          <Box className="flex flex-wrap items-center gap-x-2">
            <Text size="xs" tone="muted">
              {skipLabel}
            </Text>
            <SkipWeekdaysDialog
              rentalId={rentalId}
              skipWeekdays={view.skipWeekdays}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export function RentalAutoBillingCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <Skeleton shape="text" className="w-40 text-base" />
        <Skeleton className="h-9 w-24" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton shape="pill" className="h-5 w-28" />
        <Skeleton shape="text" className="w-44 text-sm" />
      </CardContent>
    </Card>
  );
}
