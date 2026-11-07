import type { ReactNode } from "react";
import { Col, Row } from "@/components/atoms/grid";

type DebtDetailLayoutProps = {
  overview: ReactNode;
  balance: ReactNode;
  plan: ReactNode;
  payments: ReactNode;
  documents: ReactNode;
};

/** Grid shared by the debt page and its skeleton. */
export function DebtDetailLayout({
  overview,
  balance,
  plan,
  payments,
  documents,
}: DebtDetailLayoutProps) {
  return (
    <Row className="items-start gap-y-6">
      <Col lg={8}>{overview}</Col>
      <Col lg={4}>{balance}</Col>
      <Col lg={6}>{plan}</Col>
      <Col lg={6}>{payments}</Col>
      <Col>{documents}</Col>
    </Row>
  );
}
