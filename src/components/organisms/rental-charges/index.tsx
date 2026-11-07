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
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";
import { useRentalCharges } from "@/hooks/api/rentals/useRentalCharges";

const SKELETON_ROWS = 3;

/** Charges of a rental, in the API order (open first). Read-only for now. */
export function RentalCharges({ rentalId }: { rentalId: string }) {
  const charges = useRentalCharges(rentalId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cobranças</CardTitle>
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
            {charges.data.map((charge) => (
              <ChargeItem key={charge.id} charge={charge} />
            ))}
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
