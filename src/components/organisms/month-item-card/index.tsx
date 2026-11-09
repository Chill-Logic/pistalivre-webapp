import { Paperclip } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { ExpenseStatusBadge } from "@/components/molecules/expense-status-badge";
import { TextLink } from "@/components/molecules/text-link";
import { MonthItemAction } from "@/components/organisms/month-item-action";
import {
  monthItemDetail,
  monthItemHref,
  monthItemOutcome,
} from "@/helpers/month-item";
import { useLabels } from "@/hooks/ui/useLabels";
import type { MonthItem } from "@/types/expense";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

/** A bill of the month on the phone: name, value, situation and the action. */
export function MonthItemCard({ item }: { item: MonthItem }) {
  const { label } = useLabels();
  const href = monthItemHref(item);
  const detail = monthItemDetail(item, label);
  const outcome = monthItemOutcome(item);
  const value = item.amount ?? item.expected;

  return (
    <Box className="flex items-start gap-3 py-3">
      <Box className="min-w-0 flex-1 space-y-1">
        <Text weight="medium" className="break-words">
          {href ? <TextLink to={href}>{item.description}</TextLink> : item.description}
        </Text>
        {detail && (
          <Text size="xs" tone="muted">
            {detail}
          </Text>
        )}
        <Box className="flex flex-wrap items-center gap-2">
          <ExpenseStatusBadge status={item.status} />
          {value != null && (
            <Text inline size="sm" weight="medium" className="tabular-nums">
              {formatCurrency(value)}
            </Text>
          )}
          {item.dueDate && (
            <Text inline size="xs" tone="muted">
              vence {formatCalendarDate(item.dueDate)}
            </Text>
          )}
        </Box>
        {(outcome || (item.expense?.documentCount ?? 0) > 0) && (
          <Text size="xs" tone="muted" className="flex items-center gap-1">
            {outcome}
            {item.expense && item.expense.documentCount > 0 && (
              <>
                <Paperclip className="size-3" aria-hidden />
                {item.expense.documentCount}
              </>
            )}
          </Text>
        )}
      </Box>
      <MonthItemAction item={item} />
    </Box>
  );
}

export function MonthItemCardSkeleton() {
  return (
    <Box className="flex items-start gap-3 py-3">
      <Box className="flex-1 space-y-2">
        <Skeleton shape="text" className="w-2/3" />
        <Skeleton shape="text" className="w-1/2 text-xs" />
        <Box className="flex gap-2">
          <Skeleton shape="pill" className="h-5 w-16" />
          <Skeleton shape="text" className="w-20" />
        </Box>
      </Box>
      <Skeleton className="h-9 w-24" />
    </Box>
  );
}
