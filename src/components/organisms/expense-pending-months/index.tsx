import { ChevronRight } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { List, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";
import { CollapsibleCard } from "@/components/molecules/collapsible-card";
import type { PendingMonth } from "@/types/expense";
import { formatCurrency } from "@/utils/format";
import { formatMonth } from "@/utils/month";
import { pluralize } from "@/utils/text";

type ExpensePendingMonthsProps = {
  months: PendingMonth[];
  onOpen: (month: string) => void;
};

/**
 * Earlier months that still have something open — so last month's bill
 * doesn't vanish when the calendar turns. Tap one to go to it.
 */
export function ExpensePendingMonths({ months, onOpen }: ExpensePendingMonthsProps) {
  if (months.length === 0) return null;
  return (
    <CollapsibleCard
      title="Meses anteriores em aberto"
      count={months.length}
      storageKey="expense-pending-months"
    >
      <List className="-mx-2 divide-y">
        {months.map((pending) => (
          <ListItem key={pending.month}>
            <Button
              variant="ghost"
              className="h-auto w-full justify-between gap-3 rounded-none px-2 py-3 text-left md:h-auto"
              onClick={() => onOpen(pending.month)}
            >
              <Box className="min-w-0">
                <Text weight="medium" className="first-letter:uppercase">
                  {formatMonth(pending.month)}
                </Text>
                <Text size="xs" tone="muted">
                  {pluralize(pending.count, "item em aberto", "itens em aberto")}
                </Text>
              </Box>
              <Box className="flex items-center gap-2">
                <Text weight="medium" className="tabular-nums">
                  {formatCurrency(pending.amount)}
                </Text>
                <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
              </Box>
            </Button>
          </ListItem>
        ))}
      </List>
    </CollapsibleCard>
  );
}
