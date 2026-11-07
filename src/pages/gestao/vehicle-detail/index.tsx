import { CarFront } from "lucide-react";
import { useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";
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
import { VehicleDetailLayout } from "@/components/templates/vehicle-detail-layout";
import { ROUTES } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useVehicle } from "@/hooks/api/gestao/vehicles/useVehicle";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function VehicleDetailPage() {
  const { id = "" } = useParams();
  const vehicle = useVehicle(id);
  const backTo = useBackToList(ROUTES.vehicles);

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label="Veículos" />
      {vehicle.isPending && (
        <SkeletonRegion label="Carregando veículo…">
          <VehicleDetailLayout
            summary={<VehicleSummarySkeleton />}
            rental={<VehicleRentalCardSkeleton />}
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
          rental={<VehicleRentalCard rental={vehicle.data.activeRental} />}
          documents={<DocumentsCard documents={vehicle.data.documents} />}
        />
      )}
    </Box>
  );
}
