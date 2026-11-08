import type { ReactNode } from "react";
import { Col, Row } from "@/components/atoms/grid";

type LeadDetailLayoutProps = {
  summary: ReactNode;
  side: ReactNode;
  activities: ReactNode;
  /** Proposals issued to the lead, between who it is and the timeline. */
  proposals?: ReactNode;
};

/** Lead page: who + timeline on the left, answers/loss/history on the right. */
export function LeadDetailLayout({
  summary,
  side,
  activities,
  proposals,
}: LeadDetailLayoutProps) {
  return (
    <Row className="items-start gap-y-6">
      <Col lg={8}>
        <Row className="gap-y-6">
          <Col>{summary}</Col>
          {proposals && <Col>{proposals}</Col>}
          <Col>{activities}</Col>
        </Row>
      </Col>
      <Col lg={4}>{side}</Col>
    </Row>
  );
}
