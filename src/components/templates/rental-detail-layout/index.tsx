import type { ReactNode } from "react";
import { Col, Row } from "@/components/atoms/grid";

type RentalDetailLayoutProps = {
  summary: ReactNode;
  billing: ReactNode;
  caution: ReactNode;
  charges: ReactNode;
  maintenances: ReactNode;
  inspections: ReactNode;
};

/** Grid shared by the rental page and its skeleton. */
export function RentalDetailLayout({
  summary,
  billing,
  caution,
  charges,
  maintenances,
  inspections,
}: RentalDetailLayoutProps) {
  return (
    <Row className="items-start gap-y-6">
      <Col lg={8}>{summary}</Col>
      <Col lg={4}>{billing}</Col>
      <Col lg={8}>{charges}</Col>
      <Col lg={4}>{caution}</Col>
      <Col>{maintenances}</Col>
      <Col>{inspections}</Col>
    </Row>
  );
}
