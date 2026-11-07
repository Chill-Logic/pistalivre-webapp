import type { ReactNode } from "react";
import { Col, Row } from "@/components/atoms/grid";

type VehicleDetailLayoutProps = {
  summary: ReactNode;
  rental: ReactNode;
  documents: ReactNode;
};

/** Grid shared by the detail page and its skeleton, so both line up. */
export function VehicleDetailLayout({
  summary,
  rental,
  documents,
}: VehicleDetailLayoutProps) {
  return (
    <Row className="items-start gap-y-6">
      <Col lg={8}>{summary}</Col>
      <Col lg={4}>{rental}</Col>
      <Col>{documents}</Col>
    </Row>
  );
}
