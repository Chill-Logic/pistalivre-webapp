import type { ReactNode } from "react";
import { Col, Row } from "@/components/atoms/grid";

type SupplierDetailLayoutProps = {
  summary: ReactNode;
  months: ReactNode | null;
  vehicles: ReactNode | null;
  documents: ReactNode;
};

export function SupplierDetailLayout({
  summary,
  months,
  vehicles,
  documents,
}: SupplierDetailLayoutProps) {
  return (
    <Row className="items-start gap-y-6">
      <Col>{summary}</Col>
      {months && <Col>{months}</Col>}
      {vehicles && <Col lg={7}>{vehicles}</Col>}
      <Col lg={vehicles ? 5 : 12}>{documents}</Col>
    </Row>
  );
}
