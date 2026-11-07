import { useNavigate } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { PageHeader } from "@/components/molecules/page-header";
import { PlanForm } from "@/components/organisms/plan-form";
import { ROUTES } from "@/constants/routes";

export function PlanNewPage() {
  const navigate = useNavigate();

  return (
    <Box className="space-y-4">
      <BackLink to={ROUTES.plans} label="Planos" />
      <PageHeader title="Novo plano" />
      <PlanForm
        cancelTo={ROUTES.plans}
        onSaved={() => navigate(ROUTES.plans, { replace: true })}
      />
    </Box>
  );
}
