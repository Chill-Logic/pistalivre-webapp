import { CarFront, Pencil } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";
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
import {
  VehicleRentalCard,
  VehicleRentalCardSkeleton,
} from "@/components/organisms/vehicle-rental-card";
import {
  VehicleSummary,
  VehicleSummarySkeleton,
} from "@/components/organisms/vehicle-summary";
import {
  VehicleStatusCard,
  VehicleStatusCardSkeleton,
} from "@/components/organisms/vehicle-status-card";
import { VehicleDeleteButton } from "@/components/organisms/vehicle-delete-button";
import { VehicleDetailLayout } from "@/components/templates/vehicle-detail-layout";
import { ROUTES, routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useVehicle } from "@/hooks/api/gestao/vehicles/useVehicle";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function VehicleDetailPage() {
  const { id = "" } = useParams();
  const vehicle = useVehicle(id);
  const backTo = useBackToList(ROUTES.vehicles);

  return (
    <Box className="space-y-4">
      <Box className="flex items-center justify-between gap-2">
        <BackLink to={backTo} label="Veículos" />
        {vehicle.data && (
          <Box className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to={routeTo.editVehicle(vehicle.data.id)}>
                <Pencil />
                Editar
              </Link>
            </Button>
            <VehicleDeleteButton
              vehicleId={vehicle.data.id}
              plate={vehicle.data.plate}
            />
          </Box>
        )}
      </Box>
      {vehicle.isPending && (
        <SkeletonRegion label="Carregando veículo…">
          <VehicleDetailLayout
            summary={<VehicleSummarySkeleton />}
            status={<VehicleStatusCardSkeleton />}
            rental={<VehicleRentalCardSkeleton />}
            maintenances={<RelatedMaintenancesSkeleton />}
            inspections={<RelatedInspectionsSkeleton />}
            documents={<DocumentsCardSkeleton />}
          />
        </SkeletonRegion>
      )}
      {vehicle.isError &&
        (isNotFound(vehicle.error) ? (
          <EmptyState
            icon={CarFront}
            title="Veículo não encontrado"
            description="Ele pode ter sido excluído ou o endereço está errado."
          />
        ) : (
          <QueryError error={vehicle.error} onRetry={() => vehicle.refetch()} />
        ))}
      {vehicle.data && (
        <VehicleDetailLayout
          summary={<VehicleSummary vehicle={vehicle.data} />}
          status={
            <VehicleStatusCard
              vehicleId={vehicle.data.id}
              status={vehicle.data.status}
              hasActiveRental={vehicle.data.activeRental !== null}
            />
          }
          rental={<VehicleRentalCard rental={vehicle.data.activeRental} />}
          maintenances={<RelatedMaintenances vehicleId={vehicle.data.id} />}
          inspections={<RelatedInspections vehicleId={vehicle.data.id} />}
          documents={<DocumentsCard documents={vehicle.data.documents} />}
        />
      )}
    </Box>
  );
}
