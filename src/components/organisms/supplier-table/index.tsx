import { useMemo } from "react";
import { Store } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/organisms/data-table";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { useLabels } from "@/hooks/ui/useLabels";
import type { SupplierListItem } from "@/types/supplier";
import { formatCurrency } from "@/utils/format";

type SupplierTableProps = {
  suppliers: SupplierListItem[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
};

/** Table view of the supplier list (same props as SupplierList). */
export function SupplierTable({
  suppliers,
  isLoading,
  isRefreshing,
}: SupplierTableProps) {
  const { label } = useLabels();

  const columns = useMemo<DataTableColumn<SupplierListItem>[]>(
    () => [
      {
        header: "Nome",
        cell: (supplier) => (
          <Text inline size={null} weight="semibold">
            {supplier.name}
          </Text>
        ),
        className: "max-w-64 truncate",
        skeleton: "w-40",
      },
      {
        header: "Escopo",
        cell: (supplier) => label(LABEL_MAPS.supplierScope, supplier.scope),
        skeleton: "w-16",
      },
      {
        header: "Valor / mês",
        cell: (supplier) => (
          <Text inline size={null} className="tabular-nums">
            {formatCurrency(supplier.monthlyAmount)}
            {supplier.scope === "VEHICLE" && (
              <Text inline size="xs" tone="muted">
                {" "}
                (base)
              </Text>
            )}
          </Text>
        ),
        className: "whitespace-nowrap",
        skeleton: "w-24",
      },
      {
        header: "Veículos",
        cell: (supplier) =>
          supplier.scope === "VEHICLE" ? supplier.vehicleCount : "—",
        skeleton: "w-8",
      },
      {
        header: "Situação",
        cell: (supplier) =>
          supplier.active ? (
            <Badge variant="neutral">Ativo</Badge>
          ) : (
            <Badge variant="outline">Inativo</Badge>
          ),
        skeletonShape: "pill",
      },
    ],
    [label],
  );

  return (
    <DataTable
      columns={columns}
      items={suppliers}
      rowKey={(supplier) => supplier.id}
      rowHref={(supplier) => routeTo.supplier(supplier.id)}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      loadingLabel="Carregando fornecedores…"
      empty={
        <EmptyState
          icon={Store}
          title="Nenhum fornecedor encontrado"
          description="Custos fixos da empresa e dos veículos aparecem aqui."
        />
      }
    />
  );
}
