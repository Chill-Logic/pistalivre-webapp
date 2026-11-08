import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Col, Row } from "@/components/atoms/grid";
import { WIDE_MEDIA_QUERY } from "@/constants/layout";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";

type CustomerDetailLayoutProps = {
  summary: ReactNode;
  license: ReactNode;
  contact: ReactNode;
  rentals: ReactNode;
  documents: ReactNode;
  /** Issue a charge / record a payment received outside Asaas. */
  billing?: ReactNode;
  invoices?: ReactNode;
  /** What the customer owes outside charges (damages, fines…). */
  debts?: ReactNode;
  /** Every charge at Asaas (link the ones made outside to a rental). */
  asaasCharges?: ReactNode;
  /** Our charges of the customer (settle, receipts), outside Asaas too. */
  charges?: ReactNode;
  /** "Cliente de teste" / "Fora das métricas". */
  flags?: ReactNode;
  /** Pix keys (where refunds go). */
  wallet?: ReactNode;
  /** What Asaas warns the customer about. */
  notifications?: ReactNode;
  /** Signature requests over the customer's PDFs. */
  signatures?: ReactNode;
};

/** Grid shared by the customer page and its skeleton. */
export function CustomerDetailLayout({
  summary,
  license,
  contact,
  rentals,
  documents,
  billing,
  invoices,
  debts,
  asaasCharges,
  charges,
  flags,
  wallet,
  notifications,
  signatures,
}: CustomerDetailLayoutProps) {
  // From `lg` up: two independent columns (no hole beside a short card).
  const wide = useMediaQuery(WIDE_MEDIA_QUERY);

  if (wide) {
    return (
      <Row className="items-start gap-y-6">
        <Col lg={8}>
          <Box className="space-y-6">
            {summary}
            {rentals}
            {invoices}
            {debts}
            {charges}
            {asaasCharges}
            {notifications}
            {signatures}
            {documents}
          </Box>
        </Col>
        <Col lg={4}>
          <Box className="space-y-6">
            {license}
            {contact}
            {flags}
            {billing}
            {wallet}
          </Box>
        </Col>
      </Row>
    );
  }
  return (
    <Row className="items-start gap-y-6">
      <Col>{summary}</Col>
      <Col>{license}</Col>
      <Col>{contact}</Col>
      {flags && <Col>{flags}</Col>}
      <Col>{rentals}</Col>
      {billing && <Col>{billing}</Col>}
      {invoices && <Col>{invoices}</Col>}
      {debts && <Col>{debts}</Col>}
      {charges && <Col>{charges}</Col>}
      {asaasCharges && <Col>{asaasCharges}</Col>}
      {wallet && <Col>{wallet}</Col>}
      {notifications && <Col>{notifications}</Col>}
      {signatures && <Col>{signatures}</Col>}
      <Col>{documents}</Col>
    </Row>
  );
}
