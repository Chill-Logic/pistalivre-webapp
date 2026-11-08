import { Box } from "@/components/atoms/box";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { TransferStatusBadge } from "@/components/molecules/transfer-status-badge";
import { LABEL_MAPS } from "@/constants/label-maps";
import {
  TRANSFER_PURPOSE_LABELS,
  TRANSFER_SOURCE_LABELS,
} from "@/constants/transfer";
import { useLabels } from "@/hooks/ui/useLabels";
import type { Transfer } from "@/types/transfer";
import { formatCurrency, formatDateTime } from "@/utils/format";

/** One pix sent by the platform (phone view of the history). */
export function TransferItem({ transfer }: { transfer: Transfer }) {
  const { label } = useLabels();
  const destination = [
    `Chave ${label(LABEL_MAPS.pixKeyType, transfer.pixKeyType)}`,
    transfer.customer?.name,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Box className="space-y-2 py-4">
      <Box className="flex items-start justify-between gap-3">
        <Box className="min-w-0">
          <Text weight="medium" className="break-words">
            {transfer.pixOwnerName ?? "Titular não informado"}
          </Text>
          <Text size="xs" tone="muted">
            {destination}
          </Text>
        </Box>
        <Box className="flex shrink-0 flex-col items-end gap-1 text-right">
          <Text
            size="base"
            weight="semibold"
            tone="destructive"
            className="tabular-nums"
          >
            {formatCurrency(-transfer.amount)}
          </Text>
          <TransferStatusBadge status={transfer.status} />
        </Box>
      </Box>
      <Text size="xs" className="break-words">
        {transfer.description}
      </Text>
      <Text size="xs" tone="muted">
        {formatDateTime(transfer.createdAt)} · de{" "}
        {TRANSFER_SOURCE_LABELS[transfer.sourceAccount]} ·{" "}
        {TRANSFER_PURPOSE_LABELS[transfer.purpose]}
      </Text>
    </Box>
  );
}

export function TransferItemSkeleton() {
  return (
    <Box className="space-y-2 py-4">
      <Box className="flex items-start justify-between gap-3">
        <Box className="min-w-0 flex-1 space-y-2">
          <Skeleton shape="text" className="w-36 text-sm" />
          <Skeleton shape="text" className="w-28 text-xs" />
        </Box>
        <Box className="flex shrink-0 flex-col items-end space-y-2">
          <Skeleton shape="text" className="w-20 text-base" />
          <Skeleton shape="pill" className="h-5 w-16" />
        </Box>
      </Box>
      <Skeleton shape="text" className="w-3/4 text-xs" />
      <Skeleton shape="text" className="w-1/2 text-xs" />
    </Box>
  );
}
