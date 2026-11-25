import type { LucideIcon } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import {
  StaffReimbursementCard,
  StaffReimbursementCardSkeleton,
} from "@/components/molecules/staff-reimbursement-card";
import { AttachButton } from "@/components/organisms/record-attachments";
import { ReimbursementApproveDialog } from "@/components/organisms/reimbursement-approve-dialog";
import { ReimbursementPaidDialog } from "@/components/organisms/reimbursement-paid-dialog";
import { ReimbursementRejectDialog } from "@/components/organisms/reimbursement-reject-dialog";
import { queryKeys } from "@/constants/query-keys";
import type {
  ReimbursementMissingItem,
  StaffReimbursement,
} from "@/types/staff-reimbursement";

type ReimbursementQueueProps = {
  title: string;
  reimbursements: StaffReimbursement[];
  emptyIcon: LucideIcon;
  emptyTitle: string;
  /** Checklist for rejecting; present = pending/approved requests can be rejected. */
  missingItems?: ReimbursementMissingItem[];
};

export function ReimbursementQueue({
  title,
  reimbursements,
  emptyIcon,
  emptyTitle,
  missingItems,
}: ReimbursementQueueProps) {
  return (
    <Box className="space-y-3">
      <Box className="flex items-baseline gap-2">
        <Heading level={2} variant="section">
          {title}
        </Heading>
        {reimbursements.length > 0 && (
          <Text tone="muted">({reimbursements.length})</Text>
        )}
      </Box>
      {reimbursements.length === 0 ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} />
      ) : (
        <Row as="ul" className="gap-y-6">
          {reimbursements.map((reimbursement) => (
            <Col as="li" key={reimbursement.id} lg={6}>
              <StaffReimbursementCard
                reimbursement={reimbursement}
                actions={
                  <ReimbursementActions
                    reimbursement={reimbursement}
                    missingItems={missingItems}
                  />
                }
              />
            </Col>
          ))}
        </Row>
      )}
    </Box>
  );
}

/**
 * What each stage allows: pending → reject | approve; approved (no transfer
 * in flight) → reject | mark as paid; failed transfer (legacy) → mark as paid.
 * Attaching is open at every stage: the receipt the customer sent by
 * WhatsApp goes into the request without rejecting it.
 */
function ReimbursementActions({
  reimbursement,
  missingItems,
}: {
  reimbursement: StaffReimbursement;
  missingItems?: ReimbursementMissingItem[];
}) {
  const { status } = reimbursement;
  const awaitingPayment = status === "APPROVED" && !reimbursement.transferId;
  const attach = (
    <AttachButton
      owner={{ type: "REIMBURSEMENT", id: reimbursement.id }}
      invalidate={queryKeys.reimbursements.all}
      label="Anexar"
    />
  );
  if (status !== "PENDING" && status !== "FAILED" && !awaitingPayment) {
    return attach;
  }
  const reject = missingItems && status !== "FAILED" && (
    <ReimbursementRejectDialog
      reimbursementId={reimbursement.id}
      customerName={reimbursement.customer.name}
      amount={reimbursement.amount}
      missingItems={missingItems}
    />
  );
  return (
    <>
      {attach}
      {reject}
      {status === "PENDING" ? (
        <ReimbursementApproveDialog reimbursement={reimbursement} />
      ) : (
        <ReimbursementPaidDialog
          reimbursementId={reimbursement.id}
          customerName={reimbursement.customer.name}
          amount={reimbursement.amount}
          pixKey={reimbursement.destination.pixKey}
        />
      )}
    </>
  );
}

export function ReimbursementQueueSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <Box className="space-y-3">
      <Skeleton shape="text" className="w-40 text-base" />
      <Row className="gap-y-6">
        {Array.from({ length: rows }, (_, index) => (
          <Col key={index} lg={6}>
            <StaffReimbursementCardSkeleton />
          </Col>
        ))}
      </Row>
    </Box>
  );
}
