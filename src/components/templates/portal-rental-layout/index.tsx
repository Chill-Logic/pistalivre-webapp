import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Col, Row } from "@/components/atoms/grid";

type PortalRentalLayoutProps = {
  summary: ReactNode;
  caution: ReactNode;
  sections: ReactNode;
};

/**
 * Phone: one column (the rental, then what it holds). Desktop: the rental
 * beside its caution, then the sections in two columns (PortalRentalSections).
 */
export function PortalRentalLayout({
  summary,
  caution,
  sections,
}: PortalRentalLayoutProps) {
  return (
    <Box className="space-y-6">
      <Row className="gap-y-6">
        <Col lg={caution ? 8 : 12}>{summary}</Col>
        {caution && <Col lg={4}>{caution}</Col>}
      </Row>
      {sections}
    </Box>
  );
}
