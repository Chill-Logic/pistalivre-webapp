import type { ReactNode } from "react";
import { Col, Row } from "@/components/atoms/grid";

type CustomerDetailLayoutProps = {
  summary: ReactNode;
  license: ReactNode;
  contact: ReactNode;
  rentals: ReactNode;
  documents: ReactNode;
};

/** Grid shared by the customer page and its skeleton. */
export function CustomerDetailLayout({
  summary,
  license,
  contact,
  rentals,
  documents,
}: CustomerDetailLayoutProps) {
  return (
    <Row className="items-start gap-y-6">
      <Col lg={8}>{summary}</Col>
      <Col lg={4}>
        <Row className="gap-y-6">
          <Col>{license}</Col>
          <Col>{contact}</Col>
        </Row>
      </Col>
      <Col>{rentals}</Col>
      <Col>{documents}</Col>
    </Row>
  );
}
