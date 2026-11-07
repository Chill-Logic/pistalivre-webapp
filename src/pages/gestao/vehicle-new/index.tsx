import { useNavigate } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";
import {
  VehicleForm,
  VehicleFormSkeleton,
} from "@/components/organisms/vehicle-form";
import { ROUTES, routeTo } from "@/constants/routes";
import { useVehicleFormOptions } from "@/hooks/api/gestao/vehicles/useVehicleFormOptions";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function VehicleNewPage() {
  const navigate = useNavigate();
  const options = useVehicleFormOptions();
  const backTo = useBackToList(ROUTES.vehicles);

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label="Veículos" />
      <PageHeader title="Novo veículo" />
      {options.isPending && (
        <SkeletonRegion label="Carregando formulário…">
          <VehicleFormSkeleton />
        </SkeletonRegion>
      )}
      {options.isError && (
        <QueryError error={options.error} onRetry={() => options.refetch()} />
      )}
      {options.data && (
        <VehicleForm
          options={options.data}
          cancelTo={backTo}
          onSaved={(vehicle) =>
            navigate(routeTo.vehicle(vehicle.id), { replace: true })
          }
        />
      )}
    </Box>
  );
}
