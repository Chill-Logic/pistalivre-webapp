import type { ReactNode } from "react";
import { Col, Row } from "@/components/atoms/grid";

type ProposalDetailLayoutProps = {
  summary: ReactNode;
  document: ReactNode;
  preview: ReactNode;
};

export function ProposalDetailLayout({
  summary,
  document,
  preview,
}: ProposalDetailLayoutProps) {
  return (
    <Row className="items-start gap-y-6">
      <Col lg={7}>{summary}</Col>
      <Col lg={5}>{document}</Col>
      <Col>{preview}</Col>
    </Row>
  );
}
