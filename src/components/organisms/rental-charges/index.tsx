import { Receipt } from "lucide-react";
import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import {
  ChargeItem,
  ChargeItemSkeleton,
} from "@/components/molecules/charge-item";
import { EmptyState } from "@/components/molecules/empty-state";
import { WaivedDayItem } from "@/components/molecules/waived-day-item";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { ChargeActions } from "@/components/organisms/charge-actions";
import { ChargeFormDialog } from "@/components/organisms/charge-form-dialog";
import { ManualPaymentDialog } from "@/components/organisms/manual-payment-dialog";
import { QueryError } from "@/components/organisms/query-error";
import { RecordAttachments } from "@/components/organisms/record-attachments";
import { queryKeys } from "@/constants/query-keys";
import { chargeTimeline } from "@/helpers/billing";
import { useRental } from "@/hooks/api/gestao/rentals/useRental";
import { useRentalBilling } from "@/hooks/api/gestao/rentals/useRentalBilling";
import { useRentalCharges } from "@/hooks/api/gestao/rentals/useRentalCharges";
import type { RatePeriod } from "@/types/rental";

const SKELETON_ROWS = 3;

type RentalChargesProps = {
  rentalId: string;
  rate: number;
  ratePeriod: RatePeriod;
};

/**
 * Charges of a rental with the actions, in the billing timeline's order
 * (newest first) and with the waived days in between. Until the billing
 * view loads (or if it fails) the list keeps the API order.
 */
export function RentalCharges({
  rentalId,
  rate,
  ratePeriod,
}: RentalChargesProps) {
  const charges = useRentalCharges(rentalId);
  // Same cache as the billing cards of the page (whole period).
  const timeline = useRentalBilling(rentalId).data?.timeline;
  // The rental is already cached by the page: who pays, for "Registrar recebimento".
  const customer = useRental(rentalId).data?.customer;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Cobranças</CardTitle>
        <Box className="flex flex-wrap justify-end gap-2">
          {customer && (
            <ManualPaymentDialog customer={customer} rentalId={rentalId} />
          )}
          <ChargeFormDialog
            rentalId={rentalId}
            rate={rate}
            ratePeriod={ratePeriod}
          />
        </Box>
      </CardHeader>
      <CardContent>
        {charges.isPending && (
          <SkeletonRegion label="Carregando cobranças…">
            <Box className="divide-y">
              {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <ChargeItemSkeleton key={index} />
              ))}
            </Box>
          </SkeletonRegion>
        )}
        {charges.isError && (
          <QueryError error={charges.error} onRetry={() => charges.refetch()} />
        )}
        {charges.data?.length === 0 && (
          <EmptyState icon={Receipt} title="Nenhuma cobrança emitida" />
        )}
        {charges.data && charges.data.length > 0 && (
          <Box className="divide-y">
            {chargeTimeline(charges.data, timeline).map((entry) =>
              entry.kind === "waived" ? (
                <WaivedDayItem
                  key={`waived-${entry.date}`}
                  date={entry.date}
                  reason={entry.reason}
                />
              ) : (
                <ChargeItem
                  key={entry.charge.id}
                  charge={entry.charge}
                  actions={<ChargeActions charge={entry.charge} />}
                  attachments={
                    <RecordAttachments
                      owner={{ type: "PAYMENT", id: entry.charge.id }}
                      attachments={entry.charge.attachments}
                      invalidate={queryKeys.rentals.charges(rentalId)}
                    />
                  }
                />
              ),
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export function RentalChargesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-28 text-base" />
      </CardHeader>
      <CardContent>
        <Box className="divide-y">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <ChargeItemSkeleton key={index} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
