import { FileText } from "lucide-react";
import { useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryBoundary } from "@/components/organisms/query-boundary";
import { QueryError } from "@/components/organisms/query-error";
import {
  PortalRentalSections,
  PortalRentalSectionsSkeleton,
} from "@/components/organisms/portal-rental-sections";
import {
  PortalRentalSummary,
  PortalRentalSummarySkeleton,
} from "@/components/organisms/portal-rental-summary";
import {
  RentalCautionCard,
  RentalCautionCardSkeleton,
} from "@/components/organisms/rental-caution-card";
import { PortalRentalLayout } from "@/components/templates/portal-rental-layout";
import { ROUTES } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useMyRental } from "@/hooks/api/cliente/rentals/useMyRental";
import { useMyRentalSections } from "@/hooks/api/cliente/rentals/useMyRentalSections";

export function PortalRentalDetailPage() {
  const { id = "" } = useParams();
  const rental = useMyRental(id);
  const sections = useMyRentalSections(id);

  return (
    <Box className="space-y-4">
      <BackLink to={ROUTES.portal} label="Minhas locações" />
      {rental.isPending && (
        <SkeletonRegion label="Carregando locação…">
          <PortalRentalLayout
            summary={<PortalRentalSummarySkeleton />}
            caution={<RentalCautionCardSkeleton />}
            sections={<PortalRentalSectionsSkeleton />}
          />
        </SkeletonRegion>
      )}
      {rental.isError &&
        (isNotFound(rental.error) ? (
          <EmptyState
            icon={FileText}
            title="Locação não encontrada"
            description="Confira o endereço ou volte para as suas locações."
          />
        ) : (
          <QueryError error={rental.error} onRetry={() => rental.refetch()} />
        ))}
      {rental.data && (
        <PortalRentalLayout
          summary={<PortalRentalSummary rental={rental.data} />}
          caution={
            rental.data.caution && (
              <RentalCautionCard caution={rental.data.caution} />
            )
          }
          sections={
            <QueryBoundary
              query={sections}
              label="Carregando cobranças e documentos…"
              skeleton={<PortalRentalSectionsSkeleton />}
            >
              {(data) => <PortalRentalSections rentalId={id} sections={data} />}
            </QueryBoundary>
          }
        />
      )}
    </Box>
  );
}
