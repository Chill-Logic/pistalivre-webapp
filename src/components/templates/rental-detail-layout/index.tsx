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
  /** Generated contracts + "Contrato…" documents. */
  contracts?: ReactNode;
  /** Rent rules (block B5): auto-billing, reconciliation, values, pix. */
  autoBilling?: ReactNode;
  reconciliation?: ReactNode;
  rateSegments?: ReactNode;
  receipts?: ReactNode;
  /** NFS-e of the rental (block B4). */
  invoices?: ReactNode;
  /** The CRLV of the rental's vehicle (lives on the vehicle). */
  vehicleCrlv?: ReactNode;
  /** Signature requests over the rental's PDFs. */
  signatures?: ReactNode;
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
  contracts,
  autoBilling,
  reconciliation,
  rateSegments,
  receipts,
  invoices,
  vehicleCrlv,
  signatures,
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
      <Col lg={4}>
        <Box className="space-y-6">
          {autoBilling}
          {caution}
        </Box>
      </Col>
      {contracts && <Col>{contracts}</Col>}
      {reconciliation && <Col>{reconciliation}</Col>}
      {rateSegments && <Col lg={6}>{rateSegments}</Col>}
      {receipts && <Col lg={6}>{receipts}</Col>}
      {invoices && <Col>{invoices}</Col>}
      <Col>{maintenances}</Col>
      <Col>{inspections}</Col>
      {vehicleCrlv && <Col>{vehicleCrlv}</Col>}
      {signatures && <Col>{signatures}</Col>}
      <Col>{documents}</Col>
    </Row>
  );
}
