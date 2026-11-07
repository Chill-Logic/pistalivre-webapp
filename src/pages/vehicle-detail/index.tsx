import { CarFront } from "lucide-react";
import { useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Skeleton } from "@/components/atoms/skeleton";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { QueryError } from "@/components/organisms/query-error";
import { VehicleDocuments } from "@/components/organisms/vehicle-documents";
import { VehicleRentalCard } from "@/components/organisms/vehicle-rental-card";
import { VehicleSummary } from "@/components/organisms/vehicle-summary";
import { ROUTES } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useVehicle } from "@/hooks/api/vehicles/useVehicle";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function VehicleDetailPage() {
  const { id = "" } = useParams();
  const vehicle = useVehicle(id);
  const backTo = useBackToList(ROUTES.vehicles);

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label="Veículos" />
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
      {vehicle.isPending && (
        <Box className="space-y-4">
          <Skeleton className="h-56" />
          <Skeleton className="h-28" />
        </Box>
      )}
      {vehicle.data && (
        <Box className="grid gap-4 lg:grid-cols-[2fr_1fr] lg:items-start">
          <VehicleSummary vehicle={vehicle.data} />
          <VehicleRentalCard rental={vehicle.data.activeRental} />
          <Box className="lg:col-span-2">
            <VehicleDocuments documents={vehicle.data.documents} />
          </Box>
        </Box>
      )}
    </Box>
  );
}
