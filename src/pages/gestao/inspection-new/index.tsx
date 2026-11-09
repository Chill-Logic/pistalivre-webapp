import { ClipboardCheck } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { InspectionContextPicker } from "@/components/organisms/inspection-context-picker";
import { QueryError } from "@/components/organisms/query-error";
import {
  StaffInspectionForm,
  StaffInspectionFormSkeleton,
} from "@/components/organisms/staff-inspection-form";
import { ROUTES, routeTo } from "@/constants/routes";
import { requirementsOfType } from "@/helpers/inspection";
import { vehicleName } from "@/helpers/vehicle";
import { useRental } from "@/hooks/api/gestao/rentals/useRental";
import { useInspectionRequirements } from "@/hooks/api/gestao/templates/useInspectionRequirements";
import { useVehicle } from "@/hooks/api/gestao/vehicles/useVehicle";
import { formatPlate } from "@/utils/plate";

/**
 * New inspection by the staff. From a vehicle (`/veiculos/:id/vistorias/nova`)
 * the vehicle comes fixed and `?locacao=` ties it to one of its rentals (and
 * lets the renter be the author). From the list (`/vistorias/nova`) the
 * vehicle and, optionally, the rental are picked (`?veiculo=`/`?locacao=`);
 * without a rental it is standalone. The photos and checks are the ones the
 * vehicle type asks for.
 */
export function InspectionNewPage() {
  const { id = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const picking = !id;
  const rentalId = params.get("locacao") ?? "";
  const rental = useRental(rentalId);
  const vehicleId = id || params.get("veiculo") || "";
  const vehicle = useVehicle(vehicleId);
  const catalog = useInspectionRequirements();

  const sources = [
    ...(vehicleId ? [vehicle] : []),
    catalog,
    ...(rentalId ? [rental] : []),
  ];
  const waiting = sources.some((query) => query.isPending);
  const failed = sources.find((query) => query.isError);
  const backTo = picking
    ? ROUTES.inspections
    : rentalId
      ? routeTo.rental(rentalId)
      : routeTo.vehicle(id);
  const backLabel = picking
    ? "Vistorias"
    : rentalId
      ? (rental.data?.code ?? "Locação")
      : vehicle.data
        ? formatPlate(vehicle.data.plate)
        : "Veículo";

  const pick = (next: { veiculo: string; locacao?: string }) => {
    const query = new URLSearchParams();
    if (next.veiculo) query.set("veiculo", next.veiculo);
    if (next.locacao) query.set("locacao", next.locacao);
    setParams(query, { replace: true });
  };

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label={backLabel} />
      <PageHeader title="Nova vistoria" />
      {picking && (
        <InspectionContextPicker
          vehicle={
            vehicle.data
              ? {
                  id: vehicle.data.id,
                  label: `${formatPlate(vehicle.data.plate)} · ${vehicleName(vehicle.data)}`,
                  plate: vehicle.data.plate,
                }
              : null
          }
          rental={
            rental.data
              ? {
                  id: rental.data.id,
                  label: `${rental.data.code} · ${rental.data.customer.name}`,
                }
              : null
          }
          onVehicleChange={(next) =>
            // Another vehicle: the rental (of the old one) no longer applies.
            pick({
              veiculo: next,
              locacao:
                rental.data?.vehicle.id === next ? rentalId : undefined,
            })
          }
          onRentalChange={(next) =>
            pick(
              next
                ? { veiculo: next.vehicleId, locacao: next.id }
                : { veiculo: vehicleId },
            )
          }
        />
      )}
      {picking && !vehicleId && (
        <EmptyState
          icon={ClipboardCheck}
          title="Escolha o veículo"
          description="As fotos e os itens da vistoria dependem do tipo do veículo."
        />
      )}
      {vehicleId && waiting && !failed && (
        <SkeletonRegion label="Carregando o que a vistoria pede…">
          <StaffInspectionFormSkeleton />
        </SkeletonRegion>
      )}
      {failed && (
        <QueryError error={failed.error} onRetry={() => failed.refetch()} />
      )}
      {!waiting && !failed && vehicle.data && catalog.data && (
        <StaffInspectionForm
          // A new vehicle or rental starts a fresh form.
          key={`${vehicle.data.id}:${rental.data?.id ?? ""}`}
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
