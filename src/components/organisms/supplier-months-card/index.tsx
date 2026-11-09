import { Plus } from "lucide-react";
import { useState } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { CollapsibleCard } from "@/components/molecules/collapsible-card";
import { ExpenseStatusBadge } from "@/components/molecules/expense-status-badge";
import { ExpenseDialog } from "@/components/organisms/expense-dialog";
import { MonthItemAction } from "@/components/organisms/month-item-action";
import { QueryError } from "@/components/organisms/query-error";
import { monthItemOutcome } from "@/helpers/month-item";
import { useSupplierMonths } from "@/hooks/api/gestao/expenses/useSupplierMonths";
import type { MonthItem, SupplierMonth } from "@/types/expense";
import type { SupplierDetail } from "@/types/supplier";
import { cn } from "@/utils/cn";
import { formatCalendarDate, formatCurrency } from "@/utils/format";
import { addMonths, currentMonth, formatMonth, monthsBetween } from "@/utils/month";

const FIRST_MONTHS = 6;

/**
 * "Meses" of a fixed cost: every month from its start, newest first, with
 * what happened to each bill (paid when, still open, no bill). "Registrar
 * mês" records any month — a past one still open included — so nothing gets
 * lost from sight.
 */
export function SupplierMonthsCard({ supplier }: { supplier: SupplierDetail }) {
  const months = useSupplierMonths(supplier.id);
  const [showAll, setShowAll] = useState(false);
  const now = currentMonth();
  const shown = showAll ? months.data : months.data?.slice(0, FIRST_MONTHS);

  return (
    <CollapsibleCard
      title="Meses"
      count={months.data?.length}
      storageKey="supplier-months"
      actions={
        <ExpenseDialog
          target={{
            kind: "supplierMonth",
            supplier,
            months: monthsBetween(addMonths(now, -36), now),
          }}
          trigger={
            <Button size="sm" variant="outline">
              <Plus />
              Registrar mês
            </Button>
          }
        />
      }
    >
      {months.isError ? (
        <QueryError error={months.error} onRetry={() => months.refetch()} />
      ) : months.isPending ? (
        <SupplierMonthsSkeleton />
      ) : months.data.length === 0 ? (
        <Text tone="muted">
          {supplier.scope === "VEHICLE" && supplier.vehicles.length === 0
            ? "Vincule um veículo para os meses aparecerem aqui."
            : "Nenhum mês ainda. Use “Registrar mês” para lançar um mês passado."}
        </Text>
      ) : (
        <Box
          aria-busy={months.isRefreshing}
          className={cn(
            "space-y-3 transition-opacity duration-200",
            months.isRefreshing && "pointer-events-none opacity-60",
          )}
        >
          <List className="divide-y">
            {shown?.map((month) => (
              <ListItem key={month.month} className="py-3 first:pt-0">
                <SupplierMonthRow month={month} />
              </ListItem>
            ))}
          </List>
          {months.data.length > FIRST_MONTHS && (
            <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)}>
              {showAll ? "Mostrar menos" : `Ver todos os ${months.data.length} meses`}
            </Button>
          )}
        </Box>
      )}
    </CollapsibleCard>
  );
}

function SupplierMonthRow({ month }: { month: SupplierMonth }) {
  const single = month.items.length === 1 && !month.items[0].vehicle;
  return (
    <Box className="space-y-2">
      <Box className="flex flex-wrap items-baseline justify-between gap-x-3">
        <Text weight="semibold" className="first-letter:uppercase">
          {formatMonth(month.month)}
        </Text>
        {!single && (
          <Text size="xs" tone="muted" className="tabular-nums">
            Pago {formatCurrency(month.totals.paid)} · em aberto{" "}
            {formatCurrency(month.totals.open)}
          </Text>
        )}
      </Box>
      <List className="space-y-2">
        {month.items.map((item) => (
          <ListItem key={item.key}>
            <SupplierMonthItem item={item} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

function SupplierMonthItem({ item }: { item: MonthItem }) {
  const value = item.amount ?? item.expected;
  const outcome = monthItemOutcome(item);
  return (
    <Box className="flex items-center gap-3">
      <Box className="min-w-0 flex-1 space-y-1">
        {item.vehicle && (
          <Text size="sm" weight="medium" className="break-words">
            {item.vehicle.plate} · {item.vehicle.label}
          </Text>
        )}
        <Box className="flex flex-wrap items-center gap-2">
          <ExpenseStatusBadge status={item.status} />
          {value != null && (
            <Text inline size="sm" className="tabular-nums">
              {formatCurrency(value)}
            </Text>
          )}
          {item.dueDate && item.status === "OPEN" && (
            <Text inline size="xs" tone="muted">
              vence {formatCalendarDate(item.dueDate)}
            </Text>
          )}
        </Box>
        {outcome && (
          <Text size="xs" tone="muted">
            {outcome}
          </Text>
        )}
      </Box>
      <MonthItemAction item={item} />
    </Box>
  );
}

function SupplierMonthsSkeleton() {
  return (
    <Box className="space-y-4" aria-busy>
      {[0, 1, 2].map((index) => (
        <Box key={index} className="flex items-center gap-3">
          <Box className="flex-1 space-y-2">
            <Skeleton shape="text" className="w-32" />
            <Box className="flex gap-2">
              <Skeleton shape="pill" className="h-5 w-16" />
              <Skeleton shape="text" className="w-20" />
            </Box>
          </Box>
          <Skeleton className="h-9 w-24" />
        </Box>
      ))}
    </Box>
  );
}
