import type { ReactNode } from "react";
import { Col, Row } from "@/components/atoms/grid";

type CompanyLayoutProps = {
  summary: ReactNode;
  integrations: ReactNode;
  documents: ReactNode;
};

export function CompanyLayout({
  summary,
  integrations,
  documents,
}: CompanyLayoutProps) {
  return (
    <Row className="items-start gap-y-6">
      <Col lg={7}>{summary}</Col>
      <Col lg={5}>{integrations}</Col>
      <Col>{documents}</Col>
    </Row>
  );
}
