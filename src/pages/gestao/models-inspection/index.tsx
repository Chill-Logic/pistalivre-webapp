import { Box } from "@/components/atoms/box";
import { Col, Row } from "@/components/atoms/grid";
import { InspectionPolicyCard } from "@/components/organisms/inspection-policy-card";
import {
  InspectionRequirementsCard,
  InspectionRequirementsCardSkeleton,
} from "@/components/organisms/inspection-requirements-card";
import { QueryBoundary } from "@/components/organisms/query-boundary";
import { useInspectionRequirements } from "@/hooks/api/gestao/templates/useInspectionRequirements";

export function ModelsInspectionPage() {
  const requirements = useInspectionRequirements();
  return (
    <Box className="space-y-4 md:space-y-6">
      <QueryBoundary
        query={requirements}
        label="Carregando requisitos de vistoria…"
        skeleton={
          <Row className="gap-y-6">
            {[0, 1, 2].map((index) => (
              <Col key={index} lg={4}>
                <InspectionRequirementsCardSkeleton />
              </Col>
            ))}
          </Row>
        }
      >
        {(data) => (
          <Box className="space-y-6">
            <InspectionPolicyCard policy={data.policy} />
            <Row as="ul" className="gap-y-6">
              {data.types.map((group) => (
                <Col as="li" key={group.type.id} md={6} xl={4}>
                  <InspectionRequirementsCard group={group} />
                </Col>
              ))}
            </Row>
          </Box>
        )}
      </QueryBoundary>
    </Box>
  );
}
