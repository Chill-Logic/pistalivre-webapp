import { Eye, FileText } from "lucide-react";
import { useParams } from "react-router-dom";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  PortalRentalSections,
  PortalRentalSectionsSkeleton,
} from "@/components/organisms/portal-rental-sections";
import {
  PortalRentalSummary,
  PortalRentalSummarySkeleton,
} from "@/components/organisms/portal-rental-summary";
import { QueryError } from "@/components/organisms/query-error";
import {
  RentalCautionCard,
  RentalCautionCardSkeleton,
} from "@/components/organisms/rental-caution-card";
import { PortalRentalLayout } from "@/components/templates/portal-rental-layout";
import { routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useRentalCustomerView } from "@/hooks/api/gestao/rentals/useRentalCustomerView";

/**
 * "Ver como cliente": the rental page exactly as the renter sees it in the
 * portal (same disclosure by status), with every write turned off.
 */
export function RentalCustomerViewPage() {
  const { id = "" } = useParams();
  const view = useRentalCustomerView(id);

  return (
    <Box className="space-y-4">
      <BackLink
        to={routeTo.rental(id)}
        label={view.data?.rental.code ?? "Locação"}
      />
      <Alert variant="info" className="flex items-center gap-2">
        <Eye className="size-4 shrink-0" aria-hidden />
        Visualização do cliente: é assim que o locatário vê esta locação no
        portal. Só leitura.
      </Alert>
      {view.isPending && (
        <SkeletonRegion label="Carregando a visão do cliente…">
          <PortalRentalLayout
            summary={<PortalRentalSummarySkeleton />}
            caution={<RentalCautionCardSkeleton />}
            sections={<PortalRentalSectionsSkeleton />}
          />
        </SkeletonRegion>
      )}
      {view.isError &&
        (isNotFound(view.error) ? (
          <EmptyState
            icon={FileText}
            title="Locação não encontrada"
            description="Confira o endereço ou volte para as locações."
          />
        ) : (
          <QueryError error={view.error} onRetry={() => view.refetch()} />
        ))}
      {view.data && (
        <PortalRentalLayout
          summary={<PortalRentalSummary rental={view.data.rental} />}
          caution={
            view.data.rental.caution && (
              <RentalCautionCard caution={view.data.rental.caution} />
            )
          }
          sections={
            <PortalRentalSections
              rentalId={id}
              sections={view.data.sections}
              readOnly
            />
          }
        />
      )}
    </Box>
  );
}
