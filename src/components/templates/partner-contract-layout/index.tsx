import type { ReactNode } from "react";
import { Col, Row } from "@/components/atoms/grid";

type PartnerContractLayoutProps = {
  summary: ReactNode;
  /** The proposal's versions, under the terms. */
  proposal?: ReactNode;
  status: ReactNode;
  /** The contract's PDF, under the situation. */
  document?: ReactNode;
  vehicles: ReactNode;
};

/**
 * Terms and the proposal beside the situation and the PDF on the desktop;
 * the vehicles below.
 */
export function PartnerContractLayout({
  summary,
  proposal,
  status,
  document,
  vehicles,
}: PartnerContractLayoutProps) {
  return (
    <Row className="items-start gap-y-6">
      <Col lg={8} className="space-y-6">
        {summary}
        {proposal}
      </Col>
      <Col lg={4} className="space-y-6">
        {status}
        {document}
      </Col>
      <Col>{vehicles}</Col>
    </Row>
  );
}
