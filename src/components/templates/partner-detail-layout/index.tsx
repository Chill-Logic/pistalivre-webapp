import type { ReactNode } from "react";
import { Col, Row } from "@/components/atoms/grid";

type PartnerDetailLayoutProps = {
  summary: ReactNode;
  access: ReactNode;
  contracts: ReactNode;
};

/** Data and access side by side on the desktop; contracts below. */
export function PartnerDetailLayout({
  summary,
  access,
  contracts,
}: PartnerDetailLayoutProps) {
  return (
    <Row className="items-start gap-y-6">
      <Col lg={7}>{summary}</Col>
      <Col lg={5}>{access}</Col>
      <Col>{contracts}</Col>
    </Row>
  );
}
