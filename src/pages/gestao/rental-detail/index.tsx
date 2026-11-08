import { FileText, Pencil } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { RentalDeleteButton } from "@/components/organisms/rental-delete-button";
import {
  RentalStatusCard,
  RentalStatusCardSkeleton,
} from "@/components/organisms/rental-status-card";
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
import {
  RelatedInspections,
  RelatedInspectionsSkeleton,
} from "@/components/organisms/related-inspections";
import {
  RelatedMaintenances,
  RelatedMaintenancesSkeleton,
} from "@/components/organisms/related-maintenances";
import {
  DocumentsCard,
  DocumentsCardSkeleton,
} from "@/components/organisms/documents-card";
import { RentalDetailLayout } from "@/components/templates/rental-detail-layout";
import { queryKeys } from "@/constants/query-keys";
import { ROUTES, routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useRental } from "@/hooks/api/gestao/rentals/useRental";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function RentalDetailPage() {
  const { id = "" } = useParams();
  const rental = useRental(id);
  const backTo = useBackToList(ROUTES.rentals);

  return (
    <Box className="space-y-4">
      <Box className="flex items-center justify-between gap-2">
        <BackLink to={backTo} label="Locações" />
        {rental.data && (
          <Box className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to={routeTo.editRental(rental.data.id)}>
                <Pencil />
                Editar
              </Link>
            </Button>
            <RentalDeleteButton
              rentalId={rental.data.id}
              code={rental.data.code}
              isActive={rental.data.status === "ACTIVE"}
            />
          </Box>
        )}
      </Box>
      {rental.isPending && (
        <SkeletonRegion label="Carregando locação…">
          <RentalDetailLayout
            summary={<RentalSummarySkeleton />}
            status={<RentalStatusCardSkeleton />}
            billing={<RentalBillingCardSkeleton />}
            charges={<RentalChargesSkeleton />}
            caution={<RentalCautionCardSkeleton />}
            maintenances={<RelatedMaintenancesSkeleton />}
            inspections={<RelatedInspectionsSkeleton />}
            documents={<DocumentsCardSkeleton />}
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
          status={<RentalStatusCard rental={rental.data} />}
          billing={<RentalBillingCard rental={rental.data} />}
          charges={
            <RentalCharges
              rentalId={rental.data.id}
              rate={rental.data.rate}
              ratePeriod={rental.data.ratePeriod}
            />
          }
          caution={<RentalCautionCard caution={rental.data.caution} />}
          maintenances={<RelatedMaintenances rentalId={rental.data.id} />}
          inspections={<RelatedInspections rentalId={rental.data.id} />}
          documents={
            <DocumentsCard
              documents={rental.data.documents}
              manage={{
                owner: { type: "RENTAL", id: rental.data.id },
                invalidate: queryKeys.rentals.detail(rental.data.id),
              }}
            />
          }
        />
      )}
    </Box>
  );
}
