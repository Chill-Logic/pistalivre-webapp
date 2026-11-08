import { ClipboardCheck } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/organisms/data-table";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { inspectionAuthor } from "@/helpers/inspection";
import { useLabels } from "@/hooks/ui/useLabels";
import type { InspectionListItem } from "@/types/inspection";
import { formatDate, formatMileage } from "@/utils/format";
import { formatPlate } from "@/utils/plate";

type InspectionTableProps = {
  inspections: InspectionListItem[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
};

/** Table view of the inspection list (same props as InspectionList). */
export function InspectionTable({
  inspections,
  isLoading,
  isRefreshing,
}: InspectionTableProps) {
  const { label } = useLabels();
  const columns: DataTableColumn<InspectionListItem>[] = [
    {
      header: "Data",
      cell: (item) => formatDate(item.createdAt),
      skeleton: "w-32",
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
        <Badge variant={item.type === "FULL" ? "neutral" : "outline"}>
          {label(LABEL_MAPS.inspectionType, item.type)}
        </Badge>
      ),
      skeletonShape: "pill",
    },
    {
      header: "Quem fez",
      cell: (item) => inspectionAuthor(item, label),
      skeleton: "w-32",
    },
    {
      header: "Locação",
      cell: (item) => item.rental?.code ?? "Avulsa",
      skeleton: "w-24",
    },
    {
      header: "Fotos",
      cell: (item) => item.photos,
      className: "tabular-nums",
      skeleton: "w-6",
    },
    {
      header: "Km",
      cell: (item) =>
        item.mileage !== null ? formatMileage(item.mileage) : "—",
      className: "tabular-nums",
      skeleton: "w-16",
    },
  ];

  return (
    <DataTable
      columns={columns}
      items={inspections}
      rowKey={(item) => item.id}
      rowHref={(item) => routeTo.inspection(item.id)}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      loadingLabel="Carregando vistorias…"
      empty={
        <EmptyState
          icon={ClipboardCheck}
          title="Nenhuma vistoria encontrada"
          description="Ajuste a busca ou os filtros."
        />
      }
    />
  );
}
