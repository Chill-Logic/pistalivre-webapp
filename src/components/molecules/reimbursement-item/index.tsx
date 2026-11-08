import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Text } from "@/components/atoms/text";
import { ReimbursementStatusBadge } from "@/components/molecules/reimbursement-status-badge";
import type { Reimbursement } from "@/types/portal";
import { cn } from "@/utils/cn";
import { formatCurrency, formatDate } from "@/utils/format";

/** A reimbursement request; a refused one stands out with the reason. */
export function ReimbursementItem({
  reimbursement,
  actions,
}: {
  reimbursement: Reimbursement;
  /** E.g. "Pedir reembolso" / "Pedir de novo". */
  actions?: ReactNode;
}) {
  const rejected = reimbursement.status === "REJECTED";
  const meta = [
    `Pedido em ${formatDate(reimbursement.createdAt)}`,
    reimbursement.rental?.code,
    reimbursement.pixOwnerName && `para ${reimbursement.pixOwnerName}`,
  ].filter(Boolean);

  return (
    <Box
      className={cn(
        "space-y-2 py-4",
        rejected && "-mx-3 rounded-md bg-error px-3",
      )}
    >
      <Box className="flex items-start justify-between gap-3">
        <Box className="min-w-0">
          <Text weight="medium" className="break-words">
            {reimbursement.reason}
          </Text>
          <Text size="xs" tone="muted">
            {meta.join(" · ")}
          </Text>
        </Box>
        <Box className="shrink-0 space-y-1 text-right">
          <Text size="base" weight="semibold" className="tabular-nums">
            {formatCurrency(reimbursement.amount)}
          </Text>
          <ReimbursementStatusBadge status={reimbursement.status} />
        </Box>
      </Box>
      {reimbursement.staffNote && (
        <Text size="xs" className={cn(rejected && "text-error-foreground")}>
          {rejected ? "Motivo da recusa: " : "Observação: "}
          {reimbursement.staffNote}
        </Text>
      )}
      {actions && (
        <Box className="flex flex-wrap justify-end gap-2">{actions}</Box>
      )}
    </Box>
  );
}
