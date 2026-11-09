import { Paperclip } from "lucide-react";
import { Box } from "@/components/atoms/box";
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

const HEADERS = ["Item", "Vencimento", "Previsto", "Valor", "Situação", ""];

/** A section of the month's bills on the desktop (one row per bill). */
export function MonthItemsTable({ items }: { items: MonthItem[] }) {
  const { label } = useLabels();
  return (
    <Table>
      <MonthItemsHead />
      <TableBody>
        {items.map((item) => {
          const href = monthItemHref(item);
          const detail = monthItemDetail(item, label);
          const outcome = monthItemOutcome(item);
          return (
            <TableRow key={item.key}>
              <TableCell className="w-[34%]">
                <Text weight="medium" className="break-words">
                  {href ? <TextLink to={href}>{item.description}</TextLink> : item.description}
                </Text>
                {detail && (
                  <Text size="xs" tone="muted">
                    {detail}
                  </Text>
                )}
              </TableCell>
              <TableCell className="tabular-nums">
                {item.dueDate ? formatCalendarDate(item.dueDate) : "—"}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {item.expected != null ? formatCurrency(item.expected) : "—"}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {item.amount != null ? formatCurrency(item.amount) : "—"}
              </TableCell>
              <TableCell>
                <Box className="space-y-1">
                  <ExpenseStatusBadge status={item.status} />
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
              </TableCell>
              <TableCell className="w-28 text-right">
                <Box className="flex justify-end">
                  <MonthItemAction item={item} />
                </Box>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function MonthItemsHead() {
  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        {HEADERS.map((header, index) => (
          <TableHead
            key={index}
            className={index === 2 || index === 3 ? "text-right" : undefined}
          >
            {header}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}

export function MonthItemsTableSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Table>
      <MonthItemsHead />
      <TableBody>
        {Array.from({ length: rows }, (_, index) => (
          <TableRow key={index} className="hover:bg-transparent">
            <TableCell>
              <Skeleton shape="text" className="w-40" />
            </TableCell>
            <TableCell>
              <Skeleton shape="text" className="w-20" />
            </TableCell>
            <TableCell>
              <Skeleton shape="text" className="ml-auto w-20" />
            </TableCell>
            <TableCell>
              <Skeleton shape="text" className="ml-auto w-20" />
            </TableCell>
            <TableCell>
              <Skeleton shape="pill" className="h-5 w-16" />
            </TableCell>
            <TableCell>
              <Skeleton className="ml-auto h-9 w-24" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
