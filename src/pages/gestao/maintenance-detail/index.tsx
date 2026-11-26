import { HandCoins, Pencil, Wrench } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
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
import { MaintenanceDeleteButton } from "@/components/organisms/maintenance-delete-button";
import { PassOnCostDialog } from "@/components/organisms/pass-on-cost-dialog";
import { Text } from "@/components/atoms/text";
import { formatCurrency } from "@/utils/format";
import { calendarDay } from "@/utils/date";
import { QueryError } from "@/components/organisms/query-error";
import { MaintenanceDetailLayout } from "@/components/templates/maintenance-detail-layout";
import { ROUTES, routeTo } from "@/constants/routes";
import { queryKeys } from "@/constants/query-keys";
import { isNotFound } from "@/helpers/api-error";
import { useMaintenance } from "@/hooks/api/gestao/maintenances/useMaintenance";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function MaintenanceDetailPage() {
  const { id = "" } = useParams();
  const maintenance = useMaintenance(id);
  const backTo = useBackToList(ROUTES.maintenances);

  return (
    <Box className="space-y-4">
      <Box className="flex items-center justify-between gap-2">
        <BackLink to={backTo} label="Manutenções" />
        {maintenance.data && (
          <Box className="flex gap-2">
            <PassOnCostDialog
              source={{ maintenanceId: maintenance.data.id }}
              defaults={{
                amount: maintenance.data.cost,
                description: "Manutenção do veículo",
                incurredAt: calendarDay(maintenance.data.performedAt),
                customer: maintenance.data.rental?.customer ?? null,
              }}
              invalidate={queryKeys.maintenances.detail(maintenance.data.id)}
              trigger={
                <Button variant="ghost" size="sm">
                  <HandCoins />
                  Cobrar do cliente
                </Button>
              }
            />
            <Button asChild variant="ghost" size="sm">
              <Link to={routeTo.editMaintenance(maintenance.data.id)}>
                <Pencil />
                Editar
              </Link>
            </Button>
            <MaintenanceDeleteButton maintenanceId={maintenance.data.id} />
          </Box>
        )}
      </Box>
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
      {maintenance.data?.customerDebts?.map((debt) => (
        <Text key={debt.id} size="sm" tone="muted">
          Cobrada de{" "}
          <Link
            to={routeTo.customer(debt.customer.id)}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {debt.customer.name}
          </Link>{" "}
          como débito de {formatCurrency(debt.amount)}.
        </Text>
      ))}
      {maintenance.data && (
        <MaintenanceDetailLayout
          summary={<MaintenanceSummary maintenance={maintenance.data} />}
          documents={
            <DocumentsCard
              documents={maintenance.data.documents}
              manage={{
                owner: { type: "MAINTENANCE", id: maintenance.data.id },
                invalidate: queryKeys.maintenances.detail(maintenance.data.id),
              }}
            />
          }
        />
      )}
    </Box>
  );
}
