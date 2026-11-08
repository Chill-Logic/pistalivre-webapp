import type { ReactNode } from "react";
import { Col, Row } from "@/components/atoms/grid";

type CustomerDetailLayoutProps = {
  summary: ReactNode;
  license: ReactNode;
  contact: ReactNode;
  rentals: ReactNode;
  documents: ReactNode;
  /** Issue a charge / record a payment received outside Asaas. */
  billing?: ReactNode;
  invoices?: ReactNode;
  /** What the customer owes outside charges (damages, fines…). */
  debts?: ReactNode;
  /** Every charge at Asaas (link the ones made outside to a rental). */
  asaasCharges?: ReactNode;
};

/** Grid shared by the customer page and its skeleton. */
export function CustomerDetailLayout({
  summary,
  license,
  contact,
  rentals,
  documents,
  billing,
  invoices,
  debts,
  asaasCharges,
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
      {billing && <Col lg={4}>{billing}</Col>}
      {invoices && <Col lg={8}>{invoices}</Col>}
      {debts && <Col>{debts}</Col>}
      {asaasCharges && <Col>{asaasCharges}</Col>}
      <Col>{documents}</Col>
    </Row>
  );
}
