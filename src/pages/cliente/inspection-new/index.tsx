import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { PageHeader } from "@/components/molecules/page-header";
import {
  PortalInspectionForm,
  PortalInspectionFormSkeleton,
} from "@/components/organisms/portal-inspection-form";
import { QueryBoundary } from "@/components/organisms/query-boundary";
import { routeTo } from "@/constants/routes";
import { useMyRental } from "@/hooks/api/cliente/rentals/useMyRental";
import { useInspectionRequirements } from "@/hooks/api/cliente/rentals/useInspectionRequirements";

export function PortalInspectionNewPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const rental = useMyRental(id);
  const requirements = useInspectionRequirements(id);
  const back = routeTo.portalRental(id);

  return (
    <Box className="space-y-4">
      <BackLink to={back} label={rental.data?.code ?? "Locação"} />
      <PageHeader title="Realizar vistoria" />
      <QueryBoundary
        query={requirements}
        label="Carregando o que a vistoria pede…"
        skeleton={<PortalInspectionFormSkeleton />}
      >
        {(data) => (
          <PortalInspectionForm
            rentalId={id}
            requirements={data}
            onSent={() => navigate(back, { replace: true })}
          />
        )}
      </QueryBoundary>
    </Box>
  );
}
