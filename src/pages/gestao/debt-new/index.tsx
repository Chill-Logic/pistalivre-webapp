import { useNavigate, useSearchParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { DebtForm, DebtFormSkeleton } from "@/components/organisms/debt-form";
import { QueryError } from "@/components/organisms/query-error";
import { ROUTES, routeTo } from "@/constants/routes";
import { vehicleName } from "@/helpers/vehicle";
import { useVehicle } from "@/hooks/api/gestao/vehicles/useVehicle";
import { useBackToList } from "@/hooks/ui/useBackToList";
import { formatPlate } from "@/utils/plate";

/**
 * New debt. `?veiculo=` (from the vehicle's page) opens it with that vehicle
 * already chosen; it can still be changed.
 */
export function DebtNewPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const vehicleId = params.get("veiculo") ?? "";
  const vehicle = useVehicle(vehicleId);
  const listBackTo = useBackToList(ROUTES.financeDebts);
  const backTo = vehicleId ? routeTo.vehicle(vehicleId) : listBackTo;
  const waiting = Boolean(vehicleId) && vehicle.isPending;

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label={vehicleId ? "Veículo" : "Débitos"} />
      <PageHeader title="Nova dívida" />
      {waiting && (
        <SkeletonRegion label="Carregando…">
          <DebtFormSkeleton />
        </SkeletonRegion>
      )}
      {vehicleId && vehicle.isError && (
        <QueryError error={vehicle.error} onRetry={() => vehicle.refetch()} />
      )}
      {!waiting && !(vehicleId && vehicle.isError) && (
        <DebtForm
          presetVehicle={
            vehicle.data && {
              id: vehicle.data.id,
              label: `${formatPlate(vehicle.data.plate)} · ${vehicleName(vehicle.data)}`,
            }
          }
          cancelTo={backTo}
          onSaved={(debt) => navigate(routeTo.debt(debt.id), { replace: true })}
        />
      )}
    </Box>
  );
}
