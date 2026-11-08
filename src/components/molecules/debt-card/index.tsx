import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Card } from "@/components/atoms/card";
import { Meter } from "@/components/atoms/meter";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import {
  debtCountsLabel,
  debtStatusVariant,
  nextDueLabel,
  PAID_METER_COLOR,
  paidShare,
} from "@/helpers/debt";
import { useLabels } from "@/hooks/ui/useLabels";
import type { DebtListItem } from "@/types/debt";
import { formatCurrency } from "@/utils/format";

type DebtCardProps = {
  debt: DebtListItem;
  /** Buttons under the card, outside the link (e.g. "Pagamento"). */
  footer?: ReactNode;
};

export function DebtCard({ debt, footer }: DebtCardProps) {
  const location = useLocation();
  const { label } = useLabels();
  const next = nextDueLabel(debt);
  const kind = [
    label(LABEL_MAPS.debtKind, debt.kind),
    debt.installments > 1 && `${debt.installments}x`,
  ].filter(Boolean);

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <Link
        to={routeTo.debt(debt.id)}
        state={{ from: location.pathname + location.search }}
        className="flex flex-1 items-center gap-3 rounded-lg p-4 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring active:bg-accent"
      >
        <Box className="min-w-0 flex-1 space-y-2">
          <Box className="flex items-start justify-between gap-2">
            <Text size="base" weight="semibold" className="min-w-0 break-words">
              {debt.lendersLabel}
            </Text>
            <Badge
              variant={debtStatusVariant(debt.status)}
              className="shrink-0"
            >
              {debt.status.label}
            </Badge>
          </Box>
          <Text size="xs" tone="muted">
            {[...kind, debtCountsLabel(debt)].filter(Boolean).join(" · ")}
          </Text>
          <Box className="flex items-baseline justify-between gap-2">
            <Text size="lg" weight="bold" className="tabular-nums">
              {formatCurrency(debt.balance.outstanding)}
            </Text>
            <Text size="xs" tone="muted" className="tabular-nums">
              de {formatCurrency(debt.balance.total)}
            </Text>
          </Box>
          <Meter value={paidShare(debt)} color={PAID_METER_COLOR} />
          {next && (
            <Text
              size="xs"
              tone={debt.overdue ? "destructive" : "muted"}
              weight={debt.overdue ? "medium" : "normal"}
            >
              {next}
            </Text>
          )}
        </Box>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </Link>
      {footer && (
        <Box className="flex flex-wrap items-center justify-end gap-2 border-t px-4 py-2">
          {footer}
        </Box>
      )}
    </Card>
  );
}

export function DebtCardSkeleton() {
  return (
    <Card className="flex h-full flex-col">
      <Box className="flex flex-1 items-center gap-3 p-4">
        <Box className="min-w-0 flex-1 space-y-2">
          <Box className="flex items-start justify-between gap-2">
            <Skeleton shape="text" className="w-1/2 text-base" />
            <Skeleton shape="pill" className="h-5 w-16" />
          </Box>
          <Skeleton shape="text" className="w-24 text-xs" />
          <Skeleton shape="text" className="w-28 text-lg" />
          <Skeleton className="h-2.5" />
        </Box>
        <Skeleton className="size-4 shrink-0" />
      </Box>
      <Box className="flex justify-end border-t px-4 py-2">
        <Skeleton className="h-9 w-28 md:h-8" />
      </Box>
    </Card>
  );
}
