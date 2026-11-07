import type { ReactNode } from "react";
import { Col, Row } from "@/components/atoms/grid";

type FinanceLayoutProps = {
  balances: ReactNode;
  toCollect: ReactNode;
  delinquency: ReactNode;
};

/** Finance overview: balances on top, the queue beside delinquency. */
export function FinanceLayout({
  balances,
  toCollect,
  delinquency,
}: FinanceLayoutProps) {
  return (
    <Row className="items-start gap-y-6">
      <Col>{balances}</Col>
      <Col lg={7}>{toCollect}</Col>
      <Col lg={5}>{delinquency}</Col>
    </Row>
  );
}
