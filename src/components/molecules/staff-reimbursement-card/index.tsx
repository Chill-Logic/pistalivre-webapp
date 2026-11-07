import { BadgeCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Card, CardContent } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { DocumentItem } from "@/components/molecules/document-item";
import { ReimbursementStatusBadge } from "@/components/molecules/reimbursement-status-badge";
import { TextLink } from "@/components/molecules/text-link";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { useFileActions } from "@/hooks/api/comum/files/useFileActions";
import { useLabels } from "@/hooks/ui/useLabels";
import type { StaffReimbursement } from "@/types/staff-reimbursement";
import {
  formatCalendarDate,
  formatCurrency,
  formatDateTime,
} from "@/utils/format";

/**
 * A refund request with what the reviewer needs: who, how much, why, where
 * the pix would go (and whether that key was validated) and the receipts.
 */
export function StaffReimbursementCard({
  reimbursement,
  actions,
}: {
  reimbursement: StaffReimbursement;
  /** Review buttons (only on pending requests). */
  actions?: ReactNode;
}) {
  const { label } = useLabels();
  const { view, download } = useFileActions();
  const { destination, maintenance } = reimbursement;
  const documents = [
    ...(maintenance?.documents ?? []),
    ...reimbursement.documents,
  ];

  return (
    <Card>
      <CardContent className="space-y-3 p-4 md:p-5">
        <Box className="flex items-start justify-between gap-3">
          <Box className="min-w-0 space-y-0.5">
            <Text weight="semibold" className="break-words">
              <TextLink to={routeTo.customer(reimbursement.customer.id)}>
                {reimbursement.customer.name}
              </TextLink>
            </Text>
            <Text size="xs" tone="muted">
              Pedido em {formatDateTime(reimbursement.createdAt)}
              {reimbursement.rental && (
                <>
                  {" · "}
                  <TextLink
                    to={routeTo.rental(reimbursement.rental.id)}
                    className="font-normal"
                  >
                    {reimbursement.rental.code}
                  </TextLink>
                </>
              )}
            </Text>
          </Box>
          <Box className="shrink-0 space-y-1 text-right">
            <Text size="lg" weight="bold" className="tabular-nums">
              {formatCurrency(reimbursement.amount)}
            </Text>
            <ReimbursementStatusBadge status={reimbursement.status} />
          </Box>
        </Box>

        <Text className="break-words">{reimbursement.reason}</Text>

        {maintenance && (
          <Text size="xs" tone="muted">
            Manutenção de {formatCalendarDate(maintenance.performedAt)} ·{" "}
            {label(LABEL_MAPS.maintenanceType, maintenance.type)}
            {maintenance.cost != null &&
              ` · custo ${formatCurrency(maintenance.cost)}`}
            {maintenance.description && ` · ${maintenance.description}`}
          </Text>
        )}

        <Box className="flex flex-wrap items-center gap-2 rounded-md bg-muted px-3 py-2">
          <Text size="xs">
            Pix para{" "}
            <Text inline size="xs" weight="medium">
              {destination.ownerName ?? "titular não informado"}
            </Text>{" "}
            · {label(LABEL_MAPS.pixKeyType, destination.pixKeyType)}{" "}
            <Text inline size="xs" mono>
              {destination.pixKey}
            </Text>
          </Text>
          {destination.validated ? (
            <Badge variant="success" className="gap-1">
              <BadgeCheck className="size-3.5" aria-hidden />
              Validado
            </Badge>
          ) : (
            <Badge variant="warning">Não validado</Badge>
          )}
        </Box>

        {reimbursement.staffNote && (
          <Text size="xs" tone="muted" className="break-words">
            {reimbursement.status === "REJECTED"
              ? "Motivo da recusa: "
              : "Nota: "}
            {reimbursement.staffNote}
          </Text>
        )}
        {reimbursement.reviewedAt && (
          <Text size="xs" tone="muted">
            Analisado em {formatDateTime(reimbursement.reviewedAt)}
          </Text>
        )}

        {documents.length > 0 && (
          <Box className="divide-y border-t">
            {documents.map((document) => (
              <DocumentItem
                key={document.id}
                document={document}
                onView={() => view.mutate(document)}
                onDownload={() => download.mutate(document)}
                isViewing={view.isPending && view.variables?.id === document.id}
                isDownloading={
                  download.isPending && download.variables?.id === document.id
                }
              />
            ))}
          </Box>
        )}

        {actions && (
          <Box className="flex flex-wrap justify-end gap-2 border-t pt-3">
            {actions}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export function StaffReimbursementCardSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-3 p-4 md:p-5">
        <Box className="flex items-start justify-between gap-3">
          <Box className="flex-1 space-y-2">
            <Skeleton shape="text" className="w-1/2 text-sm" />
            <Skeleton shape="text" className="w-1/3 text-xs" />
          </Box>
          <Box className="flex flex-col items-end space-y-2">
            <Skeleton shape="text" className="w-20 text-lg" />
            <Skeleton shape="pill" className="h-5 w-24" />
          </Box>
        </Box>
        <Skeleton shape="text" className="w-3/4 text-sm" />
        <Skeleton className="h-9" />
      </CardContent>
    </Card>
  );
}
