import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Col, Row } from "@/components/atoms/grid";

/**
 * The contract form with the calculator beside it (desktop: form on the left,
 * the calculator following the scroll on the right; phone: one under the
 * other). Shared by the pages and their skeletons.
 */
export function PartnerContractFormLayout({
  header,
  form,
  calculator,
}: {
  header: ReactNode;
  form: ReactNode;
  calculator: ReactNode;
}) {
  return (
    <Box className="space-y-4">
      {header}
      <Row className="items-start gap-y-4">
        <Col lg={7}>{form}</Col>
        <Col lg={5} className="lg:sticky lg:top-20">
          {calculator}
        </Col>
      </Row>
    </Box>
  );
}
