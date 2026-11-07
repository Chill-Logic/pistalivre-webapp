import { ChevronRight } from "lucide-react";
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
  debtStatusVariant,
  nextDueLabel,
  PAID_METER_COLOR,
  paidShare,
} from "@/helpers/debt";
import { useLabels } from "@/hooks/ui/useLabels";
import type { DebtListItem } from "@/types/debt";
import { formatCurrency } from "@/utils/format";

export function DebtCard({ debt }: { debt: DebtListItem }) {
  const location = useLocation();
  const { label } = useLabels();
  const next = nextDueLabel(debt);
  const kind = [
    label(LABEL_MAPS.debtKind, debt.kind),
    debt.installments > 1 && `${debt.installments}x`,
  ].filter(Boolean);

  return (
    <Link
      to={routeTo.debt(debt.id)}
      state={{ from: location.pathname + location.search }}
      className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="flex h-full items-center gap-3 p-4 transition-colors hover:bg-accent/50 active:bg-accent">
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
            {kind.join(" · ")}
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
      </Card>
    </Link>
  );
}

export function DebtCardSkeleton() {
  return (
    <Card className="flex h-full items-center gap-3 p-4">
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
    </Card>
  );
}
