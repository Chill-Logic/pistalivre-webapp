import type { ReactNode } from "react";
import { Col, Row } from "@/components/atoms/grid";

type VehicleDetailLayoutProps = {
  summary: ReactNode;
  status: ReactNode;
  rental: ReactNode;
  maintenances: ReactNode;
  inspections: ReactNode;
  suppliers: ReactNode;
  debts: ReactNode;
  documents: ReactNode;
};

/** Grid shared by the detail page and its skeleton, so both line up. */
export function VehicleDetailLayout({
  summary,
  status,
  rental,
  maintenances,
  inspections,
  suppliers,
  debts,
  documents,
}: VehicleDetailLayoutProps) {
  return (
    <Row className="items-start gap-y-6">
      <Col lg={8}>{summary}</Col>
      <Col lg={4}>
        <Row className="gap-y-6">
          <Col>{status}</Col>
          <Col>{rental}</Col>
        </Row>
      </Col>
      <Col>{maintenances}</Col>
      <Col>{inspections}</Col>
      <Col>{suppliers}</Col>
      <Col>{debts}</Col>
      <Col>{documents}</Col>
    </Row>
  );
}
