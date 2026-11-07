import type { ReactNode } from "react";
import { Col, Row } from "@/components/atoms/grid";

type MaintenanceDetailLayoutProps = {
  summary: ReactNode;
  documents: ReactNode;
};

/** Grid shared by the maintenance page and its skeleton. */
export function MaintenanceDetailLayout({
  summary,
  documents,
}: MaintenanceDetailLayoutProps) {
  return (
    <Row className="items-start gap-y-6">
      <Col lg={7}>{summary}</Col>
      <Col lg={5}>{documents}</Col>
    </Row>
  );
}
