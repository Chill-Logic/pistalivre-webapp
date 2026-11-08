import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Col, Row } from "@/components/atoms/grid";
import { WIDE_MEDIA_QUERY } from "@/constants/layout";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";

type VehicleDetailLayoutProps = {
  summary: ReactNode;
  status: ReactNode;
  rental: ReactNode;
  maintenances: ReactNode;
  inspections: ReactNode;
  suppliers: ReactNode;
  debts: ReactNode;
  documents: ReactNode;
};

/** Grid shared by the detail page and its skeleton, so both line up. */
export function VehicleDetailLayout({
  summary,
  status,
  rental,
  maintenances,
  inspections,
  suppliers,
  debts,
  documents,
}: VehicleDetailLayoutProps) {
  // From `lg` up: two independent columns (no hole beside a short card).
  const wide = useMediaQuery(WIDE_MEDIA_QUERY);

  if (wide) {
    return (
      <Row className="items-start gap-y-6">
        <Col lg={8}>
          <Box className="space-y-6">
            {summary}
            {maintenances}
            {inspections}
            {documents}
          </Box>
        </Col>
        <Col lg={4}>
          <Box className="space-y-6">
            {status}
            {rental}
            {suppliers}
            {debts}
          </Box>
        </Col>
      </Row>
    );
  }
  return (
    <Row className="items-start gap-y-6">
      <Col>{summary}</Col>
      <Col>{status}</Col>
      <Col>{rental}</Col>
      <Col>{maintenances}</Col>
      <Col>{inspections}</Col>
      <Col>{suppliers}</Col>
      <Col>{debts}</Col>
      <Col>{documents}</Col>
    </Row>
  );
}
