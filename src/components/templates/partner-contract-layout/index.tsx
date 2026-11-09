import type { ReactNode } from "react";
import { Col, Row } from "@/components/atoms/grid";

type PartnerContractLayoutProps = {
  summary: ReactNode;
  status: ReactNode;
  vehicles: ReactNode;
};

/** Terms and situation side by side on the desktop; the motos below. */
export function PartnerContractLayout({
  summary,
  status,
  vehicles,
}: PartnerContractLayoutProps) {
  return (
    <Row className="items-start gap-y-6">
      <Col lg={8}>{summary}</Col>
      <Col lg={4}>{status}</Col>
      <Col>{vehicles}</Col>
    </Row>
  );
}
