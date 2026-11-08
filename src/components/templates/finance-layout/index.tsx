import type { ReactNode } from "react";
import { Col, Row } from "@/components/atoms/grid";

type FinanceLayoutProps = {
  balances: ReactNode;
  toCollect: ReactNode;
  delinquency: ReactNode;
  /** History of pix sent by the platform (read-only), full width below. */
  transfers?: ReactNode;
};

/** Finance overview: balances on top, the queue beside delinquency. */
export function FinanceLayout({
  balances,
  toCollect,
  delinquency,
  transfers,
}: FinanceLayoutProps) {
  return (
    <Row className="items-start gap-y-6">
      <Col>{balances}</Col>
      <Col lg={7}>{toCollect}</Col>
      <Col lg={5}>{delinquency}</Col>
      {transfers && <Col>{transfers}</Col>}
    </Row>
  );
}
