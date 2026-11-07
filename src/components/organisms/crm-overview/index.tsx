import { Col, Row } from "@/components/atoms/grid";
import {
  BarListCard,
  BarListCardSkeleton,
} from "@/components/organisms/bar-list-card";
import { lostReasonItems, sourceItems } from "@/helpers/crm";
import type { LeadFunnel } from "@/types/crm";

/** Where leads come from and why they are lost (sandbox never counts). */
export function CrmOverview({ funnel }: { funnel: LeadFunnel }) {
  return (
    <Row className="gap-y-6">
      <Col md={6}>
        <BarListCard
          title="Leads por origem"
          items={sourceItems(funnel)}
          empty="Sem leads ainda."
        />
      </Col>
      <Col md={6}>
        <BarListCard
          title="Motivos de perda"
          items={lostReasonItems(funnel)}
          empty="Nenhum lead perdido."
        />
      </Col>
    </Row>
  );
}

export function CrmOverviewSkeleton() {
  return (
    <Row className="gap-y-6">
      <Col md={6}>
        <BarListCardSkeleton rows={3} />
      </Col>
      <Col md={6}>
        <BarListCardSkeleton rows={3} />
      </Col>
    </Row>
  );
}
