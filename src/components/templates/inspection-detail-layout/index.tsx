import type { ReactNode } from "react";
import { Col, Row } from "@/components/atoms/grid";

type InspectionDetailLayoutProps = {
  summary: ReactNode;
  checks: ReactNode;
  photos: ReactNode;
};

/** Grid shared by the inspection page and its skeleton. */
export function InspectionDetailLayout({
  summary,
  checks,
  photos,
}: InspectionDetailLayoutProps) {
  return (
    <Row className="items-start gap-y-6">
      <Col lg={7}>
        <Row className="gap-y-6">
          <Col>{summary}</Col>
          <Col>{checks}</Col>
        </Row>
      </Col>
      <Col lg={5}>{photos}</Col>
    </Row>
  );
}
