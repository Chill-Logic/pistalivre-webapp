import { Undo2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { CollapsibleCard } from "@/components/molecules/collapsible-card";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { QueryError } from "@/components/organisms/query-error";
import { RateSegmentDialog } from "@/components/organisms/rate-segment-dialog";
import { ratePeriodSuffix } from "@/helpers/billing";
import { useRemoveLastRateSegment } from "@/hooks/api/gestao/rentals/useBillingMutations";
import { useRentalBilling } from "@/hooks/api/gestao/rentals/useRentalBilling";
import { calendarDay } from "@/utils/date";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

/**
 * The rental's values over time: each one holds from its date, with its own
 * value and periodicity, and every day is charged with the one valid in it.
 * Only the last can be undone.
 */
export function RateSegmentsCard({ rentalId }: { rentalId: string }) {
  const billing = useRentalBilling(rentalId);
  const undo = useRemoveLastRateSegment(rentalId);
  const [confirming, setConfirming] = useState(false);

  if (billing.isPending) return <RateSegmentsCardSkeleton />;
  if (billing.isError) {
    return (
      <QueryError error={billing.error} onRetry={() => billing.refetch()} />
    );
  }

  const view = billing.data;
  const { items, current } = view.rateSegments;
  const last = items[items.length - 1];
  const rows = [...items].reverse();

  return (
    <CollapsibleCard
      title="Valores da locação"
      count={items.length}
      storageKey="rental-rate-segments"
      contentClassName="space-y-3"
      actions={<RateSegmentDialog billing={view} />}
    >
      <Text size="xs" tone="muted">
        Cada dia usa o valor que valia nele: mudar daqui para a frente não mexe
        no que já passou.
      </Text>
      {view.rateSegments.debtsSettled && current.debtShare > 0 && (
        <Alert variant="warning">
          Os débitos do cliente estão quitados, mas o valor ainda separa{" "}
          {formatCurrency(current.debtShare)} por{" "}
          {ratePeriodSuffix(current.debtSharePeriod)} para eles: esse valor está
          contando como aluguel. Ajuste se for o caso.
        </Alert>
      )}
      <Box className="divide-y rounded-md border">
        {rows.map((segment) => {
          const isCurrent = segment.from === current.from;
          const isFuture = calendarDay(segment.from) > view.today;
          return (
            <Box key={segment.from} className="flex items-center gap-3 p-3">
              <Box className="min-w-0 flex-1">
                <Text weight="medium">
                  {formatCurrency(segment.rate)} /{" "}
                  {ratePeriodSuffix(segment.ratePeriod)}
                  {isCurrent ? " · vigente" : isFuture ? " · futuro" : ""}
                </Text>
                <Text size="xs" tone="muted">
                  A partir de {formatCalendarDate(segment.from)}
                  {segment.debtShare > 0 &&
                    ` · ${formatCurrency(segment.debtShare)} por ${ratePeriodSuffix(segment.debtSharePeriod)} para débitos`}
                </Text>
              </Box>
              {segment === last && items.length > 1 && (
                <ConfirmDialog
                  open={confirming}
                  onOpenChange={setConfirming}
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Desfazer o valor de ${formatCalendarDate(segment.from)}`}
                    >
                      <Undo2 />
                      Desfazer
                    </Button>
                  }
                  title="Desfazer este valor?"
                  description="Os dias a partir desta data voltam a usar o valor anterior."
                  confirmLabel="Desfazer"
                  isPending={undo.isPending}
                  onConfirm={() =>
                    undo.mutate(undefined, {
                      onSuccess: () => setConfirming(false),
                      onError: (error) => toast.error(error.message),
                    })
                  }
                />
              )}
            </Box>
          );
        })}
      </Box>
    </CollapsibleCard>
  );
}

export function RateSegmentsCardSkeleton() {
  return (
    <Box className="space-y-3 rounded-lg border bg-card p-4 shadow-sm md:p-6">
      <Box className="flex items-center justify-between">
        <Skeleton shape="text" className="w-40 text-base" />
        <Skeleton className="h-9 w-32" />
      </Box>
      <Skeleton className="h-16 w-full" />
    </Box>
  );
}
