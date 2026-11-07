import { CarFront } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";
import {
  VehicleForm,
  VehicleFormSkeleton,
} from "@/components/organisms/vehicle-form";
import { routeTo } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useVehicle } from "@/hooks/api/gestao/vehicles/useVehicle";
import { useVehicleFormOptions } from "@/hooks/api/gestao/vehicles/useVehicleFormOptions";
import { formatPlate } from "@/utils/plate";

export function VehicleEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const vehicle = useVehicle(id);
  const options = useVehicleFormOptions();
  const detailUrl = routeTo.vehicle(id);
  const error = vehicle.error ?? options.error;

  return (
    <Box className="space-y-4">
      <BackLink
        to={detailUrl}
        label={vehicle.data ? formatPlate(vehicle.data.plate) : "Veículo"}
      />
      <PageHeader title="Editar veículo" />
      {(vehicle.isPending || options.isPending) && !error && (
        <SkeletonRegion label="Carregando formulário…">
          <VehicleFormSkeleton />
        </SkeletonRegion>
      )}
      {error &&
        (isNotFound(error) ? (
          <EmptyState
            icon={CarFront}
            title="Veículo não encontrado"
            description="Ele pode ter sido excluído ou o endereço está errado."
          />
        ) : (
          <QueryError
            error={error}
            onRetry={() => {
              vehicle.refetch();
              options.refetch();
            }}
          />
        ))}
      {vehicle.data && options.data && (
        <VehicleForm
          // Remount when the vehicle changes, so the defaults follow it.
          key={vehicle.data.id}
          options={options.data}
          vehicle={vehicle.data}
          cancelTo={detailUrl}
          onSaved={() => navigate(detailUrl, { replace: true })}
        />
      )}
    </Box>
  );
}
