import { Tags } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { PlanForm, PlanFormSkeleton } from "@/components/organisms/plan-form";
import { QueryError } from "@/components/organisms/query-error";
import { ROUTES } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { usePlan } from "@/hooks/api/gestao/plans/usePlan";

export function PlanEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const plan = usePlan(id);

  return (
    <Box className="space-y-4">
      <BackLink to={ROUTES.plans} label="Planos" />
      <PageHeader title="Editar plano" />
      {plan.isPending && (
        <SkeletonRegion label="Carregando plano…">
          <PlanFormSkeleton />
        </SkeletonRegion>
      )}
      {plan.isError &&
        (isNotFound(plan.error) ? (
          <EmptyState icon={Tags} title="Plano não encontrado" />
        ) : (
          <QueryError error={plan.error} onRetry={() => plan.refetch()} />
        ))}
      {plan.data && (
        <PlanForm
          key={plan.data.id}
          plan={plan.data}
          cancelTo={ROUTES.plans}
          onSaved={() => navigate(ROUTES.plans, { replace: true })}
        />
      )}
    </Box>
  );
}
