import type { ReactNode } from "react";
import { AiAnchor } from "@/components/atoms/ai-anchor";
import { Box } from "@/components/atoms/box";
import { Col, Row } from "@/components/atoms/grid";
import { WIDE_MEDIA_QUERY } from "@/constants/layout";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";

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

/**
 * Grid shared by the rental page and its skeleton. From `lg` up: content +
 * sidebar, two independent columns (main: everything you work on; side: the
 * short reference cards), so a short card never leaves a hole beside a tall
 * one. On the phone it is one column in reading order.
 */
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
  const wide = useMediaQuery(WIDE_MEDIA_QUERY);
  // Sections the assistant can point at ("Mostrar onde vi isso").
  const anchored = (id: string, node: ReactNode) =>
    node ? <AiAnchor id={id}>{node}</AiAnchor> : node;
  summary = anchored("summary", summary);
  charges = anchored("charges", charges);
  reconciliation = anchored("reconciliation", reconciliation);
  caution = anchored("caution", caution);
  billing = anchored("billing", billing);

  if (wide) {
    return (
      <Row className="items-start gap-y-6">
        <Col lg={8}>
          <Box className="space-y-6">
            {summary}
            {charges}
            {contracts}
            {reconciliation}
            {rateSegments}
            {receipts}
            {invoices}
            {maintenances}
            {inspections}
            {signatures}
            {documents}
          </Box>
        </Col>
        <Col lg={4}>
          <Box className="space-y-6">
            {status}
            {billing}
            {autoBilling}
            {caution}
            {vehicleCrlv}
          </Box>
        </Col>
      </Row>
    );
  }
  return (
    <Row className="items-start gap-y-6">
      <Col>{summary}</Col>
      <Col>{status}</Col>
      <Col>{billing}</Col>
      <Col>{charges}</Col>
      {autoBilling && <Col>{autoBilling}</Col>}
      <Col>{caution}</Col>
      {contracts && <Col>{contracts}</Col>}
      {reconciliation && <Col>{reconciliation}</Col>}
      {rateSegments && <Col>{rateSegments}</Col>}
      {receipts && <Col>{receipts}</Col>}
      {invoices && <Col>{invoices}</Col>}
      <Col>{maintenances}</Col>
      <Col>{inspections}</Col>
      {vehicleCrlv && <Col>{vehicleCrlv}</Col>}
      {signatures && <Col>{signatures}</Col>}
      <Col>{documents}</Col>
    </Row>
  );
}
