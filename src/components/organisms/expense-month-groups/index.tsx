import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import {
  MonthItemCard,
  MonthItemCardSkeleton,
} from "@/components/organisms/month-item-card";
import {
  MonthItemsTable,
  MonthItemsTableSkeleton,
} from "@/components/organisms/month-items-table";
import { DESKTOP_MEDIA_QUERY } from "@/constants/layout";
import { groupMonthItems } from "@/helpers/month-item";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";
import type { MonthItem } from "@/types/expense";
import { cn } from "@/utils/cn";

type ExpenseMonthGroupsProps = {
  items: MonthItem[];
  isRefreshing?: boolean;
};

/**
 * The month's bills by section (company, per vehicle, debt installments,
 * one-offs): a table on the desktop, cards on the phone. A month has a
 * handful of bills, so there's no paging.
 */
export function ExpenseMonthGroups({ items, isRefreshing = false }: ExpenseMonthGroupsProps) {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  return (
    <>
      {groupMonthItems(items).map((group) => (
        <Card
          key={group.key}
          aria-busy={isRefreshing}
          className={cn(
            "transition-opacity duration-200",
            isRefreshing && "pointer-events-none opacity-60",
          )}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-baseline gap-2 text-base">
              {group.title}
              <Text inline size="sm" tone="muted" weight="normal">
                {group.items.length}
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent className={cn(isDesktop && "px-2 pb-2")}>
            {isDesktop ? (
              <MonthItemsTable items={group.items} />
            ) : (
              <List className="divide-y">
                {group.items.map((item) => (
                  <ListItem key={item.key}>
                    <MonthItemCard item={item} />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export function ExpenseMonthGroupsSkeleton() {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  return (
    <>
      {[3, 2].map((rows, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <Skeleton shape="text" className="w-32" />
          </CardHeader>
          <CardContent className={cn(isDesktop && "px-2 pb-2")}>
            {isDesktop ? (
              <MonthItemsTableSkeleton rows={rows} />
            ) : (
              Array.from({ length: rows }, (_, row) => <MonthItemCardSkeleton key={row} />)
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
}
