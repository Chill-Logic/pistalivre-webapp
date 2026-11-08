import type { ReactNode } from "react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { StatementExport } from "@/types/statement-export";
import {
  formatCalendarDate,
  formatDateTime,
  formatFileSize,
} from "@/utils/format";
import { pluralize } from "@/utils/text";

/** One saved spreadsheet (phone view of the export history). */
export function StatementExportItem({
  item,
  actions,
}: {
  item: StatementExport;
  /** Download / delete. */
  actions?: ReactNode;
}) {
  const { label } = useLabels();

  return (
    <Box className="space-y-2 py-4">
      <Box className="flex items-start justify-between gap-3">
        <Box className="min-w-0">
          <Text weight="medium">
            {formatCalendarDate(item.startDate)} a{" "}
            {formatCalendarDate(item.endDate)}
          </Text>
          <Text size="xs" tone="muted" className="break-all">
            {item.fileName}
          </Text>
        </Box>
        <Badge variant="neutral" className="shrink-0">
          {label(LABEL_MAPS.statementSource, item.source)}
        </Badge>
      </Box>
      <Text size="xs" tone="muted">
        {pluralize(item.rowCount, "lançamento", "lançamentos")} ·{" "}
        {formatFileSize(item.size)} · {formatDateTime(item.exportedAt)}
        {item.createdByName ? ` · por ${item.createdByName}` : ""}
      </Text>
      {actions && (
        <Box className="flex flex-wrap items-center gap-2">{actions}</Box>
      )}
    </Box>
  );
}

export function StatementExportItemSkeleton() {
  return (
    <Box className="space-y-2 py-4">
      <Box className="flex items-start justify-between gap-3">
        <Box className="min-w-0 flex-1 space-y-2">
          <Skeleton shape="text" className="w-44 text-sm" />
          <Skeleton shape="text" className="w-56 max-w-full text-xs" />
        </Box>
        <Skeleton shape="pill" className="h-5 w-14 shrink-0" />
      </Box>
      <Skeleton shape="text" className="w-3/4 text-xs" />
      <Box className="flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </Box>
    </Box>
  );
}
