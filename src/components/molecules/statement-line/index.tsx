import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { StatementLine as Line } from "@/types/statement";
import { formatCalendarDate, formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";

type StatementLineProps = {
  line: Line;
  /** Show which account it came from (when listing every source). */
  showSource: boolean;
};

/**
 * One bank line. Our description (note) leads when there is one; the bank's
 * own text stays visible below — it is the proof and is never replaced.
 */
export function StatementLine({ line, showSource }: StatementLineProps) {
  const { label, knownLabel } = useLabels();
  const inflow = line.amount >= 0;
  const description = line.note ?? line.suggestion ?? line.originalDescription;
  const details = [
    formatCalendarDate(line.date),
    knownLabel(LABEL_MAPS.transactionType, line.type),
    line.counterparty,
  ].filter(Boolean);

  return (
    <Box className="flex items-start justify-between gap-3 py-3">
      <Box className="min-w-0 space-y-1">
        <Text weight="medium" className="break-words">
          {description}
        </Text>
        {(line.note || line.suggestion) && (
          <Text size="xs" tone="muted" className="break-words">
            {line.originalDescription}
          </Text>
        )}
        <Text size="xs" tone="muted">
          {details.join(" · ")}
        </Text>
        {(showSource || line.internal || line.internalSuggested) && (
          <Box className="flex flex-wrap gap-1">
            {showSource && (
              <Badge variant="outline">
                {label(LABEL_MAPS.statementSource, line.source)}
              </Badge>
            )}
            {line.internal ? (
              <Badge variant="neutral">Transferência interna</Badge>
            ) : (
              line.internalSuggested && (
                <Badge variant="outline">Talvez transferência interna</Badge>
              )
            )}
          </Box>
        )}
      </Box>
      <Text
        weight="semibold"
        className={cn(
          "shrink-0 tabular-nums",
          inflow ? "text-success-foreground" : "text-foreground",
          line.internal && "text-muted-foreground line-through",
        )}
      >
        {inflow ? "+" : "−"} {formatCurrency(Math.abs(line.amount))}
      </Text>
    </Box>
  );
}

export function StatementLineSkeleton() {
  return (
    <Box className="flex items-start justify-between gap-3 py-3">
      <Box className="min-w-0 flex-1 space-y-2">
        <Skeleton shape="text" className="w-3/4 text-sm" />
        <Skeleton shape="text" className="w-1/2 text-xs" />
      </Box>
      <Skeleton shape="text" className="w-20 text-sm" />
    </Box>
  );
}
