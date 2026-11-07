import { Wrench } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  MaintenanceForm,
  MaintenanceFormSkeleton,
} from "@/components/organisms/maintenance-form";
import { QueryError } from "@/components/organisms/query-error";
import { routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useMaintenance } from "@/hooks/api/gestao/maintenances/useMaintenance";

export function MaintenanceEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const maintenance = useMaintenance(id);
  const detailUrl = routeTo.maintenance(id);

  return (
    <Box className="space-y-4">
      <BackLink to={detailUrl} label="Manutenção" />
      <PageHeader title="Editar manutenção" />
      {maintenance.isPending && (
        <SkeletonRegion label="Carregando manutenção…">
          <MaintenanceFormSkeleton />
        </SkeletonRegion>
      )}
      {maintenance.isError &&
        (isNotFound(maintenance.error) ? (
          <EmptyState icon={Wrench} title="Manutenção não encontrada" />
        ) : (
          <QueryError
            error={maintenance.error}
            onRetry={() => maintenance.refetch()}
          />
        ))}
      {maintenance.data && (
        <MaintenanceForm
          key={maintenance.data.id}
          maintenance={maintenance.data}
          cancelTo={detailUrl}
          onSaved={() => navigate(detailUrl, { replace: true })}
        />
      )}
    </Box>
  );
}
