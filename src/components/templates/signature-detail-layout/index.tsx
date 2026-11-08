import type { ReactNode } from "react";
import { Col, Row } from "@/components/atoms/grid";

type SignatureDetailLayoutProps = {
  blockers?: ReactNode;
  summary: ReactNode;
  /** The draft's settings form (only while DRAFT). */
  settings?: ReactNode;
  signers: ReactNode;
  document: ReactNode;
};

export function SignatureDetailLayout({
  blockers,
  summary,
  settings,
  signers,
  document,
}: SignatureDetailLayoutProps) {
  return (
    <Row className="items-start gap-y-6">
      {blockers && <Col>{blockers}</Col>}
      <Col>{summary}</Col>
      {settings && <Col>{settings}</Col>}
      <Col lg={7}>{signers}</Col>
      <Col lg={5}>{document}</Col>
    </Row>
  );
}
