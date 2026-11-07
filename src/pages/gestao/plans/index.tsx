import { Tags } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Col, Row } from "@/components/atoms/grid";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { PlanCard, PlanCardSkeleton } from "@/components/organisms/plan-card";
import { QueryError } from "@/components/organisms/query-error";
import { sortPlans } from "@/helpers/plan";
import { usePlans } from "@/hooks/api/gestao/plans/usePlans";

/** Commercial plans (what the public questionnaire offers). Read-only. */
export function PlansPage() {
  const plans = usePlans();

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader title="Planos" />
      {plans.isPending && (
        <SkeletonRegion label="Carregando planos…">
          <Row className="gap-y-6">
            {[0, 1, 2].map((index) => (
              <Col key={index} md={6} xl={4}>
                <PlanCardSkeleton />
              </Col>
            ))}
          </Row>
        </SkeletonRegion>
      )}
      {plans.isError && (
        <QueryError error={plans.error} onRetry={() => plans.refetch()} />
      )}
      {plans.data?.length === 0 && (
        <EmptyState icon={Tags} title="Nenhum plano cadastrado" />
      )}
      {plans.data && plans.data.length > 0 && (
        <Row as="ul" className="gap-y-6">
          {sortPlans(plans.data).map((plan) => (
            <Col as="li" key={plan.id} md={6} xl={4}>
              <PlanCard plan={plan} />
            </Col>
          ))}
        </Row>
      )}
    </Box>
  );
}
