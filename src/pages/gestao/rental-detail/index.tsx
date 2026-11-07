import { FileText } from "lucide-react";
import { useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";
import {
  RentalBillingCard,
  RentalBillingCardSkeleton,
} from "@/components/organisms/rental-billing-card";
import {
  RentalCautionCard,
  RentalCautionCardSkeleton,
} from "@/components/organisms/rental-caution-card";
import {
  RentalCharges,
  RentalChargesSkeleton,
} from "@/components/organisms/rental-charges";
import {
  RentalSummary,
  RentalSummarySkeleton,
} from "@/components/organisms/rental-summary";
import { RentalDetailLayout } from "@/components/templates/rental-detail-layout";
import { ROUTES } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useRental } from "@/hooks/api/gestao/rentals/useRental";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function RentalDetailPage() {
  const { id = "" } = useParams();
  const rental = useRental(id);
  const backTo = useBackToList(ROUTES.rentals);

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label="Locações" />
      {rental.isPending && (
        <SkeletonRegion label="Carregando locação…">
          <RentalDetailLayout
            summary={<RentalSummarySkeleton />}
            billing={<RentalBillingCardSkeleton />}
            charges={<RentalChargesSkeleton />}
            caution={<RentalCautionCardSkeleton />}
          />
        </SkeletonRegion>
      )}
      {rental.isError &&
        (isNotFound(rental.error) ? (
          <EmptyState
            icon={FileText}
            title="Locação não encontrada"
            description="Ela pode ter sido excluída ou o endereço está errado."
          />
        ) : (
          <QueryError error={rental.error} onRetry={() => rental.refetch()} />
        ))}
      {rental.data && (
        <RentalDetailLayout
          summary={<RentalSummary rental={rental.data} />}
          billing={<RentalBillingCard rental={rental.data} />}
          charges={<RentalCharges rentalId={rental.data.id} />}
          caution={<RentalCautionCard caution={rental.data.caution} />}
        />
      )}
    </Box>
  );
}
