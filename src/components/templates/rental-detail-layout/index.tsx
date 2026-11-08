import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Col, Row } from "@/components/atoms/grid";

type RentalDetailLayoutProps = {
  summary: ReactNode;
  status: ReactNode;
  billing: ReactNode;
  caution: ReactNode;
  charges: ReactNode;
  maintenances: ReactNode;
  inspections: ReactNode;
  documents: ReactNode;
};

/** Grid shared by the rental page and its skeleton. */
export function RentalDetailLayout({
  summary,
  status,
  billing,
  caution,
  charges,
  maintenances,
  inspections,
  documents,
}: RentalDetailLayoutProps) {
  return (
    <Row className="items-start gap-y-6">
      <Col lg={8}>{summary}</Col>
      <Col lg={4}>
        <Box className="space-y-6">
          {status}
          {billing}
        </Box>
      </Col>
      <Col lg={8}>{charges}</Col>
      <Col lg={4}>{caution}</Col>
      <Col>{maintenances}</Col>
      <Col>{inspections}</Col>
      <Col>{documents}</Col>
    </Row>
  );
}
