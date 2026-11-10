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
import type { SupplierListRow } from "@/types/supplier";
import { CostAmount } from "@/components/molecules/cost-amount";
import { paymentText } from "@/helpers/payment-card";

type SupplierTableProps = {
  suppliers: SupplierListRow[] | undefined;
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

  const columns = useMemo<DataTableColumn<SupplierListRow>[]>(
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
          <CostAmount
            amount={supplier.currentMonthly}
            currency={supplier.currency}
            brl={supplier.currentMonthlyBrl}
            className="font-normal"
          />
        ),
        className: "whitespace-nowrap",
        align: "right",
        skeleton: "w-24",
      },
      {
        header: "Pagamento",
        cell: (supplier) => paymentText(supplier, label) ?? "—",
        className: "max-w-56 truncate",
        skeleton: "w-28",
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
      loadingLabel="Carregando custos fixos…"
      empty={
        <EmptyState
          icon={Store}
          title="Nenhum custo fixo encontrado"
          description="Custos fixos da empresa e dos veículos aparecem aqui."
        />
      }
    />
  );
}
