import type { ReactNode } from "react";
import { Col, Row } from "@/components/atoms/grid";

type PartnerDetailLayoutProps = {
  summary: ReactNode;
  access: ReactNode;
  contracts: ReactNode;
  documents: ReactNode;
};

/** Data and access side by side on the desktop; contracts and documents below. */
export function PartnerDetailLayout({
  summary,
  access,
  contracts,
  documents,
}: PartnerDetailLayoutProps) {
  return (
    <Row className="items-start gap-y-6">
      <Col lg={7}>{summary}</Col>
      <Col lg={5}>{access}</Col>
      <Col>{contracts}</Col>
      <Col>{documents}</Col>
    </Row>
  );
}
