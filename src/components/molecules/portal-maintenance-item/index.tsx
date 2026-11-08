import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Badge } from "@/components/atoms/badge";
import { Text } from "@/components/atoms/text";
import { AttachmentList } from "@/components/molecules/attachment-list";
import { ReimbursementStatusBadge } from "@/components/molecules/reimbursement-status-badge";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { PortalMaintenance } from "@/types/portal";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

/** A maintenance on the rental; the renter's own show their reimbursement. */
export function PortalMaintenanceItem({
  maintenance,
  actions,
}: {
  maintenance: PortalMaintenance;
  /** E.g. "Anexar", "Pedir reembolso" / "Pedir de novo". */
  actions?: ReactNode;
}) {
  const { label } = useLabels();
  const services = maintenance.services.map((code) =>
    label(LABEL_MAPS.maintenanceService, code),
  );
  const meta = [
    formatCalendarDate(maintenance.performedAt),
    maintenance.provider,
  ].filter(Boolean);

  return (
    <Box className="space-y-2 py-4">
      <Box className="flex items-start justify-between gap-3">
        <Box className="min-w-0">
          <Box className="flex flex-wrap items-center gap-2">
            <Text weight="medium">
              {label(LABEL_MAPS.maintenanceType, maintenance.type)}
            </Text>
            <Badge variant={maintenance.mine ? "success" : "outline"}>
              {maintenance.mine
                ? "Registrada por você"
                : "Registrada pela locadora"}
            </Badge>
          </Box>
          <Text size="xs" tone="muted">
            {meta.join(" · ")}
          </Text>
        </Box>
        {maintenance.cost !== null && (
          <Text size="base" weight="semibold" className="shrink-0 tabular-nums">
            {formatCurrency(maintenance.cost)}
          </Text>
        )}
      </Box>
      {(maintenance.description || services.length > 0) && (
        <Text size="xs" tone="muted" className="break-words">
          {[maintenance.description, services.join(", ")]
            .filter(Boolean)
            .join(" · ")}
        </Text>
      )}
      {maintenance.reimbursement && (
        <Box className="flex flex-wrap items-center gap-2">
          <Text inline size="xs" tone="muted">
            Reembolso:
          </Text>
          <ReimbursementStatusBadge status={maintenance.reimbursement.status} />
          {maintenance.reimbursement.status === "REJECTED" &&
            maintenance.reimbursement.staffNote && (
              <Text inline size="xs" className="text-error-foreground">
                {maintenance.reimbursement.staffNote}
              </Text>
            )}
        </Box>
      )}
      <AttachmentList files={maintenance.documents} />
      {actions && (
        <Box className="flex flex-wrap justify-end gap-2">{actions}</Box>
      )}
    </Box>
  );
}
