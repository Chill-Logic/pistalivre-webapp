import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import { Text } from "@/components/atoms/text";
import { cn } from "@/utils/cn";

export type PartnerAreaColumn<Item> = {
  header: string;
  cell: (item: Item) => ReactNode;
  /** Money/number columns: header and cells aligned right. */
  align?: "right";
  /** Text that may wrap (names, lists of services). */
  wrap?: boolean;
};

type PartnerAreaTableCardProps<Item> = {
  title: string;
  /** Shown instead of the rows when there are none. */
  empty: string;
  items: Item[];
  /** Stable key; the position helps when items can repeat (payments). */
  rowKey: (item: Item, index: number) => string;
  /**
   * Desktop: one table row per item. Without columns (a narrow column of the
   * page) the rows stay a list on every screen.
   */
  columns?: PartnerAreaColumn<Item>[];
  /** Phone: one card row per item. */
  renderItem: (item: Item) => ReactNode;
  /** Under the rows (a short note). */
  footer?: ReactNode;
  /**
   * The card sits in a narrow side column from `xl` up: there the rows go
   * back to the list (the table shows only between `md` and `xl`).
   */
  narrowFromXl?: boolean;
};

/** Where the list and the table show (static classes for Tailwind). */
function visibility(hasColumns: boolean, narrowFromXl: boolean) {
  if (!hasColumns) return { list: "", table: "hidden" };
  return narrowFromXl
    ? { list: "md:hidden xl:block", table: "hidden md:block xl:hidden" }
    : { list: "md:hidden", table: "hidden md:block" };
}

/**
 * A titled list of the partner area — divided rows on the phone, a table on
 * the desktop (the partner's lists are short: no paging).
 */
export function PartnerAreaTableCard<Item>({
  title,
  empty,
  items,
  rowKey,
  columns,
  renderItem,
  footer,
  narrowFromXl = false,
}: PartnerAreaTableCardProps<Item>) {
  const show = visibility(Boolean(columns), narrowFromXl);
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <Text tone="muted">{empty}</Text>
        ) : (
          <>
            <List className={cn("divide-y", show.list)}>
              {items.map((item, index) => (
                <ListItem key={rowKey(item, index)}>{renderItem(item)}</ListItem>
              ))}
            </List>
            {columns && (
            <Box className={show.table}>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {columns.map((column) => (
                      <TableHead
                        key={column.header}
                        className={cn(column.align === "right" && "text-right")}
                      >
                        {column.header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={rowKey(item, index)}>
                      {columns.map((column) => (
                        <TableCell
                          key={column.header}
                          className={cn(
                            column.align === "right" &&
                              "text-right tabular-nums",
                            column.wrap && "min-w-40 whitespace-normal",
                          )}
                        >
                          {column.cell(item)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            )}
          </>
        )}
        {footer && (
          <Text size="xs" tone="muted">
            {footer}
          </Text>
        )}
      </CardContent>
    </Card>
  );
}

type PartnerAreaTableCardSkeletonProps = {
  rows?: number;
  /** Width of the bar in each desktop column; none = a list everywhere. */
  columns?: string[];
  narrowFromXl?: boolean;
};

export function PartnerAreaTableCardSkeleton({
  rows = 3,
  columns,
  narrowFromXl = false,
}: PartnerAreaTableCardSkeletonProps) {
  const show = visibility(Boolean(columns), narrowFromXl);
  const lines = Array.from({ length: rows }, (_, index) => index);
  return (
    <Card className="h-full">
      <CardHeader>
        <Skeleton shape="text" className="w-32 text-base" />
      </CardHeader>
      <CardContent>
        <Box className={cn("divide-y", show.list)}>
          {lines.map((line) => (
            <Box
              key={line}
              className="flex items-start justify-between gap-3 py-3"
            >
              <Box className="min-w-0 flex-1 space-y-2">
                <Skeleton shape="text" className="w-36 text-sm" />
                <Skeleton shape="text" className="w-48 text-xs" />
              </Box>
              <Skeleton shape="pill" className="h-5 w-16" />
            </Box>
          ))}
        </Box>
        {columns && (
          <Box className={cn("overflow-hidden rounded-lg border", show.table)}>
            <Box className="flex gap-6 bg-muted/40 px-4 py-3">
              {columns.map((_, index) => (
                <Skeleton key={index} shape="text" className="w-14 text-xs" />
              ))}
            </Box>
            {lines.map((line) => (
              <Box key={line} className="flex gap-6 border-t px-4 py-3">
                {columns.map((width, index) => (
                  <Skeleton
                    key={index}
                    shape="text"
                    className={cn(width, "text-sm")}
                  />
                ))}
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
