import { Wrench } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/organisms/data-table";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { serviceLines } from "@/helpers/maintenance";
import { useLabels } from "@/hooks/ui/useLabels";
import type { MaintenanceListItem } from "@/types/maintenance";
import {
  formatCalendarDate,
  formatCurrency,
  formatMileage,
} from "@/utils/format";
import { formatPlate } from "@/utils/plate";

type MaintenanceTableProps = {
  maintenances: MaintenanceListItem[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
};

/** Table view of the maintenance list (same props as MaintenanceList). */
export function MaintenanceTable({
  maintenances,
  isLoading,
  isRefreshing,
}: MaintenanceTableProps) {
  const { label } = useLabels();
  const columns: DataTableColumn<MaintenanceListItem>[] = [
    {
      header: "Data",
      cell: (item) => formatCalendarDate(item.performedAt),
      skeleton: "w-20",
    },
    {
      header: "Placa",
      cell: (item) => (
        <Text inline size={null} mono weight="semibold">
          {formatPlate(item.vehicle.plate)}
        </Text>
      ),
      skeleton: "w-20",
    },
    {
      header: "Veículo",
      cell: (item) => item.vehicle.label,
      className: "max-w-56 truncate",
      skeleton: "w-40",
    },
    {
      header: "Tipo",
      cell: (item) => (
        <Badge variant="neutral">
          {label(LABEL_MAPS.maintenanceType, item.type)}
        </Badge>
      ),
      skeletonShape: "pill",
    },
    {
      header: "Serviços",
      cell: (item) =>
        serviceLines(item, label)
          .map((service) => service.text)
          .join(" · ") || "—",
      className: "max-w-64 truncate",
      skeleton: "w-32",
    },
    {
      header: "Oficina",
      cell: (item) => item.provider ?? "—",
      className: "max-w-40 truncate",
      skeleton: "w-24",
    },
    {
      header: "Km",
      cell: (item) =>
        item.mileage !== null ? formatMileage(item.mileage) : "—",
      skeleton: "w-16",
    },
    {
      header: "Locação",
      cell: (item) =>
        item.rental?.code ??
        (item.registeredBy === "CUSTOMER" ? "Pelo locatário" : "—"),
      skeleton: "w-24",
    },
    {
      header: "Valor",
      cell: (item) => (item.cost !== null ? formatCurrency(item.cost) : "—"),
      className: "tabular-nums",
      skeleton: "w-16",
    },
  ];

  return (
    <DataTable
      columns={columns}
      items={maintenances}
      rowKey={(item) => item.id}
      rowHref={(item) => routeTo.maintenance(item.id)}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      loadingLabel="Carregando manutenções…"
      empty={
        <EmptyState
          icon={Wrench}
          title="Nenhuma manutenção encontrada"
          description="Ajuste a busca ou os filtros."
        />
      }
    />
  );
}
