import { Badge } from "@/components/atoms/badge";
import { Text } from "@/components/atoms/text";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/organisms/data-table";
import { DebtsEmpty } from "@/components/organisms/debt-list";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { debtStatusVariant, nextDueLabel } from "@/helpers/debt";
import { useLabels } from "@/hooks/ui/useLabels";
import type { DebtListItem } from "@/types/debt";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

type DebtTableProps = {
  debts: DebtListItem[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
};

/** Table view of the company debts (same props as DebtList). */
export function DebtTable({ debts, isLoading, isRefreshing }: DebtTableProps) {
  const { label } = useLabels();

  const columns: DataTableColumn<DebtListItem>[] = [
    {
      header: "Credores",
      cell: (debt) => debt.lendersLabel,
      className: "max-w-64 truncate",
      skeleton: "w-40",
    },
    {
      header: "Tipo",
      cell: (debt) =>
        [
          label(LABEL_MAPS.debtKind, debt.kind),
          debt.installments > 1 && `${debt.installments}x`,
        ]
          .filter(Boolean)
          .join(" · "),
      skeleton: "w-28",
    },
    {
      header: "Emprestado em",
      cell: (debt) => formatCalendarDate(debt.borrowedAt),
      skeleton: "w-20",
    },
    {
      header: "Falta pagar",
      cell: (debt) => (
        <Text inline size={null} weight="semibold" className="tabular-nums">
          {formatCurrency(debt.balance.outstanding)}
        </Text>
      ),
      align: "right",
      skeleton: "w-24",
    },
    {
      header: "Total",
      cell: (debt) => formatCurrency(debt.balance.total),
      align: "right",
      skeleton: "w-24",
    },
    {
      header: "Próximo vencimento",
      cell: (debt) => {
        const next = nextDueLabel(debt);
        if (!next) return "—";
        return (
          <Text
            inline
            size={null}
            tone={debt.overdue ? "destructive" : undefined}
            weight={debt.overdue ? "medium" : undefined}
          >
            {next}
          </Text>
        );
      },
      skeleton: "w-36",
    },
    {
      header: "Situação",
      cell: (debt) => (
        <Badge variant={debtStatusVariant(debt.status)}>
          {debt.status.label}
        </Badge>
      ),
      skeletonShape: "pill",
    },
  ];

  return (
    <DataTable
      columns={columns}
      items={debts}
      rowKey={(debt) => debt.id}
      rowHref={(debt) => routeTo.debt(debt.id)}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      loadingLabel="Carregando débitos…"
      empty={<DebtsEmpty />}
    />
  );
}
