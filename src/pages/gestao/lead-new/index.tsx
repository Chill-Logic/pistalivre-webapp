import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { LeadForm, LeadFormSkeleton } from "@/components/organisms/lead-form";
import { QueryError } from "@/components/organisms/query-error";
import { ROUTES, routeTo } from "@/constants/routes";
import { catalogModelOptions } from "@/helpers/vehicle-form";
import { useCrmOptions } from "@/hooks/api/gestao/crm/useCrmOptions";
import { useVehicleFormOptions } from "@/hooks/api/gestao/vehicles/useVehicleFormOptions";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function LeadNewPage() {
  const navigate = useNavigate();
  const backTo = useBackToList(ROUTES.crm);
  const options = useCrmOptions();
  const vehicleOptions = useVehicleFormOptions();
  const models = useMemo(
    () => (vehicleOptions.data ? catalogModelOptions(vehicleOptions.data) : []),
    [vehicleOptions.data],
  );
  const error = options.error ?? vehicleOptions.error;

  return (
    <Box className="space-y-4">
      <BackLink to={backTo} label="CRM" />
      <PageHeader title="Novo lead" />
      {(options.isPending || vehicleOptions.isPending) && !error && (
        <SkeletonRegion label="Carregando formulário…">
          <LeadFormSkeleton />
        </SkeletonRegion>
      )}
      {error && (
        <QueryError
          error={error}
          onRetry={() => {
            options.refetch();
            vehicleOptions.refetch();
          }}
        />
      )}
      {options.data && vehicleOptions.data && (
        <LeadForm
          options={options.data}
          models={models}
          cancelTo={backTo}
          onSaved={(lead) => navigate(routeTo.lead(lead.id), { replace: true })}
        />
      )}
    </Box>
  );
}
