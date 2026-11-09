import { useNavigate, useSearchParams } from "react-router-dom";
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
import { safeReturnPath, withIncluded } from "@/helpers/return-path";
import { useBackToList } from "@/hooks/ui/useBackToList";

/**
 * `?proprietario=<partnerId>&titular=<partnerId|empresa>&voltar=<path>`: a
 * partner's contract opens the form with the papers filled and gets the new
 * vehicle back.
 */
export function VehicleNewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const options = useVehicleFormOptions();
  const listBackTo = useBackToList(ROUTES.vehicles);
  const returnTo = safeReturnPath(searchParams.get("voltar"));
  const backTo = returnTo ?? listBackTo;
  const holder = searchParams.get("titular");
  const prefill = {
    ownerPartnerId: searchParams.get("proprietario") || null,
    titleHolderPartnerId: holder && holder !== "empresa" ? holder : null,
  };

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label={returnTo ? "Voltar" : "Veículos"} />
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
          prefill={prefill}
          onSaved={(vehicle) =>
            navigate(
              returnTo
                ? withIncluded(returnTo, vehicle.id)
                : routeTo.vehicle(vehicle.id),
              { replace: true },
            )
          }
        />
      )}
    </Box>
  );
}
