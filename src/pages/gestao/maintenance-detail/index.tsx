import { Wrench } from "lucide-react";
import { useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  DocumentsCard,
  DocumentsCardSkeleton,
} from "@/components/organisms/documents-card";
import {
  MaintenanceSummary,
  MaintenanceSummarySkeleton,
} from "@/components/organisms/maintenance-summary";
import { QueryError } from "@/components/organisms/query-error";
import { MaintenanceDetailLayout } from "@/components/templates/maintenance-detail-layout";
import { ROUTES } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useMaintenance } from "@/hooks/api/gestao/maintenances/useMaintenance";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function MaintenanceDetailPage() {
  const { id = "" } = useParams();
  const maintenance = useMaintenance(id);
  const backTo = useBackToList(ROUTES.maintenances);

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label="Manutenções" />
      {maintenance.isPending && (
        <SkeletonRegion label="Carregando manutenção…">
          <MaintenanceDetailLayout
            summary={<MaintenanceSummarySkeleton />}
            documents={<DocumentsCardSkeleton />}
          />
        </SkeletonRegion>
      )}
      {maintenance.isError &&
        (isNotFound(maintenance.error) ? (
          <EmptyState
            icon={Wrench}
            title="Manutenção não encontrada"
            description="Ela pode ter sido excluída ou o endereço está errado."
          />
        ) : (
          <QueryError
            error={maintenance.error}
            onRetry={() => maintenance.refetch()}
          />
        ))}
      {maintenance.data && (
        <MaintenanceDetailLayout
          summary={<MaintenanceSummary maintenance={maintenance.data} />}
          documents={<DocumentsCard documents={maintenance.data.documents} />}
        />
      )}
    </Box>
  );
}
