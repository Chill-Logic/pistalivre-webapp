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
import { ReimbursementRejectDialog } from "@/components/organisms/reimbursement-reject-dialog";
import type {
  ReimbursementMissingItem,
  StaffReimbursement,
} from "@/types/staff-reimbursement";

type ReimbursementQueueProps = {
  title: string;
  reimbursements: StaffReimbursement[];
  emptyIcon: LucideIcon;
  emptyTitle: string;
  /** Checklist for rejecting; present = pending requests can be rejected. */
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
                  missingItems && reimbursement.status === "PENDING" ? (
                    <ReimbursementRejectDialog
                      reimbursementId={reimbursement.id}
                      customerName={reimbursement.customer.name}
                      amount={reimbursement.amount}
                      missingItems={missingItems}
                    />
                  ) : undefined
                }
              />
            </Col>
          ))}
        </Row>
      )}
    </Box>
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
