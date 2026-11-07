import { useNavigate, useSearchParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  MaintenanceForm,
  MaintenanceFormSkeleton,
} from "@/components/organisms/maintenance-form";
import { QueryError } from "@/components/organisms/query-error";
import { ROUTES, routeTo } from "@/constants/routes";
import { vehicleName } from "@/helpers/vehicle";
import { useRental } from "@/hooks/api/gestao/rentals/useRental";
import { useVehicle } from "@/hooks/api/gestao/vehicles/useVehicle";
import { formatPlate } from "@/utils/plate";

/**
 * New maintenance. `?locacao=` registers it on a rental (its vehicle comes
 * fixed), `?veiculo=` on a vehicle; without either, the vehicle is picked.
 */
export function MaintenanceNewPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const rentalId = params.get("locacao") ?? "";
  const rental = useRental(rentalId);
  const vehicleId = rentalId
    ? (rental.data?.vehicle.id ?? "")
    : (params.get("veiculo") ?? "");
  const vehicle = useVehicle(rentalId ? "" : vehicleId);

  const backTo = rentalId
    ? routeTo.rental(rentalId)
    : vehicleId
      ? routeTo.vehicle(vehicleId)
      : ROUTES.maintenances;
  const backLabel = rentalId
    ? "Locação"
    : vehicleId
      ? "Veículo"
      : "Manutenções";

  const source = rentalId ? rental : vehicleId ? vehicle : null;
  const fixedVehicle = rentalId ? rental.data?.vehicle : vehicle.data;
  const waiting = source?.isPending ?? false;

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label={backLabel} />
      <PageHeader title="Registrar manutenção" />
      {waiting && (
        <SkeletonRegion label="Carregando…">
          <MaintenanceFormSkeleton />
        </SkeletonRegion>
      )}
      {source?.isError && (
        <QueryError error={source.error} onRetry={() => source.refetch()} />
      )}
      {!waiting && !source?.isError && (
        <MaintenanceForm
          context={
            fixedVehicle
              ? {
                  vehicleId: fixedVehicle.id,
                  vehicleLabel: `${formatPlate(fixedVehicle.plate)} · ${vehicleName(fixedVehicle)}`,
                  rentalId: rentalId || undefined,
                  rentalCode: rental.data?.code,
                }
              : undefined
          }
          cancelTo={backTo}
          onSaved={(saved) =>
            navigate(routeTo.maintenance(saved.id), { replace: true })
          }
        />
      )}
    </Box>
  );
}
