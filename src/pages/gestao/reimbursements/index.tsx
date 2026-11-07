import { History, Inbox } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";
import {
  ReimbursementQueue,
  ReimbursementQueueSkeleton,
} from "@/components/organisms/reimbursement-queue";
import { useStaffReimbursements } from "@/hooks/api/gestao/reimbursements/useStaffReimbursements";

/**
 * Review queue: rejecting is available (a record the customer sees). There
 * is no "approve/pay" — money never leaves through the system.
 */
export function ReimbursementsPage() {
  const reimbursements = useStaffReimbursements();

  return (
    <Box className="space-y-4 md:space-y-6">
      <PageHeader title="Reembolsos" />
      {reimbursements.isPending && (
        <SkeletonRegion label="Carregando reembolsos…" className="space-y-8">
          <ReimbursementQueueSkeleton />
          <ReimbursementQueueSkeleton rows={2} />
        </SkeletonRegion>
      )}
      {reimbursements.isError && (
        <QueryError
          error={reimbursements.error}
          onRetry={() => reimbursements.refetch()}
        />
      )}
      {reimbursements.data && (
        <Box className="space-y-8">
          <ReimbursementQueue
            title="Aguardando análise"
            reimbursements={reimbursements.data.pending}
            emptyIcon={Inbox}
            emptyTitle="Nenhum pedido aguardando análise"
            missingItems={reimbursements.data.missingItems}
          />
          <ReimbursementQueue
            title="Histórico"
            reimbursements={reimbursements.data.history}
            emptyIcon={History}
            emptyTitle="Nenhum pedido analisado ainda"
          />
        </Box>
      )}
    </Box>
  );
}
