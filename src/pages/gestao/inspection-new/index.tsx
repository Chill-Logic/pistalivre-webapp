import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";
import {
  StaffInspectionForm,
  StaffInspectionFormSkeleton,
} from "@/components/organisms/staff-inspection-form";
import { routeTo } from "@/constants/routes";
import { requirementsOfType } from "@/helpers/inspection";
import { vehicleName } from "@/helpers/vehicle";
import { useRental } from "@/hooks/api/gestao/rentals/useRental";
import { useInspectionRequirements } from "@/hooks/api/gestao/templates/useInspectionRequirements";
import { useVehicle } from "@/hooks/api/gestao/vehicles/useVehicle";
import { formatPlate } from "@/utils/plate";

/**
 * New inspection of a vehicle by the staff. `?locacao=` ties it to one of the
 * vehicle's rentals (and lets the renter be the author). The photos and
 * checks are the ones the vehicle type asks for.
 */
export function InspectionNewPage() {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const rentalId = params.get("locacao") ?? "";
  const vehicle = useVehicle(id);
  const rental = useRental(rentalId);
  const catalog = useInspectionRequirements();

  const sources = rentalId ? [vehicle, catalog, rental] : [vehicle, catalog];
  const waiting = sources.some((query) => query.isPending);
  const failed = sources.find((query) => query.isError);
  const backTo = rentalId ? routeTo.rental(rentalId) : routeTo.vehicle(id);
  const backLabel = rentalId
    ? (rental.data?.code ?? "Locação")
    : vehicle.data
      ? formatPlate(vehicle.data.plate)
      : "Veículo";

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label={backLabel} />
      <PageHeader title="Nova vistoria" />
      {waiting && !failed && (
        <SkeletonRegion label="Carregando o que a vistoria pede…">
          <StaffInspectionFormSkeleton />
        </SkeletonRegion>
      )}
      {failed && (
        <QueryError error={failed.error} onRetry={() => failed.refetch()} />
      )}
      {!waiting && !failed && vehicle.data && catalog.data && (
        <StaffInspectionForm
          vehicle={{
            id: vehicle.data.id,
            label: `${formatPlate(vehicle.data.plate)} · ${vehicleName(vehicle.data)}`,
            currentMileage: vehicle.data.currentMileage,
          }}
          rental={
            rental.data
              ? {
                  id: rental.data.id,
                  code: rental.data.code,
                  customerName: rental.data.customer.name,
                }
              : undefined
          }
          requirements={requirementsOfType(catalog.data, vehicle.data.type.id)}
          onSaved={(saved) =>
            navigate(routeTo.inspection(saved), { replace: true })
          }
        />
      )}
    </Box>
  );
}
