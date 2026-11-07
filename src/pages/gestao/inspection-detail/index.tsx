import { ClipboardCheck } from "lucide-react";
import { useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  InspectionChecksCard,
  InspectionChecksCardSkeleton,
} from "@/components/organisms/inspection-checks-card";
import {
  InspectionPhotosCard,
  InspectionPhotosCardSkeleton,
} from "@/components/organisms/inspection-photos-card";
import {
  InspectionSummary,
  InspectionSummarySkeleton,
} from "@/components/organisms/inspection-summary";
import { QueryError } from "@/components/organisms/query-error";
import { InspectionDetailLayout } from "@/components/templates/inspection-detail-layout";
import { ROUTES } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useInspection } from "@/hooks/api/gestao/inspections/useInspection";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function InspectionDetailPage() {
  const { id = "" } = useParams();
  const inspection = useInspection(id);
  const backTo = useBackToList(ROUTES.inspections);

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label="Vistorias" />
      {inspection.isPending && (
        <SkeletonRegion label="Carregando vistoria…">
          <InspectionDetailLayout
            summary={<InspectionSummarySkeleton />}
            checks={<InspectionChecksCardSkeleton />}
            photos={<InspectionPhotosCardSkeleton />}
          />
        </SkeletonRegion>
      )}
      {inspection.isError &&
        (isNotFound(inspection.error) ? (
          <EmptyState
            icon={ClipboardCheck}
            title="Vistoria não encontrada"
            description="Ela pode ter sido excluída ou o endereço está errado."
          />
        ) : (
          <QueryError
            error={inspection.error}
            onRetry={() => inspection.refetch()}
          />
        ))}
      {inspection.data && (
        <InspectionDetailLayout
          summary={<InspectionSummary inspection={inspection.data} />}
          checks={<InspectionChecksCard checks={inspection.data.checks} />}
          photos={<InspectionPhotosCard photos={inspection.data.photos} />}
        />
      )}
    </Box>
  );
}
